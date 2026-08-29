# neverbounce.com — contact audit

- domain: `neverbounce.com`
- mail server: `smtp.google.com`
- collected: 2026-08-29T14:28:16+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@neverbounce.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `hello@neverbounce.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `info@neverbounce.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `press@neverbounce.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `privacy@zoominfo.com` | RISKY | enterprise gateway: mxa-0042bc01.gslb.pphosted.com | https://www.zoominfo.com/legal/privacy-policy |
| `sales@neverbounce.com` | SEND | 2.1.5 OK d9443c01a7336-2d7598a2694si91587455ad.96 - gsmtp | common front-desk address |
| `support@neverbounce.com` | SEND | 2.1.5 OK d2e1a72fcca58-8569f49f43esi8745025b3a.33 - gsmtp | common front-desk address |
| `team@neverbounce.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |

---

## Draft note

```
Subject: 5 dead addresses on neverbounce.com

Hi there,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

neverbounce.com came back with something you probably want to know.

5 of the public addresses on neverbounce.com are dead. A real sender gets a hard bounce, not a bounce-back to a form:

  contact@neverbounce.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  hello@neverbounce.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  info@neverbounce.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  ...and 2 more

Could be deliberate, could be a mailbox nobody's opened since a migration. Either way someone trying to reach you that way isn't getting through.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
