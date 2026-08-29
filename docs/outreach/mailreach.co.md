# mailreach.co — contact audit

- domain: `mailreach.co`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T14:31:13+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@mailreach.co` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `hello@mailreach.co` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f3729dc0si8501200a12.366 - gsmtp | common front-desk address |
| `info@mailreach.co` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `press@mailreach.co` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `sales@mailreach.co` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `support@mailreach.co` | SEND | 2.1.5 OK d9443c01a7336-2d7598ece59si95178925ad.158 - gsmtp | common front-desk address |
| `team@mailreach.co` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |

---

## Draft note

```
Subject: 5 dead addresses on mailreach.co

Hi there,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

mailreach.co came back with something you probably want to know.

5 of the public addresses on mailreach.co are dead. A real sender gets a hard bounce, not a bounce-back to a form:

  contact@mailreach.co  ->  5.1.1 The email account that you tried to reach does not exist. 
  info@mailreach.co  ->  5.1.1 The email account that you tried to reach does not exist. 
  press@mailreach.co  ->  5.1.1 The email account that you tried to reach does not exist. 
  ...and 2 more

Could be deliberate, could be a mailbox nobody's opened since a migration. Either way someone trying to reach you that way isn't getting through.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
