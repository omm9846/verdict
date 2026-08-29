import Link from "next/link";
import type { Metadata } from "next";
import { DomainAudit } from "@/components/domain-audit";

export const metadata: Metadata = {
  title: "A third of the world's biggest domains can be spoofed | Verdict",
  description:
    "We checked SPF, DKIM and DMARC on the Tranco top 1,200. Of the 998 that "
    + "accept mail, 32% publish no usable DMARC policy — anyone can send email "
    + "as them. Full method, reproducible, August 2026.",
  alternates: { canonical: "https://tryverdict.org/spoofable" },
  openGraph: {
    title: "A third of the world's biggest domains can be spoofed",
    description:
      "32% of the top 1,000 mail-accepting domains publish no usable DMARC "
      + "policy. Method and data, August 2026.",
    url: "https://tryverdict.org/spoofable",
  },
};

const HEADLINE = [
  { label: "Domains checked", value: "1,200", note: "Tranco top list" },
  { label: "That accept mail", value: "998", note: "the sample" },
  { label: "Spoofable", value: "32.0%", note: "319 domains", bad: true },
];

const BREAKDOWN = [
  { k: "No DMARC record at all", n: 176, pct: "17.6%", bad: true,
    why: "Receivers are told nothing. A forged message is delivered like any other." },
  { k: "DMARC present, but p=none", n: 143, pct: "14.3%", bad: true,
    why: "Monitoring only. The policy explicitly instructs receivers to take no action." },
  { k: "Enforcing — quarantine or reject", n: 679, pct: "68.0%", bad: false,
    why: "Forged mail is sent to spam or refused outright." },
  { k: "No SPF record", n: 252, pct: "25.3%", bad: true,
    why: "No published list of who may send as the domain." },
  { k: "No DKIM on known selectors", n: 359, pct: "36.0%", bad: true,
    why: "Either mail is unsigned, or the selector is one we cannot guess." },
];

const TLDS = [
  { tld: ".net", bad: 46, total: 84, pct: 54.8 },
  { tld: ".io", bad: 12, total: 26, pct: 46.2 },
  { tld: ".org", bad: 22, total: 57, pct: 38.6 },
  { tld: ".ru", bad: 13, total: 49, pct: 26.5 },
  { tld: ".com", bad: 156, total: 591, pct: 26.4 },
];

const GRADES: { g: string; n: number }[] = [
  { g: "A", n: 556 }, { g: "B", n: 78 }, { g: "C", n: 171 },
  { g: "D", n: 83 }, { g: "F", n: 110 },
];

export default function SpoofablePage() {
  const maxGrade = Math.max(...GRADES.map((x) => x.n));

  return (
    <main className="min-h-screen">
      <div className="bg-ink text-paper font-mono text-[11px] tracking-[0.18em] uppercase">
        <div className="max-w-6xl mx-auto px-6 py-1.5 flex justify-between">
          <span>research</span>
          <span className="hidden sm:inline">august 2026</span>
          <span>reproducible · MIT</span>
        </div>
      </div>

      <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="font-display font-black text-2xl tracking-tight">
          VERDICT<span className="text-stamp-dead">.</span>
        </Link>
        <div className="flex items-center gap-6 font-mono text-sm">
          <Link href="/audit" className="hover:text-stamp-live transition-colors">free audit</Link>
          <a
            href="https://github.com/omm9846/verdict"
            className="border border-ink px-3 py-1.5 hover:bg-ink hover:text-paper transition-colors"
          >
            GitHub
          </a>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-6 pt-10 pb-16">
        <p className="font-mono text-xs tracking-[0.25em] uppercase text-ink-faint mb-6">
          domain authentication survey · august 2026
        </p>
        <h1 className="font-display font-black text-4xl sm:text-5xl xl:text-6xl leading-[1.03] tracking-tight">
          A third of the world&apos;s biggest domains can still be spoofed.
        </h1>
        <p className="mt-7 text-lg text-ink-soft max-w-2xl leading-relaxed">
          We checked SPF, DKIM and DMARC on the Tranco top 1,200. Of the 998
          that actually accept mail, <strong>319 publish no usable DMARC
          policy</strong> — meaning a forged message claiming to come from them
          arrives like any other, and nobody at the domain is told it happened.
        </p>

        <div className="mt-10 grid sm:grid-cols-3 gap-4">
          {HEADLINE.map((h) => (
            <div
              key={h.label}
              className={`border-2 p-6 ${h.bad ? "border-stamp-dead" : "border-ink"} bg-card`}
            >
              <div
                className="font-display font-black text-4xl leading-none"
                style={h.bad ? { color: "var(--color-stamp-dead)" } : undefined}
              >
                {h.value}
              </div>
              <div className="font-mono text-xs mt-3 font-semibold">{h.label}</div>
              <div className="font-mono text-[11px] text-ink-faint mt-1">{h.note}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y-2 border-ink bg-paper-deep">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="font-display font-black text-3xl mb-2">The breakdown</h2>
          <div className="rule-double w-32 mb-9" />
          <div className="border border-rule bg-card">
            {BREAKDOWN.map((b) => (
              <div key={b.k} className="p-5 border-b border-rule last:border-b-0">
                <div className="flex items-baseline gap-4 flex-wrap">
                  <span
                    className="font-display font-black text-2xl tabular-nums"
                    style={b.bad ? { color: "var(--color-stamp-dead)" } : { color: "var(--color-stamp-live)" }}
                  >
                    {b.pct}
                  </span>
                  <span className="font-mono text-sm font-semibold">{b.k}</span>
                  <span className="font-mono text-xs text-ink-faint ml-auto tabular-nums">
                    {b.n} of 998
                  </span>
                </div>
                <p className="text-sm text-ink-soft mt-2 leading-relaxed">{b.why}</p>
              </div>
            ))}
          </div>
          <p className="font-mono text-xs text-ink-faint mt-5 leading-relaxed">
            Four domains publish <strong>two SPF records</strong>. That is a
            permanent error: receivers treat it as no SPF at all, so the record
            does nothing. They have been contacted and are not named here.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="font-display font-black text-3xl mb-2">By top-level domain</h2>
        <div className="rule-double w-32 mb-4" />
        <p className="text-ink-soft mb-8 max-w-2xl leading-relaxed">
          The gap between <code className="font-mono text-sm">.com</code> and{" "}
          <code className="font-mono text-sm">.net</code> is the part we did not
          expect. Over half the top <code className="font-mono text-sm">.net</code>{" "}
          domains that accept mail have no enforcing DMARC policy.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-sm border-collapse min-w-[420px]">
            <thead>
              <tr className="border-b-2 border-ink text-left">
                <th className="py-2 pr-4 font-semibold">TLD</th>
                <th className="py-2 pr-4 font-semibold">Spoofable</th>
                <th className="py-2 pr-4 font-semibold">Sample</th>
                <th className="py-2 font-semibold w-1/3">Rate</th>
              </tr>
            </thead>
            <tbody>
              {TLDS.map((t) => (
                <tr key={t.tld} className="border-b border-rule">
                  <td className="py-3 pr-4">{t.tld}</td>
                  <td className="py-3 pr-4 tabular-nums">{t.bad}</td>
                  <td className="py-3 pr-4 tabular-nums text-ink-faint">{t.total}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2 bg-paper-deep flex-1 max-w-[160px]">
                        <div
                          className="h-full"
                          style={{
                            width: `${t.pct}%`,
                            background: t.pct > 40
                              ? "var(--color-stamp-dead)"
                              : "var(--color-stamp-risky)",
                          }}
                        />
                      </div>
                      <span className="tabular-nums">{t.pct.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="font-display font-bold text-xl mt-14 mb-5">Grade distribution</h3>
        <div className="flex items-end gap-3 h-40">
          {GRADES.map((x) => (
            <div key={x.g} className="flex-1 flex flex-col items-center gap-2">
              <span className="font-mono text-xs tabular-nums text-ink-faint">{x.n}</span>
              <div
                className="w-full"
                style={{
                  height: `${(x.n / maxGrade) * 100}%`,
                  background: x.g === "A" || x.g === "B"
                    ? "var(--color-stamp-live)"
                    : x.g === "C" || x.g === "D"
                    ? "var(--color-stamp-risky)"
                    : "var(--color-stamp-dead)",
                }}
              />
              <span className="font-display font-black text-lg">{x.g}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y-2 border-ink bg-paper-deep">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="font-display font-black text-3xl mb-2">Method</h2>
          <div className="rule-double w-32 mb-9" />
          <div className="space-y-5 text-ink-soft leading-relaxed">
            <p>
              Population: the Tranco top 1,200, a research-standard ranking that
              averages several sources to resist manipulation. Collected August
              2026.
            </p>
            <p>
              Every check is a public DNS lookup. Nothing is sent to any domain
              and no mailbox is probed. The sample is restricted to the 998
              domains with a working MX record, because sender authentication on
              a domain that receives no mail means nothing.
            </p>
            <p>
              &ldquo;Spoofable&rdquo; means no DMARC record, or a DMARC record
              with <code className="font-mono text-sm">p=none</code>. Both leave
              receiving servers with no instruction to reject a forgery.{" "}
              <code className="font-mono text-sm">p=none</code> is the correct
              place to begin a DMARC rollout and the wrong place to stop.
            </p>
            <p>
              SPF is checked beyond mere presence: multiple records, exceeding
              the ten-lookup limit, and{" "}
              <code className="font-mono text-sm">+all</code> all count as
              failures, because each disables the record in practice.
            </p>
          </div>

          <h3 className="font-display font-bold text-xl mt-12 mb-4">Limitations</h3>
          <ul className="space-y-3 text-ink-soft leading-relaxed list-disc pl-5">
            <li>
              <strong>DKIM is undercounted.</strong> Selectors cannot be
              enumerated from outside; we try about thirty that common providers
              use. A &ldquo;not found&rdquo; means we could not see one, not
              that none exists — treat the 36% as an upper bound.
            </li>
            <li>
              <strong>A published policy is not an enforced one.</strong> We read
              what a domain declares, not what receivers do with it.
            </li>
            <li>
              <strong>One point in time.</strong> DNS changes. Every result is
              timestamped and the survey re-runs in minutes.
            </li>
            <li>
              <strong>We sell a product in this space.</strong> Which is why the
              engine is MIT licensed and this is reproducible rather than
              asserted.
            </li>
          </ul>

          <p className="mt-8 font-mono text-sm">
            <a
              href="https://github.com/omm9846/verdict"
              className="border-b border-ink hover:text-stamp-live"
            >
              Reproduce it: github.com/omm9846/verdict →
            </a>
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="font-display font-black text-3xl mb-2">Check your own</h2>
        <div className="rule-double w-32 mb-5" />
        <p className="text-ink-soft mb-8 max-w-2xl leading-relaxed">
          Free, no signup, same checks. Every result gets a permanent link you
          can send to whoever owns your DNS.
        </p>
        <DomainAudit />
      </section>

      <footer className="bg-ink text-paper">
        <div className="max-w-6xl mx-auto px-6 py-10 font-mono text-[11px] text-paper/40 flex justify-between flex-wrap gap-4">
          <span>Survey collected August 2026 · MIT licensed</span>
          <a href="mailto:hello@tryverdict.org" className="hover:text-paper">
            hello@tryverdict.org
          </a>
        </div>
      </footer>
    </main>
  );
}
