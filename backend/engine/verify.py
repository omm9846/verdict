"""Verdict verification engine - SMTP gate."""
import re
import smtplib
import socket
import random
import string
import dns.resolver

ENTERPRISE_GATES = (
    "mimecast", "proofpoint", "barracuda", "pphosted", "messagelabs",
    "symantec", "fireeye", "trendmicro", "forcepoint", "iphero",
    "spamtitan", "mailguard", "dmarcian", "appriver",
)


def get_mx(domain: str):
    try:
        recs = dns.resolver.resolve(domain, "MX")
        best = sorted(recs, key=lambda r: r.preference)
        return str(best[0].exchange).rstrip(".")
    except Exception:
        return None


def _rcpt(mx: str, email: str, timeout: int = 12):
    try:
        with smtplib.SMTP(timeout=timeout) as srv:
            srv.connect(mx, 25)
            srv.helo("verdict.engine")
            srv.mail("probe@verdict.engine")
            code, msg = srv.rcpt(email)
            try:
                srv.quit()
            except Exception:
                pass
        detail = msg.decode(errors="replace") if isinstance(msg, bytes) else str(msg)
        return code, detail
    except Exception as e:
        return None, str(e)[:80]


def classify_domain(domain: str):
    mx = get_mx(domain)
    if not mx:
        return "NOMX", None, "no MX record"
    low = mx.lower()
    if any(g in low for g in ENTERPRISE_GATES):
        return "GATED", mx, f"enterprise gateway: {low}"
    fake = "zz" + "".join(random.choices(string.ascii_lowercase, k=18)) + "@" + domain
    code, detail = _rcpt(mx, fake)
    if code == 250:
        return "CATCHALL", mx, "fake mailbox accepted"
    return "OK", mx, detail[:60]


def verify(email: str):
    """Returns {email, verdict, mx, detail}. Verdict in SEND/RISKY/CATCHALL/DEAD/UNKNOWN."""
    if "@" not in email:
        return {"email": email, "verdict": "BAD", "mx": None, "detail": "malformed"}
    local, domain = email.rsplit("@", 1)

    dverdict, mx, ddetail = classify_domain(domain)
    if dverdict == "NOMX":
        return {"email": email, "verdict": "DEAD", "mx": None, "detail": ddetail}
    if dverdict == "GATED":
        return {"email": email, "verdict": "RISKY", "mx": mx, "detail": ddetail}
    if dverdict == "CATCHALL":
        return {"email": email, "verdict": "CATCHALL", "mx": mx, "detail": ddetail}

    code, detail = _rcpt(mx, email)
    low = (detail or "").lower()
    if any(s in low for s in ("client host", "listed by", "service unavailable",
                              "blocked using", "access denied")):
        return {"email": email, "verdict": "UNKNOWN", "mx": mx,
                "detail": f"probe-ip blocked: {detail[:50]}"}
    if code in (250, 251):
        return {"email": email, "verdict": "SEND", "mx": mx, "detail": detail[:50]}
    if code in (550, 551, 553):
        return {"email": email, "verdict": "DEAD", "mx": mx, "detail": detail[:50]}
    return {"email": email, "verdict": "UNKNOWN", "mx": mx, "detail": str(detail)[:50]}