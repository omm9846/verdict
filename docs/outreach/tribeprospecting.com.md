# Tribe Prospecting — contact audit

- domain: `tribeprospecting.com`
- mail server: `smtp.google.com`
- collected: 2026-08-29T14:33:44+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@tribeprospecting.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `hello@tribeprospecting.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `info@tribeprospecting.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `press@tribeprospecting.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `sales@tribeprospecting.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `support@tribeprospecting.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `team@tribeprospecting.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |

---

## Draft note

```
Subject: 7 dead addresses on tribeprospecting.com

Hi Tribe Prospecting,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

Tribe Prospecting came back with something you probably want to know.

7 of the public addresses on tribeprospecting.com are dead. A real sender gets a hard bounce, not a bounce-back to a form:

  contact@tribeprospecting.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  hello@tribeprospecting.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  info@tribeprospecting.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  ...and 4 more

Could be deliberate, could be a mailbox nobody's opened since a migration. Either way someone trying to reach you that way isn't getting through.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
