# yesware.com — contact audit

- domain: `yesware.com`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T14:23:55+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `compliance@vendasta.com` | CATCHALL | fake mailbox accepted | https://www.yesware.com/gdpr/ |
| `contact@yesware.com` | SEND | 2.1.5 OK d2e1a72fcca58-8569fb7d284si8518641b3a.82 - gsmtp | common front-desk address |
| `hello@yesware.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `info@yesware.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `press@yesware.com` | SEND | 2.1.5 OK d2e1a72fcca58-856a4839bd7si8649375b3a.148 - gsmtp | common front-desk address |
| `sales@yesware.com` | SEND | 2.1.5 OK d2e1a72fcca58-858c76dec23si400158b3a.130 - gsmtp | common front-desk address |
| `support@yesware.com` | SEND | 2.1.5 OK d9443c01a7336-2d75963199dsi108838045ad.71 - gsmtp | common front-desk address |
| `team@yesware.com` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f32bdbdasi9791701a12.4 - gsmtp | common front-desk address |

---

## Draft note

```
Subject: 2 dead addresses on yesware.com

Hi there,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

yesware.com came back with something you probably want to know.

2 of the public addresses on yesware.com are dead. A real sender gets a hard bounce, not a bounce-back to a form:

  hello@yesware.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  info@yesware.com  ->  5.1.1 The email account that you tried to reach does not exist. 

Could be deliberate, could be a mailbox nobody's opened since a migration. Either way someone trying to reach you that way isn't getting through.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
