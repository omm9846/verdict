# clearbit.com — contact audit

- domain: `clearbit.com`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T14:25:43+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@clearbit.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `hello@clearbit.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `info@clearbit.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `press@clearbit.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `privacy@clearbit.com` | SEND | 2.1.5 OK d2e1a72fcca58-8586345df90si1984723b3a.30 - gsmtp | https://clearbit.com/privacy-policy |
| `sales@clearbit.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `support@clearbit.com` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f36f0c74si9923505a12.257 - gsmtp | common front-desk address |
| `team@clearbit.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |

---

## Draft note

```
Subject: 6 dead addresses on clearbit.com

Hi there,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

clearbit.com came back with something you probably want to know.

6 of the public addresses on clearbit.com are dead. A real sender gets a hard bounce, not a bounce-back to a form:

  contact@clearbit.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  hello@clearbit.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  info@clearbit.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  ...and 3 more

Could be deliberate, could be a mailbox nobody's opened since a migration. Either way someone trying to reach you that way isn't getting through.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
