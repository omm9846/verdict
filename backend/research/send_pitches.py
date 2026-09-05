"""Send the pitch drafts from your own mailbox, one at a time.

Deliberately not an ESP. Transactional providers forbid unsolicited mail, and
a domain four days old has no reputation to spend - so this speaks SMTP to
your own provider, which makes it ordinary 1:1 business mail rather than a
campaign. Credentials come from the environment and are never written down.

Every recipient is verified with our own engine immediately before its message
goes out. Pitching a story about dead mailboxes into a dead mailbox is the
funniest possible way to lose it, and a bounce on this particular story is
worse than no send at all.

Setup (GoDaddy Professional Email):

    export SMTP_HOST=smtpout.secureserver.net
    export SMTP_PORT=587
    export SMTP_USER=hello@tryverdict.org
    export SMTP_PASS='...'            # app password, not your account password
    export SMTP_FROM='Om Soni <hello@tryverdict.org>'

Usage:

    python -m research.send_pitches --drafts drafts.json            # dry run
    python -m research.send_pitches --drafts drafts.json --send     # actually send
    python -m research.send_pitches --drafts drafts.json --send --limit 5

drafts.json is a list of {"to", "subject", "body", "outlet"}.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import smtplib
import ssl
import urllib.error
import urllib.request
import sys
import time
from email.message import EmailMessage
from email.utils import formatdate, make_msgid

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from engine.verify import verify  # noqa: E402

# Long enough that the run looks like a person working through a list rather
# than a machine emptying a queue, which is what providers rate-limit on.
DELAY_SECONDS = 90


def load_drafts(path: str) -> list[dict]:
    drafts = json.load(open(path, encoding="utf-8"))
    for d in drafts:
        for field in ("to", "subject", "body"):
            if not d.get(field):
                raise SystemExit(f"draft missing {field!r}: {d}")
    return drafts


def check_recipient(addr: str) -> tuple[bool, str]:
    """Returns (safe_to_send, reason).

    UNKNOWN is allowed through: large outlets sit behind gateways that refuse
    probes, and refusing to send to every one of them would drop the best
    targets on the list. Only a confirmed dead mailbox is a hard stop.
    """
    r = verify(addr)
    v = r.get("verdict")
    detail = str(r.get("detail", ""))[:60]
    if v == "DEAD":
        return False, f"DEAD - {detail}"
    if v == "CATCHALL":
        return True, "catch-all: accepted, but nobody may read it"
    if v == "UNKNOWN":
        return True, f"unverifiable (server refused probe) - {detail}"
    if v == "RISKY":
        return True, f"gateway - {detail}"
    return True, f"live - {detail}"


def build(draft: dict, sender: str) -> EmailMessage:
    msg = EmailMessage()
    msg["From"] = sender
    msg["To"] = draft["to"]
    msg["Subject"] = draft["subject"]
    msg["Date"] = formatdate(localtime=True)
    msg["Message-ID"] = make_msgid(domain=sender.split("@")[-1].strip(">"))
    # No List-Unsubscribe and no tracking: this is a personal message, and
    # dressing it as bulk mail is what gets it filtered as bulk mail.
    msg.set_content(draft["body"])
    return msg


def send_resend(draft: dict, sender: str, api_key: str):
    """Send one message through the Resend API.

    No tracking and no List-Unsubscribe: this is a personal message to a named
    recipient, and dressing it as bulk mail is what gets it filtered as bulk
    mail. reply_to is set explicitly so a reply reaches the mailbox a human
    actually reads.
    """
    reply_to = re.search(r"<([^>]+)>", sender)
    payload = {
        "from": sender,
        "to": [draft["to"]],
        "subject": draft["subject"],
        "text": draft["body"],
        "reply_to": reply_to.group(1) if reply_to else sender,
    }
    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Authorization": f"Bearer {api_key}",
                 "Content-Type": "application/json",
                 # Resend sits behind Cloudflare, which blocks the default
                 # Python-urllib agent outright with a 403/1010.
                 "User-Agent": "verdict-outreach/0.1",
                 "Accept": "application/json"},
        method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            body = json.loads(r.read().decode("utf-8"))
        if not body.get("id"):
            raise RuntimeError(f"no id in response: {body}")
        return body["id"]
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"resend {e.code}: {e.read().decode('utf-8')[:200]}") from None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--drafts", required=True)
    ap.add_argument("--send", action="store_true",
                    help="actually send. Without it, this is a dry run.")
    ap.add_argument("--limit", type=int, help="send at most N messages")
    ap.add_argument("--delay", type=int, default=DELAY_SECONDS)
    ap.add_argument("--via", choices=("smtp", "resend"), default="smtp",
                    help="smtp uses your own mailbox; resend uses the API")
    a = ap.parse_args()

    host = os.environ.get("SMTP_HOST", "smtpout.secureserver.net")
    port = int(os.environ.get("SMTP_PORT", "587"))
    user = os.environ.get("SMTP_USER")
    password = os.environ.get("SMTP_PASS")
    sender = os.environ.get("SMTP_FROM") or user

    drafts = load_drafts(a.drafts)
    if a.limit:
        drafts = drafts[:a.limit]

    resend_key = os.environ.get("RESEND_API_KEY")
    if a.send and a.via == "smtp" and not (user and password):
        raise SystemExit("SMTP_USER and SMTP_PASS must be set to send over SMTP.")
    if a.send and a.via == "resend" and not resend_key:
        raise SystemExit("RESEND_API_KEY must be set to send via Resend.")
    if a.via == "resend" and not sender:
        sender = os.environ.get("SMTP_FROM", "Om Soni <hello@tryverdict.org>")

    print(f"{'DRY RUN' if not a.send else 'SENDING'} - {len(drafts)} message(s)")
    route = "Resend API" if a.via == "resend" else f"{host}:{port}"
    print(f"from {sender} via {route}\n")

    checked = []
    for d in drafts:
        ok, reason = check_recipient(d["to"])
        checked.append((d, ok, reason))
        flag = "  " if ok else "SKIP"
        print(f"{flag} {d['to']:<34} {reason}")

    sendable = [(d, r) for d, ok, r in checked if ok]
    print(f"\n{len(sendable)} sendable, {len(checked) - len(sendable)} skipped")

    if not a.send:
        print("\nDry run. Re-run with --send to deliver.")
        for d, _ in sendable[:2]:
            print(f"\n--- preview: {d['to']} ---")
            print(f"Subject: {d['subject']}")
            print(d["body"][:400] + ("..." if len(d["body"]) > 400 else ""))
        return

    context = ssl.create_default_context()
    sent = failed = 0

    for i, (d, _) in enumerate(sendable):
        try:
            if a.via == "resend":
                send_resend(d, sender, resend_key)
            elif port == 465:
                with smtplib.SMTP_SSL(host, port, context=context, timeout=30) as srv:
                    srv.login(user, password)
                    srv.send_message(build(d, sender))
            else:
                with smtplib.SMTP(host, port, timeout=30) as srv:
                    srv.starttls(context=context)
                    srv.login(user, password)
                    srv.send_message(build(d, sender))
            sent += 1
            print(f"  sent -> {d['to']}")
        except Exception as e:
            failed += 1
            print(f"  FAILED {d['to']}: {str(e)[:160]}")

        if i < len(sendable) - 1:
            time.sleep(a.delay)

    print(f"\nsent {sent}, failed {failed}")


if __name__ == "__main__":
    main()
