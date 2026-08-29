# 404media.co — pitch pack

- mail server: `aspmx.l.google.com`
- checked: 2026-08-29T15:12:45+00:00

## Send to (verified live)

- **press@404media.co** — 2.1.5 OK d2e1a72fcca58-8569fa80a57si10023050b3a.57 - gsmtp

**Do not use — confirmed dead:**
- ~~contact@404media.co~~ 5.1.1 The email account that you tried to reach do
- ~~editor@404media.co~~ 5.1.1 The email account that you tried to reach do
- ~~editorial@404media.co~~ 5.1.1 The email account that you tried to reach do
- ~~hello@404media.co~~ 5.1.1 The email account that you tried to reach do
- ~~info@404media.co~~ 5.1.1 The email account that you tried to reach do
- ~~news@404media.co~~ 5.1.1 The email account that you tried to reach do
- ~~newsdesk@404media.co~~ 5.1.1 The email account that you tried to reach do
- ~~team@404media.co~~ 5.1.1 The email account that you tried to reach do
- ~~tips@404media.co~~ 5.1.1 The email account that you tried to reach do

---

## Pitch

```
Subject: 31 of 80 email companies have dead mailboxes on their own domain

Hi 404media.co,

I run an open-source SMTP verification engine. I pointed it at 80 companies
whose business is email — outreach platforms, contact-data vendors,
deliverability tools — and probed the public contact addresses on their own
domains.

31 of the 80 have at least one mailbox that hard-bounces.
5 of those sell mailbox verification for a living: emailhippo.com, kickbox.com, millionverifier.com, neverbounce.com, verifalia.com.

kickbox.com and verifalia.com each returned 550 5.1.1 on six of their own
published addresses. Companies whose product is telling you whether a mailbox
exists, with mailboxes that do not.

A further 32 run catch-all domains, meaning they accept any
address at all — including a random 22-character one I invented — so nobody
can verify an individual mailbox on them. Including, in several cases, the
verifier they sell.

Method, in short: two independent SMTP probes at least 20 seconds apart, both
required to return a hard recipient-level rejection. Catch-all domains,
enterprise gateways, and anything that refused our probe are excluded rather
than counted. Raw server responses and timestamps for every result. The
engine is MIT licensed, so the whole thing is reproducible:
https://github.com/omm9846/verdict

Every company named has been contacted directly and given a week to fix it or
tell me I am wrong before anything publishes.

I can send the full dataset, the per-company breakdown, and the raw SMTP
transcripts.

Happy to give it to you exclusively — I have not sent the data to anyone else, and I will hold it until you have had a look.

- Om
  hello@tryverdict.org
  https://tryverdict.org
```
