"""Survey SPF/DKIM/DMARC posture across a population of domains.

Aggregate statistics only, no named victims. The finding is about how many
domains are spoofable, not about which - that framing needs no notification
period, accuses nobody, and is the honest form of a public-interest security
story.

Pure DNS, so it runs anywhere and finishes in minutes rather than hours.

Usage:
    python -m research.dmarc_survey --domains domains.txt --out dmarc.jsonl
    python -m research.dmarc_survey --report dmarc.jsonl
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import threading
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from engine.domain_audit import audit_domain  # noqa: E402
from research.contact_audit import log, norm_domain  # noqa: E402


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
    n = 0
    with open(out, "a", encoding="utf-8") as fh:
        with ThreadPoolExecutor(max_workers=workers) as pool:
            futs = {pool.submit(audit_domain, d): d for d in todo}
            for fut in as_completed(futs):
                d = norm_domain(futs[fut])
                try:
                    r = fut.result()
                except Exception as e:
                    r = {"domain": d, "error": str(e)[:120]}
                with lock:
                    fh.write(json.dumps(r, ensure_ascii=False) + "\n")
                    fh.flush()
                    n += 1
                    if n % 100 == 0:
                        log(f"  {n}/{len(todo)}")
    log(f"done -> {out}")


def report(path):
    rows = [json.loads(l) for l in open(path, encoding="utf-8") if l.strip()]
    rows = [r for r in rows if r.get("checks")]

    # Only domains that actually receive mail can meaningfully be judged on
    # sender authentication; a parked domain with no MX is a different thing.
    mailable = [r for r in rows
                if any(c["id"] == "mx" and c["status"] == "pass" for c in r["checks"])]

    def status(r, cid):
        for c in r["checks"]:
            if c["id"] == cid:
                return c["status"]
        return "?"

    def detail(r, cid):
        for c in r["checks"]:
            if c["id"] == cid:
                return c.get("detail", "")
        return ""

    n = len(mailable)
    no_dmarc = [r for r in mailable if status(r, "dmarc") == "fail"]
    weak_dmarc = [r for r in mailable if status(r, "dmarc") == "warn"]
    enforcing = [r for r in mailable if status(r, "dmarc") == "pass"]
    no_spf = [r for r in mailable if status(r, "spf") == "fail"]
    no_dkim = [r for r in mailable if status(r, "dkim") != "pass"]

    # A domain is spoofable when DMARC is absent or set to p=none: receivers
    # are told nothing actionable, so forged mail is delivered.
    spoofable = no_dmarc + weak_dmarc

    grades = Counter(r["grade"] for r in mailable)

    def pct(a):
        return f"{100 * a / n:.1f}%" if n else "n/a"

    print(f"""
DOMAIN AUTHENTICATION SURVEY - {path}
{'=' * 68}
Domains checked                     {len(rows)}
...that accept mail (the sample)    {n}

SPOOFABLE (no DMARC, or p=none)     {len(spoofable)}   {pct(len(spoofable))}
  no DMARC record at all            {len(no_dmarc)}   {pct(len(no_dmarc))}
  DMARC present but p=none          {len(weak_dmarc)}   {pct(len(weak_dmarc))}
  enforcing (quarantine or reject)  {len(enforcing)}   {pct(len(enforcing))}

no SPF record                       {len(no_spf)}   {pct(len(no_spf))}
no DKIM key on known selectors      {len(no_dkim)}   {pct(len(no_dkim))}

Grades: """ + "  ".join(f"{g}:{grades[g]}" for g in "ABCDF" if grades[g]))

    broken_spf = [r for r in mailable
                  if status(r, "spf") == "fail" and "No SPF" not in detail(r, "spf")]
    if broken_spf:
        print(f"\nSPF published but broken: {len(broken_spf)}")
        for r in broken_spf[:8]:
            print(f"  {r['domain']:<28} {detail(r, 'spf')[:66]}")

    print("""
Report these as percentages. Naming domains turns a public-interest finding
into a list of targets, and needs a notification period this framing does not.
""")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--domains")
    ap.add_argument("--out", default="dmarc.jsonl")
    ap.add_argument("--workers", type=int, default=16)
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
