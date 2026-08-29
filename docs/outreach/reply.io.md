# reply.io — contact audit

- domain: `reply.io`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T14:19:48+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@reply.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `hello@reply.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `info@reply.io` | SEND | 2.1.5 OK d9443c01a7336-2d7598a6e90si91827605ad.91 - gsmtp | common front-desk address |
| `press@reply.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `sales@reply.io` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f32e6688si10421097a12.105 - gsmtp | common front-desk address |
| `support@reply.io` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f32bef42si10150704a12.72 - gsmtp | common front-desk address |
| `team@reply.io` | SEND | 2.1.5 OK d9443c01a7336-2d8ff7ed3fcsi6011745ad.34 - gsmtp | common front-desk address |

---

## Draft note

```
Subject: 3 dead addresses on reply.io

Hi there,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

reply.io came back with something you probably want to know.

3 of the public addresses on reply.io are dead. A real sender gets a hard bounce, not a bounce-back to a form:

  contact@reply.io  ->  5.1.1 The email account that you tried to reach does not exist. 
  hello@reply.io  ->  5.1.1 The email account that you tried to reach does not exist. 
  press@reply.io  ->  5.1.1 The email account that you tried to reach does not exist. 

Could be deliberate, could be a mailbox nobody's opened since a migration. Either way someone trying to reach you that way isn't getting through.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
