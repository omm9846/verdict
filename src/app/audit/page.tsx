import Link from "next/link";
import type { Metadata } from "next";
import { DomainAudit } from "@/components/domain-audit";

export const metadata: Metadata = {
  title: "Can anyone send email as you? — Free domain audit | Verdict",
  description:
    "Free SPF, DKIM, DMARC and MX audit for any domain. Graded in seconds, "
    + "public DNS only, no signup. Find out whether anyone can spoof your domain.",
  alternates: { canonical: "https://tryverdict.org/audit" },
  openGraph: {
    title: "Can anyone send email as you?",
    description:
      "Free SPF, DKIM, DMARC and MX audit. Graded in seconds, no signup.",
    url: "https://tryverdict.org/audit",
  },
};

const FAQ = [
  {
    q: "What does this actually check?",
    a: "MX (can the domain receive mail), SPF (who is allowed to send as it), "
      + "DKIM (is outgoing mail signed), DMARC (what receivers should do about "
      + "forgeries, and whether you get told), and MTA-STS (is inbound mail "
      + "required to use TLS).",
  },
  {
    q: "Does it send email to my domain?",
    a: "No. Every check is a public DNS lookup. Nothing is delivered, nothing "
      + "is probed, and we store nothing unless you ask for the report by email.",
  },
  {
    q: "It says no DKIM but I have DKIM.",
    a: "Likely a custom selector. DKIM selectors cannot be enumerated from "
      + "outside — we try the thirty or so that common providers use. A "
      + "not-found is 'we could not see it', not 'it is missing'.",
  },
  {
    q: "Why does DMARC matter most?",
    a: "Without it, anyone can send mail claiming to be your domain and you "
      + "never find out. SPF and DKIM describe your legitimate senders; DMARC "
      + "is the record that tells receivers to actually act on that, and mails "
      + "you reports when someone tries.",
  },
];

export default function AuditPage() {
  return (
    <main className="min-h-screen">
      <div className="bg-ink text-paper font-mono text-[11px] tracking-[0.18em] uppercase">
        <div className="max-w-6xl mx-auto px-6 py-1.5 flex justify-between">
          <span>free · no signup</span>
          <span className="hidden sm:inline">public dns only</span>
          <span>open source · MIT</span>
        </div>
      </div>

      <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="font-display font-black text-2xl tracking-tight">
          VERDICT<span className="text-stamp-dead">.</span>
        </Link>
        <div className="flex items-center gap-6 font-mono text-sm">
          <Link href="/" className="hover:text-stamp-live transition-colors">home</Link>
          <a
            href="https://github.com/omm9846/verdict"
            className="border border-ink px-3 py-1.5 hover:bg-ink hover:text-paper transition-colors"
          >
            GitHub
          </a>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 pt-10 pb-20">
        <p className="font-mono text-xs tracking-[0.25em] uppercase text-ink-faint mb-6">
          the impersonation test
        </p>
        <h1 className="font-display font-black text-4xl sm:text-5xl xl:text-6xl leading-[1.04] tracking-tight max-w-3xl">
          Can anyone send email as you?
        </h1>
        <p className="mt-6 text-lg text-ink-soft max-w-2xl leading-relaxed">
          Four DNS records decide whether your mail gets trusted and whether a
          stranger can forge your domain. Most companies have never checked, and
          a surprising number are wide open. Takes about three seconds.
        </p>

        <div className="mt-10">
          <DomainAudit />
        </div>
      </section>

      <section className="border-y-2 border-ink bg-paper-deep">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <h2 className="font-display font-black text-3xl mb-2">Questions</h2>
          <div className="rule-double w-32 mb-10" />
          <div className="space-y-8">
            {FAQ.map((f) => (
              <div key={f.q}>
                <h3 className="font-display font-bold text-xl">{f.q}</h3>
                <p className="mt-2 text-ink-soft leading-relaxed max-w-2xl">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <p className="font-display text-2xl sm:text-3xl leading-snug">
          This audit reads your DNS. The other half — whether a mailbox on the
          far end actually exists — needs an SMTP probe, and no cloud host
          allows one.
        </p>
        <p className="mt-6 text-ink-soft max-w-xl mx-auto leading-relaxed">
          So that part runs on your machine, where your list stays. MIT
          licensed, no contact database, nothing uploaded.
        </p>
        <Link
          href="/"
          className="inline-block mt-8 bg-ink text-paper font-mono text-sm px-7 py-3.5 hover:bg-stamp-live transition-colors"
        >
          See the verification gate →
        </Link>
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
