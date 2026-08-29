# Warmly — contact audit

- domain: `warmly.ai`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T10:13:54+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@warmly.ai` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `hello@warmly.ai` | UNKNOWN | 4.2.1 The user you are trying to contact is receiving mail at a rate that prevents additional messages from be | common front-desk address |
| `info@warmly.ai` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `press@warmly.ai` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `privacy@warmly.ai` | UNKNOWN | 4.2.1 The user you are trying to contact is receiving mail at a rate that prevents additional messages from be | https://www.warmly.ai/p/privacy-policy |
| `sales@warmly.ai` | UNKNOWN | 4.2.1 The user you are trying to contact is receiving mail at a rate that prevents additional messages from be | common front-desk address |
| `support@warmly.ai` | UNKNOWN | 4.2.1 The user you are trying to contact is receiving mail at a rate that prevents additional messages from be | common front-desk address |
| `team@warmly.ai` | UNKNOWN | 4.2.1 The user you are trying to contact is receiving mail at a rate that prevents additional messages from be | common front-desk address |

---

## Draft note

```
Subject: 3 dead addresses on warmly.ai

Hi Warmly team,

I built an open-source SMTP verifier and I've been pointing it at companies
whose business is email, on the theory that they'd want to know.

3 of the addresses on warmly.ai are dead — a real sender gets a hard bounce:

  contact@warmly.ai  ->  5.1.1 The email account that you tried to reach does not exist. Please
  info@warmly.ai  ->  5.1.1 The email account that you tried to reach does not exist. Please
  press@warmly.ai  ->  5.1.1 The email account that you tried to reach does not exist. Please

Might be nothing, might be a form nobody's checked in a year.

Method is here if you want to check my working, or run it yourself against
anything: https://github.com/omm9846/verdict — MIT, runs local, nothing
uploads.

- Om
```
