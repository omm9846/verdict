# humanlinker.com — contact audit

- domain: `humanlinker.com`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T14:22:00+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@humanlinker.com` | SEND | 2.1.5 OK d9443c01a7336-2d7595092ebsi92763685ad.3 - gsmtp | common front-desk address |
| `dpo@humanlinker.com` | SEND | 2.1.5 OK d2e1a72fcca58-856a4b30030si9627184b3a.172 - gsmtp | https://www.humanlinker.com/privacy-policy |
| `hello@humanlinker.com` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f36aece4si10709674a12.162 - gsmtp | common front-desk address |
| `info@humanlinker.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `press@humanlinker.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `sales@humanlinker.com` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f3729dc0si8467073a12.366 - gsmtp | common front-desk address |
| `support@humanlinker.com` | SEND | 2.1.5 OK d9443c01a7336-2d7598acce4si93102345ad.84 - gsmtp | common front-desk address |
| `team@humanlinker.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |

---

## Draft note

```
Subject: 3 dead addresses on humanlinker.com

Hi there,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

humanlinker.com came back with something you probably want to know.

3 of the public addresses on humanlinker.com are dead. A real sender gets a hard bounce, not a bounce-back to a form:

  info@humanlinker.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  press@humanlinker.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  team@humanlinker.com  ->  5.1.1 The email account that you tried to reach does not exist. 

Could be deliberate, could be a mailbox nobody's opened since a migration. Either way someone trying to reach you that way isn't getting through.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
