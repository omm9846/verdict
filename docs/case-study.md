# Case study: 72 fund managers, one gate

In August 2026 the pipeline was pointed at its hardest possible audience:
crypto hedge funds, market makers, miners and treasuries. People who run
execution infrastructure for a living and can smell a bad cold email from
the subject line.

## The numbers

| Metric | Result |
| --- | --- |
| Decision-makers touched | 72 |
| Dead mailboxes caught before send | 24 |
| Bounce rate on shipped mail | ~2% |
| Follow-up waves | automated, person-level 12h cooldowns |
| Formats A/B tested | standard · real-number · curiosity hook |

## What moved the needle

**1. Real numbers from real filings.** For public companies (miners,
treasuries), the slippage figure was computed from their own reported sales
volume. One CFO received a mail citing his own quarterly filings back at him.
That mail is impossible to dismiss as spray-and-pray.

**2. The gate refused more than it sent.** Of every candidate set, roughly a
third died at verification: pattern guesses on catch-all domains, dead
mailboxes, gateway-blocked unknowns. Each refusal protected the domain.

**3. Format A/B testing was free.** Standard number-first format vs. a
pitch-free curiosity hook ("guess where this data came from") vs.
real-number follow-ups - all ran through the same gate, all measured.

## What bounced anyway

Two verified addresses at large corporates bounced post-SMTP-accept: their
gateways accept connections and silently drop unknown senders. No pre-send
verification catches this class; only domain warmup and reputation do.
Honest limitation, documented here so you plan for it.

## Takeaway

Verification-first is not a feature. It is the difference between a domain
you can use for years and a domain you burn in a week.
