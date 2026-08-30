"""Verdict API - verification gate + discovery for the dashboard."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from engine.verify import verify
from engine.precheck import precheck
from engine.domain_audit import audit_domain
from engine import discovery

app = FastAPI(title="Verdict Engine", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://tryverdict.org",
        "https://www.tryverdict.org",
        "https://verdict-xi-olive.vercel.app",
        "https://verdict-video.vercel.app",
        "http://localhost:3000",
    ],
    # Vercel preview deploys (verdict-*.vercel.app) — keeps staging working
    allow_origin_regex=r"https://verdict-[a-z0-9-]+\.vercel\.app",
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


class VerifyRequest(BaseModel):
    email: str


class DiscoverRequest(BaseModel):
    domain: str
    person: str


class GateRequest(BaseModel):
    email: str
    person: str
    firm: str
    domain: str


@app.get("/health")
def health():
    return {"status": "ok", "service": "verdict-engine"}


class DomainRequest(BaseModel):
    domain: str


@app.post("/api/domain-audit")
def api_domain_audit(req: DomainRequest):
    """Graded deliverability audit for a whole domain. DNS only, so it runs
    on hosts that block outbound port 25."""
    return audit_domain(req.domain)


# An open endpoint on a free dyno needs a ceiling, or one caller takes the
# service down for everyone.
BATCH_MAX = 500


class BatchRequest(BaseModel):
    emails: list[str]


@app.post("/api/batch")
def api_batch(req: BatchRequest):
    """DNS-tier hygiene over a list. No auth, no key.

    Catches dead domains, typosquats, burner providers and role accounts, and
    flags which addresses are on catch-all domains and therefore unverifiable
    by anyone. It cannot confirm a mailbox exists: that needs an SMTP probe on
    port 25, which every cloud host blocks, so it runs locally instead via
    `python -m engine backtest`.
    """
    emails = [e.strip() for e in req.emails if e and e.strip()][:BATCH_MAX]
    if not emails:
        return {"error": "no addresses supplied", "results": []}

    with ThreadPoolExecutor(max_workers=12) as pool:
        results = list(pool.map(precheck, emails))

    counts = Counter(r.get("verdict") for r in results)
    dead = [r for r in results if r.get("verdict") == "DEAD"]
    typos = [r for r in results if r.get("suggestion")]

    return {
        "checked": len(results),
        "truncated_at": BATCH_MAX if len(req.emails) > BATCH_MAX else None,
        "summary": {
            "unsendable": counts.get("DEAD", 0),
            "risky": counts.get("RISKY", 0),
            "no_objection": counts.get("PLAUSIBLE", 0),
            "no_evidence": counts.get("UNKNOWN", 0),
            "typos_found": len(typos),
        },
        "note": ("DNS tier only. This finds dead domains, typos, burner "
                 "providers and catch-all domains. Whether an individual "
                 "mailbox exists needs an SMTP probe on port 25, which no "
                 "cloud host permits — run `python -m engine backtest` "
                 "locally for that."),
        "unsendable": [{"email": r["email"], "reason": r["detail"]} for r in dead],
        "typos": [{"email": r["email"], "did_you_mean": r["suggestion"]} for r in typos],
        "results": results,
    }


@app.post("/api/precheck")
def api_precheck(req: VerifyRequest):
    """DNS-tier check. Runs anywhere, including hosts that block port 25.
    Catches malformed addresses, dead domains, burners and typos for certain;
    cannot confirm a mailbox exists. That needs /api/verify on a host with
    outbound SMTP."""
    return precheck(req.email)


@app.post("/api/verify")
def api_verify(req: VerifyRequest):
    """SMTP-verify a single mailbox. Returns verdict + evidence."""
    return verify(req.email)


@app.post("/api/discover")
def api_discover(req: DiscoverRequest):
    """Harvest public emails on a domain, infer patterns, generate candidates."""
    found = discovery.harvest(req.domain)
    cands, patterns = discovery.candidates(req.domain, found, req.person)
    return {
        "domain": req.domain,
        "person": req.person,
        "harvested": list(found.keys()),
        "patterns": {k: v for k, v in sorted(patterns.items(), key=lambda kv: -len(kv[1]))},
        "candidates": cands,
    }


@app.post("/api/gate")
def api_gate(req: GateRequest):
    """Full pipeline: discover candidates, probe each, return first SEND verdict.
    This is what the dashboard's 'bump' button calls before shipping anything."""
    found = discovery.harvest(req.domain)
    cands, _ = discovery.candidates(req.domain, found, req.person)
    probed = []
    from engine.verify import verify as _verify
    for c in cands:
        v = _verify(c)
        probed.append({"email": c, **v})
        if v["verdict"] == "SEND":
            return {
                "ok": True,
                "email": c,
                "verdict": v["verdict"],
                "detail": v["detail"],
                "probed": probed,
            }
    return {
        "ok": False,
        "email": None,
        "reason": f"no live mailbox found ({len(probed)} probed)",
        "probed": probed,
    }