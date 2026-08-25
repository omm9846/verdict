<div align="center">

# VERDICT.

**Every email gets a verdict before it ships.**

An open-source cold-outreach engine that probes every mailbox, classifies every
domain, and refuses to send what will bounce. No contact database. No credits.
Your sender reputation never takes the damage.

[![Live Demo](https://img.shields.io/badge/live-demo-2D6A4F?style=flat-square)](https://verdict-nine-nu.vercel.app)
[![License: MIT](https://img.shields.io/badge/license-MIT-1F2937?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/next.js-15-black?style=flat-square)](https://nextjs.org)
[![Stars](https://img.shields.io/badge/stars-in%20progress-F4A261?style=flat-square)](https://github.com/omm9846/verdict/stargazers)

[Live Demo](https://verdict-nine-nu.vercel.app) · [Product Interface](https://verdict-nine-nu.vercel.app/dashboard) · [Report an Issue](https://github.com/omm9846/verdict/issues)

</div>

---

## Why

Apollo sells you 240 million contacts. Nobody tells you one in ten of those
mailboxes does not exist, and every dead send is a dent in your domain.

Verdict was built after burning exactly that way: 284 cold emails to crypto
funds, a 9% bounce rate, and a sender reputation that took weeks to recover.
The entire architecture since has followed one rule:

> **Nothing ships without a verdict.**

## Screenshots

| Landing | Product Interface |
| --- | --- |
| ![Landing](docs/screenshot-landing.png) | ![Dashboard](docs/screenshot-dashboard.png) |

<details>
<summary>Night ledger (dark mode)</summary>
<img src="docs/screenshot-dark.png" alt="Dark mode" width="100%">
</details>

## The pipeline

```
          ┌───────────┐      ┌───────────┐      ┌───────────┐
          │  I.       │      │  II.      │      │  III.     │
          │  DISCOVER │ ───▶ │  VERIFY   │ ───▶ │  SHIP     │
          └───────────┘      └───────────┘      └───────────┘
   pattern inference     SMTP probe, catch-all     person-level cooldowns,
   from public web,      + gateway detection,      suppression lists, follow-up
   no contact database   dead mailboxes stamped    eligibility enforced
```

**I. Discover** — Pattern inference from what companies publish about themselves.
Team pages, press releases, filing signatures, directory footprints. The dominant
local-part format on a domain is applied to the person you need. No database,
no credits, no scraped lists.

**II. Verify** — Every candidate is probed over SMTP before anything ships.
MX resolution, enterprise-gateway detection, catch-all classification, and a
`RCPT TO` handshake produce one of five verdicts: `LIVE`, `RISKY`, `CATCHALL`,
`DEAD`, or `UNKNOWN`. Only `LIVE` leaves your domain by default.

**III. Ship** — Person-level cooldowns (one bump per address, twelve-hour
minimum), suppression lists that never resurface, and follow-up waves that
unlock automatically as touches age. Enforced by the engine, not your discipline.

## Verdicts

| Verdict | Meaning | Ships? |
| --- | --- | --- |
| `LIVE` | Mailbox confirmed via `RCPT TO` handshake | ✅ yes |
| `RISKY` | Real mailbox behind an enterprise gateway (Mimecast, Proofpoint); may reject cold senders | ⚠️ opt-in |
| `CATCHALL` | Domain accepts every address; pattern evidence required, delivery unguaranteed | ⚠️ opt-in |
| `DEAD` | Server confirmed user-unknown (`550 5.1.1`) | ❌ never |
| `UNKNOWN` | Probe blocked; no evidence either way | ❌ route elsewhere |

## Benchmarks

| | Verdict | Apollo | Hunter | Instantly |
| --- | :---: | :---: | :---: | :---: |
| Bounce rate on shipped mail | **<4%** | ~9% | n/a (verify only) | ~12% |
| Verification timing | **before send** | n/a | separate product | after send |
| Contact database required | **no** | yes, credit-metered | credits | yes |
| Self-hosted | **yes, MIT** | no | limited | no |

*Bounce figures: published docs + community-reported medians, 2026.*

## Case study

One real campaign run entirely on this pipeline:

| Metric | Result |
| --- | --- |
| Decision-makers touched | **72** (crypto funds, miners, market makers, treasuries) |
| Dead mailboxes caught before send | **24** |
| Bounce rate on shipped mail | **~2%** |
| Formats A/B tested | standard · real-number · Gen-Z curiosity hook |
| Follow-up waves | automated, person-level 12h cooldowns |

Full war story in [docs/case-study.md](docs/case-study.md).

## Quick start

```bash
git clone https://github.com/omm9846/verdict.git
cd verdict
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Using the engine against your own list

```python
from email_discovery import discover        # pattern inference
hit = discover("targetfirm.com", "Jane Doe")

from verify_email_v2 import verify          # SMTP verdict
verdict = verify(hit)

if verdict["verdict"] == "SEND":
    ship_it()                               # your sender, your domain
else:
    suppress(hit)                           # dead / catchall / risky / unknown
```

See [`docs/architecture.md`](docs/architecture.md) for the full gate logic.

## Roadmap

- [ ] Distributed probe pool (residential rotation for gateway coverage)
- [ ] Inbox warmup module
- [ ] Contacts store + wave persistence (Supabase)
- [ ] Template editor with segment variables
- [ ] LinkedIn / X human-in-the-loop cockpit
- [ ] GDPR / CAN-SPAM compliance pack

## Contributing

PRs welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md), keep the gate strict:
anything that makes shipping easier at the cost of deliverability gets rejected.

## License

[MIT](LICENSE)

---

<div align="center">
<sub>Built by the team behind <a href="https://ensotrade.tech">EnsoTrade</a> — this exact pipeline touched 72 fund managers.</sub>
</div>