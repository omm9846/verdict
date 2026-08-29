# Launch kit — paste-ready

Everything below is written to be posted as-is. Nothing here needs a reply to
work, which is the point: all of it can go up over a weekend.

---

## 1. Show HN — post Sunday evening US time

Weekend Show HN faces a fraction of the competition and stays on the front
page longer. Sunday 6–9pm ET is the slot.

**Title** (keep under 80 chars, no emoji, no exclamation):

```
Show HN: Verdict – open-source SMTP verification gate for cold email (MIT)
```

**URL:** `https://github.com/omm9846/verdict`

**First comment — post immediately after submitting:**

```
I burned a domain last year. 284 cold emails to crypto hedge funds, 9% bounce rate,
sender reputation wrecked for weeks. The addresses came from a paid contact
database that had no idea which of them still existed.

So I built the thing I wanted: discovery from public-web evidence, then an
SMTP probe on every candidate before anything ships. Nothing sends without a
verdict.

The part I did not expect to be the whole story is port 25.

You cannot host this. Render, Vercel, AWS, GCP, Azure, Fly, Heroku, DO — all
block outbound port 25, because spam. I had it deployed for three days before
I noticed every corporate address was coming back UNKNOWN and only gmail
addresses "worked", because those hit a fast path that never probed anything.
The hosted demo had literally never verified a mailbox.

That reframed the product. The public checker now answers what DNS can prove
— domain accepts no mail, burner provider, typosquat of a real domain,
enterprise gateway, role account — and says plainly that it cannot confirm a
mailbox exists, because it can't. The SMTP gate runs on your machine. Which
also means your list is never uploaded anywhere, and that turns out to be the
one thing Apollo, Hunter, Instantly and ZeroBounce structurally can't offer.

Then I pointed it at the Tranco top 1,200 to see how many published contact
addresses bounce, and it found three bugs in my own verifier instead:

1. get_mx() caught every exception and returned None, so a DNS timeout was
   indistinguishable from "this domain has no mail server". That maps to
   DEAD, and DEAD suppresses an address permanently. 7 of 12 sampled "no MX"
   domains had perfectly good MX records — berkeley.edu and theverge.com
   among them.

2. Any 550/551/553 on RCPT TO was treated as "no such mailbox". But 5.7.1 is
   policy, 5.1.4 is ambiguous, 5.3.0 is a system fault, and 5.2.2 is mailbox
   full — which proves the opposite. It now reads the RFC 3463 enhanced
   status code and only calls it dead when the server actually blamed the
   recipient.

3. Addresses scraped out of HTML arrive damaged in predictable ways —
   %20privacy@vimeo.com from a mailto href, privacy@amazon.co from
   amazon.co<span>m</span>. Every one of those double-confirmed as DEAD,
   exactly as designed, because a mangled address really is unreachable.

All three produce a confident false DEAD, which is the only error a verifier
absolutely cannot make. I would rather have found them this way than from a
user telling me I burned a real contact.

The answer to the original question, for what it's worth: of 512 published
privacy@/dpo@ addresses across 236 domains, zero were dead. People who
publish a privacy contact do keep it working. security@spamhaus.org and
security@ietf.org both bounce, though, which I enjoyed more than I should
have.

MIT, self-hostable, no contact database. Happy to answer anything.
```

**Rules for the thread:** answer every comment, concede every fair point
immediately, never argue with a downvote. HN rewards the person who says "you
are right, that is a bug" faster than the person who defends.

---

## 2. Product Hunt — Tuesday 1 Sept, 12:01am PT

**Tagline (60 char max):**
```
Emails that never bounce
```

**Description (260 char max):**
```
Open-source cold-outreach engine. Finds addresses from public-web evidence,
probes every mailbox over SMTP before it ships, and refuses to send what will
bounce. Catch-all and gateway aware. MIT, self-hosted — your list never
leaves your machine.
```

**First maker comment — post at 12:01am with the launch:**

```
Hi PH 👋

Verdict exists because I burned a domain. 284 cold emails, 9% bounce, weeks
of recovery. Every one of those addresses came from a database that had no
idea which of them still existed.

So: nothing ships without a verdict. Discovery from public evidence, an SMTP
probe on every candidate, catch-all domains flagged honestly, dead mailboxes
suppressed forever.

Two things I'd rather tell you up front than have you find out:

1. The free checker on the site is DNS-tier. It catches dead domains,
   typosquats, burner providers and gateways — but it cannot confirm a
   mailbox exists, because no cloud host allows outbound port 25. Anyone
   claiming otherwise from a browser is guessing. The real gate runs locally.

2. Which is also the best thing about it: your list never gets uploaded.
   Not to us, not to anyone. It's MIT — read the probe code yourself.

**Drop your domain in the comments and I'll run a live audit and reply with
what I find.** I'll be here all day.
```

The comment offer is the whole play. It turns the thread into a live demo,
and PH ranks on comment velocity far harder than on upvotes. Answer every
single one, fast, with real output pasted in.

**Never ask for upvotes** — PH detects solicitation and penalises it. Ask for
comments and opinions instead.

---

## 3. Peerlist — a few days after PH

Dev audience, so lead with the engineering, not the pitch.

```
Verdict — an SMTP verification gate for cold email, MIT licensed.

The interesting constraint: you cannot host an email verifier. Every cloud
provider blocks outbound port 25, so any hosted "mailbox verification" is
inference dressed up as a probe. Verdict splits it honestly — a DNS tier that
runs anywhere, and the real SMTP gate that runs on your machine.

Python engine, Next.js front end, no contact database, no credits. Pointing
it at the Tranco top 1,200 found three separate false-DEAD bugs in my own
classifier, all written up in the repo.
```

---

## 4. Directories — do these Saturday, they need no reply

Highest value first. All free, all permanent backlinks.

| where | what to do |
| --- | --- |
| **AlternativeTo** | Submit as an alternative to Apollo.io, Hunter.io, Instantly.ai, ZeroBounce. Those comparison pages carry real search traffic — this is the single best backlink on the list. |
| **awesome-selfhosted** | PR to the Communication / Email section |
| **awesome-opensource-alternatives** | PR — "open source alternative to Apollo.io" is exactly the list's format |
| **SaaSHub** | Submit, then use its own syndication tab |
| **Openalternative.co** | Curated OSS alternatives, good fit |
| **libhunt / awesome-python** | Python + email tooling |

Copy for all of them is already written in `docs/listing-kit.md` — reuse the
one-liner and short description verbatim so the positioning stays identical
everywhere.

---

## 5. Cold outreach — Monday morning, their time zone

Packs are generated in `docs/outreach/`. Send the 7 with dead addresses
first; they have the highest reply rate by a wide margin.

Send **1:1 from the hello@tryverdict.org mailbox**, not through Resend —
transactional providers prohibit unsolicited mail, and hand-sent notes read
as human anyway. Personalise the first line of each. Never paste the whole
audit table into the email; two or three addresses and a link is enough.
