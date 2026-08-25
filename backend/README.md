# Verdict Engine (backend)

FastAPI service wrapping the verification gate + discovery pipeline.

## Run

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Endpoints

| Method | Path | Body | Returns |
|--------|------|------|---------|
| GET | `/health` | - | liveness |
| POST | `/api/verify` | `{"email": "x@y.com"}` | verdict + evidence |
| POST | `/api/discover` | `{"domain": "acme.com", "person": "Jane Doe"}` | harvested emails, patterns, candidates |
| POST | `/api/gate` | `{"email": "...", "person": "Jane Doe", "firm": "Acme", "domain": "acme.com"}` | first LIVE candidate or refusal |

## Verdicts

`SEND` ships · `RISKY`/`CATCHALL` opt-in · `DEAD`/`UNKNOWN` never.

## Notes

- Probe traffic originates from **your** server IP. Residential/datacenter IPs on
  PBL blocklists will see `UNKNOWN` verdicts from Google/Mimecast-hosted domains.
  For production coverage, route probes through rotating clean IPs.
- Rate-limit discovery harvests; respect robots.txt of target sites.