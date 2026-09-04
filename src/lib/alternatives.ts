// Comparison pages for "X alternative" searches, which is where people with
// budget and intent actually land.
//
// These are written honestly on purpose. Verdict has no contact database, so
// claiming to replace Apollo would break the moment someone tried it, and a
// comparison page that oversells is the fastest way to lose a reader who came
// in already sceptical. Saying plainly where a competitor is the right choice
// is what makes the rest of the page believable.

export type Alternative = {
  slug: string;
  name: string;
  /** database | verifier | sequencer | enrichment */
  kind: "database" | "verifier" | "sequencer" | "enrichment";
  tagline: string;
  whatTheyAre: string;
  theirStrength: string;
  /** The honest reason to pick them instead. Every page has one. */
  pickThemWhen: string;
  pickUsWhen: string;
  differences: { point: string; them: string; us: string }[];
  pricingNote: string;
};

const OSS = "Free and MIT, or $59/mo hosted.";

export const ALTERNATIVES: Alternative[] = [
  {
    slug: "apollo-io",
    name: "Apollo.io",
    kind: "database",
    tagline: "Apollo sells you contacts. We tell you which ones still exist.",
    whatTheyAre:
      "A contact database of roughly 265 million business records, bundled "
      + "with sequencing and a CRM. You search for a persona, export a list, "
      + "and send.",
    theirStrength:
      "The database. Nothing open source comes close to 265 million records, "
      + "and if your problem is 'I do not know who to contact', Apollo solves "
      + "it in an afternoon.",
    pickThemWhen:
      "You need to find people you have never heard of, at companies you have "
      + "not shortlisted. That is a data problem, and we do not sell data.",
    pickUsWhen:
      "You already have a list and your bounce rate is hurting your domain. "
      + "Apollo tells you an address existed when the record was written. It "
      + "does not open an SMTP connection to check whether it exists today.",
    differences: [
      { point: "Contact database", them: "265M records, credit-metered", us: "None. We infer from public evidence at send time" },
      { point: "Mailbox verification", them: "Inferred, bundled", us: "Real SMTP probe, on your machine" },
      { point: "Your list", them: "Uploaded to their servers", us: "Never leaves your machine" },
      { point: "Source code", them: "Closed", us: "MIT, readable" },
      { point: "Catch-all domains", them: "Reported as valid", us: "Reported as unverifiable, because they are" },
    ],
    pricingNote:
      "Apollo starts free with limited credits and rises steeply with seats "
      + "and exports. " + OSS,
  },
  {
    slug: "hunter-io",
    name: "Hunter.io",
    kind: "database",
    tagline: "Hunter finds the address. We check it is still alive.",
    whatTheyAre:
      "Email finder and verifier. Give it a name and a domain and it returns "
      + "a likely address with a confidence score, drawn from crawled public "
      + "sources.",
    theirStrength:
      "Finding addresses from a name. Their crawl is large and their pattern "
      + "data is genuinely good, which is exactly the step that fails without "
      + "a corpus.",
    pickThemWhen:
      "You have names and need addresses. Our discovery only infers a pattern "
      + "when the domain already publishes one, so on a domain that publishes "
      + "nothing, Hunter will beat us.",
    pickUsWhen:
      "You want to know whether an address accepts mail right now, and you "
      + "would rather not upload the list to find out.",
    differences: [
      { point: "Finding by name", them: "Large crawled corpus", us: "Pattern inference, needs published evidence" },
      { point: "Verification", them: "Confidence score", us: "The server's own reply, quoted" },
      { point: "Free tier", them: "25 searches a month", us: "Unlimited, self-hosted" },
      { point: "Your list", them: "Uploaded", us: "Stays local" },
    ],
    pricingNote: "Hunter is free for 25 searches a month, then paid by volume. " + OSS,
  },
  {
    slug: "zerobounce",
    name: "ZeroBounce",
    kind: "verifier",
    tagline: "Same job. Ours runs on your machine and shows its working.",
    whatTheyAre:
      "A dedicated email verification service. You upload a list or call an "
      + "API, and each address comes back valid, invalid, catch-all or "
      + "unknown.",
    theirStrength:
      "Infrastructure. They operate their own IP pools with managed "
      + "reputation, which is the hard and expensive part of verification at "
      + "scale, and it is why they can process a million addresses without "
      + "getting blocked.",
    pickThemWhen:
      "You need to verify hundreds of thousands of addresses on a deadline "
      + "and do not want to run anything. That is a real operational service "
      + "and worth paying for.",
    pickUsWhen:
      "You want to read the code that produces the verdict, and you would "
      + "rather your contact list never leave your infrastructure.",
    differences: [
      { point: "Where it runs", them: "Their servers, your list uploaded", us: "Your machine, list never sent" },
      { point: "Verdict evidence", them: "A label", us: "The raw SMTP reply and status code" },
      { point: "Catch-all", them: "Flagged, still billed", us: "Flagged, and we say no tool can resolve it" },
      { point: "Pricing model", them: "Per address, credits expire", us: "Flat, or free self-hosted" },
      { point: "Source code", them: "Closed", us: "MIT" },
    ],
    pricingNote: "ZeroBounce sells credits, commonly cents per address. " + OSS,
  },
  {
    slug: "neverbounce",
    name: "NeverBounce",
    kind: "verifier",
    tagline: "Verification you can audit, for lists you would rather not upload.",
    whatTheyAre:
      "Bulk list cleaning and real-time verification, widely integrated into "
      + "marketing platforms.",
    theirStrength:
      "Integrations and throughput. If your list already lives in a platform "
      + "they plug into, cleaning is a click.",
    pickThemWhen:
      "The list is already inside a tool NeverBounce connects to and you want "
      + "it cleaned without moving data around yourself.",
    pickUsWhen:
      "You care what the receiving server actually said, or your list is "
      + "sensitive enough that uploading it is the problem.",
    differences: [
      { point: "Where it runs", them: "Their servers", us: "Yours" },
      { point: "Evidence", them: "Classification only", us: "Raw server reply, timestamped" },
      { point: "Unknowns", them: "Billed as a result", us: "Reported as no evidence, never guessed" },
      { point: "Source code", them: "Closed", us: "MIT" },
    ],
    pricingNote: "NeverBounce is priced per verification in credit packs. " + OSS,
  },
  {
    slug: "instantly-ai",
    name: "Instantly.ai",
    kind: "sequencer",
    tagline: "Instantly sends the campaign. We decide what deserves to be sent.",
    whatTheyAre:
      "A cold outreach platform: inbox rotation, warmup, sequencing and "
      + "deliverability tooling built for sending at volume.",
    theirStrength:
      "Sending infrastructure. Inbox rotation and warmup are genuinely hard "
      + "and they do them well. We do not send campaigns at all.",
    pickThemWhen:
      "You need to run and manage sequences across many inboxes. That is "
      + "their product and it is not ours.",
    pickUsWhen:
      "You want a gate in front of the sender, so dead addresses never leave "
      + "your outbox and your domain stops absorbing the bounces.",
    differences: [
      { point: "Sends campaigns", them: "Yes, at volume", us: "No. We gate what you send" },
      { point: "Verification timing", them: "Bundled, before send", us: "Real SMTP probe, before send" },
      { point: "Catch-all handling", them: "Marked valid", us: "Marked unverifiable" },
      { point: "Use together", them: "—", us: "Yes. Gate the list, then send with theirs" },
    ],
    pricingNote: "Instantly is priced per seat and sending volume. " + OSS,
  },
  {
    slug: "clay",
    name: "Clay",
    kind: "enrichment",
    tagline: "A step in your waterfall, not a replacement for it.",
    whatTheyAre:
      "An enrichment platform that chains many data providers together in a "
      + "waterfall, so if one source misses, the next is tried.",
    theirStrength:
      "Orchestration and breadth. Dozens of providers behind one table, with "
      + "logic to pick between them. Nothing open source replaces that.",
    pickThemWhen:
      "You are building enrichment across many attributes, not just email. "
      + "Clay is the right shape for that and we are not competing with it.",
    pickUsWhen:
      "You want a verification step in the waterfall that reports the "
      + "server's reply rather than another provider's guess. Our API is open "
      + "and needs no key.",
    differences: [
      { point: "Category", them: "Enrichment orchestration", us: "Verification gate" },
      { point: "Works together", them: "—", us: "Yes, as an HTTP step in the waterfall" },
      { point: "Verification source", them: "Bundled providers", us: "Direct SMTP probe" },
      { point: "Pricing", them: "Credits per enrichment", us: "Free self-hosted" },
    ],
    pricingNote: "Clay is credit-based and scales with row volume. " + OSS,
  },
  {
    slug: "kickbox",
    name: "Kickbox",
    kind: "verifier",
    tagline: "Open source verification with the evidence attached.",
    whatTheyAre:
      "Email verification with a deliverability focus, sold per verification "
      + "with a well-regarded API.",
    theirStrength:
      "A clean API and a long track record. Their Sendex score is a genuinely "
      + "useful signal that we do not attempt to reproduce.",
    pickThemWhen:
      "You want a managed API with support behind it and quality scoring "
      + "beyond existence.",
    pickUsWhen:
      "You want to see the SMTP transcript behind every verdict, or you need "
      + "the list to stay on your own hardware.",
    differences: [
      { point: "Where it runs", them: "Their servers", us: "Yours" },
      { point: "Evidence", them: "Score and label", us: "Raw reply and status code" },
      { point: "Source code", them: "Closed", us: "MIT" },
      { point: "Free tier", them: "Trial credits", us: "Unlimited, self-hosted" },
    ],
    pricingNote: "Kickbox charges per verification. " + OSS,
  },
  {
    slug: "millionverifier",
    name: "MillionVerifier",
    kind: "verifier",
    tagline: "Cheaper still: run it yourself and read the code.",
    whatTheyAre:
      "Low-cost bulk email verification, priced aggressively per address with "
      + "credits that do not expire.",
    theirStrength:
      "Price and simplicity for one-off bulk cleans. If you have a 200,000 "
      + "row list and want it cleaned once, they are hard to beat on cost.",
    pickThemWhen:
      "One large list, one time, no infrastructure. That is a good trade.",
    pickUsWhen:
      "Verification is continuous rather than occasional, or the list cannot "
      + "leave your environment.",
    differences: [
      { point: "Cost model", them: "Per address, credits", us: "Free self-hosted, or flat hosted" },
      { point: "Your list", them: "Uploaded", us: "Stays local" },
      { point: "Evidence", them: "Label", us: "Server reply, quoted" },
      { point: "Automation", them: "API and dashboard", us: "CLI, Python API and MCP server" },
    ],
    pricingNote: "MillionVerifier sells non-expiring credit packs. " + OSS,
  },
  {
    slug: "snov-io",
    name: "Snov.io",
    kind: "database",
    tagline: "Finding and sending bundled. We do the checking properly.",
    whatTheyAre:
      "An all-in-one prospecting suite: email finder, verifier, drip "
      + "campaigns and a light CRM.",
    theirStrength:
      "Breadth for the price. One subscription covers finding, verifying and "
      + "sending, which suits a small team that does not want three tools.",
    pickThemWhen:
      "You want one tool for the whole motion and are content with bundled "
      + "verification.",
    pickUsWhen:
      "The verification step is the part you do not trust, and you want to "
      + "see the server's answer rather than a bundled verdict.",
    differences: [
      { point: "Scope", them: "Find, verify and send", us: "Verify only, done thoroughly" },
      { point: "Verification", them: "Bundled", us: "Direct SMTP probe with evidence" },
      { point: "Your list", them: "Uploaded", us: "Stays local" },
      { point: "Source code", them: "Closed", us: "MIT" },
    ],
    pricingNote: "Snov.io is priced per credit and seat. " + OSS,
  },
  {
    slug: "bouncer",
    name: "Bouncer",
    kind: "verifier",
    tagline: "Same verdicts, plus the transcript that produced them.",
    whatTheyAre:
      "European email verification with a strong privacy and GDPR posture, "
      + "sold per verification.",
    theirStrength:
      "Compliance positioning and EU data residency, which matters if your "
      + "legal team asks where the list is processed.",
    pickThemWhen:
      "You need a processor agreement and EU residency, and a managed service "
      + "is the easier answer for your compliance review.",
    pickUsWhen:
      "You would rather not have a processor at all. Self-hosted means the "
      + "list never leaves, which is a stronger position than residency.",
    differences: [
      { point: "Data residency", them: "EU processing", us: "No processing. It stays with you" },
      { point: "Evidence", them: "Label", us: "Raw SMTP reply" },
      { point: "Source code", them: "Closed", us: "MIT" },
      { point: "Pricing", them: "Per address", us: "Free self-hosted" },
    ],
    pricingNote: "Bouncer charges per verification with volume tiers. " + OSS,
  },
];

export const BY_SLUG = new Map(ALTERNATIVES.map((a) => [a.slug, a]));

export const KIND_LABEL: Record<Alternative["kind"], string> = {
  database: "Contact database",
  verifier: "Email verification",
  sequencer: "Outreach platform",
  enrichment: "Enrichment platform",
};
