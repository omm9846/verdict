# apollo.io — contact audit

- domain: `apollo.io`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T14:23:58+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@apollo.io` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f36e5731si10047015a12.226 - gsmtp | common front-desk address |
| `dpo@apollo.io` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f370df47si9198316a12.314 - gsmtp | https://www.apollo.io/privacy-policy |
| `hello@apollo.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `info@apollo.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `press@apollo.io` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f37252e6si9584206a12.364 - gsmtp | common front-desk address |
| `privacy@apollo.io` | SEND | 2.1.5 OK d2e1a72fcca58-856a4d2a679si9544483b3a.182 - gsmtp | https://www.apollo.io/privacy-policy |
| `sales@apollo.io` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f36fb405si9386921a12.271 - gsmtp | common front-desk address |
| `support@apollo.io` | SEND | 2.1.5 OK d2e1a72fcca58-856a4a34972si9873358b3a.162 - gsmtp | common front-desk address |
| `team@apollo.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |

---

## Draft note

```
Subject: 3 dead addresses on apollo.io

Hi there,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

apollo.io came back with something you probably want to know.

3 of the public addresses on apollo.io are dead. A real sender gets a hard bounce, not a bounce-back to a form:

  hello@apollo.io  ->  5.1.1 The email account that you tried to reach does not exist. 
  info@apollo.io  ->  5.1.1 The email account that you tried to reach does not exist. 
  team@apollo.io  ->  5.1.1 The email account that you tried to reach does not exist. 

Could be deliberate, could be a mailbox nobody's opened since a migration. Either way someone trying to reach you that way isn't getting through.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
