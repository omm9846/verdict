"""Decide which dead addresses are actually worth publishing.

A bouncing address is not a finding on its own. Three things have to hold
before it is safe to print:

  1. The address is STILL on the page we found it on, today. Pages get fixed.
     If the line is gone, there is nothing to report and saying otherwise is
     simply false.

  2. The address is genuinely unreachable, not merely superseded. A company
     that retired contact@ and now answers on support@ is reachable; the page
     is stale. Reporting that as "you cannot contact X" is misleading, and it
     is the mistake most likely to produce a correction.

  3. The bounce is recipient-level and still reproducible right now.

Output classifies each domain rather than each address, because reachability
is a property of the company, not of one mailbox:

  PUBLISHABLE  addresses still published, and nothing on the domain answers
  WEAK         published address is dead but another address works
  DROP         the address is no longer on the page, or no longer bounces

Usage:
    python -m research.verify_findings --packs ../docs/outreach-midcap
"""
from __future__ import annotations

import argparse
import glob
import json
import os
import re
import sys
import time
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from research.contact_audit import fetch, log, norm_domain, now, strip_tags  # noqa: E402
from engine import verify as vmod  # noqa: E402

ROW = re.compile(r"^\|\s*`([^`]+)`\s*\|\s*(\*\*DEAD\*\*|[A-Z_]+)\s*\|([^|]*)\|([^|]*)\|",
                 re.M)


def parse_pack(path: str) -> dict:
    text = open(path, encoding="utf-8").read()
    domain = os.path.basename(path)[:-3]
    dead, live, other = [], [], []
    for addr, verdict, detail, evidence in ROW.findall(text):
        rec = {"email": addr.strip(), "detail": detail.strip(),
               "evidence": evidence.strip()}
        v = verdict.strip()
        if v == "**DEAD**":
            dead.append(rec)
        elif v == "SEND":
            live.append(rec)
        else:
            other.append({**rec, "verdict": v})
    return {"domain": domain, "dead": dead, "live": live, "other": other}


def still_published(addr: str, evidence: str) -> tuple[bool, str]:
    """Is the address still on the page we took it from?"""
    if not evidence.startswith("http"):
        # Guessed front-desk address, never scraped from a page. It cannot be
        # 'still published' because it was never published — that is a weaker
        # claim and must be labelled as such.
        return False, "not scraped from a page (guessed address)"
    _, html = fetch(evidence)
    if not html:
        return False, f"page no longer fetchable: {evidence}"
    hay = (html + " " + strip_tags(html)).lower()
    if addr.lower() in hay:
        return True, evidence
    return False, f"address no longer on page: {evidence}"


def reprobe(addr: str) -> tuple[bool, str]:
    vmod._email_cache.pop(addr.strip().lower(), None)
    r = vmod.verify(addr)
    return r.get("verdict") == "DEAD", f"{r.get('verdict')}: {str(r.get('detail'))[:70]}"


def assess(pack: dict) -> dict:
    domain = pack["domain"]
    out = {"domain": domain, "checked_at": now(), "confirmed": [],
           "dropped": [], "live_alternatives": [a["email"] for a in pack["live"]]}

    for d in pack["dead"]:
        published, where = still_published(d["email"], d["evidence"])
        time.sleep(0.3)
        bounces, detail = reprobe(d["email"])
        time.sleep(0.4)

        rec = {"email": d["email"], "evidence": d["evidence"],
               "still_published": published, "where": where,
               "still_bounces": bounces, "reprobe": detail}

        if published and bounces:
            out["confirmed"].append(rec)
        else:
            reason = ("no longer bounces" if not bounces
                      else where)
            out["dropped"].append({**rec, "reason": reason})

    if not out["confirmed"]:
        out["verdict"] = "DROP"
        out["why"] = "nothing survives re-checking"
    elif out["live_alternatives"]:
        out["verdict"] = "WEAK"
        out["why"] = (f"published address is dead, but "
                      f"{', '.join(out['live_alternatives'][:3])} answers — "
                      f"the page is stale, the company is reachable")
    else:
        out["verdict"] = "PUBLISHABLE"
        out["why"] = ("addresses still published and nothing on the domain "
                      "accepts mail")
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--packs", required=True)
    ap.add_argument("--out", default="findings.json")
    ap.add_argument("--workers", type=int, default=4)
    a = ap.parse_args()

    packs = [parse_pack(p) for p in sorted(glob.glob(os.path.join(a.packs, "*.md")))]
    packs = [p for p in packs if p["dead"]]
    log(f"{len(packs)} domains with dead addresses to re-check")

    results = []
    lock = threading.Lock()
    with ThreadPoolExecutor(max_workers=a.workers) as pool:
        futs = {pool.submit(assess, p): p["domain"] for p in packs}
        for fut in as_completed(futs):
            try:
                r = fut.result()
            except Exception as e:
                log(f"  {futs[fut]}: {e}")
                continue
            with lock:
                results.append(r)
                log(f"  {r['domain']:<24} {r['verdict']}")

    json.dump(results, open(a.out, "w", encoding="utf-8"), indent=1)

    order = {"PUBLISHABLE": 0, "WEAK": 1, "DROP": 2}
    results.sort(key=lambda r: (order[r["verdict"]], r["domain"]))

    for tier in ("PUBLISHABLE", "WEAK", "DROP"):
        rows = [r for r in results if r["verdict"] == tier]
        print(f"\n{'=' * 70}\n{tier}  ({len(rows)})\n{'=' * 70}")
        for r in rows:
            print(f"\n{r['domain']}  — {r['why']}")
            for c in r["confirmed"]:
                print(f"    DEAD  {c['email']:<34} {c['reprobe'][:44]}")
                print(f"          {c['where']}")
            for c in r["dropped"][:3]:
                print(f"    drop  {c['email']:<34} {c['reason'][:60]}")

    print(f"\n\nSUMMARY: {sum(1 for r in results if r['verdict']=='PUBLISHABLE')} publishable, "
          f"{sum(1 for r in results if r['verdict']=='WEAK')} weak, "
          f"{sum(1 for r in results if r['verdict']=='DROP')} drop")
    print("\nOnly PUBLISHABLE belongs in a headline. WEAK is still worth telling")
    print("the company privately — it is their page that is wrong, not their mail.")


if __name__ == "__main__":
    main()
