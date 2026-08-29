"""Domain deliverability audit — DNS only.

Grades the records that decide whether a domain's mail is trusted, and whether
anyone else can send as it. Every check here is a DNS lookup, so this runs on
any host, including the ones that block outbound port 25.

The findings people care about, in order of how alarming they are when absent:

  DMARC   missing means anyone can send mail claiming to be you, and you get
          no reports about it
  SPF     missing or malformed means receivers have no list of who may send
  DKIM    missing means nothing you send is cryptographically signed
  MX      missing means the domain cannot receive mail at all

This is a genuinely useful free tool rather than a demo dressed as one, which
is the point: the audit is the reason someone gives us an address.
"""
from __future__ import annotations

import re

import dns.resolver

from engine.verify import ENTERPRISE_GATES, resolve_mx

# Selectors worth trying. There is no way to enumerate DKIM selectors from
# outside, so this covers the providers that most domains actually use.
DKIM_SELECTORS = (
    "default", "google", "selector1", "selector2", "s1", "s2", "k1", "k2",
    "dkim", "mail", "smtp", "mandrill", "sendgrid", "zoho", "protonmail",
    "protonmail2", "fm1", "fm2", "mailjet", "sm", "pm", "resend", "postmark",
    "sig1", "everlytickey1", "mte1", "hs1", "hs2", "20230601", "scph0623",
)


def _txt(name: str) -> list[str]:
    try:
        answers = dns.resolver.resolve(name, "TXT", lifetime=6)
        return [b"".join(r.strings).decode("utf-8", "ignore") for r in answers]
    except Exception:
        return []


def _cname_or_txt(name: str) -> str | None:
    for rtype in ("CNAME", "TXT"):
        try:
            answers = dns.resolver.resolve(name, rtype, lifetime=5)
            for r in answers:
                if rtype == "CNAME":
                    return str(r.target).rstrip(".")
                return b"".join(r.strings).decode("utf-8", "ignore")[:120]
        except Exception:
            continue
    return None


def check_spf(domain: str) -> dict:
    records = [t for t in _txt(domain) if t.lower().startswith("v=spf1")]

    if not records:
        return {"id": "spf", "status": "fail", "label": "SPF",
                "detail": "No SPF record. Receivers have no list of who is "
                          "allowed to send as this domain.",
                "fix": "Publish a TXT record on the root: v=spf1 "
                       "include:<your provider> -all"}

    if len(records) > 1:
        return {"id": "spf", "status": "fail", "label": "SPF",
                "detail": f"{len(records)} SPF records published. More than one "
                          f"is a permanent error — receivers treat it as no SPF "
                          f"at all.",
                "fix": "Merge every include into a single TXT record."}

    rec = records[0]
    # Each include/a/mx/ptr/exists costs a DNS lookup; over 10 is a permerror.
    lookups = len(re.findall(r"\b(?:include|a|mx|ptr|exists):", rec)) + \
        len(re.findall(r"\b(?:a|mx)\b(?!:)", rec))
    if lookups > 10:
        return {"id": "spf", "status": "fail", "label": "SPF",
                "detail": f"About {lookups} DNS lookups. The limit is 10; past "
                          f"it the whole record fails.", "fix": "Flatten or "
                          "remove unused includes.", "record": rec}

    if re.search(r"\+all", rec):
        return {"id": "spf", "status": "fail", "label": "SPF",
                "detail": "Ends in +all, which authorises the entire internet "
                          "to send as this domain.",
                "fix": "Change +all to -all.", "record": rec}

    if rec.rstrip().endswith("?all"):
        return {"id": "spf", "status": "warn", "label": "SPF",
                "detail": "Ends in ?all (neutral) — effectively no policy.",
                "fix": "Use -all once you are sure every sender is listed.",
                "record": rec}

    if rec.rstrip().endswith("~all"):
        return {"id": "spf", "status": "pass", "label": "SPF",
                "detail": "Published, soft-fail (~all). Unlisted senders are "
                          "marked but still accepted.",
                "fix": "Tighten to -all when you are confident.", "record": rec}

    return {"id": "spf", "status": "pass", "label": "SPF",
            "detail": "Published with a hard fail (-all).", "record": rec}


def check_dmarc(domain: str) -> dict:
    records = [t for t in _txt(f"_dmarc.{domain}")
               if t.lower().startswith("v=dmarc1")]
    if not records:
        return {"id": "dmarc", "status": "fail", "label": "DMARC",
                "detail": "No DMARC record. Anyone can send mail claiming to "
                          "be this domain, and you receive no report when they "
                          "do.",
                "fix": "Publish TXT on _dmarc: v=DMARC1; p=none; "
                       "rua=mailto:you@yourdomain"}

    rec = records[0]
    policy = (re.search(r"\bp\s*=\s*(none|quarantine|reject)", rec, re.I)
              or [None, "none"])[1].lower()
    has_rua = "rua=" in rec.lower()

    if policy == "none":
        return {"id": "dmarc", "status": "warn", "label": "DMARC",
                "detail": "Published, but p=none — monitoring only. Spoofed "
                          "mail is still delivered."
                          + ("" if has_rua else " No rua= address, so you are "
                             "not even receiving the reports."),
                "fix": "Move to p=quarantine once reports look clean.",
                "record": rec}

    return {"id": "dmarc", "status": "pass", "label": "DMARC",
            "detail": f"Published and enforcing (p={policy}).",
            "record": rec}


def check_dkim(domain: str) -> dict:
    found = []
    for sel in DKIM_SELECTORS:
        val = _cname_or_txt(f"{sel}._domainkey.{domain}")
        if val:
            found.append(sel)
        if len(found) >= 3:
            break

    if found:
        return {"id": "dkim", "status": "pass", "label": "DKIM",
                "detail": f"Signing key found (selector: {', '.join(found)})."}

    return {"id": "dkim", "status": "warn", "label": "DKIM",
            "detail": "No DKIM key found on the selectors we know about. Either "
                      "mail is unsigned, or it uses a custom selector we cannot "
                      "guess — selectors cannot be enumerated from outside.",
            "fix": "Enable DKIM with your mail provider and publish the record "
                   "they give you."}


def check_mx(domain: str) -> dict:
    mx, status = resolve_mx(domain)
    if status == "dnsfail":
        return {"id": "mx", "status": "warn", "label": "MX",
                "detail": "DNS did not answer, so we cannot say."}
    if not mx:
        return {"id": "mx", "status": "fail", "label": "MX",
                "detail": "No mail server. This domain cannot receive email.",
                "fix": "Publish MX records for your mail provider."}

    gate = next((g for g in ENTERPRISE_GATES if g in mx.lower()), None)
    detail = f"Accepts mail via {mx}."
    if gate:
        detail += f" Behind a filtering gateway ({gate})."
    return {"id": "mx", "status": "pass", "label": "MX", "detail": detail}


def check_mta_sts(domain: str) -> dict:
    recs = [t for t in _txt(f"_mta-sts.{domain}") if "v=STSv1" in t]
    if recs:
        return {"id": "mta_sts", "status": "pass", "label": "MTA-STS",
                "detail": "Published — inbound mail is required to use TLS."}
    return {"id": "mta_sts", "status": "info", "label": "MTA-STS",
            "detail": "Not published. Optional, but it stops a downgrade "
                      "attack on mail sent to you.",
            "fix": "Publish _mta-sts TXT and a policy file. Nice-to-have."}


# Only checks that reflect real risk carry weight. MTA-STS is informational
# and deliberately scores nothing.
WEIGHTS = {"dmarc": 35, "spf": 30, "dkim": 20, "mx": 15}
POINTS = {"pass": 1.0, "warn": 0.5, "info": 1.0, "fail": 0.0}


def audit_domain(domain: str) -> dict:
    domain = (domain or "").strip().lower()
    domain = re.sub(r"^https?://", "", domain).split("/")[0].strip(".")
    if domain.startswith("www."):
        domain = domain[4:]

    if not domain or "." not in domain or " " in domain:
        return {"domain": domain, "error": "that does not look like a domain"}

    checks = [check_mx(domain), check_spf(domain), check_dmarc(domain),
              check_dkim(domain), check_mta_sts(domain)]

    score = sum(WEIGHTS.get(c["id"], 0) * POINTS[c["status"]] for c in checks)
    score = round(score)
    grade = ("A" if score >= 90 else "B" if score >= 75 else
             "C" if score >= 60 else "D" if score >= 40 else "F")

    fails = [c for c in checks if c["status"] == "fail"]
    if fails:
        headline = fails[0]["detail"].split(".")[0] + "."
    elif any(c["status"] == "warn" for c in checks):
        headline = "Configured, but not enforcing. Spoofed mail still gets through."
    else:
        headline = "Properly configured. Nothing urgent to fix."

    return {"domain": domain, "score": score, "grade": grade,
            "headline": headline, "checks": checks}
