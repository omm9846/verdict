# SendLayer — contact audit

- domain: `sendlayer.com`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T10:10:43+00:00

> domain is catch-all: it accepts every address, including random ones, so no verifier can confirm any individual mailbox

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@sendlayer.com` | CATCHALL | fake mailbox accepted | common front-desk address |
| `hello@sendlayer.com` | CATCHALL | fake mailbox accepted | common front-desk address |
| `info@sendlayer.com` | CATCHALL | fake mailbox accepted | common front-desk address |
| `press@sendlayer.com` | CATCHALL | fake mailbox accepted | common front-desk address |
| `sales@sendlayer.com` | CATCHALL | fake mailbox accepted | common front-desk address |
| `support@sendlayer.com` | CATCHALL | fake mailbox accepted | common front-desk address |
| `team@sendlayer.com` | CATCHALL | fake mailbox accepted | common front-desk address |

---

## Draft note

```
Subject: sendlayer.com is catch-all — worth knowing

Hi SendLayer team,

I built an open-source SMTP verifier and I've been pointing it at companies
whose business is email, on the theory that they'd want to know.

sendlayer.com is catch-all — it accepts literally any address, including a random 22-character one I made up. So nothing can confirm an individual mailbox there, including whatever verifier you're running.

Worth knowing if you quote deliverability numbers on it.

Method is here if you want to check my working, or run it yourself against
anything: https://github.com/omm9846/verdict — MIT, runs local, nothing
uploads.

- Om
```
