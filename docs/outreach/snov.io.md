# Snov.io — contact audit

- domain: `snov.io`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T10:10:43+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@snov.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `hello@snov.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `info@snov.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `press@snov.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `sales@snov.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `snovio_dpo@snov.io` | SEND | 2.1.5 OK d9443c01a7336-2d7598a2694si81355205ad.96 - gsmtp | https://snov.io/privacy-policy |
| `support@snov.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `team@snov.io` | UNKNOWN | 4.2.1 The user you are trying to contact is receiving mail at a rate that prevents additional messages from be | common front-desk address |

---

## Draft note

```
Subject: 6 dead addresses on snov.io

Hi Snov.io team,

I built an open-source SMTP verifier and I've been pointing it at companies
whose business is email, on the theory that they'd want to know.

6 of the addresses on snov.io are dead — a real sender gets a hard bounce:

  contact@snov.io  ->  5.1.1 The email account that you tried to reach does not exist. Please
  hello@snov.io  ->  5.1.1 The email account that you tried to reach does not exist. Please
  info@snov.io  ->  5.1.1 The email account that you tried to reach does not exist. Please
  press@snov.io  ->  5.1.1 The email account that you tried to reach does not exist. Please
  sales@snov.io  ->  5.1.1 The email account that you tried to reach does not exist. Please
  support@snov.io  ->  5.1.1 The email account that you tried to reach does not exist. Please

Might be nothing, might be a form nobody's checked in a year.

Method is here if you want to check my working, or run it yourself against
anything: https://github.com/omm9846/verdict — MIT, runs local, nothing
uploads.

- Om
```
