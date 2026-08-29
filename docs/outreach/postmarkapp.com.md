# postmarkapp.com — contact audit

- domain: `postmarkapp.com`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T14:32:32+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@postmarkapp.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `hello@postmarkapp.com` | SEND | 2.1.5 OK d9443c01a7336-2d8eedf9ef9si36757615ad.108 - gsmtp | common front-desk address |
| `info@postmarkapp.com` | SEND | 2.1.5 OK d2e1a72fcca58-8569fa829casi10102823b3a.70 - gsmtp | common front-desk address |
| `press@postmarkapp.com` | SEND | 2.1.5 OK d9443c01a7336-2d7598ed86csi107566455ad.163 - gsmtp | common front-desk address |
| `privacy@activecampaign.com` | RISKY | enterprise gateway: usb-smtp-inbound-2.mimecast.com | https://www.activecampaign.com/legal/privacy-policy |
| `sales@postmarkapp.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `support@postmarkapp.com` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f32bded9si10192033a12.71 - gsmtp | common front-desk address |
| `team@postmarkapp.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |

---

## Draft note

```
Subject: 3 dead addresses on postmarkapp.com

Hi there,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

postmarkapp.com came back with something you probably want to know.

3 of the public addresses on postmarkapp.com are dead. A real sender gets a hard bounce, not a bounce-back to a form:

  contact@postmarkapp.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  sales@postmarkapp.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  team@postmarkapp.com  ->  5.1.1 The email account that you tried to reach does not exist. 

Could be deliberate, could be a mailbox nobody's opened since a migration. Either way someone trying to reach you that way isn't getting through.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
