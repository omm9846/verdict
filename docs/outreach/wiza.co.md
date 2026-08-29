# wiza.co — contact audit

- domain: `wiza.co`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T14:27:15+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@wiza.co` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `hello@wiza.co` | SEND | 2.1.5 OK d2e1a72fcca58-856a4935433si10394075b3a.151 - gsmtp | common front-desk address |
| `info@wiza.co` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `press@wiza.co` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `sales@wiza.co` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `support@wiza.co` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `team@wiza.co` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |

---

## Draft note

```
Subject: 6 dead addresses on wiza.co

Hi there,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

wiza.co came back with something you probably want to know.

6 of the public addresses on wiza.co are dead. A real sender gets a hard bounce, not a bounce-back to a form:

  contact@wiza.co  ->  5.1.1 The email account that you tried to reach does not exist. 
  info@wiza.co  ->  5.1.1 The email account that you tried to reach does not exist. 
  press@wiza.co  ->  5.1.1 The email account that you tried to reach does not exist. 
  ...and 3 more

Could be deliberate, could be a mailbox nobody's opened since a migration. Either way someone trying to reach you that way isn't getting through.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
