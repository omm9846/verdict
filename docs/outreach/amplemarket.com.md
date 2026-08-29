# amplemarket.com — contact audit

- domain: `amplemarket.com`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T14:21:08+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@amplemarket.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `hello@amplemarket.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `info@amplemarket.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `press@amplemarket.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `privacy@amplemarket.com` | SEND | 2.1.5 OK d2e1a72fcca58-856a57098d5si9906794b3a.258 - gsmtp | https://www.amplemarket.com/legal/privacy |
| `sales@amplemarket.com` | SEND | 2.1.5 OK d2e1a72fcca58-8569f49fa58si9413999b3a.3 - gsmtp | common front-desk address |
| `support@amplemarket.com` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f36efd9asi10321319a12.256 - gsmtp | common front-desk address |
| `team@amplemarket.com` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f370dc4fsi9252722a12.313 - gsmtp | common front-desk address |

---

## Draft note

```
Subject: 4 dead addresses on amplemarket.com

Hi there,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

amplemarket.com came back with something you probably want to know.

4 of the public addresses on amplemarket.com are dead. A real sender gets a hard bounce, not a bounce-back to a form:

  contact@amplemarket.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  hello@amplemarket.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  info@amplemarket.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  ...and 1 more

Could be deliberate, could be a mailbox nobody's opened since a migration. Either way someone trying to reach you that way isn't getting through.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
