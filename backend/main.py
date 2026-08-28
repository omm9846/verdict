"""Verdict API - verification gate + discovery for the dashboard."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from engine.verify import verify
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