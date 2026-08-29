# mailgun.com — contact audit

- domain: `mailgun.com`
- mail server: `mailgun-com.mail.protection.outlook.com`
- collected: 2026-08-29T14:32:28+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@mailgun.com` | UNKNOWN | probe-ip blocked: 5.7.1 Service unavailable, Client host [103.249.234.161] blocked using Spamhaus. To request  | common front-desk address |
| `dpo@sinch.com` | UNKNOWN | probe-ip blocked: 5.7.1 Service unavailable, Client host [103.249.234.161] blocked using Spamhaus. To request  | https://www.mailgun.com/legal/privacy-policy/ |
| `hello@mailgun.com` | UNKNOWN | probe-ip blocked: 5.7.1 Service unavailable, Client host [103.249.234.161] blocked using Spamhaus. To request  | common front-desk address |
| `info@mailgun.com` | UNKNOWN | probe-ip blocked: 5.7.1 Service unavailable, Client host [103.249.234.161] blocked using Spamhaus. To request  | common front-desk address |
| `press@mailgun.com` | UNKNOWN | probe-ip blocked: 5.7.1 Service unavailable, Client host [103.249.234.161] blocked using Spamhaus. To request  | common front-desk address |
| `sales@mailgun.com` | UNKNOWN | probe-ip blocked: 5.7.1 Service unavailable, Client host [103.249.234.161] blocked using Spamhaus. To request  | common front-desk address |
| `support@mailgun.com` | UNKNOWN | probe-ip blocked: 5.7.1 Service unavailable, Client host [103.249.234.161] blocked using Spamhaus. To request  | common front-desk address |
| `team@mailgun.com` | UNKNOWN | probe-ip blocked: 5.7.1 Service unavailable, Client host [103.249.234.161] blocked using Spamhaus. To request  | common front-desk address |

---

## Draft note

```
Subject: mailgun.com — your mail server refused my probe (correctly)

Hi there,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

mailgun.com came back with something you probably want to know.

Ran the public addresses on mailgun.com and got nothing conclusive — your mail server refuses automated probes, which is its right and frankly the correct posture.

No finding, then. Filing it as a well-configured server.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
