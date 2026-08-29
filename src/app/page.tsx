import Link from "next/link";
import { VerdictFeed } from "@/components/verdict-feed";
import { ThemeToggle } from "@/components/theme-toggle";
import Faq from "@/components/faq";
import { WaitlistForm } from "@/components/waitlist-form";
import { VerdictChecker } from "@/components/verdict-checker";

const STEPS = [
  {
    n: "I.",
    name: "Discover",
    body: "Pattern inference from the public web. No contact database, no credits, no scraped lists. Verdict reads what companies publish about themselves and infers the rest.",
  },
  {
    n: "II.",
    name: "Verify",
    body: "Every candidate is put on the stand. An SMTP probe before anything ships, catch-all domains flagged, enterprise gateways named, dead mailboxes stamped and suppressed for good.",
  },
  {
    n: "III.",
    name: "Ship",
    body: "Only what cleared the gate leaves your domain. Person-level cooldowns, suppression lists and follow-up eligibility are enforced by the engine — not by your discipline at 2am.",
  },
];

const BENCHMARKS = [
  ["", "Verdict", "Apollo", "Hunter", "Instantly"],
  ["Bounce rate on shipped mail", "<4%", "~9%", "n/a (verify only)", "~12%"],
  ["Verification timing", "before send", "n/a", "separate product", "after send"],
  ["Contact database required", "no", "yes, 265M credits", "credits", "yes"],
  ["Self-hosted", "yes, MIT", "no", "limited", "no"],
];

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* top ticker */}
      <div className="bg-ink text-paper font-mono text-[11px] tracking-[0.18em] uppercase">
        <div className="max-w-6xl mx-auto px-6 py-1.5 flex justify-between">
          <span>open source · MIT</span>
          <span className="hidden sm:inline">your list never leaves your machine</span>
          <span>no contact database</span>
        </div>
      </div>

      {/* nav */}
      <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <span className="font-display font-black text-2xl tracking-tight">
          VERDICT<span className="text-stamp-dead">.</span>
        </span>
        <div className="flex items-center gap-6 font-mono text-sm">
          <Link href="#how" className="hidden sm:inline hover:text-stamp-live transition-colors">how it works</Link>
          <Link href="#benchmarks" className="hidden sm:inline hover:text-stamp-live transition-colors">benchmarks</Link>
          <Link href="/audit" className="hover:text-stamp-live transition-colors">free audit</Link>
          <Link href="/dashboard" className="hover:text-stamp-live transition-colors">product</Link>
          <ThemeToggle />
          <a
            href="https://github.com/omm9846/verdict"
            className="border border-ink px-3 py-1.5 hover:bg-ink hover:text-paper transition-colors"
          >
            ★ Star
          </a>
        </div>
      </nav>

      {/* hero */}
      <section className="max-w-6xl mx-auto px-6 pt-14 pb-20 grid lg:grid-cols-[1.2fr_1fr] gap-16 items-start">
        <div>
          <p className="font-mono text-xs tracking-[0.25em] uppercase text-ink-faint mb-6">
            every address stands trial
          </p>
          <h1 className="font-display font-black text-5xl sm:text-6xl xl:text-7xl leading-[1.02] tracking-tight">
            Guilty until proven deliverable.
          </h1>
          <p className="mt-7 text-lg text-ink-soft max-w-xl leading-relaxed">
            Verdict probes every mailbox over SMTP and refuses to send what will
            bounce. No contact database, no credits, no guessing — evidence, or it
            does not ship. And because it runs on your machine, your list is never
            uploaded anywhere. Not even to us.
          </p>
          <div className="mt-9 flex flex-wrap gap-4 items-center">
            <a
              href="https://github.com/omm9846/verdict"
              className="bg-ink text-paper font-mono text-sm px-6 py-3.5 hover:bg-stamp-live transition-colors"
            >
              ★ Star on GitHub
            </a>
            <Link
              href="/dashboard"
              className="border border-ink font-mono text-sm px-6 py-3.5 hover:bg-card transition-colors"
            >
              See the interface →
            </Link>
          </div>
          <div className="mt-10 max-w-2xl">
            <p className="font-mono text-xs text-ink-faint mb-4 uppercase tracking-[0.2em]">
              open a case — free, no signup
            </p>
            <VerdictChecker />
            <div className="mt-8 max-w-md">
              <p className="font-mono text-xs text-ink-faint mb-3">
                want the full engine? join the waitlist:
              </p>
              <WaitlistForm />
            </div>
          </div>
          <p className="mt-6 font-mono text-xs text-ink-faint">
            case study inside: 72 fund managers touched · 24 dead mailboxes caught pre-send · ~2% bounce
          </p>
          <div className="mt-8">
            <a href="https://www.producthunt.com/products/verdict-11?embed=true&amp;utm_source=badge-featured&amp;utm_medium=badge&amp;utm_campaign=badge-verdict-11" target="_blank" rel="noopener noreferrer">
              <img alt="Verdict - Emails that never bounce. | Product Hunt" width={250} height={54} src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1231863&amp;theme=light&amp;t=1787659374392" />
            </a>
          </div>
        </div>

        <div className="bg-card border border-rule p-6 shadow-[6px_6px_0_0_var(--color-rule)] mt-4">
          <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-ink-faint mb-4">
            live verification feed
          </div>
          <VerdictFeed />
        </div>
      </section>

      {/* problem statement */}
      <section className="border-y-2 border-ink bg-paper-deep">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <p className="font-display text-3xl sm:text-4xl leading-snug">
            Apollo sells you <span className="italic">240 million contacts.</span>
            It does not mention that one in ten is a dead letter — and every one
            you send is a mark against your domain that takes weeks to appeal.
          </p>
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-ink-faint mt-8">
            verdict was built after burning exactly that way
          </p>
        </div>
      </section>

      {/* free tool — the audit is the reason a stranger gives us an address */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="border-2 border-ink bg-card p-8 sm:p-12 shadow-[8px_8px_0_0_var(--color-stamp-live)]">
          <p className="font-mono text-xs tracking-[0.25em] uppercase text-ink-faint">
            the impersonation test · free, no signup
          </p>
          <h2 className="font-display font-black text-3xl sm:text-4xl mt-4 leading-tight">
            Anyone can sign your name.
            <br />
            Four records decide whether it holds up.
          </h2>
          <p className="mt-5 text-ink-soft max-w-2xl leading-relaxed">
            SPF, DKIM, DMARC and MX are what stop a stranger sending mail as
            you — and what decide whether your own mail is believed. Most
            companies have never read their own. Some are wide open and have
            no way of knowing.
          </p>
          <Link
            href="/audit"
            className="inline-block mt-7 bg-ink text-paper font-mono text-sm px-7 py-3.5 hover:bg-stamp-live transition-colors"
          >
            Audit your domain — 3 seconds →
          </Link>
        </div>
      </section>

      {/* how it works */}
      <section id="how" className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="font-display font-black text-4xl mb-2">How it works</h2>
        <div className="rule-double w-40 mb-12" />
        <div>
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="grid grid-cols-[5rem_10rem_1fr] gap-6 py-8 border-b border-rule items-baseline"
            >
              <span className="font-display text-4xl text-ink-faint">{s.n}</span>
              <span className="font-display font-bold text-2xl">{s.name}</span>
              <p className="text-ink-soft leading-relaxed max-w-xl">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* benchmarks */}
      <section id="benchmarks" className="border-y-2 border-ink bg-paper-deep">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <h2 className="font-display font-black text-4xl mb-2">Benchmarks</h2>
          <div className="rule-double w-40 mb-12" />
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-sm border-collapse">
              <tbody>
                {BENCHMARKS.map((row, i) => (
                  <tr key={i} className={i === 0 ? "border-b-2 border-ink" : "border-b border-rule"}>
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={`px-4 py-3 ${i === 0 ? "font-semibold" : ""} ${
                          j === 1 && i > 0 ? "bg-card font-semibold text-stamp-live border-x-2 border-ink" : ""
                        } ${j === 0 ? "text-left" : "text-center"}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="font-mono text-xs text-ink-faint mt-6">
            bounce figures: published docs + community-reported medians, 2026. your mileage varies with copy.
          </p>
        </div>
      </section>

      {/* pricing */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="font-display font-black text-4xl mb-2">Pricing</h2>
        <div className="rule-double w-40 mb-12" />
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: "Self-hosted", price: "$0", note: "forever", feats: ["Full pipeline, MIT licensed", "Bring your own SMTP or Resend key", "Community support"], cta: "Clone the repo" },
            { name: "Starter", price: "$29", note: "/mo hosted", feats: ["2,500 verified sends / mo", "1 sending domain", "Follow-up waves automated", "Email support"], cta: "Get early access", featured: true },
            { name: "Agency", price: "$99", note: "/mo hosted", feats: ["15,000 verified sends / mo", "Unlimited domains", "Client sub-accounts & reports", "Priority probe pool"], cta: "Get early access" },
          ].map((t) => (
            <div
              key={t.name}
              className={`relative p-7 ${t.featured ? "bg-ink text-paper shadow-[8px_8px_0_0_var(--color-stamp-live)]" : "bg-card border border-rule"}`}
            >
              {t.featured && (
                <span className="stamp absolute -top-3 right-4 text-stamp-live bg-paper">
                  most wanted
                </span>
              )}
              <div className="font-mono text-xs tracking-[0.2em] uppercase opacity-60">{t.name}</div>
              <div className="font-display font-black text-5xl mt-3">
                {t.price}
                <span className="text-base font-normal opacity-60"> {t.note}</span>
              </div>
              <ul className="mt-6 space-y-2.5 font-mono text-sm">
                {t.feats.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className={t.featured ? "text-stamp-live" : "text-stamp-live"}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`mt-8 w-full py-3 font-mono text-sm border transition-colors ${
                  t.featured
                    ? "bg-paper text-ink border-paper hover:bg-stamp-live hover:text-paper hover:border-stamp-live"
                    : "border-ink hover:bg-ink hover:text-paper"
                }`}
              >
                {t.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* footer */}
      <footer className="bg-ink text-paper">
        <div className="max-w-6xl mx-auto px-6 py-14 flex flex-col sm:flex-row justify-between gap-8">
          <div>
            <div className="font-display font-black text-2xl">
              VERDICT<span className="text-stamp-dead">.</span>
            </div>
            <p className="font-mono text-xs text-paper/50 mt-3 max-w-xs">
              An open-source cold-outreach engine by the team behind EnsoTrade.
              Every email gets a verdict before it ships.
            </p>
          </div>
          <div className="font-mono text-sm space-y-2 text-paper/70">
            <div><a href="https://github.com/omm9846/verdict" className="hover:text-paper">GitHub</a></div>
            <div><a href="/dashboard" className="hover:text-paper">Product</a></div>
            <div><a href="mailto:omsonii9846@gmail.com" className="hover:text-paper">omsonii9846@gmail.com</a></div>
          </div>
        </div>
        <div className="border-t border-paper/10 font-mono text-[11px] text-paper/40">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between">
            <span>MIT license</span>
            <span>cold email is legal b2b in the us (can-spam). know your local rules.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}