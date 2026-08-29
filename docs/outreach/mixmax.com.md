# mixmax.com — contact audit

- domain: `mixmax.com`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T14:23:49+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@mixmax.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `hello@mixmax.com` | SEND | 2.1.5 OK d2e1a72fcca58-856a434d1b9si8489048b3a.98 - gsmtp | common front-desk address |
| `info@mixmax.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `press@mixmax.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `privacy@mixmax.com` | SEND | 2.1.5 OK d2e1a72fcca58-856a5225945si8463711b3a.233 - gsmtp | https://www.mixmax.com/legal/terms-of-service |
| `sales@mixmax.com` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f371001esi9820811a12.323 - gsmtp | common front-desk address |
| `support@mixmax.com` | SEND | 2.1.5 OK d2e1a72fcca58-8587bd609b9si1414349b3a.69 - gsmtp | common front-desk address |
| `team@mixmax.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |

---

## Draft note

```
Subject: 4 dead addresses on mixmax.com

Hi there,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

mixmax.com came back with something you probably want to know.

4 of the public addresses on mixmax.com are dead. A real sender gets a hard bounce, not a bounce-back to a form:

  contact@mixmax.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  info@mixmax.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  press@mixmax.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  ...and 1 more

Could be deliberate, could be a mailbox nobody's opened since a migration. Either way someone trying to reach you that way isn't getting through.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
