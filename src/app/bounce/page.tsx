import Link from "next/link";
import type { Metadata } from "next";
import { BOUNCES, verdictFor } from "@/lib/bounce-codes";

export const metadata: Metadata = {
  title: "SMTP bounce codes, and which ones actually mean the address is dead",
  description:
    "Every common SMTP bounce code explained, with the answer to the question "
    + "that matters: does this mean the mailbox does not exist, or did the "
    + "server just refuse you? Most tools get this wrong.",
  alternates: { canonical: "https://tryverdict.org/bounce" },
};

const TONE: Record<string, string> = {
  dead: "var(--color-stamp-dead)",
  risky: "var(--color-stamp-risky)",
  safe: "var(--color-stamp-live)",
};

export default function BounceIndex() {
  const dead = BOUNCES.filter((b) => b.recipientDead);
  const notDead = BOUNCES.filter((b) => !b.recipientDead);

  return (
    <main className="min-h-screen">
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
          <Link href="/clean" className="hover:text-stamp-live transition-colors">check a list</Link>
          <Link href="/audit" className="hover:text-stamp-live transition-colors">domain audit</Link>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-6 pt-8 pb-14">
        <p className="font-mono text-xs tracking-[0.25em] uppercase text-ink-faint mb-5">
          reference
        </p>
        <h1 className="font-display font-black text-4xl sm:text-5xl leading-[1.05] tracking-tight">
          Not every bounce means the address is dead.
        </h1>
        <p className="mt-6 text-lg text-ink-soft max-w-2xl leading-relaxed">
          A 5xx code looks permanent, so most tools suppress on all of them. But{" "}
          <code className="font-mono text-base">5.7.1</code> is policy,{" "}
          <code className="font-mono text-base">5.1.4</code> is ambiguity, and{" "}
          <code className="font-mono text-base">5.2.2</code> means the mailbox is
          full, which proves it exists. Suppressing on those throws away
          contacts you could have reached.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="font-display font-black text-2xl mb-2">
          These mean the mailbox does not exist
        </h2>
        <div className="rule-double w-32 mb-6" />
        <div className="grid sm:grid-cols-2 gap-3 mb-14">
          {dead.map((b) => (
            <Link
              key={b.slug}
              href={`/bounce/${b.slug}`}
              className="border border-rule p-4 hover:border-ink transition-colors"
              style={{ borderLeftWidth: 5, borderLeftColor: TONE[verdictFor(b).tone] }}
            >
              <div className="font-mono text-sm font-semibold">
                {b.code} {b.enhanced}
              </div>
              <div className="text-sm text-ink-soft mt-1">{b.title}</div>
            </Link>
          ))}
        </div>

        <h2 className="font-display font-black text-2xl mb-2">
          These do not
        </h2>
        <div className="rule-double w-32 mb-4" />
        <p className="text-ink-soft mb-6 max-w-2xl leading-relaxed">
          Every code below is about the server, the message or the sender.
          Suppressing an address on any of them removes a contact that was
          reachable.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {notDead.map((b) => (
            <Link
              key={b.slug}
              href={`/bounce/${b.slug}`}
              className="border border-rule p-4 hover:border-ink transition-colors"
              style={{ borderLeftWidth: 5, borderLeftColor: TONE[verdictFor(b).tone] }}
            >
              <div className="font-mono text-sm font-semibold">
                {b.code} {b.enhanced}
              </div>
              <div className="text-sm text-ink-soft mt-1">{b.title}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y-2 border-ink bg-paper-deep">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="font-display font-black text-2xl mb-4">
            Catch them before the send
          </h2>
          <p className="text-ink-soft leading-relaxed mb-6">
            Paste a list and see which addresses sit on domains that accept no
            mail at all, which are one character away from a real inbox, and
            which are on catch-all domains where nothing can verify them. Free,
            no signup, nothing stored.
          </p>
          <Link
            href="/clean"
            className="inline-block bg-ink text-paper font-mono text-sm px-7 py-3.5 hover:bg-stamp-live transition-colors"
          >
            Check a list &rarr;
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
