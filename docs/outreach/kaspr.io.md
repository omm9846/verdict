# kaspr.io — contact audit

- domain: `kaspr.io`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T14:27:35+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@kaspr.io` | SEND | 2.1.5 OK 98e67ed59e1d1-396ddaf4fbfsi10521661a91.1 - gsmtp | common front-desk address |
| `hello@kaspr.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `info@kaspr.io` | **DEAD** | 5.2.1 The email account that you tried to reach is inactive. For more information, go to https://support.googl | common front-desk address |
| `press@kaspr.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `privacy@kaspr.io` | SEND | 2.1.5 OK 98e67ed59e1d1-396b1e4a665si17929321a91.20 - gsmtp | https://www.kaspr.io/privacy-policy |
| `sales@kaspr.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `support@kaspr.io` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f32c0446si8910938a12.60 - gsmtp | common front-desk address |
| `team@kaspr.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |

---

## Draft note

```
Subject: 5 dead addresses on kaspr.io

Hi there,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

kaspr.io came back with something you probably want to know.

5 of the public addresses on kaspr.io are dead. A real sender gets a hard bounce, not a bounce-back to a form:

  hello@kaspr.io  ->  5.1.1 The email account that you tried to reach does not exist. 
  info@kaspr.io  ->  5.2.1 The email account that you tried to reach is inactive. For
  press@kaspr.io  ->  5.1.1 The email account that you tried to reach does not exist. 
  ...and 2 more

Could be deliberate, could be a mailbox nobody's opened since a migration. Either way someone trying to reach you that way isn't getting through.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
