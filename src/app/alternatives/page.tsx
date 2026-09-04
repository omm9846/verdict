import Link from "next/link";
import type { Metadata } from "next";
import { ALTERNATIVES, KIND_LABEL, type Alternative } from "@/lib/alternatives";

export const metadata: Metadata = {
  title: "Open source alternatives to Apollo, Hunter and ZeroBounce | Verdict",
  description:
    "Honest comparisons between Verdict and the tools people actually use: "
    + "Apollo, Hunter, ZeroBounce, NeverBounce, Instantly, Clay and others. "
    + "Including where each of them is the better choice.",
  alternates: { canonical: "https://tryverdict.org/alternatives" },
};

const ORDER: Alternative["kind"][] = ["database", "verifier", "sequencer", "enrichment"];

const INTRO: Record<Alternative["kind"], string> = {
  database:
    "They sell access to contact records. We do not sell data at all, so on "
    + "finding people you have never heard of, they win. We check whether what "
    + "they gave you still accepts mail.",
  verifier:
    "The same job as ours. The difference is where it runs, and whether you "
    + "can see the evidence behind a verdict.",
  sequencer:
    "They send the campaign. We gate what goes into it, so dead addresses "
    + "never leave your outbox. These are complements, not substitutes.",
  enrichment:
    "They orchestrate many data providers. We are one honest step inside that "
    + "waterfall rather than a replacement for it.",
};

export default function AlternativesIndex() {
  return (
    <main className="min-h-screen">
      <div className="bg-ink text-paper font-mono text-[11px] tracking-[0.18em] uppercase">
        <div className="max-w-6xl mx-auto px-6 py-1.5 flex justify-between">
          <span>comparisons</span>
          <span className="hidden sm:inline">open source · MIT</span>
          <span>no contact database</span>
        </div>
      </div>

      <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="font-display font-black text-2xl tracking-tight">
          VERDICT<span className="text-stamp-dead">.</span>
        </Link>
        <div className="flex items-center gap-6 font-mono text-sm">
          <Link href="/clean" className="hover:text-stamp-live transition-colors">check a list</Link>
          <Link href="/audit" className="hover:text-stamp-live transition-colors">domain audit</Link>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-6 pt-8 pb-12">
        <p className="font-mono text-xs tracking-[0.25em] uppercase text-ink-faint mb-5">
          comparisons
        </p>
        <h1 className="font-display font-black text-4xl sm:text-5xl leading-[1.05] tracking-tight">
          What we replace, and what we do not.
        </h1>
        <p className="mt-6 text-lg text-ink-soft max-w-2xl leading-relaxed">
          Verdict has no contact database and does not send campaigns. It opens
          an SMTP connection, asks whether a mailbox exists, and reports what
          the server said. So for some of the tools below we are a replacement,
          and for others we are the step that goes after them. Each page says
          which, and where the other tool is the better choice.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-16">
        {ORDER.map((kind) => {
          const rows = ALTERNATIVES.filter((a) => a.kind === kind);
          if (!rows.length) return null;
          return (
            <div key={kind} className="mb-14">
              <h2 className="font-display font-black text-2xl mb-2">
                {KIND_LABEL[kind]}
              </h2>
              <div className="rule-double w-32 mb-4" />
              <p className="text-ink-soft max-w-2xl leading-relaxed mb-6">
                {INTRO[kind]}
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {rows.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/alternatives/${a.slug}`}
                    className="border border-rule p-5 hover:border-ink transition-colors"
                  >
                    <div className="font-mono text-sm font-semibold">
                      {a.name} alternative
                    </div>
                    <div className="text-sm text-ink-soft mt-2 leading-snug">
                      {a.tagline}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <section className="border-y-2 border-ink bg-paper-deep">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="font-display font-black text-2xl mb-4">
            Why these pages admit what we cannot do
          </h2>
          <p className="text-ink-soft leading-relaxed">
            Because you can check. Verdict is MIT licensed, so any claim on
            these pages is one clone away from being tested, and a comparison
            that oversells would be found out by exactly the sort of person who
            reads comparison pages. If Apollo is what you need, these pages say
            so.
          </p>
          <Link
            href="/clean"
            className="inline-block mt-7 bg-ink text-paper font-mono text-sm px-7 py-3.5 hover:bg-stamp-live transition-colors"
          >
            Test it on your own list &rarr;
          </Link>
        </div>
      </section>

      <footer className="bg-ink text-paper">
        <div className="max-w-6xl mx-auto px-6 py-10 font-mono text-[11px] text-paper/40 flex justify-between flex-wrap gap-4">
          <span>MIT license</span>
          <a href="mailto:hello@tryverdict.org" className="hover:text-paper">
            hello@tryverdict.org
          </a>
        </div>
      </footer>
    </main>
  );
}
