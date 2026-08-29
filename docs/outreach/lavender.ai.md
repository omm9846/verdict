# lavender.ai — contact audit

- domain: `lavender.ai`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T14:21:52+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@lavender.ai` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `hello@lavender.ai` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `info@lavender.ai` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `press@lavender.ai` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `sales@lavender.ai` | SEND | 2.1.5 OK 98e67ed59e1d1-396b1af2753si18506001a91.16 - gsmtp | common front-desk address |
| `support@lavender.ai` | SEND | 2.1.5 OK d2e1a72fcca58-8569f49f43esi8721794b3a.33 - gsmtp | common front-desk address |
| `team@lavender.ai` | SEND | 2.1.5 OK d2e1a72fcca58-8569f4a07d8si8589576b3a.24 - gsmtp | common front-desk address |

---

## Draft note

```
Subject: 4 dead addresses on lavender.ai

Hi there,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

lavender.ai came back with something you probably want to know.

4 of the public addresses on lavender.ai are dead. A real sender gets a hard bounce, not a bounce-back to a form:

  contact@lavender.ai  ->  5.1.1 The email account that you tried to reach does not exist. 
  hello@lavender.ai  ->  5.1.1 The email account that you tried to reach does not exist. 
  info@lavender.ai  ->  5.1.1 The email account that you tried to reach does not exist. 
  ...and 1 more

Could be deliberate, could be a mailbox nobody's opened since a migration. Either way someone trying to reach you that way isn't getting through.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
