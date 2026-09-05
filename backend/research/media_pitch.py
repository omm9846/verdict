"""Build a media pitch pack.

Same idea as outreach_pack, aimed at people who already have our audience
rather than at customers. Two jobs:

  1. Find and verify a working editorial contact for each outlet. Pitching a
     story about dead mailboxes from an address that bounces, or to one that
     does, would be the funniest possible way to lose it.
  2. Generate the pitch itself, with the real numbers from the audit baked in.

The pitch offers an exclusive because that is what makes an editor pick one
story out of the fifty in the inbox that morning. Send them one at a time,
in tiers - an exclusive offered to twenty people is not an exclusive.
"""
from __future__ import annotations

import argparse
import glob
import json
import os
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from research.contact_audit import (  # noqa: E402
    fetch, find_policy_urls, log, norm_domain, now, probe,
)
from research.contact_audit import extract_contacts  # noqa: E402
from engine.verify import resolve_mx, classify_domain  # noqa: E402

# Where a newsroom or a newsletter actually reads mail. Ordered by how likely
# each is to reach a human who can say yes.
MEDIA_DESK = ("tips", "news", "editor", "editorial", "newsdesk", "press",
              "hello", "contact", "team", "info")

# Local-parts worth scraping off an outlet's own pages.
MEDIA_LOCALS = ("tips", "editor", "editorial", "news", "press", "contact",
                "hello", "team", "story", "pitch")


def audit_outlet(domain: str) -> dict:
    domain = norm_domain(domain)
    out = {"domain": domain, "collected_at": now(), "addresses": [],
           "catchall": False, "mx": None, "notes": []}

    mx, status = resolve_mx(domain)
    out["mx"] = mx
    if status == "dnsfail":
        out["notes"].append("DNS did not answer")
        return out
    if not mx:
        out["notes"].append("domain accepts no mail")
        return out

    dverdict, _, ddetail = classify_domain(domain)
    if dverdict == "CATCHALL":
        out["catchall"] = True
        out["notes"].append(
            "catch-all domain: every address is accepted, so a SEND here is "
            "not proof the mailbox is read. Prefer a named journalist.")
    elif dverdict == "GATED":
        out["notes"].append(f"enterprise gateway ({ddetail})")

    found: dict[str, str] = {}
    for url in find_policy_urls(domain):
        _, html = fetch(url)
        if not html:
            continue
        for em in extract_contacts(html, MEDIA_LOCALS):
            found.setdefault(em, url)
        time.sleep(0.3)

    for local in MEDIA_DESK:
        found.setdefault(f"{local}@{domain}", "standard editorial address")

    for em, evidence in sorted(found.items()):
        out["addresses"].append({"email": em, "evidence": evidence, **probe(em)})
        time.sleep(0.4)

    return out


def load_stats(path: str) -> dict:
    if os.path.exists(path):
        return json.load(open(path, encoding="utf-8"))
    # Recompute from the packs if the cached stats are missing.
    tot = dead = ca = 0
    for f in glob.glob("docs/outreach/*.md"):
        t = open(f, encoding="utf-8").read()
        tot += 1
        if re.search(r"\*\*DEAD\*\*", t):
            dead += 1
        if "accepts every address" in t:
            ca += 1
    return {"total": tot, "dead": dead, "catchall": ca, "verifiers": [], "top": []}


def draft_pitch(outlet: str, stats: dict, exclusive: bool) -> str:
    verifiers = stats.get("verifiers", [])
    vlist = ", ".join(d for d, _ in verifiers) or "several"
    nver = len(verifiers)

    excl = ("\n\nHappy to give it to you exclusively - I have not sent the data "
            "to anyone else, and I will hold it until you have had a look."
            if exclusive else "")

    return f"""Subject: {stats['dead']} of 80 email companies have dead mailboxes on their own domain

Hi{' ' + outlet if outlet else ''},

I run an open-source SMTP verification engine. I pointed it at 80 companies
whose business is email - outreach platforms, contact-data vendors,
deliverability tools - and probed the public contact addresses on their own
domains.

{stats['dead']} of the 80 have at least one mailbox that hard-bounces.
{nver} of those sell mailbox verification for a living: {vlist}.

kickbox.com and verifalia.com each returned 550 5.1.1 on six of their own
published addresses. Companies whose product is telling you whether a mailbox
exists, with mailboxes that do not.

A further {stats['catchall']} run catch-all domains, meaning they accept any
address at all - including a random 22-character one I invented - so nobody
can verify an individual mailbox on them. Including, in several cases, the
verifier they sell.

Method, in short: two independent SMTP probes at least 20 seconds apart, both
required to return a hard recipient-level rejection. Catch-all domains,
enterprise gateways, and anything that refused our probe are excluded rather
than counted. Raw server responses and timestamps for every result. The
engine is MIT licensed, so the whole thing is reproducible:
https://github.com/omm9846/verdict

Every company named has been contacted directly and given a week to fix it or
tell me I am wrong before anything publishes.

I can send the full dataset, the per-company breakdown, and the raw SMTP
transcripts.{excl}

- Om
  hello@tryverdict.org
  https://tryverdict.org
"""


def render(pack: dict, stats: dict, exclusive: bool) -> str:
    d = pack["domain"]
    live = [a for a in pack["addresses"] if a.get("verdict") == "SEND"]
    dead = [a for a in pack["addresses"] if a.get("confirmed_dead")]
    unknown = [a for a in pack["addresses"] if a.get("verdict") == "UNKNOWN"]

    lines = [f"# {d} - pitch pack", "",
             f"- mail server: `{pack['mx'] or 'none'}`",
             f"- checked: {pack['collected_at']}", ""]
    for n in pack["notes"]:
        lines.append(f"> {n}")
    if pack["notes"]:
        lines.append("")

    if live:
        lines.append("## Send to (verified live)")
        lines.append("")
        for a in live:
            lines.append(f"- **{a['email']}** - {str(a.get('detail',''))[:60]}")
        lines.append("")
    else:
        lines.append("## No address verified live")
        lines.append("")
        lines.append("Find a named journalist instead - a masthead or a byline "
                     "beats a desk address, and this story wants a person who "
                     "covers the beat.")
        lines.append("")

    if unknown:
        lines.append(f"<details><summary>{len(unknown)} unverifiable "
                     f"(server refused the probe - may still be fine)</summary>")
        lines.append("")
        for a in unknown:
            lines.append(f"- `{a['email']}` - {str(a.get('detail',''))[:70]}")
        lines.append("")
        lines.append("</details>")
        lines.append("")

    if dead:
        lines.append("**Do not use - confirmed dead:**")
        for a in dead:
            lines.append(f"- ~~{a['email']}~~ {str(a.get('detail',''))[:50]}")
        lines.append("")

    lines += ["---", "", "## Pitch", "", "```",
              draft_pitch(d, stats, exclusive).strip(), "```", ""]
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--domains", required=True)
    ap.add_argument("--out", default="docs/media")
    ap.add_argument("--stats", default="docs/scoreboard-stats.json")
    ap.add_argument("--workers", type=int, default=4)
    ap.add_argument("--exclusive", action="store_true",
                    help="include the exclusivity offer in the pitch")
    a = ap.parse_args()

    stats = load_stats(a.stats)
    with open(a.domains, encoding="utf-8") as f:
        doms = [l.strip() for l in f if l.strip() and not l.startswith("#")]

    os.makedirs(a.out, exist_ok=True)
    summary = []

    with ThreadPoolExecutor(max_workers=a.workers) as pool:
        futs = {pool.submit(audit_outlet, d): d for d in doms}
        for fut in as_completed(futs):
            d = norm_domain(futs[fut])
            try:
                pack = fut.result()
            except Exception as e:
                log(f"  {d}: {e}")
                continue
            with open(os.path.join(a.out, f"{d}.md"), "w", encoding="utf-8") as fh:
                fh.write(render(pack, stats, a.exclusive))
            live = [x["email"] for x in pack["addresses"] if x.get("verdict") == "SEND"]
            summary.append((d, live, pack["catchall"]))
            log(f"  {d:<24} live={len(live)}")

    print(f"\n{len(summary)} pitch packs -> {a.out}/\n")
    print(f"{'outlet':<24} {'catchall':>9}  verified live address")
    for d, live, ca in sorted(summary, key=lambda r: (not r[1], r[0])):
        print(f"{d:<24} {str(ca):>9}  {live[0] if live else ' - none, find a byline'}")
    good = [r for r in summary if r[1]]
    print(f"\n{len(good)} of {len(summary)} have a verified live contact.")


if __name__ == "__main__":
    main()
