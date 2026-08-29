# Tribe Prospecting — contact audit

- domain: `tribeprospecting.com`
- mail server: `smtp.google.com`
- collected: 2026-08-29T10:12:14+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@tribeprospecting.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `hello@tribeprospecting.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `info@tribeprospecting.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `press@tribeprospecting.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `sales@tribeprospecting.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `support@tribeprospecting.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `team@tribeprospecting.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |

---

## Draft note

```
Subject: 7 dead addresses on tribeprospecting.com

Hi Tribe Prospecting team,

I built an open-source SMTP verifier and I've been pointing it at companies
whose business is email, on the theory that they'd want to know.

7 of the addresses on tribeprospecting.com are dead — a real sender gets a hard bounce:

  contact@tribeprospecting.com  ->  5.1.1 The email account that you tried to reach does not exist. Please
  hello@tribeprospecting.com  ->  5.1.1 The email account that you tried to reach does not exist. Please
  info@tribeprospecting.com  ->  5.1.1 The email account that you tried to reach does not exist. Please
  press@tribeprospecting.com  ->  5.1.1 The email account that you tried to reach does not exist. Please
  sales@tribeprospecting.com  ->  5.1.1 The email account that you tried to reach does not exist. Please
  support@tribeprospecting.com  ->  5.1.1 The email account that you tried to reach does not exist. Please
  team@tribeprospecting.com  ->  5.1.1 The email account that you tried to reach does not exist. Please

Might be nothing, might be a form nobody's checked in a year.

Method is here if you want to check my working, or run it yourself against
anything: https://github.com/omm9846/verdict — MIT, runs local, nothing
uploads.

- Om
```
