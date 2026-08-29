"""Contact-address audit.

Answers one question at scale: when an organisation publishes an address that
people are *entitled* to reach them at, does that mailbox actually exist?

Three classes of address, kept strictly separate because they carry very
different weight:

  published   - scraped from the org's own privacy/legal page. Strongest claim:
                they wrote this address down themselves.
  securitytxt - Contact: line in /.well-known/security.txt (RFC 9116).
  inferred    - RFC 2142 role addresses (abuse@, security@) that the RFC says
                SHOULD exist but that the org never published. Weakest claim.
                Never fold these into a "they published a dead address" figure.

Every probe records the raw SMTP response and a UTC timestamp, and every DEAD
is confirmed by a second independent probe. That is what makes the output
quotable rather than merely interesting.

Usage:
    python -m research.contact_audit --domains domains.txt --out audit.jsonl
    python -m research.contact_audit --report audit.jsonl
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import threading
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone

import requests

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from engine import verify as vmod  # noqa: E402
from engine.verify import get_mx  # noqa: E402

# Identify the crawler honestly. Set VERDICT_RESEARCH_CONTACT to a reachable
# address so site operators can complain to a human instead of blocking blind.
CONTACT = os.environ.get("VERDICT_RESEARCH_CONTACT", "")
UA = (
    "VerdictResearch/0.1 (+https://tryverdict.org/research"
    + (f"; contact: {CONTACT}" if CONTACT else "")
    + ")"
)
HEADERS = {"User-Agent": UA, "Accept": "text/html,text/plain,*/*"}

EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")
LINK_RE = re.compile(r"<a[^>]+href=[\"']([^\"']+)[\"'][^>]*>(.*?)</a>", re.I | re.S)
MAILTO_RE = re.compile(r"mailto:([^\"'>?\s]+)", re.I)
TAG_RE = re.compile(r"<[^>]+>")

# Link text / href fragments that mean "this is the privacy policy"
POLICY_HINTS = (
    "privacy", "datenschutz", "confidentialite", "privacidad", "privacidade",
    "gdpr", "data-protection", "dataprotection", "data protection",
    "privacy-notice", "privacy-policy", "legal", "cookie",
)

# Direct paths worth trying when the homepage yields no policy link
POLICY_PATHS = (
    "/privacy", "/privacy-policy", "/privacypolicy", "/privacy-notice",
    "/legal/privacy", "/legal/privacy-policy", "/policies/privacy",
    "/about/privacy", "/en/privacy", "/privacy.html", "/datenschutz",
    "/legal", "/terms/privacy",
)

# Local-parts that indicate a privacy / data-protection channel specifically.
PRIVACY_LOCALS = (
    "privacy", "dpo", "dataprotection", "data-protection", "datenschutz",
    "gdpr", "ccpa", "datarequest", "data-request", "privacidad", "compliance",
)
# RFC 2142 role addresses tested as *inferred* only.
RFC2142_LOCALS = ("abuse", "security")

# Never treat these as an org's contact address.
NOISE = (
    "example.", "sentry.io", "wixpress", "domain.com", "email.com",
    "yourdomain", "@2x", ".png", ".jpg", ".gif", ".webp", ".svg",
    "@sentry", "u003e", "your@", "name@", "someone@",
)

_print_lock = threading.Lock()


def log(*a):
    with _print_lock:
        print(*a, file=sys.stderr, flush=True)


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def norm_domain(d: str) -> str:
    d = d.strip().lower()
    d = re.sub(r"^https?://", "", d).split("/")[0]
    if d.startswith("www."):
        d = d[4:]
    return d


def fetch(url: str, timeout: int = 12) -> tuple[str, str]:
    """Return (final_url, text). Empty text on any failure."""
    try:
        r = requests.get(url, headers=HEADERS, timeout=timeout, allow_redirects=True)
        ctype = r.headers.get("content-type", "")
        if r.status_code != 200:
            return r.url, ""
        if ("html" not in ctype) and ("text" not in ctype):
            return r.url, ""
        # Cap the body: policy pages are text, anything huge is not what we want.
        return r.url, r.text[:900_000]
    except Exception:
        return url, ""


def strip_tags(html: str) -> str:
    return TAG_RE.sub(" ", html)


def find_policy_urls(domain: str) -> list[str]:
    """Locate privacy-policy URLs: follow homepage links first, then guess paths."""
    urls: list[str] = []
    seen: set[str] = set()

    for root in (f"https://{domain}/", f"https://www.{domain}/"):
        final, html = fetch(root)
        if not html:
            continue
        for href, text in LINK_RE.findall(html):
            label = strip_tags(text).strip().lower()
            hay = (href + " " + label).lower()
            if not any(h in hay for h in POLICY_HINTS):
                continue
            full = urllib.parse.urljoin(final, href)
            if not full.startswith("http") or full in seen:
                continue
            seen.add(full)
            urls.append(full)
        if urls:
            break

    if not urls:
        urls = [f"https://{domain}{p}" for p in POLICY_PATHS]

    return urls[:6]


# Role words that appear inside spliced local-parts. Page text runs straight
# into the address — "...serving department" + "data-privacy@" becomes
# departmentdata-privacy@, "New York 10013" + "privacy@" becomes
# 10013privacy@. The domain is real, so the no-MX guard cannot catch these,
# and a nonexistent address double-confirms as DEAD exactly as designed.
_ROLE_WORDS = ("privacy", "contact", "support", "info", "press", "team",
               "hello", "sales", "help", "legal", "dpo", "abuse", "security",
               "compliance", "gdpr", "office", "admin", "media")


def _spliced_role(local: str) -> bool:
    """True when the local-part looks like page text run into a role address."""
    if local[0].isdigit():
        return True
    for w in _ROLE_WORDS:
        if not local.endswith(w) or local == w:
            continue
        prefix = local[: -len(w)]
        # A real address separates the prefix: john.privacy@, eu-privacy@.
        # A splice does not: departmentdata-privacy@ ends with "data-privacy"
        # but the token before it is glued on.
        if prefix and prefix[-1] in "._-":
            token = prefix.rstrip("._-").split(".")[-1].split("-")[-1].split("_")[-1]
            # A plausible qualifier is short and word-like: eu, us, data, dp.
            if token.isalpha() and len(token) <= 8:
                continue
            return True
        return True
    return False


def _clean_local(addr: str) -> str | None:
    """Normalise one candidate address, or None if it is an extraction artifact.

    Addresses scraped from HTML arrive damaged in predictable ways: a
    percent-encoded space from a `mailto:%20foo@bar` href, or an inline tag
    (`amazon.co<span>m</span>`) that splits the domain when tags are stripped.
    Both produce an address that does not exist, which then double-confirms as
    DEAD exactly as designed. Every such row is a false positive, so they are
    rejected here rather than counted.
    """
    a = urllib.parse.unquote(addr).strip().strip(".,;:<>()[]\"'")
    a = a.lower()
    if a.count("@") != 1:
        return None
    local, dom = a.split("@")
    if not local or not dom:
        return None
    # % survives urlencoding artifacts; whitespace means we spliced two things.
    if "%" in a or any(c.isspace() for c in a):
        return None
    if local[0] in ".-" or local[-1] in ".-":
        return None
    if "." not in dom or dom[0] in ".-" or dom[-1] in ".-" or ".." in dom:
        return None
    tld = dom.rsplit(".", 1)[-1]
    if len(tld) < 2 or not tld.isalpha():
        return None
    if _spliced_role(local):
        return None
    return a


def extract_contacts(html: str, locals_wanted: tuple[str, ...]) -> set[str]:
    """Pull addresses whose local-part signals the wanted channel.

    mailto: hrefs are read first and are authoritative — they survive inline
    markup that would corrupt the same address in the rendered text. Visible
    text is then scanned as a fallback for addresses written out but not linked.

    Any address domain is accepted, not just the site's own: plenty of orgs
    route privacy mail to outside counsel or a parent company, and a dead
    address there is exactly as broken for the person trying to reach them.
    """
    out: set[str] = set()

    def consider(raw: str):
        a = _clean_local(raw)
        if not a or any(n in a for n in NOISE):
            return
        if any(w in a.split("@")[0] for w in locals_wanted):
            out.add(a)

    for raw in MAILTO_RE.findall(html):
        consider(raw)
    # Two text passes. Replacing tags with a space keeps adjacent words apart;
    # deleting them instead rejoins an address that markup split mid-domain
    # (amazon.co<span>m</span>). Each pass produces artifacts the other does
    # not, so take both and reconcile below.
    for raw in EMAIL_RE.findall(strip_tags(html)):
        consider(raw)
    for raw in EMAIL_RE.findall(TAG_RE.sub("", html)):
        consider(raw)

    # Prefix pairs on the same local-part come from two opposite artifacts:
    #   amazon.co   / amazon.com       markup split the domain -> keep longer
    #   snov.io     / snov.io.want     text glued on after it  -> keep shorter
    # Length cannot tell them apart, so ask DNS: the real domain resolves.
    from engine.verify import resolve_mx
    pairs = [(a, b) for a in out for b in out
             if a != b and a.split("@")[0] == b.split("@")[0]
             and b.split("@")[1].startswith(a.split("@")[1])]
    for short, long in pairs:
        if short not in out or long not in out:
            continue
        _, s_ok = resolve_mx(short.split("@")[1])
        _, l_ok = resolve_mx(long.split("@")[1])
        if l_ok == "ok" and s_ok != "ok":
            out.discard(short)
        elif s_ok == "ok" and l_ok != "ok":
            out.discard(long)
        else:
            out.discard(short)  # both or neither resolve: markup-split case
    return out


def read_security_txt(domain: str) -> set[str]:
    """RFC 9116: /.well-known/security.txt, Contact: mailto: lines."""
    out: set[str] = set()
    for path in ("/.well-known/security.txt", "/security.txt"):
        _, body = fetch(f"https://{domain}{path}", timeout=8)
        if not body:
            continue
        for line in body.splitlines():
            if line.lower().startswith("contact:") and "mailto:" in line.lower():
                for m in MAILTO_RE.findall(line) or EMAIL_RE.findall(line):
                    a = _clean_local(m)
                    if a and not any(n in a for n in NOISE):
                        out.add(a)
        if out:
            break
    return out


def probe(email: str, confirm_delay: float = 20.0) -> dict:
    """Verify once. If DEAD, wait and probe again on a fresh connection.

    A single 5xx can be a transient policy response; two, minutes apart, is a
    finding. Only double-confirmed results get confirmed_dead=True, and a
    disagreement between the two probes downgrades the row to UNKNOWN.
    """
    addr_domain = email.rsplit("@", 1)[-1]
    if not get_mx(addr_domain):
        # No MX at all usually means we mis-parsed the address out of the page,
        # not that the org publishes a contact on a domain that cannot receive
        # mail. Flag it for manual review; never count it as a finding.
        return {"verdict": "EXTRACTION_SUSPECT", "mx": None,
                "detail": f"no MX for {addr_domain}; likely mis-parsed",
                "probed_at": now(), "confirmed_dead": False}

    first = vmod.verify(email)
    rec = {
        "verdict": first.get("verdict"),
        "mx": first.get("mx"),
        "detail": first.get("detail"),
        "probed_at": now(),
        "confirmed_dead": False,
    }
    if first.get("verdict") != "DEAD":
        return rec

    time.sleep(confirm_delay)
    # Drop the cached result so this is a genuinely independent probe.
    vmod._email_cache.pop(email.strip().lower(), None)
    second = vmod.verify(email)

    rec["reprobe_verdict"] = second.get("verdict")
    rec["reprobe_detail"] = second.get("detail")
    rec["reprobed_at"] = now()
    rec["confirmed_dead"] = second.get("verdict") == "DEAD"
    if not rec["confirmed_dead"]:
        rec["verdict"] = "UNKNOWN"
        rec["detail"] = f"probe disagreement: {rec['detail']} / {rec['reprobe_detail']}"
    return rec


def audit_domain(domain: str, include_inferred: bool = True) -> list[dict]:
    """Return one row per (domain, address, source)."""
    domain = norm_domain(domain)
    base = {"domain": domain, "collected_at": now()}
    rows: list[dict] = []

    if not get_mx(domain):
        rows.append({**base, "email": None, "source": "none",
                     "verdict": "NOMX", "detail": "domain has no MX record"})
        return rows

    found: dict[str, tuple[str, str]] = {}  # email -> (source, evidence)

    for url in find_policy_urls(domain):
        _, html = fetch(url)
        if not html:
            continue
        for em in extract_contacts(html, PRIVACY_LOCALS):
            found.setdefault(em, ("published", url))
        time.sleep(0.3)

    for em in read_security_txt(domain):
        found.setdefault(em, ("securitytxt",
                              f"https://{domain}/.well-known/security.txt"))

    if include_inferred:
        for local in RFC2142_LOCALS:
            found.setdefault(f"{local}@{domain}", ("inferred", "RFC 2142"))

    if not found:
        rows.append({**base, "email": None, "source": "none",
                     "verdict": "NO_CONTACT_PUBLISHED",
                     "detail": "no privacy/security contact found on site"})
        return rows

    for em, (source, evidence) in sorted(found.items()):
        rows.append({**base, "email": em, "source": source,
                     "evidence_url": evidence, **probe(em)})
        time.sleep(0.5)

    return rows


def load_done(path: str) -> set[str]:
    done: set[str] = set()
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            for line in f:
                try:
                    done.add(json.loads(line)["domain"])
                except Exception:
                    pass
    return done


def run(domains: list[str], out: str, workers: int, include_inferred: bool):
    done = load_done(out)
    todo = [d for d in domains if norm_domain(d) not in done]
    log(f"{len(domains)} domains, {len(done)} already done, {len(todo)} to go")
    if not todo:
        return

    write_lock = threading.Lock()
    completed = 0

    with open(out, "a", encoding="utf-8") as fh:
        with ThreadPoolExecutor(max_workers=workers) as pool:
            futures = {pool.submit(audit_domain, d, include_inferred): d for d in todo}
            for fut in as_completed(futures):
                d = futures[fut]
                try:
                    rows = fut.result()
                except Exception as e:
                    rows = [{"domain": norm_domain(d), "email": None,
                             "source": "none", "verdict": "ERROR",
                             "detail": str(e)[:120], "collected_at": now()}]
                with write_lock:
                    for r in rows:
                        fh.write(json.dumps(r, ensure_ascii=False) + "\n")
                    fh.flush()
                    completed += 1
                    if completed % 10 == 0:
                        log(f"  {completed}/{len(todo)}")
    log(f"done -> {out}")


def report(path: str):
    rows = [json.loads(l) for l in open(path, encoding="utf-8") if l.strip()]
    domains = {r["domain"] for r in rows}

    pub = [r for r in rows if r.get("source") == "published"]
    pub_domains = {r["domain"] for r in pub}
    dead_pub = [r for r in pub if r.get("confirmed_dead")]
    dead_pub_domains = {r["domain"] for r in dead_pub}

    inf = [r for r in rows if r.get("source") == "inferred"]
    dead_inf_domains = {r["domain"] for r in inf if r.get("confirmed_dead")}

    no_contact = {r["domain"] for r in rows
                  if r.get("verdict") == "NO_CONTACT_PUBLISHED"}

    def pct(a, b):
        return f"{100 * a / b:.1f}%" if b else "n/a"

    print(f"""
CONTACT AUDIT - {path}
{'=' * 62}
Domains audited                     {len(domains)}
Publishing no privacy contact       {len(no_contact)}  ({pct(len(no_contact), len(domains))})

PUBLISHED privacy addresses  (the quotable number)
  domains with a published addr     {len(pub_domains)}
  addresses tested                  {len(pub)}
  CONFIRMED DEAD (2x hard 5xx)      {len(dead_pub)}
  domains w/ a dead published addr  {len(dead_pub_domains)}  ({pct(len(dead_pub_domains), len(pub_domains))} of those publishing)

INFERRED RFC 2142 (abuse@ / security@) - weaker claim, report separately
  domains w/ dead inferred addr     {len(dead_inf_domains)}

Verdict breakdown (all rows)""")

    counts: dict[str, int] = {}
    for r in rows:
        counts[r.get("verdict", "?")] = counts.get(r.get("verdict", "?"), 0) + 1
    for k, v in sorted(counts.items(), key=lambda kv: -kv[1]):
        print(f"  {k:<24} {v}")

    if dead_pub:
        print("\nConfirmed-dead published addresses "
              "(notify these 14 days before publishing):")
        for r in sorted(dead_pub, key=lambda r: r["domain"])[:40]:
            print(f"  {r['domain']:<30} {r['email']:<38} "
                  f"{str(r.get('detail'))[:42]}")
        if len(dead_pub) > 40:
            print(f"  ... and {len(dead_pub) - 40} more")
    print()


def main():
    ap = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--domains", help="file with one domain per line")
    ap.add_argument("--out", default="audit.jsonl",
                    help="JSONL output; appended to, so runs resume")
    ap.add_argument("--workers", type=int, default=6,
                    help="concurrency. Keep low: every probe is an SMTP "
                         "connection from your IP and MTAs rate-limit hard")
    ap.add_argument("--no-inferred", action="store_true",
                    help="skip RFC 2142 abuse@/security@ guesses")
    ap.add_argument("--limit", type=int, help="only the first N domains")
    ap.add_argument("--report", help="print stats for an existing JSONL and exit")
    a = ap.parse_args()

    if a.report:
        report(a.report)
        return
    if not a.domains:
        ap.error("--domains required (or --report)")

    with open(a.domains, encoding="utf-8") as f:
        doms = [l.strip() for l in f if l.strip() and not l.startswith("#")]
    if a.limit:
        doms = doms[:a.limit]

    run(doms, a.out, a.workers, not a.no_inferred)
    report(a.out)


if __name__ == "__main__":
    main()
