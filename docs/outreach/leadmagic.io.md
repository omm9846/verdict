# LeadMagic — contact audit

- domain: `leadmagic.io`
- mail server: `aspmx.l.google.com`
- collected: 2026-08-29T10:11:01+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@leadmagic.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | common front-desk address |
| `hello@leadmagic.io` | SEND | 2.1.5 OK d2e1a72fcca58-8569f596a68si8434826b3a.42 - gsmtp | common front-desk address |
| `info@leadmagic.io` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f32e50f0si8912640a12.83 - gsmtp | common front-desk address |
| `press@leadmagic.io` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f32bf968si8152178a12.52 - gsmtp | common front-desk address |
| `privacy@leadmagic.io` | SEND | 2.1.5 OK d9443c01a7336-2d8fa59f823si11154875ad.156 - gsmtp | https://leadmagic.io/legal/privacy |
| `sales@leadmagic.io` | SEND | 2.1.5 OK d9443c01a7336-2d759503648si80531615ad.19 - gsmtp | common front-desk address |
| `security@leadmagic.io` | **DEAD** | 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's ema | https://leadmagic.io/.well-known/security.txt |
| `support@leadmagic.io` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f371e893si7412392a12.356 - gsmtp | common front-desk address |
| `team@leadmagic.io` | SEND | 2.1.5 OK 41be03b00d2f7-cc1f3721371si8228316a12.350 - gsmtp | common front-desk address |

---

## Draft note

```
Subject: 2 dead addresses on leadmagic.io

Hi LeadMagic team,

I built an open-source SMTP verifier and I've been pointing it at companies
whose business is email, on the theory that they'd want to know.

2 of the addresses on leadmagic.io are dead — a real sender gets a hard bounce:

  contact@leadmagic.io  ->  5.1.1 The email account that you tried to reach does not exist. Please
  security@leadmagic.io  ->  5.1.1 The email account that you tried to reach does not exist. Please

Might be nothing, might be a form nobody's checked in a year.

Method is here if you want to check my working, or run it yourself against
anything: https://github.com/omm9846/verdict — MIT, runs local, nothing
uploads.

- Om
```
