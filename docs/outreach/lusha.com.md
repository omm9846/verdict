# lusha.com — contact audit

- domain: `lusha.com`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T14:25:09+00:00

> domain is catch-all: it accepts every address, including random ones, so no verifier can confirm any individual mailbox

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@lusha.com` | CATCHALL | fake mailbox accepted | common front-desk address |
| `hello@lusha.com` | CATCHALL | fake mailbox accepted | common front-desk address |
| `info@lusha.com` | CATCHALL | fake mailbox accepted | common front-desk address |
| `press@lusha.com` | CATCHALL | fake mailbox accepted | common front-desk address |
| `sales@lusha.com` | CATCHALL | fake mailbox accepted | common front-desk address |
| `security@lusha.com` | CATCHALL | fake mailbox accepted | https://lusha.com/.well-known/security.txt |
| `support@lusha.com` | CATCHALL | fake mailbox accepted | common front-desk address |
| `team@lusha.com` | CATCHALL | fake mailbox accepted | common front-desk address |

---

## Draft note

```
Subject: lusha.com accepts every address (including ones that don't exist)

Hi there,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

lusha.com came back with something you probably want to know.

lusha.com is catch-all — it accepted a random 22-character mailbox I invented on the spot. That means no verifier can confirm any individual address on it, including ours, and including whatever you're using.

Not a problem in itself. Worth knowing if deliverability numbers ever get quoted against that domain.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
