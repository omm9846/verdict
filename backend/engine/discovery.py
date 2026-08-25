"""Verdict discovery engine - pattern inference from public web."""
import re
import json
import time
import random
import string
import urllib.request
import urllib.parse

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"}
EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")
NOISE = ("example.", "gmail.com", "yahoo.", "hotmail.", "outlook.", "icloud.",
         "sentry.io", "wixpress", "domain.com", "email.com", "u003e")

PATHS = ["/", "/team", "/about", "/contact", "/ir", "/leadership", "/company",
         "/about-us", "/press", "/privacy", "/legal", "/terms", "/careers",
         "/foundation", "/impressum"]


def _fetch(url, timeout=15):
    try:
        req = urllib.request.Request(url, headers=UA)
        return urllib.request.urlopen(req, timeout=timeout).read().decode("utf-8", "ignore")
    except Exception:
        return ""


def _bing(q):
    try:
        html = _fetch("https://www.bing.com/search?q=" + urllib.parse.quote(q))
        return re.sub(r"<[^>]+>", " ", html)
    except Exception:
        return ""


def harvest(domain: str):
    found = {}

    def add(m):
        low = m.lower()
        if low.endswith(domain) and not any(n in low for n in NOISE):
            found[low] = found.get(low, 0) + 1

    text = ""
    for pth in PATHS:
        text += _fetch(f"https://{domain}{pth}") + _fetch(f"https://www.{domain}{pth}")
        time.sleep(0.3)
    for m in EMAIL_RE.findall(text):
        add(m)

    blob = _bing(f'"{domain}" email contact')
    for m in EMAIL_RE.findall(blob):
        add(m)
    time.sleep(0.4)
    return found


def local_pattern(local: str):
    tokens = re.split(r"[._\-]", local)
    if len(tokens) == 1:
        return "{first}"
    kinds = ["f" if len(t) == 1 else "w" for t in tokens]
    return ".".join(kinds)


def candidates(domain: str, found: dict, person: str):
    parts = person.split()
    first, last = parts[0].lower(), parts[-1].lower()
    patterns = {}
    for em in found:
        pat = local_pattern(em.split("@")[0])
        patterns.setdefault(pat, []).append(em)

    ranked = sorted(patterns.items(), key=lambda kv: -len(kv[1]))
    cands = []
    for pat, examples in ranked[:4]:
        if pat == "{first}":
            cands.append(f"{first}@{domain}")
        elif pat == "{flast}":
            cands.append(f"{first}{last}@{domain}")
        elif pat in ("f.w", "f.w.w"):
            cands.append(f"{first[0]}.{last}@{domain}")
        elif pat == "w.w":
            cands.append(f"{first}.{last}@{domain}")
        elif pat == "w":
            cands.append(f"{last}@{domain}")

    for extra in (f"{first}@{domain}", f"{first}.{last}@{domain}",
                  f"{first[0]}{last}@{domain}", f"{first[0]}.{last}@{domain}"):
        if extra not in cands:
            cands.append(extra)
    return cands[:6], patterns