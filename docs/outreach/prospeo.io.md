# prospeo.io — contact audit

- domain: `prospeo.io`
- mail server: `smtp.google.com`
- collected: 2026-08-29T14:25:55+00:00

> domain is catch-all: it accepts every address, including random ones, so no verifier can confirm any individual mailbox

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@prospeo.io` | CATCHALL | fake mailbox accepted | common front-desk address |
| `gdpr-rep@prospeo.io` | CATCHALL | fake mailbox accepted | https://prospeo.io/privacy-policy |
| `hello@prospeo.io` | CATCHALL | fake mailbox accepted | common front-desk address |
| `info@prospeo.io` | CATCHALL | fake mailbox accepted | common front-desk address |
| `press@prospeo.io` | CATCHALL | fake mailbox accepted | common front-desk address |
| `privacy@prospeo.io` | CATCHALL | fake mailbox accepted | https://prospeo.io/privacy-policy |
| `sales@prospeo.io` | CATCHALL | fake mailbox accepted | common front-desk address |
| `support@prospeo.io` | CATCHALL | fake mailbox accepted | common front-desk address |
| `team@prospeo.io` | CATCHALL | fake mailbox accepted | common front-desk address |

---

## Draft note

```
Subject: prospeo.io accepts every address (including ones that don't exist)

Hi there,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

prospeo.io came back with something you probably want to know.

prospeo.io is catch-all — it accepted a random 22-character mailbox I invented on the spot. That means no verifier can confirm any individual address on it, including ours, and including whatever you're using.

Not a problem in itself. Worth knowing if deliverability numbers ever get quoted against that domain.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
