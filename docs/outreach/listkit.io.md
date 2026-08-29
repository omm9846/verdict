# ListKit — contact audit

- domain: `listkit.io`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T14:26:23+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@listkit.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `hello@listkit.io` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f374b9e7si10395384a12.400 - gsmtp | common front-desk address |
| `info@listkit.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `press@listkit.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `sales@listkit.io` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f36aef27si9459848a12.133 - gsmtp | common front-desk address |
| `support@listkit.io` | SEND | 2.1.5 OK d2e1a72fcca58-856a4350179si9888577b3a.94 - gsmtp | common front-desk address |
| `team@listkit.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |

---

## Draft note

```
Subject: 4 dead addresses on listkit.io

Hi ListKit,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

ListKit came back with something you probably want to know.

4 of the public addresses on listkit.io are dead. A real sender gets a hard bounce, not a bounce-back to a form:

  contact@listkit.io  ->  5.1.1 The email account that you tried to reach does not exist. 
  info@listkit.io  ->  5.1.1 The email account that you tried to reach does not exist. 
  press@listkit.io  ->  5.1.1 The email account that you tried to reach does not exist. 
  ...and 1 more

Could be deliberate, could be a mailbox nobody's opened since a migration. Either way someone trying to reach you that way isn't getting through.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
