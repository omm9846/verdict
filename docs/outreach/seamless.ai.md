# seamless.ai — contact audit

- domain: `seamless.ai`
- mail server: `inbound-smtp.us-east-1.amazonaws.com`
- collected: 2026-08-29T14:25:30+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@seamless.ai` | UNKNOWN | probe-ip blocked: 5.7.1 IP address blacklisted by recipient | common front-desk address |
| `hello@seamless.ai` | UNKNOWN | probe-ip blocked: 5.7.1 IP address blacklisted by recipient | common front-desk address |
| `info@seamless.ai` | UNKNOWN | probe-ip blocked: 5.7.1 IP address blacklisted by recipient | common front-desk address |
| `press@seamless.ai` | UNKNOWN | probe-ip blocked: 5.7.1 IP address blacklisted by recipient | common front-desk address |
| `privacy@seamlessleads.com` | CATCHALL | fake mailbox accepted | https://seamless.ai/policies/privacy-policy |
| `sales@seamless.ai` | UNKNOWN | probe-ip blocked: 5.7.1 IP address blacklisted by recipient | common front-desk address |
| `support@seamless.ai` | UNKNOWN | probe-ip blocked: 5.7.1 IP address blacklisted by recipient | common front-desk address |
| `team@seamless.ai` | UNKNOWN | probe-ip blocked: 5.7.1 IP address blacklisted by recipient | common front-desk address |

---

## Draft note

```
Subject: seamless.ai — your mail server refused my probe (correctly)

Hi there,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

seamless.ai came back with something you probably want to know.

Ran the public addresses on seamless.ai and got nothing conclusive — your mail server refuses automated probes, which is its right and frankly the correct posture.

No finding, then. Filing it as a well-configured server.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
