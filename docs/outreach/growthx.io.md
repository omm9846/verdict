# GrowthX — contact audit

- domain: `growthx.io`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T10:11:03+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@growthx.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `hello@growthx.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `info@growthx.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `press@growthx.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `sales@growthx.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `support@growthx.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `team@growthx.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |

---

## Draft note

```
Subject: 7 dead addresses on growthx.io

Hi GrowthX team,

I built an open-source SMTP verifier and I've been pointing it at companies
whose business is email, on the theory that they'd want to know.

7 of the addresses on growthx.io are dead — a real sender gets a hard bounce:

  contact@growthx.io  ->  5.1.1 The email account that you tried to reach does not exist. Please
  hello@growthx.io  ->  5.1.1 The email account that you tried to reach does not exist. Please
  info@growthx.io  ->  5.1.1 The email account that you tried to reach does not exist. Please
  press@growthx.io  ->  5.1.1 The email account that you tried to reach does not exist. Please
  sales@growthx.io  ->  5.1.1 The email account that you tried to reach does not exist. Please
  support@growthx.io  ->  5.1.1 The email account that you tried to reach does not exist. Please
  team@growthx.io  ->  5.1.1 The email account that you tried to reach does not exist. Please

Might be nothing, might be a form nobody's checked in a year.

Method is here if you want to check my working, or run it yourself against
anything: https://github.com/omm9846/verdict — MIT, runs local, nothing
uploads.

- Om
```
