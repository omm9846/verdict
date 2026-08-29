# Warmly — contact audit

- domain: `warmly.ai`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T14:33:25+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@warmly.ai` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `hello@warmly.ai` | SEND | 2.1.5 OK 98e67ed59e1d1-396ddb66187si11654076a91.8 - gsmtp | common front-desk address |
| `info@warmly.ai` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `press@warmly.ai` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `privacy@warmly.ai` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f3724eafsi10248901a12.361 - gsmtp | https://www.warmly.ai/p/privacy-policy |
| `sales@warmly.ai` | SEND | 2.1.5 OK d2e1a72fcca58-856a5224208si8677621b3a.214 - gsmtp | common front-desk address |
| `support@warmly.ai` | SEND | 2.1.5 OK d2e1a72fcca58-856a434f3desi8711027b3a.132 - gsmtp | common front-desk address |
| `team@warmly.ai` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f36aca7csi8249683a12.189 - gsmtp | common front-desk address |

---

## Draft note

```
Subject: 3 dead addresses on warmly.ai

Hi Warmly,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

Warmly came back with something you probably want to know.

3 of the public addresses on warmly.ai are dead. A real sender gets a hard bounce, not a bounce-back to a form:

  contact@warmly.ai  ->  5.1.1 The email account that you tried to reach does not exist. 
  info@warmly.ai  ->  5.1.1 The email account that you tried to reach does not exist. 
  press@warmly.ai  ->  5.1.1 The email account that you tried to reach does not exist. 

Could be deliberate, could be a mailbox nobody's opened since a migration. Either way someone trying to reach you that way isn't getting through.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
