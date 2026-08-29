# mailivery.io — contact audit

- domain: `mailivery.io`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T14:31:55+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@mailivery.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `hello@mailivery.io` | SEND | 2.1.5 OK 98e67ed59e1d1-396b19820ebsi18102089a91.13 - gsmtp | common front-desk address |
| `info@mailivery.io` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f3703404si10706552a12.298 - gsmtp | common front-desk address |
| `press@mailivery.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `sales@mailivery.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `support@mailivery.io` | SEND | 2.1.5 OK d2e1a72fcca58-8569fa82c8csi8623114b3a.71 - gsmtp | common front-desk address |
| `team@mailivery.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |

---

## Draft note

```
Subject: 4 dead addresses on mailivery.io

Hi there,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

mailivery.io came back with something you probably want to know.

4 of the public addresses on mailivery.io are dead. A real sender gets a hard bounce, not a bounce-back to a form:

  contact@mailivery.io  ->  5.1.1 The email account that you tried to reach does not exist. 
  press@mailivery.io  ->  5.1.1 The email account that you tried to reach does not exist. 
  sales@mailivery.io  ->  5.1.1 The email account that you tried to reach does not exist. 
  ...and 1 more

Could be deliberate, could be a mailbox nobody's opened since a migration. Either way someone trying to reach you that way isn't getting through.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
