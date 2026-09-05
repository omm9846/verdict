"""One command for the whole outreach pipeline.

The steps existed already but as separate scripts, with the list of who had
already been contacted living in my head and in directory diffs. That is how
someone gets mailed twice, which is worse than not mailing them at all.

    verify contacts  ->  draft  ->  send  ->  record

The ledger is the point. Every address that goes out is written to it with the
date and campaign, and every later run skips anyone already there. Nothing is
sent twice even if the same target file is run again by mistake.

    python -m research.campaign --targets ../docs/targets-x.txt \\
        --campaign agencies --template clean --limit 15          # dry run
    python -m research.campaign ... --send

Sends are capped per run on purpose. A young domain that goes from 20 messages
a day to 300 gets filtered on reputation, and the ramp matters more than the
total.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from research.contact_audit import log, norm_domain  # noqa: E402
from research.media_pitch import audit_outlet  # noqa: E402
from research.send_pitches import check_recipient, send_resend  # noqa: E402

LEDGER = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                      "outreach-ledger.json")

PREFERRED_LOCALS = ("hello", "contact", "info", "team", "sales", "press",
                    "support", "enquiries")

TEMPLATES = {
    "clean": {
        "subject": "Some of your list was never going to arrive",
        "body": (
            "Hi,\n\n"
            "I checked this address was real before hitting send. That is the "
            "tool.\n\n"
            "Point it at a list and it finds the dead addresses, the typos, and "
            "the ones nobody can check at all. Your bounce rate drops because "
            "the dead ones never leave your outbox, and your domain stops "
            "taking the hit.\n\n"
            "On my own outreach it caught 24 dead addresses before send, across "
            "72 contacts. Bounce came in around 2%.\n\n"
            "Free, no signup:\n"
            "https://tryverdict.org/clean\n\n"
            "Om\nhello@tryverdict.org\n"
        ),
    },
    "spoofable": {
        "subject": "Half of .net can be forged. A quarter of .com.",
        "body": (
            "Hi,\n\n"
            "Most of the internet still leaves the front door open.\n\n"
            "I checked the top 1,200 sites. Of the ones that accept mail, a "
            "third have nothing stopping a stranger sending email in their "
            "name, and the owner never finds out it happened.\n\n"
            ".net is worst at 54.8%. .com is 26.4%.\n\n"
            "How I checked, plus your own domain in three seconds:\n"
            "https://tryverdict.org/spoofable\n\n"
            "Public DNS only. Nothing sent to anyone. Code is open.\n\n"
            "Om\nhello@tryverdict.org\n"
        ),
    },
}


def load_ledger() -> dict:
    if not os.path.exists(LEDGER):
        return {"sent": {}}
    try:
        with open(LEDGER, encoding="utf-8") as fh:
            return json.load(fh)
    except Exception:
        # A corrupt ledger must not become permission to re-send. Refuse.
        raise SystemExit(f"{LEDGER} is unreadable. Fix or move it before sending.")


def save_ledger(ledger: dict) -> None:
    tmp = LEDGER + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(ledger, fh, indent=1, ensure_ascii=False)
    os.replace(tmp, LEDGER)  # atomic, so a crash cannot truncate the ledger


def pick_address(pack: dict) -> str | None:
    live = [a["email"] for a in pack.get("addresses", [])
            if a.get("verdict") == "SEND"]
    for want in PREFERRED_LOCALS:
        for addr in live:
            if addr.split("@")[0] == want:
                return addr
    return live[0] if live else None


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--targets", required=True)
    ap.add_argument("--campaign", required=True,
                    help="name recorded in the ledger, e.g. agencies-oct")
    ap.add_argument("--template", default="clean", choices=sorted(TEMPLATES))
    ap.add_argument("--limit", type=int, default=15,
                    help="maximum sends this run. Ramp slowly.")
    ap.add_argument("--workers", type=int, default=3)
    ap.add_argument("--delay", type=int, default=25)
    ap.add_argument("--send", action="store_true",
                    help="actually send. Without it this is a dry run.")
    a = ap.parse_args()

    ledger = load_ledger()
    already = ledger.get("sent", {})

    with open(a.targets, encoding="utf-8") as fh:
        targets = [norm_domain(l) for l in fh
                   if l.strip() and not l.startswith("#")]

    fresh = [d for d in dict.fromkeys(targets) if d not in already]
    log(f"{len(targets)} targets, {len(targets) - len(fresh)} already contacted, "
        f"{len(fresh)} new")
    if not fresh:
        print("Nothing new to contact.")
        return 0

    # Verify more than we need, since roughly one in six yields a live address.
    budget = min(len(fresh), max(a.limit * 8, a.limit))
    log(f"verifying contacts for {budget} domains...")

    ready: list[tuple[str, str]] = []
    for domain in fresh[:budget]:
        if len(ready) >= a.limit:
            break
        try:
            pack = audit_outlet(domain)
        except Exception as e:
            log(f"  {domain}: {str(e)[:60]}")
            continue
        if pack.get("catchall"):
            log(f"  {domain:<28} catch-all, skipped")
            continue
        addr = pick_address(pack)
        if addr:
            ready.append((domain, addr))
            log(f"  {domain:<28} {addr}")

    if not ready:
        print("No verified live contacts found in this batch.")
        return 0

    tpl = TEMPLATES[a.template]
    print(f"\n{'SENDING' if a.send else 'DRY RUN'} - {len(ready)} message(s), "
          f"template '{a.template}'\n")

    if not a.send:
        for domain, addr in ready:
            print(f"  would send -> {addr:<38} ({domain})")
        print(f"\nSubject: {tpl['subject']}")
        print("\nRe-run with --send to deliver.")
        return 0

    key = os.environ.get("RESEND_API_KEY")
    sender = os.environ.get("SMTP_FROM", "Om Soni <hello@tryverdict.org>")
    if not key:
        raise SystemExit("RESEND_API_KEY is not set.")

    sent = failed = 0
    for i, (domain, addr) in enumerate(ready):
        ok, reason = check_recipient(addr)
        if not ok:
            log(f"  SKIP {addr}: {reason}")
            continue

        draft = {"to": addr, "subject": tpl["subject"], "body": tpl["body"]}
        try:
            send_resend(draft, sender, key)
            sent += 1
            # Record immediately. A crash after sending must not leave someone
            # eligible to be mailed again on the next run.
            already[domain] = {
                "email": addr,
                "campaign": a.campaign,
                "template": a.template,
                "at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            }
            ledger["sent"] = already
            save_ledger(ledger)
            print(f"  sent -> {addr}")
        except Exception as e:
            failed += 1
            print(f"  FAILED {addr}: {str(e)[:120]}")

        if i < len(ready) - 1:
            time.sleep(a.delay)

    print(f"\nsent {sent}, failed {failed}. Ledger now holds {len(already)} contacts.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
