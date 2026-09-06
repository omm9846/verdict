"""Find and verify named decision-makers without a port-25 probe.

Agencies almost never publish a founder's email address - a crawl of 35 of
them turned up three person-shaped addresses and not one real founder. But
they do publish founder *names*, on the about and team pages. So the move is:
take the name, guess the address pattern, and confirm which pattern is real.

Confirming a guess normally needs an SMTP probe on port 25, which no cloud
host allows. The exception is Microsoft 365: its GetCredentialType endpoint
says whether an address exists over plain HTTPS. So this works only for
agencies whose MX points at Microsoft 365 - roughly one in ten - and for those
it returns a genuinely verified named contact, not a guess.

The noisy part (pulling names off a page) does not need to be precise, because
the M365 check is the filter: a garbage "name" produces no confirmed pattern
and is dropped. Only a real person on a real mailbox survives.

    python -m research.find_founders --domains ../docs/targets-agencies-wave5.txt \\
        --out ../docs/founders.csv
"""
from __future__ import annotations

import argparse
import csv
import os
import re
import secrets
import sys
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from research.contact_audit import fetch, log, norm_domain, strip_tags  # noqa: E402
from engine.verify import resolve_mx  # noqa: E402
from engine.soft_signals import is_microsoft365, _m365_exists  # noqa: E402

NAME = re.compile(r"\b([A-Z][a-z]{2,})\s+([A-Z][a-z]{2,})\b")

# A title near a name is what marks it as a person worth reaching. Ordered
# roughly by seniority so the best contact sorts first.
TITLES = ("founder", "co-founder", "ceo", "chief executive", "owner",
          "managing director", "managing partner", "president", "principal",
          "partner", "chief", "vp ", "head of", "director")

# Words that look like a Name but are not. The M365 check would drop them
# anyway; this just saves the lookups.
STOP = {
    "The", "Our", "We", "Get", "Read", "Learn", "More", "About", "Team",
    "Meet", "Contact", "Home", "Marketing", "Digital", "Sales", "Chief",
    "Managing", "Senior", "Head", "Director", "Founder", "Group", "Client",
    "Data", "Content", "Media", "Brand", "Growth", "Lead", "Account", "Project",
    "Cyber", "Security", "Regional", "Global", "Executive", "Officer", "Vice",
    "President", "Partner", "Principal", "Owner", "Tools", "Overview", "Careers",
    "Services", "Solutions", "Strategy", "Creative", "Design", "Development",
    "Business", "Company", "Agency", "Email", "Privacy", "Terms", "Cookie",
    "Urgent", "Care", "Automation", "Excellence", "Academy", "Insights",
    "Resources", "Case", "Studies", "Book", "Free", "New", "Latest",
}

PATHS = ("/about", "/about-us", "/team", "/our-team", "/leadership", "/people",
         "/who-we-are", "/company", "/meet-the-team", "/")


def candidate_names(domain: str) -> list[tuple[str, str]]:
    """Person names that appear next to a leadership title on the site."""
    for path in PATHS:
        _, html = fetch(f"https://{domain}{path}")
        if not html:
            continue
        text = strip_tags(html)
        low = text.lower()
        hits: list[tuple[str, str]] = []
        for m in NAME.finditer(text):
            first, last = m.group(1), m.group(2)
            if first in STOP or last in STOP:
                continue
            ctx = low[max(0, m.start() - 90): m.start() + 90]
            if any(t in ctx for t in TITLES):
                hits.append((first, last))
        if hits:
            # De-dupe, keep order (title order on the page tends to be seniority).
            seen, out = set(), []
            for pair in hits:
                if pair not in seen:
                    seen.add(pair)
                    out.append(pair)
            return out[:5]
    return []


def patterns(first: str, last: str, dom: str) -> list[str]:
    f, l = first.lower(), last.lower()
    return [f"{f}.{l}@{dom}", f"{f}@{dom}", f"{f}{l}@{dom}",
            f"{f[0]}{l}@{dom}", f"{f}_{l}@{dom}", f"{f}.{l[0]}@{dom}"]


def confirm_founder(domain: str) -> dict | None:
    """One verified named contact on an M365 agency, or None."""
    domain = norm_domain(domain)
    mx, _ = resolve_mx(domain)
    if not is_microsoft365(mx):
        return None

    # Unmask a tenant that says "exists" to everything (same idea as a
    # catch-all): if a random control confirms, no answer here is trustworthy.
    if _m365_exists(f"verdict-{secrets.token_hex(6)}@{domain}") is not False:
        return None

    for first, last in candidate_names(domain):
        for cand in patterns(first, last, domain):
            if _m365_exists(cand) is True:
                return {"domain": domain, "email": cand,
                        "name": f"{first} {last}", "mx": mx}
    return None


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--domains", required=True)
    ap.add_argument("--out", default="founders.csv")
    ap.add_argument("--workers", type=int, default=8)
    ap.add_argument("--limit", type=int)
    a = ap.parse_args()

    with open(a.domains, encoding="utf-8") as f:
        doms = [l.strip() for l in f if l.strip() and not l.startswith("#")]
    if a.limit:
        doms = doms[:a.limit]

    log(f"scanning {len(doms)} domains for M365 agencies with a findable founder")
    found, lock = [], threading.Lock()
    done = 0
    with ThreadPoolExecutor(max_workers=a.workers) as pool:
        futs = {pool.submit(confirm_founder, d): d for d in doms}
        for fut in as_completed(futs):
            done += 1
            try:
                r = fut.result()
            except Exception:
                r = None
            if r:
                with lock:
                    found.append(r)
                    log(f"  CONFIRMED  {r['name']:<24} {r['email']}")
            if done % 25 == 0:
                log(f"  {done}/{len(doms)} scanned, {len(found)} confirmed")

    found.sort(key=lambda r: r["domain"])
    with open(a.out, "w", encoding="utf-8", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["domain", "email", "name"])
        for r in found:
            w.writerow([r["domain"], r["email"], r["name"]])

    print(f"\n{len(found)} verified named contacts -> {a.out}")
    for r in found:
        print(f"  {r['domain']:<26} {r['name']:<24} {r['email']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
