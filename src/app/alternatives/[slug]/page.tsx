import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ALTERNATIVES, BY_SLUG, KIND_LABEL } from "@/lib/alternatives";

export function generateStaticParams() {
  return ALTERNATIVES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const a = BY_SLUG.get((await params).slug);
  if (!a) return { title: "Not found | Verdict" };

  const title = `${a.name} alternative: Verdict, open source and self-hosted`;
  const description = `${a.tagline} An honest comparison of ${a.name} and Verdict, `
    + `including where ${a.name} is the better choice.`;

  return {
    title,
    description,
    keywords: [
      `${a.name} alternative`,
      `${a.name} vs Verdict`,
      `open source ${a.name} alternative`,
      `self-hosted ${a.name} alternative`,
    ],
    alternates: { canonical: `https://tryverdict.org/alternatives/${a.slug}` },
    openGraph: {
      title,
      description,
      url: `https://tryverdict.org/alternatives/${a.slug}`,
    },
  };
}

export default async function AlternativePage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const a = BY_SLUG.get((await params).slug);
  if (!a) notFound();

  const others = ALTERNATIVES.filter((x) => x.slug !== a.slug).slice(0, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Is Verdict a good ${a.name} alternative?`,
        acceptedAnswer: { "@type": "Answer", text: `${a.tagline} ${a.pickUsWhen}` },
      },
      {
        "@type": "Question",
        name: `When should I use ${a.name} instead of Verdict?`,
        acceptedAnswer: { "@type": "Answer", text: a.pickThemWhen },
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
          <span>comparison</span>
          <span className="hidden sm:inline">open source · MIT</span>
          <span>your list never leaves your machine</span>
        </div>
      </div>

      <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="font-display font-black text-2xl tracking-tight">
          VERDICT<span className="text-stamp-dead">.</span>
        </Link>
        <div className="flex items-center gap-6 font-mono text-sm">
          <Link href="/alternatives" className="hover:text-stamp-live transition-colors">all comparisons</Link>
          <Link href="/clean" className="hover:text-stamp-live transition-colors">check a list</Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-6 pt-8 pb-16">
        <p className="font-mono text-xs tracking-[0.25em] uppercase text-ink-faint mb-5">
          {KIND_LABEL[a.kind]} · comparison
        </p>
        <h1 className="font-display font-black text-4xl sm:text-5xl leading-[1.05] tracking-tight">
          {a.name} alternative
        </h1>
        <p className="mt-6 text-xl text-ink-soft leading-snug max-w-2xl">{a.tagline}</p>

        <h2 className="font-display font-black text-2xl mt-12 mb-3">What {a.name} is</h2>
        <p className="text-ink-soft leading-relaxed">{a.whatTheyAre}</p>

        <div className="mt-10 border-2 border-ink bg-card p-6">
          <div className="font-mono text-xs tracking-[0.15em] uppercase text-ink-faint">
            where {a.name} is better
          </div>
          <p className="mt-3 text-ink-soft leading-relaxed">{a.theirStrength}</p>
          <p className="mt-4 leading-relaxed">
            <strong>Pick {a.name} when:</strong> {a.pickThemWhen}
          </p>
        </div>

        <div
          className="mt-6 border-2 border-ink bg-card p-6"
          style={{ borderLeftWidth: 10, borderLeftColor: "var(--color-stamp-live)" }}
        >
          <div className="font-mono text-xs tracking-[0.15em] uppercase text-ink-faint">
            where Verdict is better
          </div>
          <p className="mt-3 leading-relaxed">{a.pickUsWhen}</p>
        </div>

        <h2 className="font-display font-black text-2xl mt-14 mb-4">Side by side</h2>
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-sm border-collapse min-w-[520px]">
            <thead>
              <tr className="border-b-2 border-ink text-left">
                <th className="py-2 pr-4 font-semibold w-1/4"></th>
                <th className="py-2 pr-4 font-semibold">{a.name}</th>
                <th className="py-2 font-semibold">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {a.differences.map((d) => (
                <tr key={d.point} className="border-b border-rule align-top">
                  <td className="py-3 pr-4 text-ink-faint">{d.point}</td>
                  <td className="py-3 pr-4">{d.them}</td>
                  <td className="py-3 font-semibold">{d.us}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 font-mono text-xs text-ink-faint">{a.pricingNote}</p>

        <h2 className="font-display font-black text-2xl mt-14 mb-3">
          The honest summary
        </h2>
        <p className="text-ink-soft leading-relaxed">
          Verdict has no contact database and does not send campaigns. It opens
          an SMTP connection to the receiving server, asks whether the mailbox
          exists, and reports what the server said. When the server refuses to
          answer, or the domain accepts every address, it says so instead of
          guessing. That is the whole product, it is MIT licensed, and it runs
          on your own machine so the list never goes anywhere.
        </p>

        <div className="mt-10 border-2 border-ink bg-card p-7">
          <h2 className="font-display font-black text-xl mb-2">Try it on a real list</h2>
          <p className="text-ink-soft leading-relaxed mb-5">
            Paste up to 500 addresses. Free, no signup, nothing stored. The
            fairest test is your last campaign&apos;s bounce list, since you
            already know which ones failed.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/clean"
              className="bg-ink text-paper font-mono text-sm px-6 py-3 hover:bg-stamp-live transition-colors"
            >
              Check a list &rarr;
            </Link>
            <a
              href="https://github.com/omm9846/verdict"
              className="border border-ink font-mono text-sm px-6 py-3 hover:bg-paper-deep transition-colors"
            >
              Read the code
            </a>
          </div>
        </div>

        <h2 className="font-display font-black text-2xl mt-14 mb-4">Other comparisons</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {others.map((o) => (
            <Link
              key={o.slug}
              href={`/alternatives/${o.slug}`}
              className="border border-rule p-4 hover:border-ink transition-colors"
            >
              <div className="font-mono text-sm font-semibold">{o.name}</div>
              <div className="text-sm text-ink-soft mt-1">{KIND_LABEL[o.kind]}</div>
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
