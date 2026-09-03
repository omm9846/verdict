"""Job queue that lets SMTP probing happen somewhere port 25 is open.

Render blocks outbound port 25, as does every other major host, so the API
cannot open the connection that confirms a mailbox. This decouples the two:
the API takes the request and queues it, and a worker running anywhere with
port 25 available claims the job, probes, and posts the answer back.

The point is that the machine becomes swappable. A laptop, a cheap VPS, or a
user's own self-hosted instance all speak the same protocol, and the hosted
service does not change when the machine does.

Deliberately in-memory. The free dyno is a single process, results are cached
for hours anyway, and a queue that survives a restart is not worth a database
until there is a paying customer waiting on it.
"""
from __future__ import annotations

import os
import threading
import time
import uuid
from collections import deque

# A worker holds a job while probing. If it dies mid-probe the job has to come
# back rather than disappear, so claims expire.
CLAIM_TIMEOUT = 90
JOB_TTL = 600
MAX_QUEUE = 2000

WORKER_TOKEN = os.environ.get("VERDICT_WORKER_TOKEN", "")

_lock = threading.Lock()
_pending: deque[str] = deque()
_jobs: dict[str, dict] = {}


def _expire(now: float) -> None:
    """Requeue abandoned claims and drop jobs nobody came back for."""
    for jid, job in list(_jobs.items()):
        if job["state"] == "claimed" and now - job["claimed_at"] > CLAIM_TIMEOUT:
            job["state"] = "pending"
            job["attempts"] += 1
            # Two failed claims means the workers cannot do it either.
            if job["attempts"] >= 2:
                job["state"] = "done"
                job["result"] = {"email": job["email"], "verdict": "UNKNOWN",
                                 "detail": "no worker completed the probe"}
            else:
                _pending.append(jid)
        elif now - job["created_at"] > JOB_TTL:
            _jobs.pop(jid, None)


def submit(email: str) -> str:
    """Queue an address for probing. Returns the job id."""
    now = time.time()
    with _lock:
        _expire(now)
        if len(_jobs) >= MAX_QUEUE:
            raise RuntimeError("probe queue is full")
        jid = uuid.uuid4().hex[:16]
        _jobs[jid] = {"id": jid, "email": email, "state": "pending",
                      "created_at": now, "claimed_at": 0.0,
                      "attempts": 0, "result": None}
        _pending.append(jid)
        return jid


def claim(limit: int = 5) -> list[dict]:
    """A worker takes up to `limit` jobs."""
    now = time.time()
    out = []
    with _lock:
        _expire(now)
        while _pending and len(out) < limit:
            jid = _pending.popleft()
            job = _jobs.get(jid)
            if not job or job["state"] != "pending":
                continue
            job["state"] = "claimed"
            job["claimed_at"] = now
            out.append({"id": jid, "email": job["email"]})
    return out


def complete(job_id: str, result: dict) -> bool:
    with _lock:
        job = _jobs.get(job_id)
        if not job:
            return False
        job["state"] = "done"
        job["result"] = result
        return True


def get(job_id: str) -> dict | None:
    with _lock:
        job = _jobs.get(job_id)
        return dict(job) if job else None


def wait(job_id: str, timeout: float = 20.0, interval: float = 0.4) -> dict | None:
    """Block until a worker answers, or give up.

    Callers get a real verdict when a worker is connected and fall back to the
    DNS tier when none is. Returning None rather than blocking forever is what
    keeps the endpoint usable with no worker at all.
    """
    deadline = time.time() + timeout
    while time.time() < deadline:
        job = get(job_id)
        if job and job["state"] == "done":
            return job["result"]
        time.sleep(interval)
    return None


def stats() -> dict:
    now = time.time()
    with _lock:
        _expire(now)
        states: dict[str, int] = {}
        for job in _jobs.values():
            states[job["state"]] = states.get(job["state"], 0) + 1
        return {"queued": len(_pending), "jobs": len(_jobs), "states": states,
                "worker_configured": bool(WORKER_TOKEN)}


def authorised(token: str | None) -> bool:
    """Workers must present the shared token.

    With no token configured the queue refuses every worker rather than
    accepting anonymous ones: an open endpoint that hands out addresses to
    probe and accepts verdicts back would let anyone poison the cache.
    """
    return bool(WORKER_TOKEN) and token == WORKER_TOKEN
