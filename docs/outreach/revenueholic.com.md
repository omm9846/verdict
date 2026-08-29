# RevenueHolic — contact audit

- domain: `revenueholic.com`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T10:12:30+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@revenueholic.com` | SEND | 2.1.5 OK d2e1a72fcca58-856a4d2d469si8907737b3a.191 - gsmtp | common front-desk address |
| `hello@revenueholic.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `info@revenueholic.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `press@revenueholic.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `sales@revenueholic.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `support@revenueholic.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `team@revenueholic.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |

---

## Draft note

```
Subject: 6 dead addresses on revenueholic.com

Hi RevenueHolic team,

I built an open-source SMTP verifier and I've been pointing it at companies
whose business is email, on the theory that they'd want to know.

6 of the addresses on revenueholic.com are dead — a real sender gets a hard bounce:

  hello@revenueholic.com  ->  5.1.1 The email account that you tried to reach does not exist. Please
  info@revenueholic.com  ->  5.1.1 The email account that you tried to reach does not exist. Please
  press@revenueholic.com  ->  5.1.1 The email account that you tried to reach does not exist. Please
  sales@revenueholic.com  ->  5.1.1 The email account that you tried to reach does not exist. Please
  support@revenueholic.com  ->  5.1.1 The email account that you tried to reach does not exist. Please
  team@revenueholic.com  ->  5.1.1 The email account that you tried to reach does not exist. Please

Might be nothing, might be a form nobody's checked in a year.

Method is here if you want to check my working, or run it yourself against
anything: https://github.com/omm9846/verdict — MIT, runs local, nothing
uploads.

- Om
```
