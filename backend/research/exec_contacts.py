"""Find published contact addresses for named individuals at large companies.

Role mailboxes are a dead end: an earlier run over 236 domains found zero dead
published privacy@/dpo@ addresses. Large organisations maintain the shared
boxes, because losing one is visible immediately.

Named individuals are the opposite. An executive leaves, IT deletes the
mailbox, and the investor-relations page listing them stays up for years. Same
after an acquisition or a rebrand. So this crawls the pages where companies
publish a specific person - investor relations, press, governance, leadership
 - and probes only the addresses that look like a person rather than a desk.

What makes a finding here worth reporting is the pairing: the page names a
role ("Chief Financial Officer", "Head of Investor Relations") next to an
address that no longer accepts mail.

Usage:
    python -m research.exec_contacts --domains big.txt --out execs.jsonl
    python -m research.exec_contacts --report execs.jsonl
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

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from research.contact_audit import (  # noqa: E402
    HEADERS, LINK_RE, MAILTO_RE, TAG_RE, _clean_local, fetch, log,
    norm_domain, now, probe, strip_tags,
)
from engine.verify import resolve_mx, classify_domain  # noqa: E402

# Where a company publishes a named human.
EXEC_PATHS = (
    "/investors", "/investor-relations", "/ir", "/investor",
    "/press", "/media", "/newsroom", "/press-room", "/media-centre",
    "/about/leadership", "/leadership", "/management", "/executive-team",
    "/governance", "/corporate-governance", "/about/governance",
    "/contact", "/contact-us", "/about/contact", "/company/contact",
)

EXEC_HINTS = (
    "investor", "ir ", "press", "media", "newsroom", "leadership",
    "governance", "management", "executive", "contact", "board",
)

# Titles worth quoting next to a dead address.
TITLE_RE = re.compile(
    r"\b(chief [a-z]+ officer|c[efotm]o\b|general counsel|company secretary|"
    r"head of investor relations|investor relations (?:manager|director|contact|lead)|"
    r"vice president[a-z ]*|senior vice president[a-z ]*|managing director|"
    r"director of (?:communications|investor relations|media relations)|"
    r"head of (?:communications|media|press|corporate affairs))",
    re.I)

# Desk addresses. Present on the same pages, but not the finding we want.
ROLE_LOCALS = {
    "info", "contact", "hello", "admin", "support", "sales", "help", "office",
    "team", "mail", "enquiries", "inquiries", "webmaster", "postmaster",
    "abuse", "security", "privacy", "legal", "billing", "noreply", "no-reply",
    "donotreply", "marketing", "press", "media", "ir", "investor",
    "investors", "investorrelations", "investor-relations", "pr", "news",
    "communications", "corporate", "general", "careers", "jobs", "hr",
    "service", "customerservice", "compliance", "governance", "board",
    "shareholder", "shareholders", "agm", "company.secretary",
}

NOISE = ("example.", "sentry.io", "wixpress", "domain.com", "yourdomain",
         "@2x", ".png", ".jpg", ".gif", ".webp", ".svg", "u003e", "your@",
         "name@", "someone@", "email@", "test@")


def looks_like_person(local: str) -> bool:
    """first.last, first_last, first-last, or flast / firstl.

    A desk address is one word or a known role. A person is two name-shaped
    tokens, or a single token long enough not to be an abbreviation paired
    with an initial.
    """
    low = local.lower()
    if low in ROLE_LOCALS:
        return False
    if any(low.startswith(r + ".") or low.startswith(r + "-") for r in
           ("info", "press", "media", "ir", "investor", "contact")):
        return False

    parts = re.split(r"[._\-]", low)
    parts = [p for p in parts if p]
    if len(parts) >= 2:
        # Both tokens alphabetic, at least one longer than an initial.
        if all(p.isalpha() for p in parts[:2]) and max(len(p) for p in parts[:2]) >= 3:
            return True
        return False

    # Single token: jsmith / smithj style. Needs to be plausibly a surname,
    # not a department.
    if low.isalpha() and 5 <= len(low) <= 20:
        return True
    return False


def nearby_title(text: str, addr: str, window: int = 320) -> str | None:
    """Look for a job title near where the address appears."""
    i = text.lower().find(addr.lower())
    if i < 0:
        return None
    chunk = text[max(0, i - window): i + window]
    m = TITLE_RE.search(chunk)
    return m.group(1).strip() if m else None


def exec_urls(domain: str) -> list[str]:
    urls: list[str] = []
    seen: set[str] = set()

    for root in (f"https://{domain}/", f"https://www.{domain}/"):
        final, html = fetch(root)
        if not html:
            continue
        for href, label_html in LINK_RE.findall(html):
            hay = (href + " " + strip_tags(label_html)).lower()
            if not any(h in hay for h in EXEC_HINTS):
                continue
            full = urllib.parse.urljoin(final, href)
            if full.startswith("http") and full not in seen:
                seen.add(full)
                urls.append(full)
        if urls:
            break

    for p in EXEC_PATHS:
        u = f"https://{domain}{p}"
        if u not in seen:
            seen.add(u)
            urls.append(u)

    return urls[:12]


def audit(domain: str) -> list[dict]:
    domain = norm_domain(domain)
    base = {"domain": domain, "collected_at": now()}
    rows: list[dict] = []

    mx, status = resolve_mx(domain)
    if status == "dnsfail" or not mx:
        return [{**base, "email": None, "verdict": "NOMX" if not mx else "DNSFAIL",
                 "detail": "no mail server" if not mx else "DNS did not answer"}]

    dverdict, _, ddetail = classify_domain(domain)
    if dverdict == "CATCHALL":
        # Nothing on this domain can be judged. Say so once and stop.
        return [{**base, "email": None, "verdict": "CATCHALL",
                 "detail": "catch-all domain; no address here is verifiable"}]

    found: dict[str, tuple[str, str | None]] = {}
    for url in exec_urls(domain):
        _, html = fetch(url)
        if not html:
            continue
        text = strip_tags(html)
        cands = set(MAILTO_RE.findall(html)) | set(
            re.findall(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", text))
        for raw in cands:
            a = _clean_local(raw)
            if not a or any(n in a for n in NOISE):
                continue
            local, dom = a.split("@")
            if not looks_like_person(local):
                continue
            # Only the company's own domain: a person at an outside PR agency
            # is a different claim.
            if dom != domain and not dom.endswith("." + domain):
                continue
            if a not in found:
                found[a] = (url, nearby_title(text, a))
        time.sleep(0.3)

    if not found:
        return [{**base, "email": None, "verdict": "NO_NAMED_CONTACT",
                 "detail": "no individually-addressed contact published"}]

    for a, (url, title) in sorted(found.items()):
        rows.append({**base, "email": a, "evidence_url": url,
                     "title": title, **probe(a)})
        time.sleep(0.5)
    return rows


def run(domains, out, workers):
    done = set()
    if os.path.exists(out):
        for line in open(out, encoding="utf-8"):
            try:
                done.add(json.loads(line)["domain"])
            except Exception:
                pass
    todo = [d for d in domains if norm_domain(d) not in done]
    log(f"{len(domains)} domains, {len(done)} done, {len(todo)} to go")

    lock = threading.Lock()
    with open(out, "a", encoding="utf-8") as fh:
        with ThreadPoolExecutor(max_workers=workers) as pool:
            futs = {pool.submit(audit, d): d for d in todo}
            n = 0
            for fut in as_completed(futs):
                d = norm_domain(futs[fut])
                try:
                    rows = fut.result()
                except Exception as e:
                    rows = [{"domain": d, "email": None, "verdict": "ERROR",
                             "detail": str(e)[:120], "collected_at": now()}]
                with lock:
                    for r in rows:
                        fh.write(json.dumps(r, ensure_ascii=False) + "\n")
                    fh.flush()
                    n += 1
                    if n % 10 == 0:
                        log(f"  {n}/{len(todo)}")
    log(f"done -> {out}")


def report(path):
    rows = [json.loads(l) for l in open(path, encoding="utf-8") if l.strip()]
    domains = {r["domain"] for r in rows}
    named = [r for r in rows if r.get("email")]
    dead = [r for r in named if r.get("confirmed_dead")]
    titled = [r for r in dead if r.get("title")]

    counts: dict[str, int] = {}
    for r in rows:
        counts[r.get("verdict", "?")] = counts.get(r.get("verdict", "?"), 0) + 1

    print(f"""
NAMED-CONTACT AUDIT - {path}
{'=' * 66}
Companies crawled                 {len(domains)}
Named individual addresses found  {len(named)}
CONFIRMED DEAD (2x hard 5xx)      {len(dead)}
  ...of those, with a job title   {len(titled)}   <- the quotable ones
""")
    for k, v in sorted(counts.items(), key=lambda kv: -kv[1]):
        print(f"  {k:<22} {v}")

    if dead:
        print("\nDead published addresses for named individuals:\n")
        for r in sorted(dead, key=lambda r: r["domain"]):
            t = f"  [{r['title']}]" if r.get("title") else ""
            print(f"  {r['domain']:<24} {r['email']:<38}{t}")
            print(f"      {str(r.get('detail'))[:78]}")
            print(f"      {r.get('evidence_url')}")
    print()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--domains")
    ap.add_argument("--out", default="execs.jsonl")
    ap.add_argument("--workers", type=int, default=6)
    ap.add_argument("--limit", type=int)
    ap.add_argument("--report")
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

    run(doms, a.out, a.workers)
    report(a.out)


if __name__ == "__main__":
    main()
