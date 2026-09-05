"""Turn generated packs into a drafts.json the sender can consume.

Pairs each pack's written note with a recipient we have actually verified as
live on that company's own domain. A pack whose domain has no live address is
reported rather than guessed at - sending a notice about dead mailboxes into a
dead mailbox helps nobody, and the whole story depends on being able to say
every company was contacted.

Usage:
    python -m research.build_drafts --packs ../docs/outreach --out drafts.json
"""
from __future__ import annotations

import argparse
import glob
import json
import os
import re

# Rows look like: | `sales@snov.io` | SEND | 2.1.5 Ok | common front-desk ... |
ROW = re.compile(r"^\|\s*`([^`]+)`\s*\|\s*([A-Z*]+)", re.M)
NOTE = re.compile(r"## Draft note\s*\n\s*```\s*\n(.*?)```", re.S)
SUBJECT = re.compile(r"^Subject:\s*(.+)$", re.M)

# Preferred recipients, most likely to reach a human who can act on it.
PREFERRED = ("hello", "contact", "support", "team", "info", "sales", "press")


def live_addresses(text: str) -> list[str]:
    out = []
    for addr, verdict in ROW.findall(text):
        if verdict.strip() == "SEND":
            out.append(addr.strip().lower())
    return out


def pick(addrs: list[str]) -> str | None:
    """Prefer a mailbox a person reads over whatever sorted first."""
    for want in PREFERRED:
        for a in addrs:
            if a.split("@")[0] == want:
                return a
    return addrs[0] if addrs else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--packs", required=True)
    ap.add_argument("--out", default="drafts.json")
    ap.add_argument("--only-findings", action="store_true",
                    help="only packs that actually found a dead address")
    a = ap.parse_args()

    drafts, skipped = [], []

    for path in sorted(glob.glob(os.path.join(a.packs, "*.md"))):
        domain = os.path.basename(path)[:-3]
        text = open(path, encoding="utf-8").read()

        note = NOTE.search(text)
        if not note:
            skipped.append((domain, "no draft note in pack"))
            continue
        body = note.group(1).strip()

        subj = SUBJECT.search(body)
        if not subj:
            skipped.append((domain, "draft has no subject line"))
            continue
        subject = subj.group(1).strip()
        # The subject lives in the note for readability; strip it from the body
        # so it is not sent twice.
        body = SUBJECT.sub("", body, count=1).lstrip()

        has_finding = "**DEAD**" in text or "accepts every address" in text
        if a.only_findings and not has_finding:
            skipped.append((domain, "no finding to report"))
            continue

        to = pick(live_addresses(text))
        if not to:
            skipped.append((domain, "no verified live address on that domain"))
            continue

        drafts.append({"outlet": domain, "to": to,
                       "subject": subject, "body": body})

    with open(a.out, "w", encoding="utf-8") as fh:
        json.dump(drafts, fh, indent=1, ensure_ascii=False)

    print(f"{len(drafts)} drafts -> {a.out}\n")
    for d in drafts:
        print(f"  {d['outlet']:<26} {d['to']}")

    if skipped:
        print(f"\n{len(skipped)} skipped:")
        for dom, why in skipped:
            print(f"  {dom:<26} {why}")
        print("\nThose need a contact form or a named person. The story depends "
              "on every company having been reached, so do not leave them out.")


if __name__ == "__main__":
    main()
