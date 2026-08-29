# hunter.io — contact audit

- domain: `hunter.io`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T14:24:03+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@hunter.io` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f32bf52esi9311516a12.21 - gsmtp | common front-desk address |
| `hello@hunter.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `info@hunter.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `press@hunter.io` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f36fe7b3si9757503a12.287 - gsmtp | common front-desk address |
| `privacy@hunter.io` | SEND | 2.1.5 OK d9443c01a7336-2d75963442esi89152375ad.74 - gsmtp | https://hunter.io/privacy-policy |
| `sales@hunter.io` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f32c26d3si9665194a12.48 - gsmtp | common front-desk address |
| `support@hunter.io` | SEND | 2.1.5 OK d2e1a72fcca58-8569f49fa58si9419933b3a.3 - gsmtp | common front-desk address |
| `team@hunter.io` | SEND | 2.1.5 OK d2e1a72fcca58-856a5412ff3si9666144b3a.241 - gsmtp | common front-desk address |

---

## Draft note

```
Subject: 2 dead addresses on hunter.io

Hi there,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

hunter.io came back with something you probably want to know.

2 of the public addresses on hunter.io are dead. A real sender gets a hard bounce, not a bounce-back to a form:

  hello@hunter.io  ->  5.1.1 The email account that you tried to reach does not exist. 
  info@hunter.io  ->  5.1.1 The email account that you tried to reach does not exist. 

Could be deliberate, could be a mailbox nobody's opened since a migration. Either way someone trying to reach you that way isn't getting through.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
