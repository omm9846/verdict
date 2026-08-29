# LeadMagic — contact audit

- domain: `leadmagic.io`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T14:26:19+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@leadmagic.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `hello@leadmagic.io` | SEND | 2.1.5 OK d9443c01a7336-2d75950c5a8si94838605ad.40 - gsmtp | common front-desk address |
| `info@leadmagic.io` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f36ecd48si9268536a12.230 - gsmtp | common front-desk address |
| `press@leadmagic.io` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f36dfd73si9127084a12.221 - gsmtp | common front-desk address |
| `privacy@leadmagic.io` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f36aebf5si10301845a12.188 - gsmtp | https://leadmagic.io/legal/privacy |
| `sales@leadmagic.io` | SEND | 2.1.5 OK 98e67ed59e1d1-396b1981feasi21781992a91.12 - gsmtp | common front-desk address |
| `security@leadmagic.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | https://leadmagic.io/.well-known/security.txt |
| `support@leadmagic.io` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f37303c8si9348145a12.378 - gsmtp | common front-desk address |
| `team@leadmagic.io` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f3731b53si9262822a12.372 - gsmtp | common front-desk address |

---

## Draft note

```
Subject: 2 dead addresses on leadmagic.io

Hi LeadMagic,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

LeadMagic came back with something you probably want to know.

2 of the public addresses on leadmagic.io are dead. A real sender gets a hard bounce, not a bounce-back to a form:

  contact@leadmagic.io  ->  5.1.1 The email account that you tried to reach does not exist. 
  security@leadmagic.io  ->  5.1.1 The email account that you tried to reach does not exist. 

Could be deliberate, could be a mailbox nobody's opened since a migration. Either way someone trying to reach you that way isn't getting through.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
