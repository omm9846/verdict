# Breeze CRM — contact audit

- domain: `breezecrm.com`
- mail server: `smtp.secureserver.net`
- collected: 2026-08-29T14:34:54+00:00

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
Subject: breezecrm.com — your mail server refused my probe (correctly)

Hi Breeze CRM,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

Breeze CRM came back with something you probably want to know.

Ran the public addresses on breezecrm.com and got nothing conclusive — your mail server refuses automated probes, which is its right and frankly the correct posture.

No finding, then. Filing it as a well-configured server.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
