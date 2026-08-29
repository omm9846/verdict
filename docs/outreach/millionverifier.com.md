# millionverifier.com — contact audit

- domain: `millionverifier.com`
- mail server: `bp1.gbd-server.com`
- collected: 2026-08-29T14:29:04+00:00

| address | verdict | server said | where we found it |
| --- | --- | --- | --- |
| `contact@millionverifier.com` | **DEAD** | 5.1.1 <contact@millionverifier.com>: Recipient address rejected: User unknown in virtual mailbox table | common front-desk address |
| `hello@millionverifier.com` | **DEAD** | 5.1.1 <hello@millionverifier.com>: Recipient address rejected: User unknown in virtual mailbox table | common front-desk address |
| `info@millionverifier.com` | SEND | 2.1.5 Ok | common front-desk address |
| `press@millionverifier.com` | **DEAD** | 5.1.1 <press@millionverifier.com>: Recipient address rejected: User unknown in virtual mailbox table | common front-desk address |
| `sales@millionverifier.com` | **DEAD** | 5.1.1 <sales@millionverifier.com>: Recipient address rejected: User unknown in virtual mailbox table | common front-desk address |
| `support@millionverifier.com` | SEND | 2.1.5 Ok | common front-desk address |
| `team@millionverifier.com` | **DEAD** | 5.1.1 <team@millionverifier.com>: Recipient address rejected: User unknown in virtual mailbox table | common front-desk address |

---

## Draft note

```
Subject: 5 dead addresses on millionverifier.com

Hi there,

We just built an open-source cold-outreach engine and I was stress-testing the verification gate on companies that sell email tooling — on the theory that you'd be the harshest thing to point it at.

millionverifier.com came back with something you probably want to know.

5 of the public addresses on millionverifier.com are dead. A real sender gets a hard bounce, not a bounce-back to a form:

  contact@millionverifier.com  ->  5.1.1 <contact@millionverifier.com>: Recipient address rejected:
  hello@millionverifier.com  ->  5.1.1 <hello@millionverifier.com>: Recipient address rejected: U
  press@millionverifier.com  ->  5.1.1 <press@millionverifier.com>: Recipient address rejected: U
  ...and 2 more

Could be deliberate, could be a mailbox nobody's opened since a migration. Either way someone trying to reach you that way isn't getting through.

The engine is MIT and runs locally, so you can check my working or point it
at anything yourself: https://github.com/omm9846/verdict

Not selling you anything — genuinely just what fell out of the test.

- Om
  hello@tryverdict.org
```
