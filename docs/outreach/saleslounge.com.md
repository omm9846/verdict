# SalesLounge — contact audit

- domain: `saleslounge.com`
- mail server: `saleslounge-com.mail.protection.outlook.com`
- collected: 2026-08-29T14:34:25+00:00

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
Subject: saleslounge.com — your mail server refused my probe (correctly)

Hi SalesLounge,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

SalesLounge came back with something you probably want to know.

Ran the public addresses on saleslounge.com and got nothing conclusive — your mail server refuses automated probes, which is its right and frankly the correct posture.

No finding, then. Filing it as a well-configured server.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
