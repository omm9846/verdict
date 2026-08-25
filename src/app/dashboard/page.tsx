import Link from "next/link";

type Verdict = "LIVE" | "DEAD" | "RISKY" | "CATCHALL";

const QUEUE: { email: string; person: string; firm: string; verdict: Verdict; eligible: string }[] = [
  { email: "pavel.stehno@sigilfund.com", person: "Pavel Stehno", firm: "Sigil PCC", verdict: "LIVE", eligible: "FOLLOW-UP READY" },
  { email: "guilhem@flowdesk.co", person: "Guilhem Chaumont", firm: "Flowdesk", verdict: "LIVE", eligible: "FOLLOW-UP READY" },
  { email: "myusko@morgancreekcap.com", person: "Mark Yusko", firm: "Morgan Creek", verdict: "LIVE", eligible: "COOLED · 6H LEFT" },
  { email: "denelle@stellar.org", person: "Denelle Dixon", firm: "Stellar Foundation", verdict: "LIVE", eligible: "COOLED · 9H LEFT" },
  { email: "todd@amphibiancapital.com", person: "Todd Bendell", firm: "Amphibian Capital", verdict: "CATCHALL", eligible: "SUPPRESSED" },
  { email: "rsmets@thetacapital.com", person: "Ruud Smets", firm: "Theta Capital", verdict: "DEAD", eligible: "SUPPRESSED" },
  { email: "ruby@polychain.capital", person: "Ruby Sekhon", firm: "Polychain Capital", verdict: "LIVE", eligible: "FOLLOW-UP READY" },
  { email: "matthew@sixtant.io", person: "Matthew Downey", firm: "Sixtant", verdict: "CATCHALL", eligible: "SKIP · NO EVIDENCE" },
];

const WAVES = [
  { name: "Wave 7 — miners & funds", sent: 5, delivered: 5, bounced: 0, date: "today" },
  { name: "Wave 6 — MM batch", sent: 4, delivered: 4, bounced: 0, date: "yesterday" },
  { name: "Follow-up wave 2", sent: 8, delivered: 8, bounced: 0, date: "yesterday" },
  { name: "Gen-Z hooks", sent: 12, delivered: 11, bounced: 1, date: "2d ago" },
  { name: "Wave 5 — funds", sent: 7, delivered: 7, bounced: 0, date: "2d ago" },
];

const STATS = [
  { label: "delivered", value: "58" },
  { label: "bounced", value: "4", tone: "text-stamp-dead" },
  { label: "suppressed", value: "18" },
  { label: "reply rate", value: "6.8%" },
];

const NAV = ["Overview", "Verify Queue", "Contacts", "Campaigns", "Suppression"];

function Chip({ v }: { v: Verdict }) {
  const cls =
    v === "LIVE" ? "text-stamp-live border-stamp-live"
    : v === "DEAD" ? "text-stamp-dead border-stamp-dead"
    : v === "RISKY" ? "text-stamp-risky border-stamp-risky"
    : "text-stamp-check border-stamp-check";
  return <span className={`stamp ${cls}`}>{v}</span>;
}

export default function Dashboard() {
  return (
    <div className="min-h-screen flex">
      {/* sidebar */}
      <aside className="w-56 shrink-0 border-r-2 border-ink bg-paper-deep flex flex-col">
        <Link href="/" className="font-display font-black text-xl px-5 py-5 border-b-2 border-ink block">
          VERDICT<span className="text-stamp-dead">.</span>
        </Link>
        <nav className="py-4 flex-1">
          {NAV.map((item, i) => (
            <div
              key={item}
              className={`px-5 py-2.5 font-mono text-sm cursor-default ${
                i === 0
                  ? "bg-card border-l-4 border-ink font-semibold"
                  : "border-l-4 border-transparent text-ink-soft hover:text-ink hover:bg-card/60"
              }`}
            >
              {item}
            </div>
          ))}
        </nav>
        <div className="px-5 py-4 border-t-2 border-ink font-mono text-[11px] text-ink-faint space-y-1">
          <div>probe pool: local</div>
          <div>sender: hello@ensotrade.tech</div>
          <div>dnc entries: 1</div>
        </div>
      </aside>

      {/* main */}
      <main className="flex-1 min-w-0 px-8 py-8 max-w-5xl">
        {/* header */}
        <div className="flex items-baseline justify-between mb-8">
          <h1 className="font-display font-black text-3xl">Overview</h1>
          <span className="font-mono text-xs text-ink-faint">
            friday · wave window open
          </span>
        </div>

        {/* stats */}
        <div className="grid grid-cols-4 gap-px bg-rule border border-rule mb-10">
          {STATS.map((s) => (
            <div key={s.label} className="bg-card px-5 py-4">
              <div className={`font-display font-black text-3xl ${s.tone ?? ""}`}>
                {s.value}
              </div>
              <div className="font-mono text-[11px] tracking-[0.15em] uppercase text-ink-faint mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* the gate */}
        <section className="mb-12">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display font-bold text-xl">The Gate — tonight&apos;s wave</h2>
            <span className="font-mono text-xs text-ink-faint">person-level cooldown: 12h</span>
          </div>
          <div className="bg-card border border-rule divide-y divide-rule">
            {QUEUE.map((row) => (
              <div key={row.email} className="grid grid-cols-[1fr_9rem_auto_auto] gap-4 items-center px-5 py-3">
                <div className="min-w-0">
                  <div className="text-sm truncate">{row.email}</div>
                  <div className="font-mono text-[11px] text-ink-faint">
                    {row.person} · {row.firm}
                  </div>
                </div>
                <Chip v={row.verdict} />
                <span className="font-mono text-[11px] text-ink-soft whitespace-nowrap">
                  {row.eligible}
                </span>
                <button
                  disabled={row.eligible !== "FOLLOW-UP READY"}
                  className={`font-mono text-xs px-3 py-1.5 border transition-colors ${
                    row.eligible === "FOLLOW-UP READY"
                      ? "border-ink hover:bg-ink hover:text-paper"
                      : "border-rule text-ink-faint cursor-not-allowed"
                  }`}
                >
                  bump
                </button>
              </div>
            ))}
          </div>
          <p className="font-mono text-[11px] text-ink-faint mt-3">
            bumps allowed: one per address · first touch must be &gt;12h old · suppressed addresses never resurface
          </p>
        </section>

        {/* waves */}
        <section>
          <h2 className="font-display font-bold text-xl mb-4">Waves</h2>
          <table className="w-full font-mono text-sm border-collapse bg-card border border-rule">
            <thead>
              <tr className="border-b-2 border-ink text-left">
                <th className="px-4 py-2.5 font-semibold">wave</th>
                <th className="px-4 py-2.5 font-semibold text-right">sent</th>
                <th className="px-4 py-2.5 font-semibold text-right">delivered</th>
                <th className="px-4 py-2.5 font-semibold text-right">bounced</th>
                <th className="px-4 py-2.5 font-semibold text-right">when</th>
              </tr>
            </thead>
            <tbody>
              {WAVES.map((w) => (
                <tr key={w.name} className="border-b border-rule last:border-0">
                  <td className="px-4 py-2.5">{w.name}</td>
                  <td className="px-4 py-2.5 text-right">{w.sent}</td>
                  <td className="px-4 py-2.5 text-right text-stamp-live">{w.delivered}</td>
                  <td className={`px-4 py-2.5 text-right ${w.bounced ? "text-stamp-dead" : ""}`}>
                    {w.bounced}
                  </td>
                  <td className="px-4 py-2.5 text-right text-ink-faint">{w.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}