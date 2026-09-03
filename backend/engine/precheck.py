"""DNS-tier verification.

Everything that can be established about an address without opening an SMTP
connection. This exists because outbound port 25 is blocked on essentially
every cloud host — Render, Vercel, AWS, GCP, Azure, Fly, Heroku — so the
hosted service cannot probe mailboxes and must not pretend otherwise.

What this catches for certain:
  - malformed addresses
  - domains that do not resolve at all
  - domains that resolve but refuse mail (no MX, no A, or RFC 7505 null MX)
  - disposable / burner domains
  - near-miss typos of large providers

What it cannot catch, ever:
  - whether a specific mailbox exists on a live domain

That last one is the whole point of the product, and it needs a real SMTP
probe. The honest split is: this runs anywhere, verify.py runs where port 25
is open.
"""
from __future__ import annotations

import re

import dns.resolver

from engine.verify import (
    CONSUMER_PROVIDERS,
    ENTERPRISE_GATES,
    COMMON_DOMAINS,
    resolve_mx,
    suggest_domain,
)

SYNTAX_RE = re.compile(r"^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$")

# Mailboxes that reach a function rather than a person. Not invalid, but a
# cold email to one of these is going to a shared inbox, which is worth saying.
ROLE_LOCALS = {
    "info", "contact", "hello", "admin", "support", "sales", "help",
    "office", "team", "mail", "enquiries", "inquiries", "webmaster",
    "postmaster", "abuse", "security", "privacy", "legal", "billing",
    "noreply", "no-reply", "donotreply", "marketing", "press", "careers",
    "jobs", "hr", "accounts", "finance", "service", "customerservice",
}

# Burner providers. Deliverable today, gone tomorrow.
DISPOSABLE_DOMAINS = {
    "mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com",
    "temp-mail.org", "throwawaymail.com", "yopmail.com", "trashmail.com",
    "sharklasers.com", "getairmail.com", "dispostable.com", "maildrop.cc",
    "fakeinbox.com", "mytemp.email", "getnada.com", "emailondeck.com",
    "spamgourmet.com", "mohmal.com", "tempr.email", "moakt.com",
    "burnermail.io", "anonaddy.com", "simplelogin.io", "33mail.com",
}

def _txt(domain: str, prefix: str = "") -> list[str]:
    name = f"{prefix}{domain}" if prefix else domain
    try:
        answers = dns.resolver.resolve(name, "TXT", lifetime=6)
        return [b"".join(r.strings).decode("utf-8", "ignore") for r in answers]
    except Exception:
        return []


def precheck(email: str) -> dict:
    """DNS-tier verdict.

    verdict is one of:
      DEAD      - cannot receive mail, established without an SMTP probe
      RISKY     - reachable but the mailbox is behind a gateway, disposable,
                  or a shared role account
      PLAUSIBLE - the domain accepts mail; whether this mailbox exists is
                  unknown from DNS alone and needs the SMTP gate
      UNKNOWN   - DNS did not answer; no evidence either way
    """
    email = (email or "").strip()
    out: dict = {
        "email": email,
        "checks": [],
        "smtp_probed": False,
        "note": "DNS-tier only. Mailbox existence needs an SMTP probe; "
                "run the engine locally for that.",
    }

    def add(name, ok, detail):
        out["checks"].append({"check": name, "ok": ok, "detail": detail})

    if not SYNTAX_RE.match(email):
        add("syntax", False, "not a valid address format")
        return {**out, "verdict": "DEAD", "detail": "malformed address"}
    add("syntax", True, "valid format")

    local, domain = email.rsplit("@", 1)
    local_l, domain = local.lower(), domain.lower()

    typo = suggest_domain(domain)
    if typo:
        add("typo", False, f"did you mean {local}@{typo}?")
        out["suggestion"] = f"{local}@{typo}"
    else:
        add("typo", True, "domain spelled like a real provider")

    if domain in DISPOSABLE_DOMAINS:
        add("disposable", False, "burner/disposable provider")
        return {**out, "verdict": "RISKY", "mx": None,
                "detail": "disposable address; deliverable now, gone later"}
    add("disposable", True, "not a known burner domain")

    mx, status = resolve_mx(domain)
    if status == "dnsfail":
        add("mx", None, "DNS lookup failed")
        return {**out, "verdict": "UNKNOWN", "mx": None,
                "detail": "DNS did not answer; no evidence either way"}
    if status == "nomx" or not mx:
        add("mx", False, "domain accepts no mail (no MX, no A, or null MX)")
        return {**out, "verdict": "DEAD", "mx": None,
                "detail": "domain cannot receive mail at all"}
    add("mx", True, f"accepts mail via {mx}")
    out["mx"] = mx

    is_role = local_l.split("+")[0] in ROLE_LOCALS
    add("role_account", not is_role,
        "shared/role mailbox, not a person" if is_role else "looks person-addressed")

    low = mx.lower()
    gate = next((g for g in ENTERPRISE_GATES if g in low), None)
    if gate:
        add("gateway", False, f"enterprise gateway: {gate}")
    else:
        add("gateway", True, "no filtering gateway detected")

    consumer = domain in CONSUMER_PROVIDERS
    add("provider", True, "consumer provider" if consumer else "corporate domain")

    spf = any(t.lower().startswith("v=spf1") for t in _txt(domain))
    dmarc = any(t.lower().startswith("v=dmarc1") for t in _txt(domain, "_dmarc."))
    add("spf", spf, "SPF published" if spf else "no SPF record")
    add("dmarc", dmarc, "DMARC published" if dmarc else "no DMARC record")

    if typo:
        # A registered typosquat has perfectly good MX records, so every DNS
        # signal says "fine". Near-miss on a major provider is the strongest
        # thing we can say without a probe, so it outranks the rest.
        return {**out, "verdict": "RISKY",
                "detail": f"looks like a typo of {typo} — mail here reaches a "
                          f"squatter, not your recipient"}
    if gate:
        return {**out, "verdict": "RISKY",
                "detail": f"live domain behind {gate}; may reject cold senders"}
    if is_role:
        return {**out, "verdict": "RISKY",
                "detail": "shared role mailbox, not an individual"}
    if consumer:
        return {**out, "verdict": "PLAUSIBLE",
                "detail": "major consumer provider; mailbox existence not probeable here"}
    return {**out, "verdict": "PLAUSIBLE",
            "detail": "domain accepts mail; SMTP probe needed to confirm this mailbox"}
