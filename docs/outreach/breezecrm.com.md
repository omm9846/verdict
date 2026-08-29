# Breeze CRM — contact audit

- domain: `breezecrm.com`
- mail server: `smtp.secureserver.net`
- collected: 2026-08-29T10:14:35+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@breezecrm.com` | UNKNOWN | probe-ip blocked: Connection unexpectedly closed | common front-desk address |
| `hello@breezecrm.com` | UNKNOWN | probe-ip blocked: Connection unexpectedly closed | common front-desk address |
| `info@breezecrm.com` | UNKNOWN | probe-ip blocked: Connection unexpectedly closed | common front-desk address |
| `press@breezecrm.com` | UNKNOWN | probe-ip blocked: Connection unexpectedly closed | common front-desk address |
| `sales@breezecrm.com` | UNKNOWN | probe-ip blocked: Connection unexpectedly closed | common front-desk address |
| `support@breezecrm.com` | UNKNOWN | probe-ip blocked: Connection unexpectedly closed | common front-desk address |
| `team@breezecrm.com` | UNKNOWN | probe-ip blocked: Connection unexpectedly closed | common front-desk address |

---

## Draft note

```
Subject: breezecrm.com — clean contact audit

Hi Breeze CRM team,

I built an open-source SMTP verifier and I've been pointing it at companies
whose business is email, on the theory that they'd want to know.

Ran the public addresses on breezecrm.com; nothing conclusive came back.

Mail server refused the probe, which is its right.

Method is here if you want to check my working, or run it yourself against
anything: https://github.com/omm9846/verdict — MIT, runs local, nothing
uploads.

- Om
```
