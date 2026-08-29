# GrowthX — contact audit

- domain: `growthx.io`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T14:34:01+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@growthx.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `hello@growthx.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `info@growthx.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `press@growthx.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `sales@growthx.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `support@growthx.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `team@growthx.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |

---

## Draft note

```
Subject: 7 dead addresses on growthx.io

Hi GrowthX,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

GrowthX came back with something you probably want to know.

7 of the public addresses on growthx.io are dead. A real sender gets a hard bounce, not a bounce-back to a form:

  contact@growthx.io  ->  5.1.1 The email account that you tried to reach does not exist. 
  hello@growthx.io  ->  5.1.1 The email account that you tried to reach does not exist. 
  info@growthx.io  ->  5.1.1 The email account that you tried to reach does not exist. 
  ...and 4 more

Could be deliberate, could be a mailbox nobody's opened since a migration. Either way someone trying to reach you that way isn't getting through.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
