# Compify — contact audit

- domain: `compify.com`
- mail server: `smtp.secureserver.net`
- collected: 2026-08-29T10:14:57+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@compify.com` | UNKNOWN | probe-ip blocked: Connection unexpectedly closed | common front-desk address |
| `hello@compify.com` | UNKNOWN | probe-ip blocked: Connection unexpectedly closed | common front-desk address |
| `info@compify.com` | UNKNOWN | probe-ip blocked: Connection unexpectedly closed | common front-desk address |
| `press@compify.com` | UNKNOWN | probe-ip blocked: Connection unexpectedly closed | common front-desk address |
| `sales@compify.com` | UNKNOWN | probe-ip blocked: Connection unexpectedly closed | common front-desk address |
| `support@compify.com` | UNKNOWN | probe-ip blocked: Connection unexpectedly closed | common front-desk address |
| `team@compify.com` | UNKNOWN | probe-ip blocked: Connection unexpectedly closed | common front-desk address |

---

## Draft note

```
Subject: compify.com — clean contact audit

Hi Compify team,

I built an open-source SMTP verifier and I've been pointing it at companies
whose business is email, on the theory that they'd want to know.

Ran the public addresses on compify.com; nothing conclusive came back.

Mail server refused the probe, which is its right.

Method is here if you want to check my working, or run it yourself against
anything: https://github.com/omm9846/verdict — MIT, runs local, nothing
uploads.

- Om
```
