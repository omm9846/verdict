---
title: I ran cold email to 72 crypto fund managers — a third of the addresses were dead. So I built an open-source verifier.
published: false
tags: coldemail, email, smtp, opensource, saas
---

# I ran cold email to 72 crypto fund managers — a third of the addresses were dead

Cold outreach has a dirty secret: **your email list decays faster than you think.**

I run outreach to crypto fund managers — one of the harder audiences to reach, and one of the fastest to burn your domain reputation with. Last cycle I sent to a list of 72 decision-makers. **24 of their addresses were dead.**

Not spam traps. Not scraped garbage. Just people who left, companies that pivoted, domains that expired. And every single bounce was teaching inbox providers to distrust my domain.

The kicker? Existing "email verificper" tools weren't telling me the truth.

## The core problem with SMTP verification

The naive approach: connect to the recipient's mail server, issue `RCPT TO`, and trust the response. If the server says OK, the mailbox exists.

That breaks in three ways:

### 1. Catch-all domains lie to you

A catch-all server returns `250 OK` for **any** address — including ones that don't exist. If you blindly trust the response, you'll stamp every email on that domain as LIVE. That's exactly how you get hard bounces.

The fix: probe a **random, non-existent mailbox** at the domain first. If that also returns `250 OK`, the domain is a catch-all. Flag the whole domain instead of pretending to verify addresses individually.

### 2. Enterprise gateways can't be distinguished from dead mailboxes

Mimecast, Proofpoint, Barracuda — these reject probes from unknown senders with errors that look *identical* to a genuine user-unknown rejection. If you trust the error, you'll kill every valid email behind a corporate gateway.

The fix: classify gateways separately and tag them **RISKY** rather than guessing LIVE or DEAD.

### 3. Some servers just refuse to answer

Some providers silently drop the connection or return ambiguous responses. That's not "the mailbox is dead" — that's "I'm not telling you." The honest verdict is **UNKNOWN**, not DEAD.

## Five verdicts, not two

After running this for a while, I settled on five honest states:

| Verdict | Meaning |
|---------|---------|
| **LIVE** | Server confirmed the mailbox exists |
| **DEAD** | Server confirmed it doesn't |
| **CATCHALL** | Domain accepts any address; can't confirm individually |
| **RISKY** | Corporate gateway that may reject cold senders |
| **UNKNOWN** | Server refused the check entirely |

Most tools pretend to give you a yes/no. The hard part — and the valuable part — is knowing when you **can't** know.

## What it cost me

A truly wrong guess is expensive. A dead address you email is a bounce, a bounce is a derate, a derate is your domain landing in spam for weeks. Bounce rate went from **9% to under 2%** once verification moved in front of the send.

## Why I open-sourced it

Email verification is a trust problem. You're asking people to hand over their list — the lifeblood of their business — to a black box. So I shipped the whole thing: MIT licensed, self-hostable, read every line, keep your data on your own servers.

## The stack

- **Engine:** Python FastAPI — SMTP probing, catch-all detection, gateway classification, discovery
- **Frontend:** Next.js, deployed on Vercel
- **Backend:** Render
- **Waitlist:** Supabase
- **Everything public:** [github.com/omm9846/verdict](https://github.com/omm9846/verdict)

## Try it

The free checker is live — paste any email, get a verdict instantly, no signup:

**https://verdict-xi-olive.vercel.app**

If you run cold outreach, this is the tool I wish I'd had before the first bounce. Open source means you can verify that claim yourself.
