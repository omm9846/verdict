import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of service | Verdict",
  description:
    "The terms for using Verdict: what you may do with it, what you may not, "
    + "and what we promise.",
  alternates: { canonical: "https://tryverdict.org/terms" },
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

export default function TermsPage() {
  return (
    <main className="min-h-screen">
      <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="font-display font-black text-2xl tracking-tight">
          VERDICT<span className="text-stamp-dead">.</span>
        </Link>
        <div className="flex items-center gap-6 font-mono text-sm">
          <Link href="/privacy" className="hover:text-stamp-live transition-colors">privacy</Link>
          <Link href="/clean" className="hover:text-stamp-live transition-colors">check a list</Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-6 pt-8 pb-20">
        <p className="font-mono text-xs tracking-[0.25em] uppercase text-ink-faint mb-5">
          terms of service
        </p>
        <h1 className="font-display font-black text-4xl sm:text-5xl leading-[1.05] tracking-tight">
          The deal, in plain words.
        </h1>
        <p className="mt-5 font-mono text-xs text-ink-faint">Last updated {UPDATED}</p>

        <p className="mt-8 text-lg text-ink-soft leading-relaxed">
          Verdict is operated by Om Soni. Using the website, the API or the
          hosted service means accepting these terms. The open-source engine is
          separate and is governed by the MIT licence that ships with it.
        </p>

        <Section title="What the service does">
          <p>
            Verdict checks whether an email address can receive mail. Where
            possible it asks the receiving mail server directly. Where that is
            not possible it says so rather than guessing, and a result of{" "}
            <code className="font-mono text-sm">PLAUSIBLE</code> or{" "}
            <code className="font-mono text-sm">UNKNOWN</code> means exactly
            that: we could not establish an answer.
          </p>
          <p>
            Verdict does not send marketing email on your behalf and does not
            sell contact data.
          </p>
        </Section>

        <Section title="Accounts">
          <p>
            One account per person or organisation. You are responsible for
            what happens under your account and for keeping your sign-in link
            and API keys to yourself. Tell us promptly if you think a key has
            been exposed and we will revoke it.
          </p>
          <p>
            Free accounts may verify up to 5 addresses a day. Paid accounts
            have a higher limit shown on your dashboard. Limits are per day and
            reset at midnight UTC.
          </p>
        </Section>

        <Section title="Acceptable use">
          <p>You may not use Verdict to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Send unsolicited bulk email, or clean a list you obtained by
              scraping or purchase without a lawful basis to contact the people
              on it.
            </li>
            <li>
              Enumerate addresses at a domain you have no relationship with,
              or otherwise probe a mail server to map who works somewhere.
            </li>
            <li>
              Harass, defraud or impersonate anyone, or check addresses in order
              to target an individual.
            </li>
            <li>
              Resell the hosted service as your own, or route another product&apos;s
              verification traffic through your account.
            </li>
            <li>
              Circumvent plan limits, share API keys across organisations, or
              run automated attempts to exhaust the service.
            </li>
          </ul>
          <p>
            Verifying a list you already hold and have a lawful basis to contact
            is exactly what this is for. The line is about consent and purpose,
            not volume.
          </p>
          <p>
            We may suspend an account that breaks these rules. Where the breach
            is serious or ongoing we may do so without notice.
          </p>
        </Section>

        <Section title="Your responsibilities as a sender">
          <p>
            Whether you may contact someone is your decision and your legal
            responsibility, not ours. Different countries treat marketing email
            differently, and a verified address is not a permitted one. Verdict
            tells you whether a mailbox exists; it cannot tell you whether you
            are allowed to write to it.
          </p>
        </Section>

        <Section title="Payment">
          <p>
            The paid plan is billed monthly in advance through Dodo Payments.
            You can cancel at any time and access continues to the end of the
            period you have paid for. We do not pro-rate partial months.
          </p>
          <p>
            If something is genuinely broken and we cannot fix it, email us and
            we will refund you. We would rather do that than keep money from
            someone the product failed.
          </p>
          <p>
            Prices may change with at least 30 days notice by email. A change
            never applies to a period already paid for.
          </p>
        </Section>

        <Section title="Availability and accuracy">
          <p>
            The service is provided as is. We do not guarantee uninterrupted
            availability, and we do not guarantee that a verification result is
            correct: mail servers can be misconfigured, rate limit us, refuse a
            probe, or accept every address whether or not it exists. Where we
            cannot establish an answer we report that rather than assert one,
            but a result should be treated as evidence, not as a warranty.
          </p>
          <p>
            To the extent the law allows, our total liability for any claim
            relating to the service is limited to what you paid us in the three
            months before the claim arose.
          </p>
        </Section>

        <Section title="Ending the arrangement">
          <p>
            Close your account whenever you like by emailing us. We may end
            your access if you break these terms, or with 30 days notice for
            any other reason, refunding anything you have paid for a period you
            will not receive.
          </p>
        </Section>

        <Section title="Changes and contact">
          <p>
            We may update these terms. Material changes will be announced on
            this page with the date above, and by email if you have an account.
            Questions go to{" "}
            <a href="mailto:hello@tryverdict.org" className="border-b border-ink">
              hello@tryverdict.org
            </a>.
          </p>
        </Section>

        <p className="mt-14 font-mono text-xs text-ink-faint leading-relaxed">
          The self-hosted engine is MIT licensed and these terms do not
          restrict it. Running it on your own machine involves no account, no
          limits, and no agreement with us at all.
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
