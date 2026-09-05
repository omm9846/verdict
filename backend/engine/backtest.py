"""Measure what the gate would have caught on a campaign you already sent.

The persuasive number is not one we claim, it is one the sender measures on
their own bounce log. They already know which addresses failed. Running those
back through the gate answers the only question that matters: how many were
knowable before the send?

Deliberately honest about its own ceiling. Catch-all domains accept every
address, gateways refuse probes, and on those the gate could not have helped
anybody. Those are reported separately rather than quietly dropped, because a
backtest that hides its misses is a sales sheet.

    python -m engine backtest bounced.csv
    python -m engine backtest bounced.csv --sent all-sent.csv

The file can be a plain list of addresses or a CSV: any column containing
addresses is found automatically. Nothing is uploaded; this runs where you
run it.
"""
from __future__ import annotations

import json
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

from engine.verify import verify

EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")


def load_addresses(path: str) -> list[str]:
    """Pull addresses out of a list, a CSV, or an exported bounce report."""
    seen: dict[str, None] = {}
    with open(path, encoding="utf-8", errors="replace") as fh:
        for line in fh:
            for m in EMAIL_RE.findall(line):
                seen.setdefault(m.strip().lower(), None)
    return list(seen)


def classify(addresses: list[str], workers: int = 6) -> list[dict]:
    out: list[dict] = []
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futs = {pool.submit(verify, a): a for a in addresses}
        done = 0
        for fut in as_completed(futs):
            a = futs[fut]
            try:
                out.append(fut.result())
            except Exception as e:
                out.append({"email": a, "verdict": "ERROR", "detail": str(e)[:80]})
            done += 1
            if done % 25 == 0:
                print(f"  checked {done}/{len(addresses)}", file=sys.stderr, flush=True)
            time.sleep(0.05)
    return out


def report(bounced: list[dict], sent_total: int | None) -> dict:
    caught = [r for r in bounced if r.get("verdict") == "DEAD"]
    catchall = [r for r in bounced if r.get("verdict") == "CATCHALL"]
    gated = [r for r in bounced if r.get("verdict") == "RISKY"]
    unknown = [r for r in bounced if r.get("verdict") == "UNKNOWN"]
    alive = [r for r in bounced if r.get("verdict") == "SEND"]

    n = len(bounced)
    knowable = len(caught)
    unknowable = len(catchall) + len(gated) + len(unknown)

    print(f"""
BACKTEST - {n} bounced addresses
{'=' * 62}

  WOULD HAVE BEEN CAUGHT       {knowable:>4}   {100*knowable/n if n else 0:.0f}% of your bounces
    The server names the recipient as unknown. These never
    needed to be sent.

  COULD NOT BE KNOWN           {unknowable:>4}   {100*unknowable/n if n else 0:.0f}% of your bounces
    catch-all domain           {len(catchall):>4}   accepts every address, so nothing is knowable
    behind a gateway           {len(gated):>4}   answers on policy, not on mailbox existence
    refused the probe          {len(unknown):>4}   no evidence either way

  ACCEPTS MAIL NOW             {len(alive):>4}
    Live today. Either it was a temporary failure, a
    reputation block on your domain, or the mailbox came back.
""")

    if sent_total:
        before = 100 * n / sent_total
        after = 100 * (n - knowable) / sent_total
        print(f"""  On {sent_total} sent:
    bounce rate as sent          {before:.1f}%
    bounce rate through the gate {after:.1f}%
    reduction                    {before - after:.1f} points
""")

    print("""The honest read: the gate catches the addresses whose server will
tell it the truth. On catch-all domains and behind gateways, nothing
can. Any tool claiming otherwise is guessing, and guessing wrong in
that direction suppresses real contacts permanently.
""")

    return {
        "bounced": n, "caught": knowable, "unknowable": unknowable,
        "catchall": len(catchall), "gated": len(gated),
        "unknown": len(unknown), "alive": len(alive),
        "sent_total": sent_total,
    }


def main(argv: list[str]) -> int:
    if not argv:
        print(__doc__.strip(), file=sys.stderr)
        return 2

    path = argv[0]
    sent_total = None
    if "--sent" in argv:
        sent_path = argv[argv.index("--sent") + 1]
        sent_total = len(load_addresses(sent_path))

    addresses = load_addresses(path)
    if not addresses:
        print(f"No addresses found in {path}", file=sys.stderr)
        return 2

    print(f"Checking {len(addresses)} addresses. Nothing is uploaded.",
          file=sys.stderr, flush=True)
    results = classify(addresses)
    summary = report(results, sent_total)

    if "--json" in argv:
        print(json.dumps({"summary": summary, "results": results}, indent=2))
    return 0
