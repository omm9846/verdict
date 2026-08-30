import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BOUNCES, BY_SLUG, verdictFor } from "@/lib/bounce-codes";

export function generateStaticParams() {
  return BOUNCES.map((b) => ({ code: b.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ code: string }> }
): Promise<Metadata> {
  const b = BY_SLUG.get((await params).code);
  if (!b) return { title: "Bounce code not found | Verdict" };

  const title = `${b.code} ${b.enhanced} — ${b.title} | What it means`;
  const description = b.summary;
  return {
    title,
    description,
    keywords: [
      `${b.code} ${b.enhanced}`,
      `what does ${b.code} ${b.enhanced} mean`,
      `${b.enhanced} bounce`,
      ...(b.aliases ?? []),
    ],
    alternates: { canonical: `https://tryverdict.org/bounce/${b.slug}` },
    openGraph: {
      title,
      description,
      url: `https://tryverdict.org/bounce/${b.slug}`,
    },
  };
}

const TONE: Record<string, { bg: string; label: string }> = {
  dead: { bg: "var(--color-stamp-dead)", label: "Dead" },
  risky: { bg: "var(--color-stamp-risky)", label: "Temporary" },
  safe: { bg: "var(--color-stamp-live)", label: "Not the recipient" },
};

export default async function BouncePage(
  { params }: { params: Promise<{ code: string }> }
) {
  const b = BY_SLUG.get((await params).code);
  if (!b) notFound();

  const v = verdictFor(b);
  const tone = TONE[v.tone];
  const related = BOUNCES.filter((x) => x.slug !== b.slug).slice(0, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What does SMTP error ${b.code} ${b.enhanced} mean?`,
        acceptedAnswer: { "@type": "Answer", text: `${b.summary} ${b.meaning}` },
      },
      {
        "@type": "Question",
        name: `Does ${b.code} ${b.enhanced} mean the email address is invalid?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: b.recipientDead
            ? "Yes. The server named the recipient as the problem, so the mailbox does not exist and the address should be suppressed."
            : "No. The server refused the message for reasons unrelated to whether the mailbox exists. Suppressing on this code removes contacts that are perfectly reachable.",
        },
      },
    ],
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-ink text-paper font-mono text-[11px] tracking-[0.18em] uppercase">
        <div className="max-w-6xl mx-auto px-6 py-1.5 flex justify-between">
          <span>bounce codes</span>
          <span className="hidden sm:inline">what the server actually said</span>
          <span>open source · MIT</span>
        </div>
      </div>

      <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="font-display font-black text-2xl tracking-tight">
          VERDICT<span className="text-stamp-dead">.</span>
        </Link>
        <div className="flex items-center gap-6 font-mono text-sm">
          <Link href="/bounce" className="hover:text-stamp-live transition-colors">all codes</Link>
          <Link href="/clean" className="hover:text-stamp-live transition-colors">check a list</Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-6 pt-8 pb-16">
        <p className="font-mono text-xs tracking-[0.25em] uppercase text-ink-faint mb-5">
          smtp bounce code
        </p>
        <h1 className="font-display font-black text-4xl sm:text-5xl leading-[1.05] tracking-tight">
          {b.code} {b.enhanced}
          <span className="block text-2xl sm:text-3xl mt-3 text-ink-soft font-bold">
            {b.title}
          </span>
        </h1>

        <div
          className="mt-8 border-2 border-ink p-6 bg-card"
          style={{ borderLeftWidth: 10, borderLeftColor: tone.bg }}
        >
          <div className="font-mono text-xs tracking-[0.15em] uppercase text-ink-faint">
            what to do
          </div>
          <div className="font-display font-black text-2xl mt-2">{v.label}</div>
          <p className="mt-3 text-ink-soft leading-relaxed">{b.summary}</p>
        </div>

        <h2 className="font-display font-black text-2xl mt-12 mb-3">
          What the server is telling you
        </h2>
        <p className="text-ink-soft leading-relaxed">{b.meaning}</p>

        <h2 className="font-display font-black text-2xl mt-10 mb-3">Next steps</h2>
        <ul className="space-y-2.5">
          {b.whatToDo.map((step) => (
            <li key={step} className="flex gap-3 text-ink-soft leading-relaxed">
              <span className="text-stamp-live font-mono">&rarr;</span>
              <span>{step}</span>
            </li>
          ))}
        </ul>

        {b.seenAt && (
          <p className="mt-8 font-mono text-sm text-ink-faint">
            Commonly returned by: {b.seenAt}
          </p>
        )}

        <div className="mt-12 border-2 border-ink bg-card p-7">
          <h2 className="font-display font-black text-xl mb-2">
            Find these before you send, not after
          </h2>
          <p className="text-ink-soft leading-relaxed mb-5">
            Paste a list and see which addresses sit on domains that accept no
            mail, which are one character from a real inbox, and which are on
            catch-all domains where nothing can tell you anything. Free, no
            signup, nothing stored.
          </p>
          <Link
            href="/clean"
            className="inline-block bg-ink text-paper font-mono text-sm px-6 py-3 hover:bg-stamp-live transition-colors"
          >
            Check a list &rarr;
          </Link>
        </div>

        <h2 className="font-display font-black text-2xl mt-14 mb-4">Other codes</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {related.map((r) => (
            <Link
              key={r.slug}
              href={`/bounce/${r.slug}`}
              className="border border-rule p-4 hover:border-ink transition-colors"
            >
              <div className="font-mono text-sm font-semibold">
                {r.code} {r.enhanced}
              </div>
              <div className="text-sm text-ink-soft mt-1">{r.title}</div>
            </Link>
          ))}
        </div>
      </article>

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
