# Hand-written pitches, one per outlet

The facts are identical everywhere. The reason to care is not, so nothing here
is a mail-merge of anything else.

**Before you send any of these:**

1. Notify all 80 companies first, with a stated deadline. A story where the
   subjects were told a week ago is reportable; one where they were not is a
   hit job, and an editor will spot the difference immediately.
2. Send from `hello@tryverdict.org`, one at a time, never bcc.
3. Offer the exclusive to **one outlet at a time**, top of the list down, with
   48 hours to respond before you move on. An exclusive offered to twenty
   people is not an exclusive, and editors talk to each other.
4. Check the pack in `docs/media/` for that outlet first — send to a verified
   live address, and where there is none, find a byline on the beat instead.

The order below is the order to work down.

---

## 1. The Register — `theregister.com`

The best fit by a distance. This is their exact genre: technically-grounded
industry embarrassment, reported straight, with the humour left to the reader.

```
Subject: Firms that sell mailbox verification can't verify their own mailboxes

Hi,

I maintain an open-source SMTP verification engine. I pointed it at 80
companies whose business is email — outreach platforms, contact-data vendors,
deliverability tools — and probed the contact addresses they publish on their
own websites.

31 of the 80 have at least one address that hard-bounces.

Five of those sell mailbox verification for a living: kickbox.com,
verifalia.com, neverbounce.com, millionverifier.com and emailhippo.com.
Kickbox and Verifalia each returned 550 5.1.1 on six of their own published
addresses.

A further 32 run catch-all domains, which accept any address at all — I
confirmed it with a random 22-character mailbox I made up on the spot. On
those domains no verifier can confirm any individual address, including the
verifier the company is selling you.

Method: two independent SMTP probes at least 20 seconds apart, both required
to return a hard recipient-level rejection. Catch-all domains, enterprise
gateways and anything that refused the probe are excluded rather than counted
— the interesting number is the one that survives being conservative. Raw
server responses and timestamps for every result.

The engine is MIT licensed, so you or anyone else can reproduce the whole
thing: https://github.com/omm9846/verdict

Everyone named has been contacted and given a week to fix it or tell me I'm
wrong.

Full dataset and raw SMTP transcripts are yours if useful. Happy to make it
exclusive — nobody else has the data.

Om Soni
hello@tryverdict.org
```

---

## 2. 404 Media — `404media.co`

Reader-owned, allergic to PR, drawn to "the industry does not work the way it
claims". Lead with the contradiction, not the tooling.

```
Subject: The email-verification industry can't verify its own email

Hi,

An entire product category exists to tell you whether an email address is
real. I tested whether those companies' own addresses are real.

I run an open-source SMTP verification engine. Pointed at 80 companies that
sell email tooling, it found 31 with at least one hard-bouncing address on
their own domain. Five of them sell mailbox verification as the product:
Kickbox, Verifalia, NeverBounce, MillionVerifier and Email Hippo. Kickbox and
Verifalia each failed on six of their own published addresses.

The part I find more interesting: 32 of the 80 run catch-all domains, which
accept literally any address. I confirmed it by sending to a random
22-character mailbox that has never existed. On a catch-all domain no
verification product can tell you anything at all — which means a chunk of
this industry is selling a check that cannot return a meaningful answer for a
large share of the internet, and is not saying so.

Everything is reproducible. The engine is MIT, the method is two independent
probes 20 seconds apart with catch-alls and blocked probes excluded rather
than counted, and I kept the raw server response for every result:
https://github.com/omm9846/verdict

All 80 were contacted first and given a week to respond.

Data is yours, exclusively if you want it.

Om Soni
hello@tryverdict.org
```

---

## 3. Spam Resource (Al Iverson) — `spamresource.com`

A deliverability practitioner writing for practitioners. Do not explain what a
catch-all is; he has forgotten more about this than the rest of the list knows.
Peer to peer, method first.

```
Subject: Probed 80 email vendors' own contact addresses — 31 have hard bounces

Hi Al,

Long-time reader. I built an open-source SMTP verification engine and used it
on a question I hadn't seen answered: do the companies selling email tooling
keep their own published contact addresses alive?

80 companies — ESPs, outreach platforms, contact data, verification vendors.
31 have at least one address returning a hard recipient rejection. Five of
those are verification vendors: Kickbox, Verifalia, NeverBounce,
MillionVerifier, Email Hippo. Six failing addresses each at Kickbox and
Verifalia.

32 are catch-all, confirmed against a random 22-character local part.

On method, since you'll ask: RCPT TO probe, two independent connections at
least 20s apart, both required to return 5xx. I classify with the RFC 3463
enhanced status code rather than the reply code — only 5.1.1/5.1.2/5.1.3/
5.1.6/5.2.1 count as recipient-unknown. 5.7.x is policy, 5.1.4 is ambiguous
and 5.2.2 actually proves the mailbox exists. Catch-alls, enterprise gateways
and probes refused at our IP are excluded rather than counted as dead.

I found that classification the hard way: my first pass called Apple, doi.org
and ntp.org "dead" off 5.7.1 and 5.3.0 responses. Fixing that dropped 31 false
positives out of 122.

MIT, fully reproducible: https://github.com/omm9846/verdict

Everyone named has been notified with a deadline. Happy to send the full
dataset with raw transcripts if it's useful to you — no expectation either
way, I mostly thought you'd find the classification problem interesting.

Om Soni
hello@tryverdict.org
```

---

## 4. Word to the Wise (Laura Atkins) — `wordtothewise.com`

Same peer register as above, but her interest runs to what the data says about
industry practice rather than the gotcha. Lead with the catch-all finding.

```
Subject: 32 of 80 email vendors run catch-all domains — unverifiable by anyone

Hi Laura,

I built an open-source SMTP verification engine and pointed it at 80 companies
that sell email tooling, to see what their own contact surfaces look like
under a real probe.

The headline most people would take is that 31 have at least one hard-bouncing
published address, five of them verification vendors. The finding I think
actually matters is different: 32 of the 80 run catch-all domains. Confirmed
against a random 22-character local part that has never existed.

Which means for a large share of this industry, no verification product —
theirs, mine, anyone's — can return a meaningful per-mailbox answer, and I
don't see that limitation stated anywhere in how these tools are sold. My own
tool reports CATCHALL and refuses to guess, and I'd argue that honesty is the
only defensible position, but it is clearly not the market norm.

Method: two independent RCPT TO probes 20s apart, both must return 5xx,
classified on the RFC 3463 enhanced status rather than the reply code.
Gateways, catch-alls and probes refused at our IP are excluded rather than
counted. MIT and reproducible: https://github.com/omm9846/verdict

All 80 notified with a deadline before anything publishes.

Full dataset available if you want it.

Om Soni
hello@tryverdict.org
```

---

## 5. Console.dev — `console.dev`

They curate developer tools for a large list. They do not want a scandal; they
want a good tool with a clear reason to exist. Lead with the tool, use the
finding as evidence it works.

```
Subject: Verdict — MIT SMTP verification gate (and what it found)

Hi,

Submitting Verdict for consideration: an open-source SMTP verification gate
for cold outreach. MIT, self-hosted, no contact database.

The design constraint is the interesting part. Every cloud host blocks
outbound port 25 — Render, Vercel, AWS, GCP, Azure, Fly, Heroku — so a hosted
mailbox verifier cannot actually probe anything. Most of the category quietly
infers and presents it as verification. Verdict splits it honestly: a DNS tier
that runs anywhere (SPF/DKIM/DMARC/MX, typosquat and burner detection, free at
tryverdict.org/audit), and the real SMTP gate that runs on your own machine —
which also means your contact list is never uploaded anywhere.

As a test, I ran it against 80 companies that sell email tooling. 31 have a
hard-bouncing address on their own domain, five of them verification vendors.
Running it also found three false-DEAD bugs in my own classifier, all written
up in the repo, which I'd argue is the better recommendation.

https://github.com/omm9846/verdict

Om Soni
hello@tryverdict.org
```

---

## 6. Changelog — `changelog.com`

Podcast and newsletter about open source. The angle is the engineering story:
the bugs, not the vendors.

```
Subject: What auditing 1,200 domains taught me about my own verifier

Hi,

I built an open-source SMTP verification engine, then pointed it at the Tranco
top 1,200 to answer a research question. It answered a different one: it found
three bugs in itself, all producing the same failure — a confident false DEAD,
which for a verifier is the one error you cannot make, because DEAD suppresses
an address permanently.

1. get_mx() caught every exception and returned None, so a DNS timeout was
   indistinguishable from "no mail server". 7 of 12 sampled "no MX" domains had
   perfectly good MX records — berkeley.edu and theverge.com among them.

2. Any 550/551/553 was read as "no such mailbox". But 5.7.1 is policy, 5.1.4 is
   ambiguous, 5.3.0 is a system fault and 5.2.2 — mailbox full — proves the
   mailbox exists. Reading the RFC 3463 enhanced status instead dropped 31
   false positives out of 122.

3. Addresses scraped from HTML arrive damaged in predictable ways:
   %20privacy@vimeo.com from a mailto href, privacy@amazon.co from
   amazon.co<span>m</span>. Each one double-confirmed as DEAD exactly as
   designed, because a mangled address really is unreachable.

There's a product around it — MIT, self-hosted, and it has to be, because every
cloud host blocks outbound port 25 so a hosted verifier physically cannot probe
a mailbox. But the bugs are the interesting part.

https://github.com/omm9846/verdict

Om Soni
hello@tryverdict.org
```

---

## 7. GTM / growth newsletters — GTMfund, Demand Curve, RevGenius, Marketing Examples

Their readers do not care about RFC 3463. They care that the list they paid for
is rotting. One template, personalise the first line per newsletter.

```
Subject: Data for you: 31 of 80 email vendors have dead mailboxes on their own domain

Hi [name],

[One specific line about a recent issue of theirs — this matters more than
anything else in the email. Skip it and this reads as a blast.]

I have some original data your readers might like, and it is yours free.

I run an open-source SMTP verification engine. I pointed it at 80 companies
selling email tooling — Apollo, Hunter, Instantly, Clay, Snov, the verification
vendors — and probed the contact addresses on their own sites.

- 31 of 80 have at least one address that hard-bounces
- 5 of those sell mailbox verification: Kickbox, Verifalia, NeverBounce,
  MillionVerifier, Email Hippo
- 32 run catch-all domains, where no verifier can confirm any address at all

The practical takeaway for your readers is the third one. If a prospect's
domain is catch-all, every verification tool will mark those addresses
"valid", and you will find out otherwise from your bounce rate. That is not a
vendor problem, it is a physics problem, and almost nobody says it out loud.

Full data, per-company breakdown and raw server responses are yours — no link
required, no strings. Use it however you like.

Om Soni
hello@tryverdict.org
https://tryverdict.org
```

---

## Follow-up (once, after 4 days, then stop)

```
Subject: Re: [original subject]

Hi — following up once and then I'll leave it.

The dataset is still unpublished if you want first look. If it's not for you,
no problem at all, and I won't chase it again.

Om
```
