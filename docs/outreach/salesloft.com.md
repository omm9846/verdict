# salesloft.com — contact audit

- domain: `salesloft.com`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T14:23:38+00:00

> domain is catch-all: it accepts every address, including random ones, so no verifier can confirm any individual mailbox

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@salesloft.com` | CATCHALL | fake mailbox accepted | common front-desk address |
| `hello@salesloft.com` | CATCHALL | fake mailbox accepted | common front-desk address |
| `info@salesloft.com` | CATCHALL | fake mailbox accepted | common front-desk address |
| `press@salesloft.com` | CATCHALL | fake mailbox accepted | common front-desk address |
| `privacy@salesloft.com` | CATCHALL | fake mailbox accepted | https://www.salesloft.com/legal/platform-privacy-notice |
| `sales@salesloft.com` | CATCHALL | fake mailbox accepted | common front-desk address |
| `support@salesloft.com` | CATCHALL | fake mailbox accepted | common front-desk address |
| `team@salesloft.com` | CATCHALL | fake mailbox accepted | common front-desk address |

---

## Draft note

```
Subject: salesloft.com accepts every address (including ones that don't exist)

Hi there,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

salesloft.com came back with something you probably want to know.

salesloft.com is catch-all — it accepted a random 22-character mailbox I invented on the spot. That means no verifier can confirm any individual address on it, including ours, and including whatever you're using.

Not a problem in itself. Worth knowing if deliverability numbers ever get quoted against that domain.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
