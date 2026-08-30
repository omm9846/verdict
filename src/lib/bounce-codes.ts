// Bounce codes people actually paste into a search box, with the answer to the
// question they are really asking: is this address dead, or did the server
// just refuse me?
//
// That distinction is the whole product. A permanent-looking code that means
// "policy" gets a real contact suppressed forever if you read it as "no such
// mailbox", and most tools do exactly that.

export type Bounce = {
  slug: string;
  code: string;
  enhanced: string;
  title: string;
  /** true only when the server named the recipient as the problem */
  recipientDead: boolean;
  permanent: boolean;
  summary: string;
  meaning: string;
  whatToDo: string[];
  seenAt?: string;
  aliases?: string[];
};

export const BOUNCES: Bounce[] = [
  {
    slug: "550-5-1-1",
    code: "550",
    enhanced: "5.1.1",
    title: "User unknown",
    recipientDead: true,
    permanent: true,
    summary:
      "The mailbox does not exist. This is the one code that genuinely means "
      + "the address is dead, and the only one worth suppressing on.",
    meaning:
      "The receiving server looked up the local part and found nothing. It is "
      + "not a filter, a policy or a temporary condition: there is no mailbox "
      + "at that address. Google phrases it as \"the email account that you "
      + "tried to reach does not exist\", Postfix as \"Recipient address "
      + "rejected: User unknown in virtual mailbox table\".",
    whatToDo: [
      "Suppress the address permanently. Retrying will never work.",
      "If it used to work, someone left the company or the mailbox was deleted.",
      "Check for a typo first — a single wrong character produces this exact code.",
    ],
    seenAt: "Gmail, Outlook, Postfix, Exim, almost everything",
    aliases: ["550 user unknown", "5.1.1 recipient address rejected"],
  },
  {
    slug: "550-5-7-1",
    code: "550",
    enhanced: "5.7.1",
    title: "Policy rejection, not a dead mailbox",
    recipientDead: false,
    permanent: true,
    summary:
      "The server refused you, not the recipient. The mailbox may be perfectly "
      + "fine. Treating this as a dead address is the most expensive mistake in "
      + "email verification.",
    meaning:
      "Class 5.7.x is authorisation and policy. The server decided not to "
      + "accept this message, from this sender, right now. Common causes are "
      + "relay denied, sender reputation, a blocklist hit, or a rule about "
      + "unauthenticated senders. The recipient is never mentioned in that "
      + "decision, even when the text says \"recipient address rejected\".",
    whatToDo: [
      "Do not suppress the address. There is no evidence it is invalid.",
      "Check whether your sending IP or domain is on a blocklist.",
      "Confirm SPF, DKIM and DMARC are aligned for your sending domain.",
      "If you were probing rather than sending, the server simply refused the probe.",
    ],
    seenAt: "Microsoft 365, corporate gateways, most filtered domains",
    aliases: ["550 5.7.1 relay access denied", "5.7.1 unable to relay"],
  },
  {
    slug: "550-5-4-1",
    code: "550",
    enhanced: "5.4.1",
    title: "Recipient address rejected: access denied",
    recipientDead: false,
    permanent: true,
    summary:
      "Microsoft 365's catch-all refusal. It usually means the address does not "
      + "exist, but it is also returned for tenant policy, so it is weaker "
      + "evidence than 5.1.1.",
    meaning:
      "Exchange Online returns this both for unknown recipients and for "
      + "addresses that exist but are not accepting external mail. The two "
      + "cases are indistinguishable from outside, which is deliberate: it "
      + "stops attackers enumerating a tenant's mailboxes.",
    whatToDo: [
      "Treat as risky rather than dead unless you have other evidence.",
      "If the domain is Microsoft 365, expect this for most invalid addresses.",
      "A pattern check helps: if colleagues at the same domain follow first.last and yours does not, it is probably wrong.",
    ],
    seenAt: "Microsoft 365 / Exchange Online",
    aliases: ["5.4.1 access denied", "550 5.4.1 recipient address rejected"],
  },
  {
    slug: "550-5-1-10",
    code: "550",
    enhanced: "5.1.10",
    title: "Recipient not found by SMTP address lookup",
    recipientDead: true,
    permanent: true,
    summary:
      "Microsoft 365's version of user unknown. The address does not exist in "
      + "the tenant.",
    meaning:
      "Exchange Online could not resolve the address to a mailbox, group or "
      + "contact. Unlike 5.4.1, this one names the lookup as the failure, so it "
      + "is reliable evidence the address is not real.",
    whatToDo: [
      "Suppress the address.",
      "Check for a typo, especially in the local part.",
    ],
    seenAt: "Microsoft 365 / Exchange Online",
    aliases: ["5.1.10 recipient not found"],
  },
  {
    slug: "552-5-2-2",
    code: "552",
    enhanced: "5.2.2",
    title: "Mailbox full",
    recipientDead: false,
    permanent: false,
    summary:
      "The mailbox exists and is over quota. This is proof the address is real, "
      + "which makes suppressing on it exactly backwards.",
    meaning:
      "The server accepted the recipient, then refused the message because "
      + "there is no room for it. A full mailbox is an occupied mailbox: "
      + "somebody had to fill it.",
    whatToDo: [
      "Keep the address. It is valid.",
      "Retry in a few days. Quotas get cleared.",
      "If it stays full for weeks, the account is probably abandoned.",
    ],
    seenAt: "Most servers",
    aliases: ["552 mailbox full", "5.2.2 over quota"],
  },
  {
    slug: "550-5-2-1",
    code: "550",
    enhanced: "5.2.1",
    title: "Mailbox disabled",
    recipientDead: true,
    permanent: true,
    summary:
      "The mailbox exists but has been switched off. In practice the address "
      + "is unusable and should be suppressed.",
    meaning:
      "The account is suspended, disabled or archived. The address resolves, "
      + "but nothing will be delivered to it and nobody is reading it.",
    whatToDo: [
      "Suppress. A disabled mailbox is rarely re-enabled.",
      "Often means the person left. Look for their replacement instead.",
    ],
    seenAt: "Exchange, Zimbra, hosted providers",
  },
  {
    slug: "550-5-7-26",
    code: "550",
    enhanced: "5.7.26",
    title: "Unauthenticated email is not accepted",
    recipientDead: false,
    permanent: true,
    summary:
      "Your SPF, DKIM or DMARC failed. The recipient is fine. This is a problem "
      + "with your sending domain and it will affect every message you send.",
    meaning:
      "Since Google and Yahoo tightened bulk sender requirements, mail that "
      + "fails authentication from a domain sending at volume is rejected "
      + "outright rather than filed as spam.",
    whatToDo: [
      "Do not suppress anything. Fix your own DNS.",
      "Publish SPF, DKIM and DMARC and make sure they align with your From domain.",
      "Check what your domain publishes right now with a free audit.",
    ],
    seenAt: "Gmail, Yahoo",
    aliases: ["5.7.26 unauthenticated", "550 5.7.26 gmail"],
  },
  {
    slug: "550-5-7-509",
    code: "550",
    enhanced: "5.7.509",
    title: "Message not accepted: DMARC failure",
    recipientDead: false,
    permanent: true,
    summary:
      "The recipient's server enforces DMARC and your message did not pass. "
      + "Nothing to do with whether the address exists.",
    meaning:
      "Exchange Online checked your From domain's DMARC policy, found "
      + "quarantine or reject, and your message failed both SPF and DKIM "
      + "alignment.",
    whatToDo: [
      "Do not suppress the address.",
      "Align SPF or DKIM with the domain in your From header.",
      "Sending through a provider often means alignment is set on a subdomain, which is fine as long as it matches.",
    ],
    seenAt: "Microsoft 365",
  },
  {
    slug: "554-5-7-1",
    code: "554",
    enhanced: "5.7.1",
    title: "Message rejected as spam",
    recipientDead: false,
    permanent: true,
    summary:
      "Content or reputation refusal. The mailbox is almost certainly real and "
      + "reachable by someone with a better sending reputation.",
    meaning:
      "The server evaluated the message or the sender and declined it. This is "
      + "a judgement about you, not a statement about the recipient.",
    whatToDo: [
      "Keep the address.",
      "Check blocklists for your sending IP and domain.",
      "Warm the domain properly before sending at volume.",
    ],
    seenAt: "Most filtered domains",
    aliases: ["554 5.7.1 blocked", "554 message rejected"],
  },
  {
    slug: "421-4-7-0",
    code: "421",
    enhanced: "4.7.0",
    title: "Temporary rejection, try later",
    recipientDead: false,
    permanent: false,
    summary:
      "A 4xx code is temporary by definition. Nothing here says the address is "
      + "bad, and suppressing on it throws away good contacts.",
    meaning:
      "The server is rate limiting, greylisting, or declining to talk right "
      + "now. Greylisting in particular refuses the first attempt from any "
      + "unknown sender on purpose, and accepts the retry.",
    whatToDo: [
      "Retry. A normal mail server does this automatically.",
      "If you are probing rather than sending, this is why single-attempt verification is unreliable.",
      "Repeated 421s from one destination usually mean you are sending too fast.",
    ],
    seenAt: "Everything, especially under load",
    aliases: ["421 too many connections", "4.7.0 try again later"],
  },
  {
    slug: "451-4-4-1",
    code: "451",
    enhanced: "4.4.1",
    title: "Connection timed out",
    recipientDead: false,
    permanent: false,
    summary:
      "The receiving server did not answer. No information about the address "
      + "at all.",
    meaning:
      "The connection was opened and then stalled, or was never completed. "
      + "Causes range from an overloaded server to a firewall silently "
      + "dropping traffic from your IP.",
    whatToDo: [
      "Retry later.",
      "If every destination times out, the problem is your connection, not theirs.",
      "Outbound port 25 is blocked on every major cloud host, which produces exactly this.",
    ],
    seenAt: "Everything",
  },
  {
    slug: "550-5-1-2",
    code: "550",
    enhanced: "5.1.2",
    title: "Domain not found",
    recipientDead: true,
    permanent: true,
    summary:
      "The domain itself does not accept mail. Every address at it is "
      + "undeliverable, not just this one.",
    meaning:
      "There is no MX record and no usable A record fallback for the domain. "
      + "Often a typo in the domain, an expired registration, or a domain that "
      + "was never configured for email.",
    whatToDo: [
      "Suppress every address at that domain, not just this one.",
      "Check the spelling of the domain first — this is what a typosquat miss looks like.",
    ],
    seenAt: "Everything",
    aliases: ["550 5.1.2 host unknown", "domain not found bounce"],
  },
  {
    slug: "501-5-1-3",
    code: "501",
    enhanced: "5.1.3",
    title: "Bad address syntax",
    recipientDead: true,
    permanent: true,
    summary:
      "The address is malformed. Usually a stray space, a trailing comma, or "
      + "two addresses glued together by a broken export.",
    meaning:
      "The server could not parse the address as an address. This is nearly "
      + "always a data problem on the sending side rather than anything about "
      + "the recipient.",
    whatToDo: [
      "Fix the record in your list rather than suppressing it.",
      "Check your CSV export: percent-encoded spaces and concatenated fields are the usual cause.",
    ],
    seenAt: "Everything",
  },
  {
    slug: "550-5-1-8",
    code: "550",
    enhanced: "5.1.8",
    title: "Bad sender address",
    recipientDead: false,
    permanent: true,
    summary:
      "The problem is your From or envelope address, not the recipient.",
    meaning:
      "The receiving server rejected your sender address, usually because the "
      + "domain does not resolve, has no MX, or fails a sender verification "
      + "callout back to you.",
    whatToDo: [
      "Do not suppress the recipient.",
      "Make sure your sending domain resolves and can receive mail itself.",
      "Some servers refuse senders whose domain cannot accept a reply.",
    ],
    seenAt: "Postfix, Exim, strict configurations",
  },
  {
    slug: "550-5-7-606",
    code: "550",
    enhanced: "5.7.606",
    title: "Access denied, banned sending IP",
    recipientDead: false,
    permanent: true,
    summary:
      "Microsoft has blocked your sending IP. Every message to any Microsoft "
      + "365 tenant will fail until it is delisted.",
    meaning:
      "The IP you are sending from is on Microsoft's block list. It says "
      + "nothing about the recipient, and it will not resolve by retrying.",
    whatToDo: [
      "Do not suppress anything.",
      "Submit a delisting request to Microsoft.",
      "Review what was sent from that IP. Something triggered it.",
    ],
    seenAt: "Microsoft 365",
    aliases: ["5.7.606 banned sending ip"],
  },
  {
    slug: "450-4-2-1",
    code: "450",
    enhanced: "4.2.1",
    title: "Mailbox temporarily unavailable",
    recipientDead: false,
    permanent: false,
    summary:
      "Temporary. The mailbox exists but cannot take mail this moment.",
    meaning:
      "Often throttling on a busy account, or a mailbox being moved or "
      + "migrated. It resolves on its own.",
    whatToDo: [
      "Retry over the next day or two.",
      "Do not count this as a bounce in your rate.",
    ],
    seenAt: "Exchange, hosted providers",
  },
];

export const BY_SLUG = new Map(BOUNCES.map((b) => [b.slug, b]));

export function verdictFor(b: Bounce): { label: string; tone: "dead" | "risky" | "safe" } {
  if (b.recipientDead) return { label: "Suppress the address", tone: "dead" };
  if (!b.permanent) return { label: "Retry, do not suppress", tone: "risky" };
  return { label: "Keep the address, fix your side", tone: "safe" };
}
