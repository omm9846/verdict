# verifalia.com — contact audit

- domain: `verifalia.com`
- mail server: `smtp.google.com`
- collected: 2026-08-29T14:29:54+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@verifalia.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `dpo@verifalia.com` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f32bf896si8369396a12.58 - gsmtp | https://verifalia.com/legal/data-processing-addendum |
| `hello@verifalia.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `info@verifalia.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `press@verifalia.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `sales@verifalia.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `support@verifalia.com` | SEND | 2.1.5 OK d9443c01a7336-2d759510bf2si102630155ad.20 - gsmtp | common front-desk address |
| `team@verifalia.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |

---

## Draft note

```
Subject: 6 dead addresses on verifalia.com

Hi there,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

verifalia.com came back with something you probably want to know.

6 of the public addresses on verifalia.com are dead. A real sender gets a hard bounce, not a bounce-back to a form:

  contact@verifalia.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  hello@verifalia.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  info@verifalia.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  ...and 3 more

Could be deliberate, could be a mailbox nobody's opened since a migration. Either way someone trying to reach you that way isn't getting through.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
