# Smartlead — contact audit

- domain: `smartlead.ai`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T10:10:51+00:00

> domain is catch-all: it accepts every address, including random ones, so no verifier can confirm any individual mailbox

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@smartlead.ai` | CATCHALL | fake mailbox accepted | common front-desk address |
| `hello@smartlead.ai` | CATCHALL | fake mailbox accepted | common front-desk address |
| `info@smartlead.ai` | CATCHALL | fake mailbox accepted | common front-desk address |
| `press@smartlead.ai` | CATCHALL | fake mailbox accepted | common front-desk address |
| `sales@smartlead.ai` | CATCHALL | fake mailbox accepted | common front-desk address |
| `support@smartlead.ai` | CATCHALL | fake mailbox accepted | common front-desk address |
| `team@smartlead.ai` | CATCHALL | fake mailbox accepted | common front-desk address |

---

## Draft note

```
Subject: smartlead.ai is catch-all — worth knowing

Hi Smartlead team,

I built an open-source SMTP verifier and I've been pointing it at companies
whose business is email, on the theory that they'd want to know.

smartlead.ai is catch-all — it accepts literally any address, including a random 22-character one I made up. So nothing can confirm an individual mailbox there, including whatever verifier you're running.

Worth knowing if you quote deliverability numbers on it.

Method is here if you want to check my working, or run it yourself against
anything: https://github.com/omm9846/verdict — MIT, runs local, nothing
uploads.

- Om
```
