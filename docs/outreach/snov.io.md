# Snov.io — contact audit

- domain: `snov.io`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T14:24:05+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@snov.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `hello@snov.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `info@snov.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `press@snov.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `sales@snov.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `snovio_dpo@snov.io` | SEND | 2.1.5 OK 98e67ed59e1d1-398a08b3468si6561810a91.15 - gsmtp | https://snov.io/privacy-policy |
| `support@snov.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `team@snov.io` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f3724d62si9751901a12.352 - gsmtp | common front-desk address |

---

## Draft note

```
Subject: 6 dead addresses on snov.io

Hi Snov.io,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

Snov.io came back with something you probably want to know.

6 of the public addresses on snov.io are dead. A real sender gets a hard bounce, not a bounce-back to a form:

  contact@snov.io  ->  5.1.1 The email account that you tried to reach does not exist. 
  hello@snov.io  ->  5.1.1 The email account that you tried to reach does not exist. 
  info@snov.io  ->  5.1.1 The email account that you tried to reach does not exist. 
  ...and 3 more

Could be deliberate, could be a mailbox nobody's opened since a migration. Either way someone trying to reach you that way isn't getting through.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
