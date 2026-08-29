# salesforge.ai — contact audit

- domain: `salesforge.ai`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T14:21:04+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@salesforge.ai` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `hello@salesforge.ai` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `info@salesforge.ai` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `press@salesforge.ai` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `sales@salesforge.ai` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `support@salesforge.ai` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `team@salesforge.ai` | SEND | 2.1.5 OK d2e1a72fcca58-856a4931bf1si9704389b3a.156 - gsmtp | common front-desk address |

---

## Draft note

```
Subject: 6 dead addresses on salesforge.ai

Hi there,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

salesforge.ai came back with something you probably want to know.

6 of the public addresses on salesforge.ai are dead. A real sender gets a hard bounce, not a bounce-back to a form:

  contact@salesforge.ai  ->  5.1.1 The email account that you tried to reach does not exist. 
  hello@salesforge.ai  ->  5.1.1 The email account that you tried to reach does not exist. 
  info@salesforge.ai  ->  5.1.1 The email account that you tried to reach does not exist. 
  ...and 3 more

Could be deliberate, could be a mailbox nobody's opened since a migration. Either way someone trying to reach you that way isn't getting through.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
