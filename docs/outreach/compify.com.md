# Compify — contact audit

- domain: `compify.com`
- mail server: `smtp.secureserver.net`
- collected: 2026-08-29T14:35:06+00:00

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
Subject: compify.com — your mail server refused my probe (correctly)

Hi Compify,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

Compify came back with something you probably want to know.

Ran the public addresses on compify.com and got nothing conclusive — your mail server refuses automated probes, which is its right and frankly the correct posture.

No finding, then. Filing it as a well-configured server.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
