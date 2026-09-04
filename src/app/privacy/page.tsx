import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy | Verdict",
  description:
    "What Verdict collects, what it does not, and who processes it. Written "
    + "plainly rather than as boilerplate.",
  alternates: { canonical: "https://tryverdict.org/privacy" },
};

const UPDATED = "1 September 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="font-display font-black text-2xl mb-3">{title}</h2>
      <div className="space-y-4 text-ink-soft leading-relaxed">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="font-display font-black text-2xl tracking-tight">
          VERDICT<span className="text-stamp-dead">.</span>
        </Link>
        <div className="flex items-center gap-6 font-mono text-sm">
          <Link href="/terms" className="hover:text-stamp-live transition-colors">terms</Link>
          <Link href="/clean" className="hover:text-stamp-live transition-colors">check a list</Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-6 pt-8 pb-20">
        <p className="font-mono text-xs tracking-[0.25em] uppercase text-ink-faint mb-5">
          privacy policy
        </p>
        <h1 className="font-display font-black text-4xl sm:text-5xl leading-[1.05] tracking-tight">
          What we hold, and what we never see.
        </h1>
        <p className="mt-5 font-mono text-xs text-ink-faint">Last updated {UPDATED}</p>

        <p className="mt-8 text-lg text-ink-soft leading-relaxed">
          Verdict is operated by Om Soni. This page describes what the service
          collects and who processes it. Contact{" "}
          <a href="mailto:hello@tryverdict.org" className="border-b border-ink">
            hello@tryverdict.org
          </a>{" "}
          with any question about it.
        </p>

        <Section title="The short version">
          <p>
            We store your email address, a daily count of how many checks you
            have run, and a record of your payments. We do not store the
            contact lists you check, and the self-hosted engine never sends
            them to us at all.
          </p>
        </Section>

        <Section title="What we collect">
          <p>
            <strong>Your email address.</strong> Given when you sign in, join
            the waitlist, or ask for an audit report by email. It identifies
            your account and is how we contact you.
          </p>
          <p>
            <strong>Usage counts.</strong> A number per day, per account, so
            plan limits can be enforced. We record how many checks you ran, not
            what you checked.
          </p>
          <p>
            <strong>Billing records.</strong> When you pay, Dodo Payments sends
            us your email address and the event that occurred, which we store
            to know which plan you are on. Card details are handled by Dodo and
            never reach our servers.
          </p>
          <p>
            <strong>If you sign in with Google</strong>, we receive your email
            address and whether Google has verified it. Nothing else. We do not
            request access to your Google account, contacts, or mail, and no
            token is retained after sign-in.
          </p>
        </Section>

        <Section title="What we do not collect">
          <p>
            <strong>Your contact lists.</strong> Addresses you paste into the
            web checker are processed to produce a result and are not written
            to our database. The open-source engine runs on your own machine,
            so a list checked that way never leaves it.
          </p>
          <p>
            <strong>Passwords.</strong> There are none. Sign-in is a one-time
            link or Google, so there is nothing to leak.
          </p>
          <p>No advertising identifiers, no third-party analytics, no tracking pixels.</p>
        </Section>

        <Section title="Things worth knowing">
          <p>
            <strong>Domain audit pages are public.</strong> Checking a domain at{" "}
            <Link href="/audit" className="border-b border-ink">/audit</Link>{" "}
            creates a shareable page at <code className="font-mono text-sm">
            /audit/&lt;domain&gt;</code> showing that domain&apos;s public DNS
            records. It contains nothing that is not already published in DNS,
            and no personal data, but it is reachable by anyone with the link.
          </p>
          <p>
            <strong>Results are cached briefly.</strong> To avoid repeating the
            same lookup, the engine keeps a verification result in memory for
            up to a few hours. It is not written to disk and is lost when the
            service restarts.
          </p>
          <p>
            <strong>Verification contacts the recipient&apos;s mail server.</strong>{" "}
            Checking whether a mailbox exists means asking the server that
            holds it. That server sees the address being checked and the
            address doing the checking. No message is ever sent.
          </p>
        </Section>

        <Section title="Who processes data for us">
          <p>
            <strong>Vercel</strong> hosts the website.{" "}
            <strong>Render</strong> hosts the verification API.{" "}
            <strong>Supabase</strong> stores accounts, usage counts and billing
            records. <strong>Resend</strong> delivers our email.{" "}
            <strong>Dodo Payments</strong> processes payments and holds card
            details. <strong>Google</strong> handles sign-in if you choose it.
          </p>
          <p>
            Each receives only what it needs to do its job. We do not sell
            personal data, and we do not share it for advertising.
          </p>
        </Section>

        <Section title="How long we keep it">
          <p>
            Account details and usage counts are kept while your account
            exists. Sign-in links expire after fifteen minutes and are
            single-use. Billing records are kept as long as required for
            accounting. Ask us to delete your account and we will remove your
            profile, usage history and API keys.
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            You can ask for a copy of what we hold about you, ask us to correct
            it, or ask us to delete it. Email{" "}
            <a href="mailto:hello@tryverdict.org" className="border-b border-ink">
              hello@tryverdict.org
            </a>{" "}
            and we will action it. If you are in the UK or EU, you also have
            the right to complain to your data protection authority.
          </p>
        </Section>

        <Section title="Cookies">
          <p>
            One cookie holds your sign-in session, and a second short-lived one
            protects the Google sign-in flow against forgery. Both are strictly
            necessary and neither is used for tracking. There are no analytics
            or advertising cookies.
          </p>
        </Section>

        <Section title="Changes">
          <p>
            If this policy changes materially we will say so on this page and
            update the date above. Continued use after a change means you
            accept the revised policy.
          </p>
        </Section>

        <p className="mt-14 font-mono text-xs text-ink-faint leading-relaxed">
          The engine is open source under the MIT licence, so any claim on this
          page about what the software does can be checked against the code at{" "}
          <a href="https://github.com/omm9846/verdict" className="border-b border-ink-faint">
            github.com/omm9846/verdict
          </a>.
        </p>
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
