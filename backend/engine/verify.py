"""Verdict verification engine - SMTP gate + consumer provider fast-path."""
import os
import re
import time
import smtplib
import socket
import random
import string
import threading
import dns.resolver

CONSUMER_PROVIDERS = {
    "gmail.com", "googlemail.com",
    "outlook.com", "hotmail.com", "live.com", "msn.com",
    "yahoo.com", "yahoo.co.uk", "ymail.com",
    "icloud.com", "me.com", "mac.com",
    "protonmail.com", "proton.me",
    "aol.com", "zoho.com", "gmx.com", "mail.com",
    "yandex.ru", "yandex.com", "fastmail.com",
}

ENTERPRISE_GATES = (
    "mimecast", "proofpoint", "barracuda", "pphosted", "messagelabs",
    "symantec", "fireeye", "trendmicro", "forcepoint", "iphero",
    "spamtitan", "mailguard", "dmarcian", "appriver",
)

DISPOSABLE_DOMAINS = {
    "mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com",
    "temp-mail.org", "throwawaymail.com", "yopmail.com", "trashmail.com",
    "sharklasers.com", "getairmail.com", "dispostable.com", "maildrop.cc",
    "fakeinbox.com", "mytemp.email", "getnada.com", "emailondeck.com",
    "spamgourmet.com", "mohmal.com", "tempr.email", "moakt.com",
    "burnermail.io", "anonaddy.com", "simplelogin.io", "33mail.com",
}

# Role accounts (shared mailboxes, not individuals)
ROLE_LOCALS = {
    "info", "contact", "hello", "admin", "support", "sales", "help",
    "office", "team", "mail", "enquiries", "inquiries", "webmaster",
    "postmaster", "abuse", "security", "privacy", "legal", "billing",
    "noreply", "no-reply", "donotreply", "marketing", "press", "careers",
    "jobs", "hr", "accounts", "finance", "service", "customerservice",
}


# Result caches. Every probe costs an SMTP connection from our egress IP, and
# receiving MTAs rate-limit or blacklist that IP under load. Caching means 500
# people checking the same domain costs one probe, not 500.
_DOMAIN_TTL = 6 * 3600   # MX + catch-all posture barely moves
_EMAIL_TTL = 1 * 3600    # a mailbox can be created/deleted, so expire sooner
_CACHE_MAX = 5000

_domain_cache = {}
_email_cache = {}
_cache_lock = threading.Lock()


# HELO name + MAIL FROM used for probes. These must be a REAL, resolvable
# domain: many MTAs reject a sender whose domain has no MX/A record with
# "4.1.8 Sender address rejected", which turns a good probe into UNKNOWN.
PROBE_DOMAIN = os.environ.get("VERDICT_PROBE_DOMAIN", "tryverdict.org")
PROBE_SENDER = os.environ.get("VERDICT_PROBE_SENDER", f"probe@{PROBE_DOMAIN}")

# Egress capability cache: whether outbound port 25 is reachable from this
# host. Probing on Render/Vercel/AWS/GCP/Azure where port 25 is blocked wastes 25s+ per
# address and returns nothing useful. Detect it once and skip all SMTP work.
_EGRESS = {"checked": False, "open": None, "ts": 0}

_EGRESS_TTL = 6 * 3600  # 6 hours

# Allow environment override: EGRESS_SMTP_OPEN=false on known-blocked hosts
# (e.g., Render) skips the probe entirely.
_EGRESS_OVERRIDE = os.environ.get("EGRESS_SMTP_OPEN")


def egress_smtp_open():
    """Detect whether outbound port 25 is usable. Cached after first check.

    Returns True if we can open an SMTP connection to a well-known MTA within
    2 seconds. Cloud hosts (Render, Vercel, AWS, GCP, Azure) block egress on
    port 25, so probing is futile - better to skip straight to DNS evidence.
    """
    now = time.time()
    with _cache_lock:
        if _EGRESS["checked"] and (now - _EGRESS["ts"]) < _EGRESS_TTL:
            return _EGRESS["open"]
        _EGRESS["checked"] = True
        _EGRESS["open"] = _test_egress()
        _EGRESS["ts"] = time.time()
        return _EGRESS["open"]


def _test_egress():
    # Quick check: if env says blocked, trust it (for Render, set EGRESS_SMTP_OPEN=false)
    override = _EGRESS_OVERRIDE
    if override is not None:
        return override.lower() in ("1", "true", "yes")
    # Detect known cloud providers that block port 25 - skip probe entirely
    if os.environ.get("RENDER") or os.environ.get("VERCEL") or \
       os.environ.get("AWS_LAMBDA_FUNCTION_NAME") or os.environ.get("AWS_REGION") or \
       os.environ.get("GOOGLE_CLOUD_PROJECT") or os.environ.get("AZURE_CLIENT_ID"):
        return False
    # Quick check: try one well-known MTA with aggressive timeout
    for host in ("gmail-smtp-in.l.google.com", "outlook-com.olc.protection.outlook.com"):
        try:
            s = socket.create_connection((host, 25), timeout=0.5)
            s.close()
            return True
        except Exception:
            continue
    return False


# Domains people fat-finger. A typosquat has real MX records, so no DNS signal
# flags it; the near-miss is the only evidence available without a probe.
COMMON_DOMAINS = (
    "gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "live.com",
    "yahoo.com", "icloud.com", "me.com", "aol.com", "protonmail.com",
    "proton.me", "zoho.com", "gmx.com", "yandex.com", "fastmail.com",
    "msn.com", "comcast.net", "verizon.net", "sbcglobal.net",
)


def _edit_distance(a, b, cap=2):
    """Levenshtein, abandoned once it exceeds cap."""
    if abs(len(a) - len(b)) > cap:
        return cap + 1
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        if min(cur) > cap:
            return cap + 1
        prev = cur
    return prev[-1]


def suggest_domain(domain):
    """Nearest common provider within two edits, if not already one."""
    if domain in COMMON_DOMAINS:
        return None
    best, best_d = None, 3
    for cand in COMMON_DOMAINS:
        d = _edit_distance(domain, cand)
        if d < best_d:
            best, best_d = cand, d
    return best if best_d <= 2 else None


def _cache_get(store, key, ttl):
    with _cache_lock:
        hit = store.get(key)
    if hit and (time.time() - hit[0]) < ttl:
        return hit[1]
    return None


def _cache_put(store, key, value):
    with _cache_lock:
        if len(store) >= _CACHE_MAX:
            store.clear()
        store[key] = (time.time(), value)


def resolve_mxs(domain, attempts=3):
    """Resolve ALL mail exchangers, ordered by preference. Returns (mxs, status).

    status is one of:
      "ok" - mxs is a non-empty list of hosts to probe
      "nomx" - the domain definitively cannot receive mail
      "dnsfail" - we could not find out. NOT the same as "no mailserver".

    Returning every host (not just the first) matters: a domain can list two
    MX records where one is down or blacklisted while the other works. Probing
    only the first is how you get a false DEAD on a healthy domain.

    Separating "no mailserver" from "we couldn't look it up" matters more than
    it looks. Collapsing a DNS timeout into "no MX record" makes a healthy
    domain look DEAD, and a DEAD verdict suppresses an address permanently. A
    resolver hiccup must never be able to burn a real contact, so transient
    failures are retried and then reported as unknown.
    """
    for i in range(attempts):
        try:
            # Use custom resolver with aggressive timeouts for cloud environments
            resolver = dns.resolver.Resolver()
            resolver.lifetime = 2.0
            resolver.timeout = 2.0
            resolver.nameservers = ["8.8.8.8", "1.1.1.1"]  # Google + Cloudflare DNS

            recs = resolver.resolve(domain, "MX")
            hosts = sorted(recs, key=lambda r: r.preference)
            mxs = []
            for h in hosts:
                mx = str(h.exchange).rstrip(".")
                # A single "." target is RFC 7505 null MX: explicitly no mail.
                if mx and mx != ".":
                    mxs.append(mx)
            if mxs:
                return mxs, "ok"
            return None, "nomx"
        except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
            # Definitive: the name exists with no MX, or does not exist at all.
            # RFC 5321 s5.1 - fall back to the A record as an implicit MX.
            try:
                resolver.resolve(domain, "A")
                return [domain], "ok"
            except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
                return None, "nomx"
            except Exception:
                pass
        except Exception:
            # Timeout, SERVFAIL, no working nameserver: transient, so retry.
            if i < attempts - 1:
                time.sleep(0.1)
                continue
    return None, "dnsfail"


def resolve_mx(domain, attempts=3):
    """Back-compat wrapper: first MX host or None."""
    mxs, status = resolve_mxs(domain, attempts)
    return (mxs[0] if mxs else None), status


def get_mx(domain):
    """Back-compat wrapper: host or None. Callers that must distinguish a
    missing mailserver from a failed lookup should use resolve_mxs."""
    return resolve_mx(domain)[0]


def _clean_detail(text, limit=140):
    """Server responses arrive wrapped over several lines, often repeating the
    status code on each. Collapse to one line so the value is safe to drop into
    a table cell, a JSON field or an email body."""
    t = " ".join(str(text or "").split())
    m = re.match(r"(\d\.\d\.\d)\s", t)
    if m:
        # Servers repeat the status code on every wrapped line; keep the first.
        t = m.group(1) + " " + re.sub(re.escape(m.group(1)) + r"\s*", "", t[len(m.group(1)):]).strip()
    return t.strip()[:limit]


def _rcpt(mx, email, timeout=12, retries=0):
    """Probe one MX host for a recipient. On a greylist/transient 451, retry
    once after a short wait if retries>0. Returns (code, detail)."""
    last = None
    for attempt in range(retries + 1):
        try:
            with smtplib.SMTP(timeout=timeout) as srv:
                srv.connect(mx, 25)
                srv.ehlo_or_helo_if_needed()
                srv.docmd("HELO", PROBE_DOMAIN)
                srv.mail(PROBE_SENDER)
                code, msg = srv.rcpt(email)
                try:
                    srv.quit()
                except Exception:
                    pass
            detail = msg.decode(errors="replace") if isinstance(msg, bytes) else str(msg)
            low = detail.lower()
            # Greylist / transient: 451, or the phrase says try again later.
            # The mailbox may be perfectly fine - do not burn it as DEAD.
            if code == 451 or "try again" in low or "greylist" in low or "temporary" in low:
                if attempt < retries:
                    time.sleep(2 + attempt)
                    continue
            return code, detail
        except Exception as e:
            last = str(e)[:80]
            if attempt < retries:
                time.sleep(2 + attempt)
    return None, last or "connection failed"


def _probe_multi(mxs, email, retries=1):
    """Probe every MX host until one gives a definitive answer.

    Returns (code, detail). A domain can list several MX hosts where the first
    is down or blacklisted while the rest work, so giving up after the first
    (usually the one that fails) produces false DEADs. This tries each host in
    preference order and only reports a failure once every host has refused.
    """
    last = (None, "no MX to probe")
    for mx in mxs:
        code, detail = _rcpt(mx, email, retries=retries)
        if code in (250, 251):
            return code, detail
        if code in (550, 551, 553):
            # Only accept a recipient-level rejection as definitive if it's not
            # a probe-block / policy refusal - those say nothing about the user.
            low = (detail or "").lower()
            if not any(s in low for s in ("client host", "listed by", "blocked",
                                          "access denied", "policy")):
                return code, detail
            # policy/block: keep trying others, remember this one
            if last[0] is None:
                last = (code, detail)
    return last


def classify_domain(domain):
    cached = _cache_get(_domain_cache, domain, _DOMAIN_TTL)
    if cached is not None:
        return cached
    result = _classify_domain_uncached(domain)
    if result[0] != "DNSFAIL":
        _cache_put(_domain_cache, domain, result)
    return result


def _classify_domain_uncached(domain):
    mxs, status = resolve_mxs(domain)
    if status == "dnsfail":
        return "DNSFAIL", None, "MX lookup failed; no evidence either way"
    if not mxs:
        return "NOMX", None, "no MX record"
    # Use the first host for gateway detection (gates are first-preference).
    mx = mxs[0]
    low = mx.lower()
    if any(g in low for g in ENTERPRISE_GATES):
        return "GATED", mx, f"enterprise gateway: {low}"
    fake = "zz" + "".join(random.choices(string.ascii_lowercase, k=18)) + "@" + domain
    code, detail = _probe_multi(mxs, fake)
    if code == 250:
        return "CATCHALL", mx, "fake mailbox accepted"
    return "OK", mx, detail[:60]


# RFC 3463 enhanced status codes. A 5xx on RCPT TO does not mean "no such
# mailbox" - it means the server said no, and the reason matters enormously.
# DEAD suppresses an address permanently, so it is reserved for the codes that
# actually name the recipient as the problem.
_ENHANCED_RE = re.compile(r"(?<![0-9.])([245])\.([0-9]{1,3})\.([0-9]{1,3})(?![0-9.])")

# Recipient is the problem: the mailbox does not exist or cannot be delivered to.
_RECIPIENT_STATUS = {(1, 1), (1, 2), (1, 3), (1, 6), (2, 1)}
# The server is refusing us, or cannot answer. The mailbox may be perfectly fine.
#   1.4 ambiguous  2.2 mailbox full (it exists!)  3.x system  4.x network
#   5.x protocol   6.x content     7.x policy / authorisation
_POLICY_CLASS = {3, 4, 5, 6, 7}

_RECIPIENT_PHRASES = (
    "user unknown", "no such user", "unknown user", "recipient not found",
    "does not exist", "doesn't exist", "no mailbox", "mailbox unavailable",
    "invalid recipient", "recipient address rejected", "address rejected",
    "unknown recipient", "no such recipient", "user not found",
    "account that you tried to reach does not exist",
)
_POLICY_PHRASES = (
    "policy", "spam", "blocked", "blacklist", "denied", "not authorized",
    "not authorised", "rejected due to", "greylist", "rate limit",
    "unable to talk", "bad neighbor", "temporarily", "try again",
    "authentication", "relay", "ambiguous", "mailbox full", "over quota",
    "unrouteable", "unroutable", "host lookup failed", "no route",
)


def classify_rejection(detail):
    """Why did the server say no? Returns "recipient", "policy" or "unclear".

    Enhanced status code wins when present - it is machine-readable and
    unambiguous. Otherwise fall back to the human text, and when neither is
    conclusive say so rather than guessing, because guessing wrong in the
    DEAD direction is unrecoverable.
    """
    text = (detail or "")
    low = text.lower()

    m = _ENHANCED_RE.search(text)
    if m:
        subject, sub = int(m.group(2)), int(m.group(3))
        if (subject, sub) in _RECIPIENT_STATUS:
            return "recipient"
        if subject in _POLICY_CLASS or (subject, sub) == (1, 4) or (subject, sub) == (2, 2):
            return "policy"

    if any(p in low for p in _RECIPIENT_PHRASES):
        return "recipient"
    if any(p in low for p in _POLICY_PHRASES):
        return "policy"
    return "unclear"


# DNS signal weights: evidence a mailbox likely exists even when probe is blocked.
def _dns_send_evidence(domain):
    """Score how much evidence points to 'this mailbox is sendable' from DNS alone,
    used to resolve UNKNOWN when every SMTP angle is blocked."""
    score = 0
    signals = []
    mxs, status = resolve_mxs(domain)
    if status == "ok" and mxs:
        score += 2
        signals.append("has live MX records")
    # A real MX host that answers implies the domain actively receives mail.
    for t in _spf_txt(domain):
        if t.lower().startswith("v=spf1"):
            score += 1
            signals.append("publishes SPF")
            break
    if _dmarc_published(domain):
        score += 1
        signals.append("publishes DMARC")
    if domain not in DISPOSABLE_DOMAINS:
        score += 1
        signals.append("not a disposable domain")
    return score, signals


def _spf_txt(domain):
    try:
        answers = dns.resolver.resolve(domain, "TXT", lifetime=6)
        return [b"".join(r.strings).decode("utf-8", "ignore") for r in answers]
    except Exception:
        return []


def _dmarc_published(domain):
    try:
        dns.resolver.resolve("_dmarc." + domain, "TXT", lifetime=6)
        return True
    except Exception:
        return False


def _probe_port(mx, email, port=587, timeout=10):
    """Some MTAs block ad-hoc port-25 probes but allow STARTTLS on 587.
    Returns (code, detail) or (None, reason)."""
    try:
        with smtplib.SMTP(timeout=timeout) as srv:
            srv.connect(mx, port)
            srv.ehlo_or_helo_if_needed()
            srv.docmd("HELO", PROBE_DOMAIN)
            srv.mail(PROBE_SENDER)
            code, msg = srv.rcpt(email)
            try:
                srv.quit()
            except Exception:
                pass
        detail = msg.decode(errors="replace") if isinstance(msg, bytes) else str(msg)
        return code, detail
    except Exception as e:
        return None, str(e)[:80]


def resolve_unknown(email, domain, mx, mxs, primary_detail):
    """Try harder on an UNKNOWN, without ever inventing a verdict.

    Only a real RCPT TO can produce SEND or DEAD. A secondary MX host is worth
    trying because it may sit on a different egress path, but that is still a
    probe. DNS evidence is not: a domain with MX, SPF and DMARC tells you the
    domain accepts mail, and says nothing whatsoever about whether one mailbox
    on it exists.

    An earlier version returned SEND on strong DNS signals alone. That is the
    precise behaviour this product exists to argue against, and it is worse
    coming from us than from anyone else, because our whole claim is that we
    only report what a server actually said.
    """
    for host in mxs:
        if host == mx:
            continue
        code, detail = _rcpt(host, email, retries=0, timeout=6)
        if code in (250, 251):
            return {"email": email, "verdict": "SEND", "mx": host,
                    "detail": "confirmed via secondary MX host"}
        if code in (550, 551, 553):
            if classify_rejection(detail) == "recipient":
                return {"email": email, "verdict": "DEAD", "mx": host,
                        "detail": "secondary MX says no such user"}

    # Ports 587 and 465 were tried here. They cannot work: MX hosts listen on
    # 25 for inbound mail, while 587/465 belong to submission servers on
    # different hostnames entirely. Every attempt timed out, costing six
    # seconds per lookup for a path that has no success case.

    score, signals = _dns_send_evidence(domain)
    if score >= 4 and not any(g in (mx or "").lower() for g in ENTERPRISE_GATES):
        return {"email": email, "verdict": "PLAUSIBLE", "mx": mx,
                "smtp_probed": False,
                "detail": f"domain accepts mail ({', '.join(signals[:3])}), but "
                          f"this mailbox was never probed: {primary_detail[:40]}"}
    return {"email": email, "verdict": "UNKNOWN", "mx": mx,
            "smtp_probed": False,
            "detail": f"could not confirm: {primary_detail[:60]}"}


def _add_soft_signal(result, email):
    """When a mailbox could not be probed, try the HTTP grey-area signals.

    Only runs on PLAUSIBLE and UNKNOWN, i.e. exactly the cases where port 25
    was unavailable and the domain, not the mailbox, is all we know. The signal
    is positive-only by construction (see engine/soft_signals): it can confirm
    a mailbox is real, never that it is dead, so it can lift confidence but can
    never manufacture a false DEAD.
    """
    if result.get("verdict") not in ("PLAUSIBLE", "UNKNOWN"):
        return result
    if result.get("smtp_probed"):
        return result
    try:
        from engine.soft_signals import gather
        sig = gather(email, result.get("mx"))
    except Exception:
        return result
    if sig.get("signal") == "real":
        result["mailbox_confirmed"] = True
        result["confirmed_by"] = sig.get("source", "")
        # Kept distinct from a SEND verdict on purpose: SEND means a mail server
        # answered RCPT, this means a provider's own API vouches for the
        # address over HTTPS. Both are real; they are not the same witness.
        result["detail"] = (f"{sig.get('detail', 'mailbox confirmed real')} "
                            f"(no port-25 probe was possible, so this is an "
                            f"HTTPS confirmation, not an SMTP one)")
    return result


def verify(email):
    key = email.strip().lower()
    cached = _cache_get(_email_cache, key, _EMAIL_TTL)
    if cached is not None:
        return cached
    result = _add_soft_signal(_verify_uncached(email), email)
    # Don't cache UNKNOWN: it usually means our probe IP was blocked, which is
    # transient. Caching it would pin a bad answer for an hour. A confirmed
    # mailbox is not transient, though, so cache that even under UNKNOWN.
    if result.get("verdict") != "UNKNOWN" or result.get("mailbox_confirmed"):
        _cache_put(_email_cache, key, result)
    return result


def _verify_uncached(email):
    if "@" not in email:
        return {"email": email, "verdict": "BAD", "mx": None, "detail": "malformed"}

    parts = email.rsplit("@", 1)
    local = parts[0]
    domain = parts[1].lower()

    # Universal pre-checks: catch issues that affect all providers
    # 1. Disposable/burner domains
    if domain in DISPOSABLE_DOMAINS:
        return {"email": email, "verdict": "RISKY", "mx": None,
                "detail": "disposable/burner domain"}

    # 2. Role accounts (info@, support@, sales@, etc.)
    local_l = local.lower().split("+")[0]
    if local_l in ROLE_LOCALS:
        return {"email": email, "verdict": "RISKY", "mx": None,
                "detail": "role/shared mailbox"}

    # 3. Typo-squat detection on common providers
    typo = suggest_domain(domain)
    if typo:
        # Not DEAD: the squatted domain accepts mail and we have not probed
        # this mailbox. A DEAD verdict suppresses an address permanently, and
        # a near-miss is suspicion, not evidence.
        return {"email": email, "verdict": "RISKY", "mx": None,
                "detail": f"looks like a typo of {typo}; mail here reaches a "
                          f"squatter, not your recipient"}

    # Fast path: major consumer providers always validate at signup,
    # never do catch-all, but block external probes.
    # If format is valid and domain is known provider -> SEND directly.
    # No probe needed; probing would just get IP-blocked.
    if domain in CONSUMER_PROVIDERS:
        mx, status = resolve_mx(domain)
        if mx:
            return {"email": email, "verdict": "SEND", "mx": mx,
                    "detail": "major provider"}
        if status == "dnsfail":
            return {"email": email, "verdict": "UNKNOWN", "mx": None,
                    "detail": "MX lookup failed"}
        return {"email": email, "verdict": "DEAD", "mx": None, "detail": "no MX"}

    # If egress port 25 is blocked (cloud hosts), skip all SMTP probes and
    # go straight to DNS evidence. Probing on blocked egress wastes 20s+
    # per address and only returns UNKNOWN or probe-blocked.
    if not egress_smtp_open():
        dverdict, mx, ddetail = classify_domain(domain)
        if dverdict == "DNSFAIL":
            return {"email": email, "verdict": "UNKNOWN", "mx": None, "detail": ddetail}
        if dverdict == "NOMX":
            return {"email": email, "verdict": "DEAD", "mx": None, "detail": ddetail}
        if dverdict == "GATED":
            return {"email": email, "verdict": "RISKY", "mx": mx, "detail": ddetail}
        if dverdict == "CATCHALL":
            return {"email": email, "verdict": "CATCHALL", "mx": mx, "detail": ddetail}
        # Egress is blocked, so no mailbox on this domain can be probed at
        # all. DNS evidence describes the domain, never the mailbox: MX, SPF
        # and DMARC are identical for a live address and a nonexistent one at
        # the same company. Returning SEND here reported a verdict for an
        # address that was never contacted, and did so for known-dead
        # addresses too, which is the failure this product exists to name.
        score, signals = _dns_send_evidence(domain)
        gate = any(g in (mx or "").lower() for g in ENTERPRISE_GATES)
        mxs, _ = resolve_mxs(domain)
        mx = mxs[0] if mxs else None
        if score >= 4 and not gate:
            return {"email": email, "verdict": "PLAUSIBLE", "mx": mx,
                    "smtp_probed": False,
                    "detail": f"domain accepts mail ({', '.join(signals[:2])}), "
                              f"but no probe was possible from this host"}
        return {"email": email, "verdict": "UNKNOWN", "mx": mx,
                "smtp_probed": False,
                "detail": "no SMTP probe possible from this host"}

    dverdict, mx, ddetail = classify_domain(domain)
    if dverdict == "DNSFAIL":
        return {"email": email, "verdict": "UNKNOWN", "mx": None, "detail": ddetail}
    if dverdict == "NOMX":
        return {"email": email, "verdict": "DEAD", "mx": None, "detail": ddetail}
    if dverdict == "GATED":
        return {"email": email, "verdict": "RISKY", "mx": mx, "detail": ddetail}
    if dverdict == "CATCHALL":
        return {"email": email, "verdict": "CATCHALL", "mx": mx, "detail": ddetail}

    # Probe all MX hosts with one greylist retry each. The first host may be
    # down or blacklisted while another works; only a host-wide rejection is
    # a defensible DEAD.
    mxs, _ = resolve_mxs(domain)
    if not mxs:
        mxs = [mx]
    code, detail = _probe_multi(mxs, email, retries=1)
    low = (detail or "").lower()

    if any(s in low for s in ("client host", "listed by", "service unavailable",
                              "blocked using", "access denied",
                              "unexpectedly closed", "connection reset")):
        # Probe IP blocked. Push through the grey area before giving up.
        return resolve_unknown(email, domain, mx, mxs, _clean_detail(detail))

    if code in (250, 251):
        return {"email": email, "verdict": "SEND", "mx": mx, "detail": _clean_detail(detail)}

    if code in (550, 551, 553):
        kind = classify_rejection(detail)
        if kind == "recipient":
            return {"email": email, "verdict": "DEAD", "mx": mx, "detail": _clean_detail(detail)}
        if kind == "policy":
            # The server refused us, not the recipient. Saying DEAD here burns a
            # real contact permanently. Push through the grey area.
            return resolve_unknown(email, domain, mx, mxs, detail[:44])
        return {"email": email, "verdict": "UNKNOWN", "mx": mx,
                "detail": f"5xx, cause unclear: {detail[:44]}"}

    return {"email": email, "verdict": "UNKNOWN", "mx": mx, "detail": _clean_detail(detail)}