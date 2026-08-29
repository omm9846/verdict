# RevenueHolic — contact audit

- domain: `revenueholic.com`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T14:33:29+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@revenueholic.com` | SEND | 2.1.5 OK d2e1a72fcca58-856a5224fd2si8450922b3a.228 - gsmtp | common front-desk address |
| `hello@revenueholic.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `info@revenueholic.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `press@revenueholic.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `sales@revenueholic.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `support@revenueholic.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `team@revenueholic.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |

---

## Draft note

```
Subject: 6 dead addresses on revenueholic.com

Hi RevenueHolic,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

RevenueHolic came back with something you probably want to know.

6 of the public addresses on revenueholic.com are dead. A real sender gets a hard bounce, not a bounce-back to a form:

  hello@revenueholic.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  info@revenueholic.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  press@revenueholic.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  ...and 3 more

Could be deliberate, could be a mailbox nobody's opened since a migration. Either way someone trying to reach you that way isn't getting through.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
