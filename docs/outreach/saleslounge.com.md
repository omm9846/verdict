# SalesLounge — contact audit

- domain: `saleslounge.com`
- mail server: `saleslounge-com.mail.protection.outlook.com`
- collected: 2026-08-29T10:13:50+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@saleslounge.com` | UNKNOWN | probe-ip blocked: 5.7.1 Service unavailable, Client host [103.249.234.161] blocked using Spamhaus. To request  | common front-desk address |
| `hello@saleslounge.com` | UNKNOWN | probe-ip blocked: 5.7.1 Service unavailable, Client host [103.249.234.161] blocked using Spamhaus. To request  | common front-desk address |
| `info@saleslounge.com` | UNKNOWN | probe-ip blocked: 5.7.1 Service unavailable, Client host [103.249.234.161] blocked using Spamhaus. To request  | common front-desk address |
| `press@saleslounge.com` | UNKNOWN | probe-ip blocked: 5.7.1 Service unavailable, Client host [103.249.234.161] blocked using Spamhaus. To request  | common front-desk address |
| `sales@saleslounge.com` | UNKNOWN | probe-ip blocked: 5.7.1 Service unavailable, Client host [103.249.234.161] blocked using Spamhaus. To request  | common front-desk address |
| `support@saleslounge.com` | UNKNOWN | probe-ip blocked: 5.7.1 Service unavailable, Client host [103.249.234.161] blocked using Spamhaus. To request  | common front-desk address |
| `team@saleslounge.com` | UNKNOWN | probe-ip blocked: 5.7.1 Service unavailable, Client host [103.249.234.161] blocked using Spamhaus. To request  | common front-desk address |

---

## Draft note

```
Subject: saleslounge.com — clean contact audit

Hi SalesLounge team,

I built an open-source SMTP verifier and I've been pointing it at companies
whose business is email, on the theory that they'd want to know.

Ran the public addresses on saleslounge.com; nothing conclusive came back.

Mail server refused the probe, which is its right.

Method is here if you want to check my working, or run it yourself against
anything: https://github.com/omm9846/verdict — MIT, runs local, nothing
uploads.

- Om
```
