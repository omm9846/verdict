# Contributing

The gate is the product. One rule above all:

> **Anything that makes shipping easier at the cost of deliverability gets rejected.**

## Ground rules

1. Every send path must pass through a verdict gate (`LIVE` only by default).
2. No scraped contact databases, ever. Discovery works from public web evidence only.
3. Person-level cooldowns and suppression are enforced engine-side, not caller-side.
4. No dependencies without discussion. This repo stays light.

## Dev setup

```bash
git clone https://github.com/omm9846/verdict.git
cd verdict
npm install
npm run dev
```

## Python engine

The verification and discovery engines live in the parent research tree and are
being ported into `packages/engine` (see roadmap). Until then, reference
implementations:

- `verify_email_v2.py` — MX → gateway detect → catch-all probe → RCPT TO
- `email_discovery.py` — harvest → pattern inference → candidate generation

## PR checklist

- [ ] New send paths gate on a fresh verdict
- [ ] Bounced/suppressed addresses never resurface
- [ ] No hardcoded credentials (keys live in env or gitignored files)
- [ ] UI copy reads like a human wrote it