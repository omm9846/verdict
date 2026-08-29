# kickbox.com — contact audit

- domain: `kickbox.com`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T14:30:26+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `compliance@kickbox.com` | SEND | 2.1.5 OK d9443c01a7336-2d8fa98e635si23730475ad.147 - gsmtp | https://docs.kickbox.com/docs/gdpr |
| `contact@kickbox.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `dpo@ziffdavis.com` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f36aecd9si10695077a12.131 - gsmtp | https://docs.kickbox.com/docs/privacy-policy |
| `emailprivacy@generitech.com` | UNKNOWN | timed out | https://privacyportal.onetrust.com/webform/f73513a8-7a10-4a9d-939a-703f8d994839/262761ab-edc4-440a-8e56-e6348b131382 |
| `hello@kickbox.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `info@kickbox.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `press@kickbox.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `privacy@icontact.com` | SEND | 2.1.5 OK d9443c01a7336-2d75950d0f7si103307665ad.4 - gsmtp | https://docs.kickbox.com/docs/privacy-policy |
| `privacy@kickbox.com` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f36f541csi9760872a12.266 - gsmtp | https://privacyportal.onetrust.com/webform/f73513a8-7a10-4a9d-939a-703f8d994839/262761ab-edc4-440a-8e56-e6348b131382 |
| `sales@kickbox.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `support@kickbox.com` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f3702c3bsi9221149a12.296 - gsmtp | common front-desk address |
| `team@kickbox.com` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |

---

## Draft note

```
Subject: 6 dead addresses on kickbox.com

Hi there,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

kickbox.com came back with something you probably want to know.

6 of the public addresses on kickbox.com are dead. A real sender gets a hard bounce, not a bounce-back to a form:

  contact@kickbox.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  hello@kickbox.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  info@kickbox.com  ->  5.1.1 The email account that you tried to reach does not exist. 
  ...and 3 more

Could be deliberate, could be a mailbox nobody's opened since a migration. Either way someone trying to reach you that way isn't getting through.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
