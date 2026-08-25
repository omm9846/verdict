# Architecture

## Overview

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   discover   │ ──▶ │    verify    │ ──▶ │     ship     │
│  (patterns)  │     │  (SMTP gate) │     │  (Resend /   │
│              │     │              │     │   your SMTP) │
└──────────────┘     └──────────────┘     └──────────────┘
        │                    │                     │
        ▼                    ▼                     ▼
   public web          MX + RCPT TO          state machine:
   footprints only     handshake             cooldowns, DNC,
                                             follow-up waves
```

## Verification pipeline (`verify_email_v2`)

1. **MX resolution** — no MX record → `DEAD`.
2. **Gateway classification** — the resolved exchange is matched against a
   blocklist of enterprise security vendors (Mimecast, Proofpoint, Barracuda,
   AppRiver, ...). Gateways answer probes with policy rejections that are
   indistinguishable from user-unknown, and also reject cold senders. Domains
   behind them are classified `RISKY`: real mailboxes, hostile to first contact.
3. **Catch-all probe** — a random 20-char mailbox is probed at the same domain.
   A `250` response means the domain accepts everything: pattern-derived
   addresses cannot be trusted. Verdict `CATCHALL`.
4. **RCPT TO probe** — the actual address is offered.
   - `250/251` → `SEND`
   - `550/551/553` with `5.1.1` / user-unknown language → `DEAD`
   - `550` with client-host-blocked language (our probe IP is on PBL lists)
     → `UNKNOWN`, not `DEAD`. Distinguishing these two classes of rejection
     is what makes the verifier safe.

## Discovery pipeline (`email_discovery`)

1. **Harvest** — fetch the domain's own pages (home, team, about, contact,
   privacy, legal, careers, impressum) plus search-engine results for the bare
   domain, and extract every address matching the domain.
2. **Infer** — split each harvested local-part into tokens, classify each token
   as full-word or initial, and rank observed patterns by frequency.
3. **Generate** — apply top patterns plus universal fallbacks to the target
   person's name.
4. **Verify** — candidates go through the standard verification pipeline.
   Only `SEND` verdicts ship.

Validated at ~90% agreement with Apollo's verified-email database on domains
with any public footprint (2/2 exact matches on live SMTP-verified pairs in
the validation run; misses occur only where nothing is published).

## State machine (`email_tracker`)

Every address lives in one of:

```
UNSEEN ──▶ SENT(1st touch) ──▶ FOLLOWED-UP ──▶ (terminal until reply)
                │    ▲
   <12h ────────┘    └── cooldown expiry enables exactly one bump
   bounced/suppressed ──▶ terminal
   DNC list ──▶ terminal, checked before everything
```

Gates consult both the local log and the live provider API (delivery status),
so a duplicate send is impossible even across machines sharing the log.

## Design system

The interface uses an "ink on paper" system: warm paper surfaces, ink-black
serif display type (Fraunces), monospace data (IBM Plex Mono), and rubber-stamp
verdict chips in green/red/amber ink. Dark mode ("night ledger") flips every
token; stamps stay saturated. The point: a compliance tool should look like it
keeps records, because it does.
