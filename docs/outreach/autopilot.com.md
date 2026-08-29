# Autopilot — contact audit

- domain: `autopilot.com`
- mail server: `barracuda.teamhorner.com`
- collected: 2026-08-29T10:14:46+00:00

> behind an enterprise gateway (enterprise gateway: barracuda.teamhorner.com)

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@autopilot.com` | RISKY | enterprise gateway: barracuda.teamhorner.com | common front-desk address |
| `hello@autopilot.com` | RISKY | enterprise gateway: barracuda.teamhorner.com | common front-desk address |
| `info@autopilot.com` | RISKY | enterprise gateway: barracuda.teamhorner.com | common front-desk address |
| `press@autopilot.com` | RISKY | enterprise gateway: barracuda.teamhorner.com | common front-desk address |
| `sales@autopilot.com` | RISKY | enterprise gateway: barracuda.teamhorner.com | common front-desk address |
| `support@autopilot.com` | RISKY | enterprise gateway: barracuda.teamhorner.com | common front-desk address |
| `team@autopilot.com` | RISKY | enterprise gateway: barracuda.teamhorner.com | common front-desk address |

---

## Draft note

```
Subject: autopilot.com — clean contact audit

Hi Autopilot team,

I built an open-source SMTP verifier and I've been pointing it at companies
whose business is email, on the theory that they'd want to know.

Ran the public addresses on autopilot.com; nothing conclusive came back.

Mail server refused the probe, which is its right.

Method is here if you want to check my working, or run it yourself against
anything: https://github.com/omm9846/verdict — MIT, runs local, nothing
uploads.

- Om
```
