import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LIMITS, currentProfile, usageToday } from "@/lib/auth";
import { AccountActions } from "@/components/account-actions";

export const metadata: Metadata = {
  title: "Your account | Verdict",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const profile = await currentProfile();
  if (!profile) redirect("/login");

  const used = await usageToday(profile);
  const limits = LIMITS[profile.plan];
  const remaining = Math.max(0, limits.perDay - used);
  const pct = Math.min(100, (used / limits.perDay) * 100);

  return (
    <main className="min-h-screen">
      <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="font-display font-black text-2xl tracking-tight">
          VERDICT<span className="text-stamp-dead">.</span>
        </Link>
        <div className="flex items-center gap-6 font-mono text-sm">
          <Link href="/clean" className="hover:text-stamp-live transition-colors">check a list</Link>
          <AccountActions />
        </div>
      </nav>

      <section className="max-w-3xl mx-auto px-6 pt-10 pb-20">
        <p className="font-mono text-xs tracking-[0.25em] uppercase text-ink-faint mb-5">
          account
        </p>
        <h1 className="font-display font-black text-4xl leading-[1.05] tracking-tight">
          {profile.email}
        </h1>

        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          <div className="border-2 border-ink bg-card p-6">
            <div className="font-mono text-xs tracking-[0.15em] uppercase text-ink-faint">
              plan
            </div>
            <div className="font-display font-black text-3xl mt-2 capitalize">
              {profile.plan}
            </div>
            <div className="font-mono text-xs text-ink-soft mt-3">
              {profile.plan === "free"
                ? "5 verifications a day, one at a time."
                : "Batch upload, API access, higher cap."}
            </div>
          </div>

          <div className="border-2 border-ink bg-card p-6">
            <div className="font-mono text-xs tracking-[0.15em] uppercase text-ink-faint">
              today
            </div>
            <div className="font-display font-black text-3xl mt-2 tabular-nums">
              {used}<span className="text-ink-faint text-xl"> / {limits.perDay}</span>
            </div>
            <div className="h-2 bg-paper-deep mt-3">
              <div
                className="h-full"
                style={{
                  width: `${pct}%`,
                  background: remaining === 0
                    ? "var(--color-stamp-dead)"
                    : "var(--color-stamp-live)",
                }}
              />
            </div>
            <div className="font-mono text-xs text-ink-soft mt-2">
              {remaining} left. Resets at midnight UTC.
            </div>
          </div>
        </div>

        {profile.plan === "free" && (
          <div className="mt-6 border-2 border-ink bg-card p-7">
            <h2 className="font-display font-black text-xl mb-3">
              What the paid plan adds
            </h2>
            <ul className="space-y-2 font-mono text-sm text-ink-soft">
              <li>{LIMITS.pro.perDay.toLocaleString()} verifications a day</li>
              <li>CSV upload, so a whole list goes through at once</li>
              <li>An API key for your own tooling</li>
            </ul>
            <Link
              href="/#pricing"
              className="inline-block mt-6 bg-ink text-paper font-mono text-sm px-6 py-3 hover:bg-stamp-live transition-colors"
            >
              See the paid plan &rarr;
            </Link>
          </div>
        )}

        {limits.api && (
          <div className="mt-6 border-2 border-ink bg-card p-7">
            <h2 className="font-display font-black text-xl mb-2">API access</h2>
            <p className="text-ink-soft leading-relaxed mb-4">
              Send your key as a bearer token. A key is shown once when created
              and stored only as a hash, so we cannot show it again.
            </p>
            <pre className="bg-paper-deep border border-rule p-4 font-mono text-xs overflow-x-auto">
{`curl -X POST https://tryverdict.org/api/verify \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"emails":["someone@example.com"]}'`}
            </pre>
          </div>
        )}

        <p className="mt-10 font-mono text-xs text-ink-faint leading-relaxed">
          A verification asks the receiving mail server whether the mailbox
          exists. Where no probe is possible, the answer says so rather than
          guessing.
        </p>
      </section>
    </main>
  );
}
