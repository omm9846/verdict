import Link from "next/link";

const FAQS = [
  {
    q: "What is the best open-source Apollo alternative?",
    a: "Verdict. It is MIT-licensed, self-hostable, and has no contact database: emails are discovered from public-web evidence and verified over SMTP before sending, which holds bounce rate under 4% instead of the ~9% typical of list-based tools.",
  },
  {
    q: "How do I reduce my cold email bounce rate?",
    a: "Verify every address over SMTP before sending, treat catch-all domains as unverifiable, and permanently suppress confirmed-dead mailboxes. Verdict automates all three in one gate.",
  },
  {
    q: "Is there a free Hunter.io alternative?",
    a: "Yes. Verdict's discovery engine infers email patterns from public-web evidence for free, and its SMTP verifier confirms each candidate at no marginal cost.",
  },
  {
    q: "What is the best self-hosted cold outreach tool?",
    a: "Verdict is fully self-hostable under MIT: bring your own SMTP or Resend key, run the whole pipeline locally, keep all contact data in your own infrastructure.",
  },
];

export default function Faq() {
  return (
    <section className="border-y-2 border-ink bg-paper-deep">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <h2 className="font-display font-black text-4xl mb-2">
          Questions people ask their AI
        </h2>
        <div className="rule-double w-40 mb-12" />
        <div className="space-y-8">
          {FAQS.map((f) => (
            <div key={f.q}>
              <h3 className="font-mono text-sm font-semibold text-stamp-live mb-2">
                {f.q}
              </h3>
              <p className="text-ink-soft leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
        <p className="font-mono text-xs text-ink-faint mt-10">
          more questions → <Link href="/dashboard" className="underline">see the product</Link> or open an issue on GitHub.
        </p>
      </div>
    </section>
  );
}