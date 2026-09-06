"""One command for the whole outreach pipeline.

The steps existed already but as separate scripts, with the list of who had
already been contacted living in my head and in directory diffs. That is how
someone gets mailed twice, which is worse than not mailing them at all.

    verify contacts  ->  draft  ->  send  ->  record

The ledger is the point. Every address that goes out is written to it with the
date and campaign, and every later run skips anyone already there. Nothing is
sent twice even if the same target file is run again by mistake.

    python -m research.campaign --targets ../docs/targets-x.txt \
        --campaign agencies --template clean --limit 15          # dry run
    python -m research.campaign ... --send

Sends are capped per run on purpose. A young domain that goes from 20 messages
a day to 300 gets filtered on reputation, and the ramp matters more than the
total.

On writing the messages
-----------------------
A shared inbox and a named person are not the same recipient and must not get
the same mail. Telling support@ that I worked out their address is absurd:
nobody guesses support@, and the claim reads as a mail merge that does not know
who it is talking to. So the copy is chosen by recipient kind, the worked-out
address claim appears only where it is actually true, and every message carries
one fact about that specific domain's DNS, which no two recipients share.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import time
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from research.contact_audit import log, norm_domain  # noqa: E402
from research.exec_contacts import ROLE_LOCALS, looks_like_person  # noqa: E402
from research.media_pitch import audit_outlet  # noqa: E402
from research.send_pitches import check_recipient, send_resend  # noqa: E402
from engine.domain_audit import check_dmarc, check_spf  # noqa: E402

LEDGER = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                      "outreach-ledger.json")

# Fallback only. A named person is always the better recipient, so these are
# used when the crawl found nobody.
PREFERRED_LOCALS = ("hello", "contact", "info", "team", "outreach", "growth",
                    "sales", "support", "enquiries")

# Used when DNS gave us nothing to say. Carries no claim about the recipient.
GENERIC_FACT = ("For context on why I bothered: most verifiers guess when they "
                "cannot tell, and a guess that says 'valid' is how a list ends "
                "up bouncing.")


def is_role(addr: str) -> bool:
    local = addr.split("@")[0].lower()
    return local in ROLE_LOCALS or not looks_like_person(local)


def first_name(addr: str) -> str:
    """'jane.doe@x.com' -> 'Jane'. Empty unless the local part really is a name.

    Only separated locals qualify. 'tobrien@' is t.obrien, not somebody called
    Tobrien, and greeting a stranger by a mangled name is worse than not
    greeting them at all.
    """
    local = addr.split("@")[0].replace("_", ".").replace("-", ".")
    if "." not in local:
        return ""
    token = local.split(".")[0]
    return token.capitalize() if token.isalpha() and len(token) > 2 else ""


def variant(domain: str, options: tuple[str, ...]) -> str:
    """Pick deterministically from the domain, so a re-run is byte-identical
    but two recipients are not. Random would make the ledger a liar about what
    each person actually received.
    """
    h = hashlib.sha256(domain.encode()).digest()
    return options[h[0] % len(options)]


def observed_fact(domain: str, pack: dict) -> tuple[str, bool]:
    """One true, checkable sentence about this specific domain.

    This is what stops the mail being a template: it is the only part that
    could not have been sent to anyone else. Which means it has to be right.
    A check that did not resolve says nothing at all - telling a stranger
    their DNS is broken when our resolver simply timed out is the fastest way
    to be dismissed, and we have made that mistake before.
    """
    for note in pack.get("notes", []):
        if "gateway" in note:
            return (f"Incidentally, {domain} sits behind a filtering gateway, "
                    f"so most verifiers cannot tell you whether any individual "
                    f"mailbox on it is real. Mine says so rather than "
                    f"guessing.", True)

    try:
        dmarc = check_dmarc(domain)
        spf = check_spf(domain)
    except Exception:
        return GENERIC_FACT, False

    if dmarc["status"] == "fail":
        return (f"Unrelated, but worth knowing: {domain} publishes no DMARC "
                f"record. Anyone can send mail that looks like it came from "
                f"you, and you get no report when they do.", True)
    if dmarc["status"] == "warn":
        return (f"Unrelated, but worth knowing: {domain} publishes DMARC at "
                f"p=none, so mail spoofed in your name is monitored but still "
                f"delivered.", True)

    if spf["status"] == "fail":
        if "No SPF record" in spf["detail"]:
            return (f"Unrelated, but worth knowing: {domain} publishes no SPF "
                    f"record, so receivers have no list of who is allowed to "
                    f"send as you.", True)
        return (f"Unrelated, but worth knowing: the SPF record on {domain} has "
                f"a problem. {spf['detail'].rstrip('.')}. That quietly costs "
                f"you inbox placement.", True)

    if "unknown" in (dmarc["status"], spf["status"]):
        # We did not manage to look. Claim nothing.
        return GENERIC_FACT, False

    return (f"For what it is worth, {domain} is in the minority that has SPF "
            f"and DMARC both set up properly. Rarer than it should be.", False)


# Copy is keyed by recipient kind. 'person' may claim the address was worked
# out from a pattern, because it was. 'role' may not.
TEMPLATES = {
    "clean": {
        "person": {
            "subjects": ("did this one land?",
                         "worked out your address, checking it arrived",
                         "a guess that had to not bounce"),
            "openers": (
                "I worked this address out from your domain's pattern rather "
                "than buying it from anyone, then checked it would not bounce "
                "before sending. That check is the thing I built.",
                "Your address here is a guess from how the rest of your domain "
                "is laid out. The part worth your time is that I could tell it "
                "was live before sending, which is what I built.",
                "This address was inferred, not looked up. It went out only "
                "because the tool I built said it would not bounce.",
            ),
        },
        "role": {
            "subjects": ("for whoever owns outbound at {domain}",
                         "bounce rates, for the right person at {domain}",
                         "please pass to whoever runs your cold outreach"),
            "openers": (
                "Writing to the shared inbox because I could not find a named "
                "contact. Please pass this to whoever owns outbound email.",
                "This is the only address published for you, so apologies for "
                "the shared inbox. It is meant for whoever runs outreach.",
                "No named contact published, hence the general address. Worth "
                "thirty seconds of whoever handles your sending domain.",
            ),
        },
        "pitch": {
            "person": (
                "It runs over a whole list the same way and pulls out the dead "
                "addresses, the typos, and the ones nobody can verify at all, "
                "so the bounces never leave your outbox and your sending "
                "domain stops taking the hit."
            ),
            "role": (
                "The tool is a bounce gate. It reads a list before you send it "
                "and drops the addresses that would hard-bounce, so your "
                "sending domain stops absorbing the damage a bad list does."
            ),
        },
        "evidence": (
            "On my own outreach it caught 24 dead addresses across 72 "
            "contacts. Bounce came in around 2%.",
            "Across 72 contacts of my own it stopped 24 messages that would "
            "have bounced. What did go out bounced at about 2%.",
            "It held back 24 of 72 addresses on my own list. The remainder "
            "bounced at roughly 2%.",
        ),
        "cta": "Free, no signup, nothing stored:\nhttps://tryverdict.org/clean",
    },
    "spoofable": {
        "person": {
            "subjects": ("your domain, and the front door",
                         "checked {domain} against the top 1,200",
                         "anyone can send mail as most domains"),
            "openers": (
                "I checked the top 1,200 sites for whether a stranger can send "
                "email in their name. Yours came up while I was reading the "
                "results, so this is going to you directly.",
                "A survey I ran across the top 1,200 domains turned up "
                "something about yours, so this is going to you rather than to "
                "a desk.",
                "Ran a spoofing survey over the top 1,200 domains. Writing to "
                "you because of what it said about yours.",
            ),
        },
        "role": {
            "subjects": ("who owns DNS at {domain}?",
                         "spoofing check on {domain}, for your IT lead",
                         "one DNS record, for whoever owns it"),
            "openers": (
                "No named contact published, so this is going to the shared "
                "inbox. It needs whoever controls your DNS records.",
                "Please forward to whoever owns DNS. It is a one-record fix "
                "and it is not a sales pitch.",
                "For your IT or security lead, whoever holds the DNS zone.",
            ),
        },
        "pitch": {
            "person": (
                "Across those 1,200, of the domains that accept mail at all, a "
                "third have nothing stopping a stranger sending email in their "
                "name, and the owner never finds out it happened."
            ),
            "role": (
                "I surveyed the top 1,200 sites for this. Of the ones that "
                "accept mail, a third have nothing stopping a stranger sending "
                "email in their name, and the owner never finds out."
            ),
        },
        "evidence": (
            ".net is worst at 54.8%. .com is 26.4%.",
            "By TLD it is worst on .net at 54.8%, against 26.4% on .com.",
            "The spread is wide: 54.8% of .net, 26.4% of .com.",
        ),
        "cta": ("Method, and your own domain checked in three seconds:\n"
                "https://tryverdict.org/spoofable\n\n"
                "Public DNS only. Nothing was sent to anyone."),
    },
    "private": {
        "person": {
            "subjects": ("the verifier that never sees your client lists",
                         "verifying {domain}'s lists without uploading them",
                         "your clients' lists, and where they get uploaded"),
            "openers": (
                "You run outreach for clients, so their contact lists are your "
                "responsibility - and every email verifier on the market makes "
                "you upload that list to their servers before it will check a "
                "thing. That is the part I could not get comfortable with, so "
                "I built the other kind.",
                "Every verifier you can buy wants your list uploaded to their "
                "cloud first. For an agency holding clients' contacts that is "
                "a promise you make on someone else's behalf. I built one that "
                "does not ask.",
                "Quick one about the lists you clean for clients: the tools "
                "that check them all take a copy first. I built one that never "
                "sees the list at all, and thought you would be the right "
                "person to tell.",
            ),
        },
        "role": {
            "subjects": ("for whoever owns client data at {domain}",
                         "list verification that never leaves your servers",
                         "please pass to whoever cleans client lists"),
            "openers": (
                "Writing to the shared inbox because I could not find a named "
                "contact. Please pass this to whoever cleans client lists "
                "before a send.",
                "No named contact published, so this is going to the general "
                "address. It is for whoever is responsible for client contact "
                "data.",
                "For whoever owns deliverability and the client lists that "
                "feed it - apologies for the shared inbox.",
            ),
        },
        "pitch": {
            "person": (
                "Verdict is the one verifier that never sees the list. It is "
                "open source and runs on your own machine, so a client's "
                "contacts never leave it - the thing a DPA is supposed to "
                "promise and a cloud uploader structurally cannot. And it "
                "tells you which addresses it genuinely cannot confirm instead "
                "of labelling them 'valid' to pad a number, so you stop "
                "trusting a green tick that was really a guess."
            ),
            "role": (
                "Verdict is open source and runs on your own machine, so the "
                "list it checks never leaves your servers - no upload, nothing "
                "for a client to worry about in a DPA. And it is honest about "
                "the addresses it cannot confirm rather than calling them "
                "'valid' to look good, which is what quietly lands a "
                "clean-looking list in the spam folder anyway."
            ),
        },
        "evidence": (
            "On my own outreach it caught 24 dead addresses across 72 "
            "contacts, and the list never left my laptop.",
            "Across 72 of my own contacts it stopped 24 that would have "
            "bounced, without a single address being uploaded anywhere.",
            "It held back 24 of 72 addresses on my own list, all checked "
            "locally, nothing sent to a third party.",
        ),
        "cta": ("MIT-licensed, runs locally, nothing uploaded:\n"
                "https://tryverdict.org/clean"),
    },
}


def compose(domain: str, addr: str, template: str, pack: dict,
            display_name: str | None = None) -> dict:
    """Build one message for one recipient. No two come out the same.

    display_name is set when the recipient is a known, verified person (a
    founder found and confirmed by name), so the greeting uses their real first
    name rather than one guessed from the local part, and the message is always
    the person variant.
    """
    tpl = TEMPLATES[template]
    if display_name:
        kind = "person"
    else:
        kind = "role" if is_role(addr) else "person"
    side = tpl[kind]

    subject = variant(domain + "s", side["subjects"]).format(domain=domain)
    opener = variant(domain + "o", side["openers"])
    if display_name:
        name = display_name.split()[0]
    else:
        name = first_name(addr) if kind == "person" else ""
    greeting = f"Hi {name}," if name else "Hi,"

    fact, finding = observed_fact(domain, pack)
    parts = [greeting, opener, fact, tpl["pitch"][kind],
             variant(domain + "e", tpl["evidence"]), tpl["cta"]]
    if kind == "role":
        parts.append(f"If outbound email is not a thing at {domain}, say so "
                     f"and I will not write again.")
    parts.append("Om\nhello@tryverdict.org")

    return {"to": addr, "kind": kind, "subject": subject, "finding": finding,
            "body": "\n\n".join(parts) + "\n"}


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
    """A named person beats a shared inbox, always - then honesty about port 25.

    When a live SMTP probe is possible, a confirmed SEND is preferred and a
    named person beats a desk. But on a host without outbound port 25 nothing
    ever returns SEND, and the old code then picked nobody, so the whole
    campaign silently sent zero mail. That is not more honest, it is just
    broken: it refuses to send to hello@ on a live agency domain, which is the
    one address that effectively never bounces.

    So the fallback, used only when no probe could be made, is a known-good
    shared inbox that the DNS tier did not mark dead. This matches how mail has
    always gone out here without port 25, and the send loop still runs a final
    check that stops a DEAD address regardless.
    """
    addrs = pack.get("addresses", [])

    def dead(a: dict) -> bool:
        return a.get("verdict") in ("DEAD", "CATCHALL", "EXTRACTION_SUSPECT") \
            or a.get("confirmed_dead")

    # 1. A real probe got through. Prefer a confirmed live named person, then a
    #    confirmed live desk.
    live = [a["email"] for a in addrs if a.get("verdict") == "SEND"]
    people = [a for a in live if not is_role(a)]
    if people:
        return people[0]
    for want in PREFERRED_LOCALS:
        for addr in live:
            if addr.split("@")[0] == want:
                return addr
    if live:
        return live[0]

    # 2. No probe was possible. Fall back to a preferred shared inbox that the
    #    DNS tier did not rule out. Restricted to PREFERRED_LOCALS so we only
    #    ever guess an address that is safe to assume on an established domain.
    safe = {a["email"].lower() for a in addrs if not dead(a)}
    for want in PREFERRED_LOCALS:
        cand = f"{want}@{pack['domain']}".lower()
        if cand in safe:
            return cand
    return None


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--targets", help="domains file, crawled for a contact")
    ap.add_argument("--from-list", dest="from_list",
                    help="CSV of domain,email,name (already-verified named "
                         "contacts, e.g. from find_founders). Skips the crawl.")
    ap.add_argument("--campaign", required=True,
                    help="name recorded in the ledger, e.g. agencies-oct")
    ap.add_argument("--template", default="clean", choices=sorted(TEMPLATES))
    ap.add_argument("--limit", type=int, default=15,
                    help="maximum sends this run. Ramp slowly.")
    ap.add_argument("--workers", type=int, default=3)
    ap.add_argument("--delay", type=int, default=25)
    ap.add_argument("--show", type=int, default=3,
                    help="how many full drafts to print in a dry run")
    ap.add_argument("--send", action="store_true",
                    help="actually send. Without it this is a dry run.")
    a = ap.parse_args()
    if not a.targets and not a.from_list:
        ap.error("one of --targets or --from-list is required")

    ledger = load_ledger()
    already = ledger.get("sent", {})

    ready: list[tuple[str, dict]] = []

    if a.from_list:
        # Contacts already found and verified elsewhere. Just compose and send,
        # greeting each by the real name, with the ledger doing its usual job of
        # never mailing a domain twice.
        import csv
        rows = []
        with open(a.from_list, encoding="utf-8", newline="") as fh:
            for row in csv.DictReader(fh):
                dom = norm_domain(row.get("domain", ""))
                email = (row.get("email") or "").strip().lower()
                if dom and email and dom not in already:
                    rows.append((dom, email, (row.get("name") or "").strip()))
        log(f"{len(rows)} verified contacts not yet in the ledger")
        for dom, email, name in rows[:a.limit]:
            draft = compose(dom, email, a.template, {"notes": []}, display_name=name)
            ready.append((dom, draft))
            log(f"  {dom:<28} {email:<34} [{name or 'named'}]")
    else:
        with open(a.targets, encoding="utf-8") as fh:
            targets = [norm_domain(l) for l in fh
                       if l.strip() and not l.startswith("#")]

        fresh = [d for d in dict.fromkeys(targets) if d not in already]
        log(f"{len(targets)} targets, {len(targets) - len(fresh)} already "
            f"contacted, {len(fresh)} new")
        if not fresh:
            print("Nothing new to contact.")
            return 0

        # Verify more than we need, since ~one in six yields a live address.
        budget = min(len(fresh), max(a.limit * 8, a.limit))
        log(f"verifying contacts for {budget} domains...")

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
                draft = compose(domain, addr, a.template, pack)
                if a.template == "spoofable" and not draft["finding"]:
                    log(f"  {domain:<28} DNS already correct, no hook, skipped")
                    continue
                ready.append((domain, draft))
                log(f"  {domain:<28} {addr:<34} [{draft['kind']}]")

    if not ready:
        print("No verified live contacts found in this batch.")
        return 0

    people = sum(1 for _, d in ready if d["kind"] == "person")
    print(f"\n{'SENDING' if a.send else 'DRY RUN'} - {len(ready)} message(s), "
          f"template '{a.template}': {people} named, {len(ready) - people} shared\n")

    if not a.send:
        for _, d in ready:
            print(f"  would send -> {d['to']:<38} [{d['kind']}] {d['subject']}")
        for _, d in ready[:a.show]:
            print(f"\n{'-' * 68}\nTo: {d['to']}  [{d['kind']}]\n"
                  f"Subject: {d['subject']}\n\n{d['body']}")
        print("Re-run with --send to deliver.")
        return 0

    key = os.environ.get("RESEND_API_KEY")
    sender = os.environ.get("SMTP_FROM", "Om Soni <hello@tryverdict.org>")
    if not key:
        raise SystemExit("RESEND_API_KEY is not set.")

    sent = failed = 0
    for i, (domain, draft) in enumerate(ready):
        ok, reason = check_recipient(draft["to"])
        if not ok:
            log(f"  SKIP {draft['to']}: {reason}")
            continue

        try:
            send_resend(draft, sender, key)
            sent += 1
            # Record immediately. A crash after sending must not leave someone
            # eligible to be mailed again on the next run.
            already[domain] = {
                "email": draft["to"],
                "campaign": a.campaign,
                "template": a.template,
                "kind": draft["kind"],
                "subject": draft["subject"],
                "at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            }
            ledger["sent"] = already
            save_ledger(ledger)
            print(f"  sent -> {draft['to']}")
        except Exception as e:
            failed += 1
            print(f"  FAILED {draft['to']}: {str(e)[:120]}")

        if i < len(ready) - 1:
            time.sleep(a.delay)

    print(f"\nsent {sent}, failed {failed}. Ledger now holds {len(already)} contacts.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
