# dripify.io — contact audit

- domain: `dripify.io`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T14:20:57+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@dripify.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `hello@dripify.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `info@dripify.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `press@dripify.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `sales@dripify.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `support@dripify.io` | SEND | 2.1.5 OK d9443c01a7336-2d7598d7f45si91451875ad.141 - gsmtp | common front-desk address |
| `team@dripify.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |

---

## Draft note

```
Subject: 6 dead addresses on dripify.io

Hi there,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

dripify.io came back with something you probably want to know.

6 of the public addresses on dripify.io are dead. A real sender gets a hard bounce, not a bounce-back to a form:

  contact@dripify.io  ->  5.1.1 The email account that you tried to reach does not exist. 
  hello@dripify.io  ->  5.1.1 The email account that you tried to reach does not exist. 
  info@dripify.io  ->  5.1.1 The email account that you tried to reach does not exist. 
  ...and 3 more

Could be deliberate, could be a mailbox nobody's opened since a migration. Either way someone trying to reach you that way isn't getting through.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
