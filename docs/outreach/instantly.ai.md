# instantly.ai — contact audit

- domain: `instantly.ai`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T14:19:48+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@instantly.ai` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `hello@instantly.ai` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `info@instantly.ai` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `press@instantly.ai` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `sales@instantly.ai` | SEND | 2.1.5 OK d9443c01a7336-2d7598d1626si102643365ad.127 - gsmtp | common front-desk address |
| `support@instantly.ai` | SEND | 2.1.5 OK d2e1a72fcca58-856a4350144si9968055b3a.117 - gsmtp | common front-desk address |
| `team@instantly.ai` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |

---

## Draft note

```
Subject: 5 dead addresses on instantly.ai

Hi there,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

instantly.ai came back with something you probably want to know.

5 of the public addresses on instantly.ai are dead. A real sender gets a hard bounce, not a bounce-back to a form:

  contact@instantly.ai  ->  5.1.1 The email account that you tried to reach does not exist. 
  hello@instantly.ai  ->  5.1.1 The email account that you tried to reach does not exist. 
  info@instantly.ai  ->  5.1.1 The email account that you tried to reach does not exist. 
  ...and 2 more

Could be deliberate, could be a mailbox nobody's opened since a migration. Either way someone trying to reach you that way isn't getting through.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
