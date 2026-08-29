# emailhippo.com — contact audit

- domain: `emailhippo.com`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T14:30:35+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@emailhippo.com` | SEND | 2.1.5 OK d2e1a72fcca58-856a434d1a2si9621035b3a.114 - gsmtp | common front-desk address |
| `dpo@emailhippo.com` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f3704a2fsi8791977a12.300 - gsmtp | https://emailhippo.com/privacy-policy |
| `hello@emailhippo.com` | SEND | 2.1.5 OK d2e1a72fcca58-856a5224fddsi8723240b3a.231 - gsmtp | common front-desk address |
| `info@emailhippo.com` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f32c09a2si8692534a12.74 - gsmtp | common front-desk address |
| `press@emailhippo.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `sales@emailhippo.com` | SEND | 2.1.5 OK d9443c01a7336-2d7598a6cc6si105820295ad.94 - gsmtp | common front-desk address |
| `support@emailhippo.com` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f36fabefsi8850462a12.272 - gsmtp | common front-desk address |
| `team@emailhippo.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |

---

## Draft note

```
Subject: 2 dead addresses on emailhippo.com

Hi there,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

emailhippo.com came back with something you probably want to know.

2 of the public addresses on emailhippo.com are dead. A real sender gets a hard bounce, not a bounce-back to a form:

  press@emailhippo.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  team@emailhippo.com  ->  5.1.1 The email account that you tried to reach does not exist. 

Could be deliberate, could be a mailbox nobody's opened since a migration. Either way someone trying to reach you that way isn't getting through.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
