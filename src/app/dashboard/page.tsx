import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LIMITS, currentProfile, usageToday } from "@/lib/auth";
import { AccountActions } from "@/components/account-actions";
import { VerifyPanel } from "@/components/verify-panel";
import { ApiKeys } from "@/components/api-keys";

export const metadata: Metadata = {
  title: "Dashboard | Verdict",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const profile = await currentProfile();
  if (!profile) redirect("/login");

  const used = await usageToday(profile);
  const limits = LIMITS[profile.plan];
  const remaining = Math.max(0, limits.perDay - used);
  const pct = Math.min(100, (used / limits.perDay) * 100);
  const pro = profile.plan === "pro";

  return (
    <main className="min-h-screen">
      <div className="bg-ink text-paper font-mono text-[11px] tracking-[0.18em] uppercase">
        <div className="max-w-5xl mx-auto px-6 py-1.5 flex justify-between">
          <span>dashboard</span>
          <span className="hidden sm:inline">{profile.email}</span>
          <span>{profile.plan} plan</span>
        </div>
      </div>

      <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="font-display font-black text-2xl tracking-tight">
          VERDICT<span className="text-stamp-dead">.</span>
        </Link>
        <div className="flex items-center gap-6 font-mono text-sm">
          <Link href="/audit" className="hover:text-stamp-live transition-colors">domain audit</Link>
          <Link href="/bounce" className="hidden sm:inline hover:text-stamp-live transition-colors">bounce codes</Link>
          <AccountActions />
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-6 pt-4 pb-20">
        {/* Summary before detail: what is left today, and what the plan allows. */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="border-2 border-ink bg-card p-5 sm:col-span-2">
            <div className="font-mono text-[11px] tracking-[0.15em] uppercase text-ink-faint">
              today
            </div>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="font-display font-black text-4xl leading-none tabular-nums">
                {remaining}
              </span>
              <span className="font-mono text-sm text-ink-faint">
                of {limits.perDay.toLocaleString()} checks left
              </span>
            </div>
            <div className="h-2 bg-paper-deep mt-4">
              <div
                className="h-full transition-all"
                style={{
                  width: `${pct}%`,
                  background: remaining === 0
                    ? "var(--color-stamp-dead)"
                    : "var(--color-stamp-live)",
                }}
              />
            </div>
            <div className="font-mono text-[11px] text-ink-faint mt-2">
              Resets at midnight UTC.
            </div>
          </div>

          <div className="border-2 border-ink bg-card p-5">
            <div className="font-mono text-[11px] tracking-[0.15em] uppercase text-ink-faint">
              plan
            </div>
            <div className="font-display font-black text-3xl mt-2 capitalize leading-none">
              {profile.plan}
            </div>
            {pro ? (
              <p className="font-mono text-[11px] text-ink-soft mt-3 leading-relaxed">
                Bulk upload, API access, {limits.perDay.toLocaleString()} a day.
              </p>
            ) : (
              <Link
                href="/#pricing"
                className="inline-block mt-3 font-mono text-xs border border-ink px-3 py-2 hover:bg-ink hover:text-paper transition-colors"
              >
                Upgrade &rarr;
              </Link>
            )}
          </div>
        </div>

        <h2 className="font-display font-black text-2xl mt-10 mb-4">Verify</h2>
        <VerifyPanel canBatch={limits.csv} used={used} limit={limits.perDay} />

        <div className="grid md:grid-cols-2 gap-4 mt-10">
          <Link
            href="/audit"
            className="border-2 border-ink bg-card p-6 hover:shadow-[6px_6px_0_0_var(--color-stamp-live)] transition-shadow"
          >
            <h3 className="font-display font-black text-lg">Domain audit</h3>
            <p className="mt-2 text-sm text-ink-soft leading-relaxed">
              Grade any domain on SPF, DKIM, DMARC and MX, and find out whether
              someone else can send email as it. Free, unlimited, and every
              result gets a permanent link.
            </p>
            <span className="inline-block mt-4 font-mono text-xs border-b border-ink">
              Audit a domain &rarr;
            </span>
          </Link>

          <Link
            href="/clean"
            className="border-2 border-ink bg-card p-6 hover:shadow-[6px_6px_0_0_var(--color-stamp-live)] transition-shadow"
          >
            <h3 className="font-display font-black text-lg">Public list checker</h3>
            <p className="mt-2 text-sm text-ink-soft leading-relaxed">
              The no-signup version, for sharing with a colleague or a client
              who should not need your account to clean a list.
            </p>
            <span className="inline-block mt-4 font-mono text-xs border-b border-ink">
              Open the checker &rarr;
            </span>
          </Link>
        </div>

        <h2 className="font-display font-black text-2xl mt-10 mb-4">Automate</h2>
        <ApiKeys enabled={limits.api} />

        <div className="border-2 border-rule bg-card p-6 mt-4">
          <h3 className="font-display font-black text-lg">Run it on your own machine</h3>
          <p className="mt-2 text-sm text-ink-soft leading-relaxed">
            Confirming a mailbox needs an SMTP conversation on port 25, and
            every cloud host blocks it. Run the engine locally and the probe is
            real, your list never leaves the machine, and there is no limit at
            all.
          </p>
          <pre className="mt-4 bg-paper-deep border border-rule p-4 font-mono text-[11px] overflow-x-auto">
{`git clone https://github.com/omm9846/verdict.git
cd verdict/backend && pip install -r requirements.txt

python -m engine verify someone@example.com
python -m engine backtest bounced.csv`}
          </pre>
        </div>

        <p className="mt-10 font-mono text-[11px] text-ink-faint leading-relaxed">
          Signed in as {profile.email}. Questions go to{" "}
          <a href="mailto:hello@tryverdict.org" className="border-b border-ink-faint">
            hello@tryverdict.org
          </a>.
        </p>
      </section>
    </main>
  );
}
