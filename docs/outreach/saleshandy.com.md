# saleshandy.com — contact audit

- domain: `saleshandy.com`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T14:20:08+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@saleshandy.com` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f371df55si8148243a12.348 - gsmtp | common front-desk address |
| `gdpr@ametrosgroup.com` | UNKNOWN | probe-ip blocked: 5.7.1 Service unavailable, Client host [103.249.234.161] blocked using Spamhaus. To request  | https://saleshandy.com/privacy-policy |
| `hello@saleshandy.com` | SEND | 2.1.5 OK d9443c01a7336-2d7598ed098si92798255ad.155 - gsmtp | common front-desk address |
| `info@saleshandy.com` | SEND | 2.1.5 OK d9443c01a7336-2d7598a2688si93305525ad.85 - gsmtp | common front-desk address |
| `press@saleshandy.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `privacy@saleshandy.com` | SEND | 2.1.5 OK d9443c01a7336-2d7598d2e15si91202845ad.122 - gsmtp | https://saleshandy.com/privacy-policy |
| `sales@saleshandy.com` | SEND | 2.1.5 OK d2e1a72fcca58-856a434f708si8537007b3a.133 - gsmtp | common front-desk address |
| `support@saleshandy.com` | SEND | 2.1.5 OK d2e1a72fcca58-856a560a38asi8422118b3a.252 - gsmtp | common front-desk address |
| `team@saleshandy.com` | SEND | 2.1.5 OK d2e1a72fcca58-8569f49db08si9401308b3a.1 - gsmtp | common front-desk address |

---

## Draft note

```
Subject: a dead address on saleshandy.com

Hi there,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

saleshandy.com came back with something you probably want to know.

1 of the public addresses on saleshandy.com are dead. A real sender gets a hard bounce, not a bounce-back to a form:

  press@saleshandy.com  ->  5.1.1 The email account that you tried to reach does not exist. 

Could be deliberate, could be a mailbox nobody's opened since a migration. Either way someone trying to reach you that way isn't getting through.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
