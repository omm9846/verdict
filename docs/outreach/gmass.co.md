# gmass.co — contact audit

- domain: `gmass.co`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T14:20:23+00:00

> domain is catch-all: it accepts every address, including random ones, so no verifier can confirm any individual mailbox

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@gmass.co` | CATCHALL | fake mailbox accepted | common front-desk address |
| `hello@gmass.co` | CATCHALL | fake mailbox accepted | common front-desk address |
| `info@gmass.co` | CATCHALL | fake mailbox accepted | common front-desk address |
| `press@gmass.co` | CATCHALL | fake mailbox accepted | common front-desk address |
| `sales@gmass.co` | CATCHALL | fake mailbox accepted | common front-desk address |
| `support@gmass.co` | CATCHALL | fake mailbox accepted | common front-desk address |
| `team@gmass.co` | CATCHALL | fake mailbox accepted | common front-desk address |

---

## Draft note

```
Subject: gmass.co accepts every address (including ones that don't exist)

Hi there,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

gmass.co came back with something you probably want to know.

gmass.co is catch-all — it accepted a random 22-character mailbox I invented on the spot. That means no verifier can confirm any individual address on it, including ours, and including whatever you're using.

Not a problem in itself. Worth knowing if deliverability numbers ever get quoted against that domain.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
