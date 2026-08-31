"""Find the people who run a company, and a working address for each.

Desk mailboxes reach a shared inbox. A founder's address reaches the person
who decides. Almost nobody publishes executive email, but nearly everybody
publishes executive names on a team page, and a name plus a domain is enough:
infer the address pattern, probe every candidate, keep only what the server
confirms.

A wrong guess costs nothing because it is never sent. That is the whole point
of having a gate.

    python -m research.find_people --domains agencies.txt --out people.jsonl
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from research.contact_audit import (  # noqa: E402
    LINK_RE, fetch, log, norm_domain, now, strip_tags,
)
from engine.discovery import harvest, candidates  # noqa: E402
from engine.verify import verify, classify_domain  # noqa: E402

TEAM_PATHS = (
    "/team", "/about", "/about-us", "/our-team", "/people", "/leadership",
    "/who-we-are", "/meet-the-team", "/company/team", "/about/team",
    "/our-people", "/management", "/founders",
)

TEAM_HINTS = ("team", "about", "people", "leadership", "who we are",
              "our story", "founders", "management", "meet")

# Titles worth reaching. Ordered by seniority so the best one wins.
TITLES = [
    "founder & ceo", "co-founder & ceo", "founder and ceo", "ceo & founder",
    "chief executive officer", "managing director", "co-founder", "cofounder",
    "founder", "ceo", "president", "chief marketing officer", "cmo",
    "chief revenue officer", "cro", "chief operating officer", "coo",
    "head of growth", "head of marketing", "marketing director",
    "commercial director", "sales director", "head of sales", "partner",
    "director",
]
TITLE_RE = re.compile("|".join(re.escape(t) for t in TITLES), re.I)

# Two or three capitalised words: a plausible person name.
NAME_RE = re.compile(r"\b([A-Z][a-z'\-]{1,15})\s+([A-Z][a-z'\-]{1,20})\b")

# Words that look like names but are not people.
NOT_NAMES = {
    # pronouns, prepositions and page furniture
    "our", "the", "we", "us", "you", "your", "for", "from", "with", "and",
    "get", "read", "learn", "more", "view", "profile", "follow", "join",
    "meet", "book", "call", "free", "find", "out", "how", "why", "what",
    "who", "all", "rights", "reserved", "back", "next", "home", "menu",
    # site sections
    "case", "study", "studies", "contact", "about", "team", "teams", "work",
    "works", "blog", "news", "insights", "resources", "careers", "jobs",
    "privacy", "policy", "cookie", "cookies", "terms", "legal", "pricing",
    "services", "solutions", "clients", "partners", "story", "stories",
    # industry words that pair into fake names
    "digital", "marketing", "agency", "group", "media", "creative", "brand",
    "growth", "revenue", "sales", "demand", "content", "search", "social",
    "paid", "email", "strategy", "design", "web", "data", "seo", "ppc",
    "united", "kingdom", "states", "new", "york", "london", "limited",
    # titles themselves, singular and plural
    "senior", "head", "chief", "managing", "director", "directors",
    "founder", "founders", "partner", "partners", "officer", "president",
    "manager", "lead", "leads", "specialist", "consultant", "executive",
}

def team_urls(domain: str) -> list[str]:
    urls: list[str] = []
    seen: set[str] = set()
    for root in (f"https://{domain}/", f"https://www.{domain}/"):
        final, html = fetch(root)
        if not html:
            continue
        for href, label in LINK_RE.findall(html):
            hay = (href + " " + strip_tags(label)).lower()
            if any(h in hay for h in TEAM_HINTS):
                import urllib.parse
                full = urllib.parse.urljoin(final, href)
                if full.startswith("http") and full not in seen:
                    seen.add(full)
                    urls.append(full)
        if urls:
            break
    for p in TEAM_PATHS:
        u = f"https://{domain}{p}"
        if u not in seen:
            seen.add(u)
            urls.append(u)
    return urls[:8]


def plausible_name(first: str, last: str) -> bool:
    if first.lower() in NOT_NAMES or last.lower() in NOT_NAMES:
        return False
    if len(first) < 2 or len(last) < 2:
        return False
    return True


def people_on_page(text: str) -> list[tuple[str, str]]:
    """Names sitting near a job title. Returns [(name, title)].

    Each name takes the title nearest to it rather than any title within a
    window: on a team page the titles of two people sit close together, and a
    window wide enough to catch one person's title will catch their
    colleague's too.
    """
    titles = [(m.start(), m.end(), m.group(0).lower())
              for m in TITLE_RE.finditer(text)]
    if not titles:
        return []

    out: dict[str, tuple[int, str]] = {}
    for m in NAME_RE.finditer(text):
        first, last = m.group(1), m.group(2)
        if not plausible_name(first, last):
            continue
        pos, end_pos = m.start(), m.end()

        def cost(start: int, end: int) -> int:
            """Distance, biased toward the title that follows the name.

            Team pages read "Sarah Okonkwo, Head of Growth". A title sitting
            before a name usually belongs to the person listed above them, so
            it is penalised rather than excluded: "CEO Sarah Okonkwo" is
            rarer but real.
            """
            if start <= pos <= end:
                return 0
            if start >= end_pos:
                return start - end_pos
            return (pos - end) * 3

        dist, title = min((cost(st, en), t) for st, en, t in titles)
        if dist > 60:
            continue
        name = f"{first} {last}"
        if name not in out or dist < out[name][0]:
            out[name] = (dist, title)

    return [(n, t) for n, (_, t) in out.items()]


def find_for_domain(domain: str, per_domain: int = 2) -> list[dict]:
    domain = norm_domain(domain)
    base = {"domain": domain, "collected_at": now()}

    dverdict, _, _ = classify_domain(domain)
    if dverdict == "CATCHALL":
        return [{**base, "person": None, "verdict": "CATCHALL",
                 "detail": "catch-all domain; no address here is verifiable"}]

    found_people: list[tuple[str, str]] = []
    for url in team_urls(domain):
        _, html = fetch(url)
        if not html:
            continue
        for name, title in people_on_page(strip_tags(html)):
            if name not in [n for n, _ in found_people]:
                found_people.append((name, title))
        time.sleep(0.3)
        if len(found_people) >= 8:
            break

    if not found_people:
        return [{**base, "person": None, "verdict": "NO_PEOPLE_FOUND",
                 "detail": "no names next to a job title on the team pages"}]

    # Seniority order, so we spend probes on the person who decides.
    found_people.sort(key=lambda p: TITLES.index(p[1]))

    # One harvest per domain teaches us the address pattern in use.
    harvested = harvest(domain)

    rows: list[dict] = []
    for name, title in found_people[:per_domain]:
        cands, patterns = candidates(domain, harvested, name)
        hit = None
        probed = []
        for i, c in enumerate(cands):
            v = verify(c)
            probed.append({"email": c, "verdict": v["verdict"]})
            if v["verdict"] == "SEND":
                hit = {**v, "person": name, "title": title}
                break
            if v["verdict"] == "UNKNOWN":
                # The server is refusing us rather than answering about the
                # mailbox. Hammering the next candidate makes it worse, and
                # every following answer is then meaningless.
                unknowns = sum(1 for p in probed if p["verdict"] == "UNKNOWN")
                if unknowns >= 2:
                    break
                time.sleep(8)
            elif i < len(cands) - 1:
                time.sleep(3)
        rows.append({**base, "person": name, "title": title,
                     "pattern_evidence": list(harvested)[:3],
                     "probed": probed,
                     **(hit or {"verdict": "NO_HIT",
                                "detail": f"{len(cands)} candidates, none confirmed"})})
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--domains", required=True)
    ap.add_argument("--out", default="people.jsonl")
    ap.add_argument("--workers", type=int, default=3)
    ap.add_argument("--per-domain", type=int, default=2)
    a = ap.parse_args()

    with open(a.domains, encoding="utf-8") as f:
        doms = [l.strip() for l in f if l.strip() and not l.startswith("#")]

    lock = threading.Lock()
    hits = 0
    with open(a.out, "a", encoding="utf-8") as fh:
        with ThreadPoolExecutor(max_workers=a.workers) as pool:
            futs = {pool.submit(find_for_domain, d, a.per_domain): d for d in doms}
            for fut in as_completed(futs):
                d = norm_domain(futs[fut])
                try:
                    rows = fut.result()
                except Exception as e:
                    rows = [{"domain": d, "person": None, "verdict": "ERROR",
                             "detail": str(e)[:120], "collected_at": now()}]
                with lock:
                    for r in rows:
                        fh.write(json.dumps(r, ensure_ascii=False) + "\n")
                    fh.flush()
                    got = [r for r in rows if r.get("verdict") == "SEND"]
                    hits += len(got)
                    for r in got:
                        log(f"  {d:<28} {r['person']} ({r['title']}) -> {r['email']}")

    print(f"\n{hits} confirmed addresses for named people -> {a.out}")


if __name__ == "__main__":
    main()
