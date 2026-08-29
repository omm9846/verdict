# ListKit — contact audit

- domain: `listkit.io`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T10:10:43+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@listkit.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `hello@listkit.io` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f36fc317si9192158a12.283 - gsmtp | common front-desk address |
| `info@listkit.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `press@listkit.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `sales@listkit.io` | SEND | 2.1.5 OK d2e1a72fcca58-856a4353b6fsi8758701b3a.136 - gsmtp | common front-desk address |
| `support@listkit.io` | SEND | 2.1.5 OK d9443c01a7336-2d8da56916bsi41754275ad.112 - gsmtp | common front-desk address |
| `team@listkit.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |

---

## Draft note

```
Subject: 4 dead addresses on listkit.io

Hi ListKit team,

I built an open-source SMTP verifier and I've been pointing it at companies
whose business is email, on the theory that they'd want to know.

4 of the addresses on listkit.io are dead — a real sender gets a hard bounce:

  contact@listkit.io  ->  5.1.1 The email account that you tried to reach does not exist. Please
  info@listkit.io  ->  5.1.1 The email account that you tried to reach does not exist. Please
  press@listkit.io  ->  5.1.1 The email account that you tried to reach does not exist. Please
  team@listkit.io  ->  5.1.1 The email account that you tried to reach does not exist. Please

Might be nothing, might be a form nobody's checked in a year.

Method is here if you want to check my working, or run it yourself against
anything: https://github.com/omm9846/verdict — MIT, runs local, nothing
uploads.

- Om
```
