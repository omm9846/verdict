# Media pitches

> **Correction, and why this file was rewritten.**
> An earlier version of this file claimed that verification vendors had dead
> mailboxes "on their own published addresses". That was wrong. Of 137 dead
> addresses found across 80 email companies, **136 were front-desk addresses
> we guessed** (`hello@`, `sales@`, `support@`) — not addresses those
> companies ever published. Exactly one was genuinely published.
> Four datasets, 571 companies, produced one real dead published address. The
> finding does not exist, and nothing built on it should ever be sent.
>
> What follows uses only what survived checking.

---

## What is actually true

**1. Domain authentication survey — Tranco top 1,200, August 2026.**
Sample restricted to the 998 domains that accept mail, since sender
authentication on a parked domain means nothing.

| finding | count | share |
| --- | ---: | ---: |
| Spoofable — no DMARC, or `p=none` | 319 | **32.0%** |
| ...no DMARC record at all | 176 | 17.6% |
| ...DMARC present but `p=none` | 143 | 14.3% |
| Enforcing (`quarantine` or `reject`) | 679 | 68.0% |
| No SPF record | 252 | 25.3% |
| No DKIM key on known selectors | 359 | 36.0% |

Four domains publish **two SPF records**, which is a permanent error — the
record fails entirely: `warnerbros.com`, `indiatimes.com`, `olx.com.br`,
`hichina.com`. This is the only named finding in the set, and it is real:
published by them, verifiably broken. Naming them in print needs a
notification period first.

**2. Verification is largely impossible from a host.**
Outbound port 25 is blocked by every major cloud provider. A hosted verifier
cannot open the connection that would confirm a mailbox, so it infers and
reports the result in the vocabulary of a probe.

**3. Most corporate addresses cannot be verified by anyone.**
Of 158 published contact addresses at 131 large companies: 96 behind
enterprise gateways, 59 refused the probe, 14 catch-all, **3 verifiable**.
Separately, 61 of 124 mid-cap brands run catch-all domains, where no verifier
can determine anything about any individual address.

**4. The engine found four classes of false-positive in itself**, each
producing a confident wrong answer, all documented in the repo.

---

## Ars Technica — `news@arstechnica.com` — send first

Verified live. Six other addresses on that domain bounce, so do not guess.

```
Subject: A third of the top 1,000 domains can still be spoofed

Hi,

I maintain an open-source email verification engine. In building it I ran a
DNS survey over the Tranco top 1,200, and the result seems worth reporting
plainly.

Of the 998 that accept mail, 319 — 32% — publish no usable DMARC policy. 176
have no DMARC record at all; another 143 have one set to p=none, which is
monitoring only and instructs receivers to do nothing. A quarter publish no
SPF record. Four publish two SPF records, which is a permanent error that
disables the record entirely, including warnerbros.com and indiatimes.com.

DMARC is the record that decides whether a forged message claiming to be a
domain gets rejected. Without it, SPF and DKIM are documentation nobody is
obliged to act on.

The second half is why I was looking. Confirming that a mailbox exists needs
an SMTP conversation on port 25, and every major cloud provider blocks
outbound port 25 to suppress spam — AWS, GCP, Azure, Vercel, Render, Fly,
Heroku. A hosted verifier physically cannot open that connection. It can
infer, and it reports the inference using the language of a probe: "valid",
"deliverable", "verified".

I found that the way you would want someone to: I deployed my own engine to
Render and it ran for three days before I noticed every corporate address
returned UNKNOWN and only Gmail addresses appeared to work, because those hit
a fast path that never probed anything. The hosted deployment had never
verified a mailbox. It just looked like it had.

There is a harder limit underneath. Catch-all domains accept every address,
including ones that have never existed — I confirm it with a random
22-character local part. On those domains no verifier can determine anything.
61 of 124 mid-size companies I checked are catch-all. At the large end it is
worse for a different reason: of 158 published contact addresses at 131 large
companies, 96 sit behind enterprise gateways and 59 refuse probes outright.
Three were verifiable.

I should say plainly that I sell a product in this space, which is why
everything above is reproducible rather than asserted. The engine is MIT, the
survey is pure DNS and reruns in minutes, and there is a free checker at
tryverdict.org/audit that grades any domain and tells you when it cannot see
something instead of guessing:

https://github.com/omm9846/verdict

One more thing that belongs in any writeup: pointing the engine at 1,200
domains found four separate bugs in my own classifier, each producing a
confident false "dead" verdict. A DNS timeout read as "no mail server". Any
5xx read as "no such mailbox", when 5.7.1 is policy and 5.2.2 — mailbox full
— proves the opposite. Addresses mangled during HTML scraping. And guessed
front-desk addresses counted as though they had been published, which
invalidated an entire earlier dataset of mine before I caught it. False
negatives in this field are invisible and permanent, because a "dead" verdict
suppresses an address for good.

Full data, method and raw records available. Yours exclusively if useful.

Om Soni
hello@tryverdict.org
https://tryverdict.org
```

---

## The Register — `editorial@theregister.com` — second

`tips@theregister.com` is dead; use `editorial@`. Same facts, shorter, with
the joke left for them to make.

```
Subject: A third of the world's biggest domains can be spoofed. Nobody can verify the rest.

Hi,

Two findings from an open-source email verification engine, both reproducible.

First: of the top 1,200 domains, 998 accept mail, and 319 of those — 32% —
have no usable DMARC policy. 176 have no DMARC at all. Another 143 have
p=none, which tells receiving servers to do precisely nothing. Four publish
two SPF records, a permanent error that disables SPF entirely; warnerbros.com
is one.

Second, and the reason I was looking: hosted mailbox verification cannot
work. Confirming a mailbox requires SMTP on port 25, and every major cloud
blocks outbound 25. So the hosted products infer and call it verification. I
know because I built one, deployed it to Render, and it ran three days
without verifying anything while appearing to work fine.

Then there are catch-all domains, which accept any address including invented
ones — 61 of 124 mid-size companies I checked. No verifier can say anything
about those, mine included.

I sell a product in this space, so none of it is asserted: MIT licensed,
DNS-only survey, reruns in minutes, free checker at tryverdict.org/audit.

https://github.com/omm9846/verdict

Full data yours if useful.

Om Soni
hello@tryverdict.org
```

---

## Rules

1. **One outlet at a time**, 48 hours each. An exclusive offered twice is not
   one.
2. **Disclose the conflict in the pitch itself.** You sell a competing
   product. Stated up front it reads as expertise; discovered later it reads
   as an axe.
3. **Percentages, not names** — except the four broken-SPF domains, and those
   only after they have been told.
4. Send from `hello@tryverdict.org`, one at a time, never bcc.
5. **Never re-add a dead-mailbox claim.** It did not survive checking.
