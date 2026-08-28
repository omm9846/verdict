# Contact audit — methodology

Measures one thing: when an organisation publishes an address that people are
entitled to reach them at, does that mailbox actually exist?

This file is the methodology section of the published study. It is written to
be read by a journalist or a lawyer, not only by an engineer.

## Running it

```bash
cd backend
export VERDICT_RESEARCH_CONTACT="you@tryverdict.org"   # so operators can reach a human
python -m research.contact_audit --domains domains.txt --out audit.jsonl --workers 6
python -m research.contact_audit --report audit.jsonl
```

Output is JSONL, appended, so an interrupted run resumes where it stopped.
Re-running skips domains already present in the output file.

Run it from a normal residential or office connection. Do **not** run it from
the Render dyno: shared cloud IPs are pre-blocked by many mail servers, which
turns real answers into `UNKNOWN`.

## What is collected

Per domain, three classes of address — kept separate because they carry very
different weight:

| source | where it came from | strength of claim |
| --- | --- | --- |
| `published` | the org's own privacy / legal page | strongest — they wrote it down themselves |
| `securitytxt` | `Contact:` line in `/.well-known/security.txt` (RFC 9116) | strong — a published commitment |
| `inferred` | RFC 2142 role addresses (`abuse@`, `security@`) the org never published | weakest — the RFC says these SHOULD exist, not that this org claimed they do |

**Never merge `inferred` into a headline figure about published addresses.**
The report command reports them separately for this reason.

## How "dead" is decided

A row is marked `confirmed_dead` only when **all** of the following hold:

1. The domain has an MX record.
2. The domain is **not** catch-all. Catch-all domains accept every address
   including a random 22-character mailbox, so no address on them can be
   judged either way. These are recorded as `CATCHALL` and excluded.
3. The mail server is not an enterprise gateway (Mimecast, Proofpoint,
   Barracuda et al.), which answer for policy reasons rather than for mailbox
   existence. Recorded as `RISKY`, excluded.
4. Our probe was not refused by the receiving server. A rejection aimed at our
   IP or sender rather than the recipient (`5.7.1 Service unavailable`,
   `blocked using`, `access denied`) is recorded as `UNKNOWN` and excluded.
5. Two **independent** probes, on separate connections at least 20 seconds
   apart, both returned a hard recipient rejection (`550` / `551` / `553`,
   typically `5.1.1 user unknown`).

If the two probes disagree, the row is downgraded to `UNKNOWN` and the
disagreement is recorded verbatim. Nothing that disagrees with itself is
counted.

Every row stores the raw SMTP response string, the MX host that answered, and
a UTC timestamp for each probe.

## Known limitations — state these in the write-up

- **Large providers block probes.** Google Workspace, Microsoft 365 and
  GitHub-scale infrastructure frequently refuse connections from unknown IPs.
  Those domains return `UNKNOWN`, not a verdict. Expect a substantial share of
  the largest sites to be unmeasurable; the usable sample skews toward
  mid-sized organisations.
- **Catch-all domains are unmeasurable by design**, not by our limitation.
  A meaningful fraction of any sample will drop out here.
- **SMTP acceptance is not delivery.** A server can accept `RCPT TO` and then
  discard the message. This method proves a mailbox is *rejected*, never that
  a message will be *read*.
- **A single point in time.** Every row is timestamped. An address that was
  dead on the collection date may be fixed later — which is the intended
  outcome.
- **Address discovery is best-effort.** Policy pages behind JavaScript,
  contact forms instead of addresses, or images of addresses will be missed.
  A domain recorded as `NO_CONTACT_PUBLISHED` means we did not find one, not
  that none exists.

## Publication rules

These are not optional. They are what separates a study from an accusation.

1. **Report the measurement, not the legal conclusion.** Write "the address
   published at `<url>` returned `550 5.1.1` on 2026-09-03 and again 20
   seconds later." Do not write "X is in breach of GDPR." That is a lawyer's
   call, and a journalist would rather get that quote themselves.
2. **Notify every named organisation at least 14 days before publishing**,
   with the evidence URL, the address, and the raw SMTP response. Give them a
   chance to fix it. "We told them two weeks ago and it still bounces" is a
   stronger finding than the original one.
3. **Publish aggregate statistics first.** Do not publish a bulk list of
   organisations that cannot receive security reports — that is a target list.
   Individual named examples are fine where they have been notified and the
   finding is newsworthy.
4. **Ship the code and this file with the numbers.** The study must be
   reproducible by anyone who doubts it.

## Why the exclusions matter commercially

Points 2–4 under "How dead is decided" are the reason this dataset holds up.
Most email-verification tools report a catch-all domain as "valid" and a
gateway-blocked probe as "invalid", because both produce a cleaner-looking
number. Verdict separates them, which is why a share of this dataset is
honestly labelled "we cannot tell."

That is the product, demonstrated rather than described.
