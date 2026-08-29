# datagma.com — contact audit

- domain: `datagma.com`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T14:26:24+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@datagma.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `hello@datagma.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `info@datagma.com` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f36ad6e2si9220150a12.190 - gsmtp | common front-desk address |
| `press@datagma.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `sales@datagma.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `support@datagma.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `team@datagma.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |

---

## Draft note

```
Subject: 6 dead addresses on datagma.com

Hi there,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

datagma.com came back with something you probably want to know.

6 of the public addresses on datagma.com are dead. A real sender gets a hard bounce, not a bounce-back to a form:

  contact@datagma.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  hello@datagma.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  press@datagma.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  ...and 3 more

Could be deliberate, could be a mailbox nobody's opened since a migration. Either way someone trying to reach you that way isn't getting through.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
