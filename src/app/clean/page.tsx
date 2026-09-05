import Link from "next/link";
import type { Metadata } from "next";
import { ListCleaner } from "@/components/list-cleaner";

export const metadata: Metadata = {
  title: "Clean a cold email list before you send it | Verdict",
  description:
    "Paste up to 500 addresses. Finds dead domains, typos one character from a "
    + "real inbox, burner providers and catch-all domains nothing can verify. "
    + "Free, no signup, nothing stored.",
  alternates: { canonical: "https://tryverdict.org/clean" },
  openGraph: {
    title: "Clean a cold email list before you send it",
    description:
      "Paste up to 500 addresses. Dead domains, typos and catch-all domains, "
      + "flagged in seconds. Free, no signup.",
    url: "https://tryverdict.org/clean",
  },
};

export default function CleanPage() {
  return (
    <main className="min-h-screen">
      <div className="bg-ink text-paper font-mono text-[11px] tracking-[0.18em] uppercase">
        <div className="max-w-6xl mx-auto px-6 py-1.5 flex justify-between">
          <span>free · no signup</span>
          <span className="hidden sm:inline">nothing you paste is stored</span>
          <span>open source · MIT</span>
        </div>
      </div>

      <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="font-display font-black text-2xl tracking-tight">
          VERDICT<span className="text-stamp-dead">.</span>
        </Link>
        <div className="flex items-center gap-6 font-mono text-sm">
          <Link href="/audit" className="hover:text-stamp-live transition-colors">domain audit</Link>
          <a
            href="https://github.com/omm9846/verdict"
            className="border border-ink px-3 py-1.5 hover:bg-ink hover:text-paper transition-colors"
          >
            GitHub
          </a>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 pt-10 pb-16">
        <p className="font-mono text-xs tracking-[0.25em] uppercase text-ink-faint mb-6">
          before you press send
        </p>
        <h1 className="font-display font-black text-4xl sm:text-5xl xl:text-6xl leading-[1.04] tracking-tight max-w-3xl">
          Some of your list was never going to arrive.
        </h1>
        <p className="mt-6 text-lg text-ink-soft max-w-2xl leading-relaxed">
          Paste it in, or drop an export straight from Apollo, Hunter or Clay.
          We will tell you which addresses sit on domains that
          accept no mail, which are one character away from a real inbox, and
          which sit on catch-all domains where no tool on earth can tell you
          anything. Takes a few seconds and nothing is stored.
        </p>

        <div className="mt-10">
          <ListCleaner />
        </div>
      </section>

      <section className="border-y-2 border-ink bg-paper-deep">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="font-display font-black text-2xl mb-4">
            The part we cannot do from here
          </h2>
          <p className="text-ink-soft leading-relaxed">
            Confirming that a specific mailbox exists means opening an SMTP
            conversation with the receiving server on port 25. Every major cloud
            provider blocks outbound port 25 to suppress spam, so no hosted tool
            can do it, ours included. Anything that claims to is inferring and
            calling it verification.
          </p>
          <p className="text-ink-soft leading-relaxed mt-4">
            So the real gate runs on your machine, where the probe works and
            your list never goes anywhere. The most honest way to test it is
            against a campaign you have already sent, because you already know
            which addresses bounced:
          </p>
          <pre className="mt-5 bg-card border border-rule p-4 font-mono text-sm overflow-x-auto">
{`git clone https://github.com/omm9846/verdict.git
cd verdict/backend && pip install -r requirements.txt

python -m engine backtest bounced.csv`}
          </pre>
          <p className="text-ink-soft leading-relaxed mt-4">
            It reports how many of your bounces were knowable before you sent,
            and how many were not. The second number is the one nobody else
            will show you.
          </p>
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
