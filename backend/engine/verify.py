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


def resolve_mx(domain, attempts=3):
    """Resolve the mail exchanger. Returns (mx, status).

    status is one of:
      "ok"      - mx is the host to probe
      "nomx"    - the domain definitively cannot receive mail
      "dnsfail" - we could not find out. NOT the same as "no mailserver".

    Separating the last two matters more than it looks. Collapsing a DNS
    timeout into "no MX record" makes a healthy domain look DEAD, and a DEAD
    verdict suppresses an address permanently. A resolver hiccup must never be
    able to burn a real contact, so transient failures are retried and then
    reported as unknown.
    """
    last = None
    for i in range(attempts):
        try:
            recs = dns.resolver.resolve(domain, "MX", lifetime=8)
            hosts = sorted(recs, key=lambda r: r.preference)
            for h in hosts:
                mx = str(h.exchange).rstrip(".")
                # A single "." target is RFC 7505 null MX: explicitly no mail.
                if mx and mx != ".":
                    return mx, "ok"
            return None, "nomx"
        except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
            # Definitive: the name exists with no MX, or does not exist at all.
            # RFC 5321 s5.1 - fall back to the A record as an implicit MX.
            try:
                dns.resolver.resolve(domain, "A", lifetime=8)
                return domain, "ok"
            except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
                return None, "nomx"
            except Exception as e:
                last = e
        except Exception as e:
            # Timeout, SERVFAIL, no working nameserver: transient, so retry.
            last = e
        if i < attempts - 1:
            time.sleep(0.6 * (i + 1))
    return None, "dnsfail"


def get_mx(domain):
    """Back-compat wrapper: host or None. Callers that must distinguish a
    missing mailserver from a failed lookup should use resolve_mx."""
    return resolve_mx(domain)[0]


def _rcpt(mx, email, timeout=12):
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
        return code, detail
    except Exception as e:
        return None, str(e)[:80]


def classify_domain(domain):
    cached = _cache_get(_domain_cache, domain, _DOMAIN_TTL)
    if cached is not None:
        return cached
    result = _classify_domain_uncached(domain)
    if result[0] != "DNSFAIL":
        _cache_put(_domain_cache, domain, result)
    return result


def _classify_domain_uncached(domain):
    mx, status = resolve_mx(domain)
    if status == "dnsfail":
        return "DNSFAIL", None, "MX lookup failed; no evidence either way"
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


def verify(email):
    key = email.strip().lower()
    cached = _cache_get(_email_cache, key, _EMAIL_TTL)
    if cached is not None:
        return cached
    result = _verify_uncached(email)
    # Don't cache UNKNOWN: it usually means our probe IP was blocked, which is
    # transient. Caching it would pin a bad answer for an hour.
    if result.get("verdict") != "UNKNOWN":
        _cache_put(_email_cache, key, result)
    return result


def _verify_uncached(email):
    if "@" not in email:
        return {"email": email, "verdict": "BAD", "mx": None, "detail": "malformed"}

    parts = email.rsplit("@", 1)
    local = parts[0]
    domain = parts[1].lower()

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

    dverdict, mx, ddetail = classify_domain(domain)
    if dverdict == "DNSFAIL":
        return {"email": email, "verdict": "UNKNOWN", "mx": None, "detail": ddetail}
    if dverdict == "NOMX":
        return {"email": email, "verdict": "DEAD", "mx": None, "detail": ddetail}
    if dverdict == "GATED":
        return {"email": email, "verdict": "RISKY", "mx": mx, "detail": ddetail}
    if dverdict == "CATCHALL":
        return {"email": email, "verdict": "CATCHALL", "mx": mx, "detail": ddetail}

    code, detail = _rcpt(mx, email)
    low = (detail or "").lower()

    if any(s in low for s in ("client host", "listed by", "service unavailable",
                              "blocked using", "access denied",
                              "unexpectedly closed", "connection reset")):
        return {"email": email, "verdict": "UNKNOWN", "mx": mx,
                "detail": f"probe-ip blocked: {detail[:50]}"}

    if code in (250, 251):
        return {"email": email, "verdict": "SEND", "mx": mx, "detail": detail[:50]}
    if code in (550, 551, 553):
        return {"email": email, "verdict": "DEAD", "mx": mx, "detail": detail[:50]}
    return {"email": email, "verdict": "UNKNOWN", "mx": mx, "detail": str(detail)[:50]}