# Autopilot — contact audit

- domain: `autopilot.com`
- mail server: `barracuda.teamhorner.com`
- collected: 2026-08-29T14:35:19+00:00

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
Subject: autopilot.com — your mail server refused my probe (correctly)

Hi Autopilot,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

Autopilot came back with something you probably want to know.

Ran the public addresses on autopilot.com and got nothing conclusive — your mail server refuses automated probes, which is its right and frankly the correct posture.

No finding, then. Filing it as a well-configured server.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
