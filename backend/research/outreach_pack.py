"""Build a personalised outreach pack.

The pitch that works on a stranger is not "try my product", it is "here is
something true about you that you did not know, which cost me an hour and
costs you nothing". This produces exactly that, one file per target, from
public data only — no list from them, nothing to trust us with.

For each target domain it reports what its own public contact surface does
under a real SMTP probe: which published addresses are live, which are dead,
which sit on a catch-all domain where nobody — including whatever verifier
they sell or use — can tell.

Usage:
    python -m research.outreach_pack --domains ring1.txt --out packs/
    python -m research.outreach_pack --domains ring1.txt --out packs/ --audit audit.jsonl
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from research.contact_audit import (  # noqa: E402
    PRIVACY_LOCALS, extract_contacts, fetch, find_policy_urls,
    log, norm_domain, now, probe, read_security_txt,
)
from engine.verify import resolve_mx, classify_domain  # noqa: E402

# Generic mailboxes worth probing on a company's own domain. These are the
# addresses a stranger would actually try, which is what makes a dead one
# embarrassing rather than merely trivia.
FRONT_DESK = ("hello", "contact", "info", "support", "sales", "team", "press")


def audit_target(domain: str) -> dict:
    domain = norm_domain(domain)
    out = {"domain": domain, "collected_at": now(), "addresses": [],
           "catchall": False, "mx": None, "notes": []}

    mx, status = resolve_mx(domain)
    out["mx"] = mx
    if status == "dnsfail":
        out["notes"].append("DNS did not answer; nothing claimed")
        return out
    if not mx:
        out["notes"].append("domain accepts no mail at all")
        return out

    dverdict, _, ddetail = classify_domain(domain)
    if dverdict == "CATCHALL":
        out["catchall"] = True
        out["notes"].append(
            "domain is catch-all: it accepts every address, including "
            "random ones, so no verifier can confirm any individual mailbox")
    elif dverdict == "GATED":
        out["notes"].append(f"behind an enterprise gateway ({ddetail})")

    found: dict[str, str] = {}
    for url in find_policy_urls(domain):
        _, html = fetch(url)
        if not html:
            continue
        for em in extract_contacts(html, PRIVACY_LOCALS):
            found.setdefault(em, url)
        time.sleep(0.3)
    for em in read_security_txt(domain):
        found.setdefault(em, f"https://{domain}/.well-known/security.txt")

    for local in FRONT_DESK:
        found.setdefault(f"{local}@{domain}", "common front-desk address")

    for em, evidence in sorted(found.items()):
        rec = probe(em)
        out["addresses"].append({"email": em, "evidence": evidence, **rec})
        time.sleep(0.4)

    return out


def draft_email(pack: dict, company: str) -> str:
    """The note that goes with the findings. Short, specific, no pitch."""
    d = pack["domain"]
    dead = [a for a in pack["addresses"] if a.get("confirmed_dead")]
    live = [a for a in pack["addresses"] if a.get("verdict") == "SEND"]

    if dead:
        lead = (f"{len(dead)} of the addresses on {d} are dead — a real "
                f"sender gets a hard bounce:\n\n"
                + "\n".join(f"  {a['email']}  ->  {str(a['detail'])[:70]}"
                            for a in dead))
        close = "Might be nothing, might be a form nobody's checked in a year."
    elif pack["catchall"]:
        lead = (f"{d} is catch-all — it accepts literally any address, "
                f"including a random 22-character one I made up. So nothing "
                f"can confirm an individual mailbox there, including whatever "
                f"verifier you're running.")
        close = "Worth knowing if you quote deliverability numbers on it."
    elif live:
        lead = (f"Checked the public addresses on {d} — all "
                f"{len(live)} live and answering cleanly. Genuinely rarer "
                f"than it should be.")
        close = "Nothing for you to fix. Filing it as a good example."
    else:
        lead = f"Ran the public addresses on {d}; nothing conclusive came back."
        close = "Mail server refused the probe, which is its right."

    if dead:
        subject = (f"{len(dead)} dead addresses on {d}"
                   if len(dead) > 1 else f"a dead address on {d}")
    elif pack["catchall"]:
        subject = f"{d} is catch-all — worth knowing"
    else:
        subject = f"{d} — clean contact audit"

    return f"""Subject: {subject}

Hi{' ' + company if company else ''} team,

I built an open-source SMTP verifier and I've been pointing it at companies
whose business is email, on the theory that they'd want to know.

{lead}

{close}

Method is here if you want to check my working, or run it yourself against
anything: https://github.com/omm9846/verdict — MIT, runs local, nothing
uploads.

- Om
"""


def render(pack: dict, company: str) -> str:
    lines = [f"# {company or pack['domain']} — contact audit",
             "", f"- domain: `{pack['domain']}`",
             f"- mail server: `{pack['mx'] or 'none'}`",
             f"- collected: {pack['collected_at']}", ""]
    for n in pack["notes"]:
        lines.append(f"> {n}")
    if pack["notes"]:
        lines.append("")

    if pack["addresses"]:
        lines += ["| address | verdict | server said | where we found it |",
                  "| --- | --- | --- | --- |"]
        # EXTRACTION_SUSPECT rows are our parsing noise, not their problem.
        for a in [x for x in pack["addresses"]
                  if x.get("verdict") != "EXTRACTION_SUSPECT"]:
            v = "**DEAD**" if a.get("confirmed_dead") else a.get("verdict", "?")
            lines.append(f"| `{a['email']}` | {v} | "
                         f"{str(a.get('detail', ''))[:110]} | {a['evidence']} |")
        lines.append("")

    lines += ["---", "", "## Draft note", "", "```",
              draft_email(pack, company).strip(), "```", ""]
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--domains", required=True)
    ap.add_argument("--out", default="packs")
    ap.add_argument("--names", help="optional JSON [{company, domain}] for nicer titles")
    ap.add_argument("--workers", type=int, default=4)
    a = ap.parse_args()

    names: dict[str, str] = {}
    if a.names and os.path.exists(a.names):
        for row in json.load(open(a.names, encoding="utf-8")):
            if row.get("domain"):
                names[norm_domain(row["domain"])] = row.get("company", "")

    with open(a.domains, encoding="utf-8") as f:
        doms = [l.strip() for l in f if l.strip() and not l.startswith("#")]

    os.makedirs(a.out, exist_ok=True)
    summary = []

    with ThreadPoolExecutor(max_workers=a.workers) as pool:
        futs = {pool.submit(audit_target, d): d for d in doms}
        for fut in as_completed(futs):
            d = norm_domain(futs[fut])
            try:
                pack = fut.result()
            except Exception as e:
                log(f"  {d}: {e}")
                continue
            company = names.get(d, "")
            path = os.path.join(a.out, f"{d}.md")
            with open(path, "w", encoding="utf-8") as fh:
                fh.write(render(pack, company))
            dead = sum(1 for x in pack["addresses"] if x.get("confirmed_dead"))
            summary.append((d, company, dead, pack["catchall"],
                            len(pack["addresses"])))
            log(f"  {d:<28} dead={dead} catchall={pack['catchall']}")

    print(f"\n{len(summary)} packs -> {a.out}/\n")
    print(f"{'domain':<28} {'company':<20} {'dead':>4} {'catchall':>9} {'probed':>7}")
    for d, c, dead, ca, n in sorted(summary, key=lambda r: -r[2]):
        print(f"{d:<28} {c[:20]:<20} {dead:>4} {str(ca):>9} {n:>7}")
    hot = [r for r in summary if r[2] > 0]
    print(f"\n{len(hot)} targets have at least one dead address — send those first.")


if __name__ == "__main__":
    main()
