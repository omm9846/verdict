"""Probe worker. Runs anywhere outbound port 25 is open.

The hosted API cannot open an SMTP connection, so it queues addresses instead.
This claims those jobs, probes them locally, and posts the verdict back. The
machine it runs on is the only part of the system that needs port 25, which
makes it swappable: a laptop, a VPS costing a few pounds a year, or a user's
own box all work the same way.

    export VERDICT_API=https://verdict-engine-4g97.onrender.com
    export VERDICT_WORKER_TOKEN='...'      # must match the API's value
    python worker.py

Check the machine can actually reach port 25 before trusting the results:

    python worker.py --selftest
"""
from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.request

from engine.verify import verify

API = os.environ.get("VERDICT_API", "https://verdict-engine-4g97.onrender.com").rstrip("/")
TOKEN = os.environ.get("VERDICT_WORKER_TOKEN", "")
POLL_IDLE = 5.0
POLL_BUSY = 0.5
UA = "verdict-worker/0.1"


def _call(path: str, payload: dict | None = None) -> dict:
    url = f"{API}{path}"
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(
        url, data=data, method="POST" if data is not None else "GET",
        headers={"Content-Type": "application/json",
                 "X-Worker-Token": TOKEN,
                 "User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())


def selftest() -> int:
    """Confirm this machine can do the one thing the host cannot."""
    print(f"API: {API}")
    print("Probing a known-dead and a known-live address...")
    dead = verify("zzznotreal9x@lemvi.ch")
    live = verify("invest@lemvi.ch")
    print(f"  expect DEAD -> {dead['verdict']:<9} {str(dead['detail'])[:60]}")
    print(f"  expect SEND -> {live['verdict']:<9} {str(live['detail'])[:60]}")

    if dead["verdict"] == "DEAD" and live["verdict"] == "SEND":
        print("\nPort 25 is open here. This machine can serve as a worker.")
        return 0
    if "unreachable" in str(dead.get("detail", "")).lower():
        print("\nPort 25 is BLOCKED on this machine. Every probe would return "
              "UNKNOWN, which is worse than not running a worker at all.")
        return 1
    print("\nInconclusive. The test domain may have changed; try another "
          "address you know the answer for.")
    return 1


def run() -> int:
    if not TOKEN:
        print("VERDICT_WORKER_TOKEN is not set. The API refuses anonymous "
              "workers, so nothing would be claimed.", file=sys.stderr)
        return 2

    print(f"worker up, polling {API}")
    done = 0
    while True:
        try:
            batch = _call("/api/probe-jobs/claim", {"limit": 5}).get("jobs", [])
        except urllib.error.HTTPError as e:
            print(f"claim failed: {e.code} {e.read().decode()[:120]}", file=sys.stderr)
            time.sleep(10)
            continue
        except Exception as e:
            print(f"claim failed: {str(e)[:120]}", file=sys.stderr)
            time.sleep(10)
            continue

        if not batch:
            time.sleep(POLL_IDLE)
            continue

        for job in batch:
            try:
                result = verify(job["email"])
            except Exception as e:
                result = {"email": job["email"], "verdict": "UNKNOWN",
                          "detail": f"worker error: {str(e)[:60]}"}
            try:
                _call("/api/probe-jobs/complete",
                      {"id": job["id"], "result": result})
                done += 1
                print(f"  {result['verdict']:<9} {job['email']}")
            except Exception as e:
                print(f"  post failed for {job['email']}: {str(e)[:80]}",
                      file=sys.stderr)
        time.sleep(POLL_BUSY)


if __name__ == "__main__":
    sys.exit(selftest() if "--selftest" in sys.argv else run())
