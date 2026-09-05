"""Grey-area mailbox signals that do not need port 25.

A real RCPT TO on port 25 is the only thing that can prove a mailbox exists or
does not. Every cloud host blocks that outbound, so the hosted engine falls
back to PLAUSIBLE: the domain accepts mail, but this one mailbox was never
probed. This module tries to narrow that gap over plain HTTPS, which Render
does allow.

Two signals survive honest scrutiny. Neither can ever produce a DEAD verdict
on its own, and that is deliberate: a false DEAD is the one mistake this
product cannot afford, and an HTTP side channel is a much weaker witness than a
mail server. So these only ever:

  - raise confidence toward "this mailbox is real", or
  - add a soft "the provider says no such user" lean, still short of DEAD.

1. Gravatar
   Hash the address and ask whether it has an avatar. A hit means a human
   registered this exact address with Gravatar, which is strong positive proof
   the mailbox is real. A miss means nothing at all - most real addresses have
   no Gravatar. Public API, no terms issue, positive-only.

2. Microsoft 365 GetCredentialType
   Business tenants on Microsoft 365 answer an unauthenticated endpoint that
   leaks whether a username exists. Works for any domain whose MX points at
   *.mail.protection.outlook.com. It is grey: Microsoft actively fights
   enumeration, and some tenants are configured to answer "exists" for every
   address to defeat exactly this. That masking is detected the same way the
   SMTP engine detects a catch-all - probe a random control address first, and
   if the tenant claims the control exists too, throw the signal away.

Everything else considered and rejected: Google has no reliable existence
endpoint since gxlu was removed; signup-form probes violate terms and get the
IP blocked; VRFY needs port 25. None of them belong in a product whose whole
pitch is that it only reports what it can actually stand behind.
"""
from __future__ import annotations

import hashlib
import json
import os
import secrets
import urllib.error
import urllib.request

_UA = "verdict-verifier/1.0 (+https://tryverdict.org)"
_TIMEOUT = 6

# Turn the whole module off with one env var if an upstream ever starts
# rate-limiting Render's egress IP.
_ENABLED = os.environ.get("SOFT_SIGNALS", "on").lower() not in ("off", "0", "false")


def _md5(text: str) -> str:
    return hashlib.md5(text.strip().lower().encode("utf-8")).hexdigest()


def gravatar(email: str) -> dict:
    """Positive-only. 'real' when the address has an avatar, else 'none'.

    d=404 makes Gravatar 404 instead of serving a default image, so the status
    code alone answers the question without downloading anything.
    """
    if not _ENABLED:
        return {"source": "gravatar", "signal": "none"}
    url = f"https://www.gravatar.com/avatar/{_md5(email)}?d=404&s=1"
    req = urllib.request.Request(url, method="GET", headers={"User-Agent": _UA})
    try:
        with urllib.request.urlopen(req, timeout=_TIMEOUT) as r:
            if r.status == 200:
                return {"source": "gravatar", "signal": "real",
                        "detail": "a person has a Gravatar on this exact address"}
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return {"source": "gravatar", "signal": "none"}
    except Exception:
        pass
    return {"source": "gravatar", "signal": "none"}


def is_microsoft365(mx: str | None) -> bool:
    return bool(mx) and "mail.protection.outlook.com" in mx.lower()


def _m365_exists(username: str) -> bool | None:
    """One GetCredentialType call. True/False if the answer is usable, else None.

    IfExistsResult: 0 exists, 1 does not, 5/6 federated or other tenant. Only 0
    and 1 are treated as answers; anything else is None so the caller can bail
    rather than guess.
    """
    body = json.dumps({"Username": username}).encode("utf-8")
    req = urllib.request.Request(
        "https://login.microsoftonline.com/common/GetCredentialType",
        data=body, method="POST",
        headers={"Content-Type": "application/json; charset=UTF-8",
                 "User-Agent": _UA, "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=_TIMEOUT) as r:
            data = json.loads(r.read().decode("utf-8", "ignore"))
    except Exception:
        return None
    res = data.get("IfExistsResult")
    if res == 0:
        return True
    if res == 1:
        return False
    return None


def microsoft365(email: str, mx: str | None) -> dict:
    """Existence via M365, positive-only, with a control to unmask the tenant.

    Returns signal in {real, none}. Never 'dead' and never even 'likely_gone',
    and the reason is worth stating because it is not obvious. Tenants mask in
    two opposite ways: some answer "exists" for every address, some answer
    "does not exist" for every address (federation, conditional access, a
    catch-all that is not an M365 mailbox at all). A random control catches the
    first - if the control "exists", throw everything away. It cannot catch the
    second, because there is no address we know should exist to test against.

    So a negative is uninterpretable: a genuinely dead mailbox and a
    deny-everything tenant look identical, and github.com proves it - support@
    is real and this endpoint reports it absent. A positive is not: the control
    "does not exist" while the real address "exists" means the endpoint is
    actually discriminating, so the yes is real. We keep only the yes.
    """
    if not _ENABLED or not is_microsoft365(mx):
        return {"source": "microsoft365", "signal": "none"}

    domain = email.split("@")[-1]
    control = f"verdict-control-{secrets.token_hex(8)}@{domain}"
    control_exists = _m365_exists(control)
    if control_exists is None:
        return {"source": "microsoft365", "signal": "none"}  # endpoint unusable
    if control_exists is True:
        return {"source": "microsoft365", "signal": "none",
                "detail": "tenant answers 'exists' for every address (masked)"}

    # Control does not exist, so the endpoint discriminates on this tenant. A
    # yes about the real address can be trusted; a no cannot (see docstring).
    if _m365_exists(email) is True:
        return {"source": "microsoft365", "signal": "real",
                "detail": "Microsoft 365 confirms this account exists"}
    return {"source": "microsoft365", "signal": "none"}


def gather(email: str, mx: str | None) -> dict:
    """Best available soft signal for an un-probed address.

    Order matters: a positive confirmation ends the search, since nothing a
    second source could add would beat "a mail provider says this exists". A
    negative M365 lean is only reported when no positive was found.
    """
    if not _ENABLED:
        return {"signal": "none", "sources": []}

    tried = []

    g = gravatar(email)
    tried.append(g)
    if g["signal"] == "real":
        return {"signal": "real", "source": "gravatar",
                "detail": g["detail"], "sources": tried}

    m = microsoft365(email, mx)
    tried.append(m)
    if m["signal"] == "real":
        return {"signal": "real", "source": "microsoft365",
                "detail": m.get("detail", ""), "sources": tried}

    return {"signal": "none", "sources": tried}
