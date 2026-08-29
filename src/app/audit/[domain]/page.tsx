import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DomainAudit } from "@/components/domain-audit";

const API = process.env.NEXT_PUBLIC_ENGINE_URL || "https://verdict-engine-4g97.onrender.com";

type Check = {
  id: string;
  status: "pass" | "warn" | "fail" | "info";
  label: string;
  detail: string;
  fix?: string;
  record?: string;
};

type Audit = {
  domain: string;
  score?: number;
  grade?: string;
  headline?: string;
  checks?: Check[];
  error?: string;
};

// Results change only when someone edits DNS, so a long cache costs nothing
// and keeps the page fast for the shared-link case it exists to serve.
export const revalidate = 21600;

const DOMAIN_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/;

async function getAudit(domain: string): Promise<Audit | null> {
  try {
    const r = await fetch(`${API}/api/domain-audit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain }),
      next: { revalidate },
    });
    if (!r.ok) return null;
    const d: Audit = await r.json();
    return d.error ? null : d;
  } catch {
    return null;
  }
}

function clean(raw: string): string {
  return decodeURIComponent(raw).trim().toLowerCase().replace(/^www\./, "");
}

export async function generateMetadata(
  { params }: { params: Promise<{ domain: string }> }
): Promise<Metadata> {
  const domain = clean((await params).domain);
  const audit = await getAudit(domain);

  const title = audit?.grade
    ? `${domain} scores ${audit.grade} on email spoofing protection`
    : `${domain} — email security audit`;
  const description = audit?.headline
    ? `${audit.headline} SPF, DKIM, DMARC and MX for ${domain}, graded ${audit.grade} (${audit.score}/100).`
    : `Check whether anyone can send email as ${domain}. Free SPF, DKIM and DMARC audit.`;

  return {
    title,
    description,
    alternates: { canonical: `https://tryverdict.org/audit/${domain}` },
    openGraph: { title, description, url: `https://tryverdict.org/audit/${domain}` },
  };
}

const STATUS: Record<string, { color: string; mark: string; word: string }> = {
  pass: { color: "var(--color-stamp-live)", mark: "✓", word: "PASS" },
  warn: { color: "var(--color-stamp-risky)", mark: "!", word: "WEAK" },
  fail: { color: "var(--color-stamp-dead)", mark: "✕", word: "FAIL" },
  info: { color: "var(--color-ink-faint)", mark: "–", word: "INFO" },
};

export default async function DomainAuditPage(
  { params }: { params: Promise<{ domain: string }> }
) {
  const domain = clean((await params).domain);
  if (!DOMAIN_RE.test(domain)) notFound();

  const audit = await getAudit(domain);
  const failing = audit?.checks?.filter((c) => c.status === "fail" || c.status === "warn") ?? [];

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
          <Link href="/audit" className="hover:text-stamp-live transition-colors">audit another</Link>
          <a
            href="https://github.com/omm9846/verdict"
            className="border border-ink px-3 py-1.5 hover:bg-ink hover:text-paper transition-colors"
          >
            GitHub
          </a>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-6 pt-8 pb-16">
        <p className="font-mono text-xs tracking-[0.25em] uppercase text-ink-faint mb-5">
          email security audit
        </p>

        {audit?.checks ? (
          <>
            <h1 className="font-display font-black text-4xl sm:text-5xl leading-[1.05] tracking-tight">
              Can anyone send email as {domain}?
            </h1>

            <div className="mt-8 flex items-center gap-7 flex-wrap border-2 border-ink bg-card p-7">
              <div
                className="font-display font-black leading-none"
                style={{ fontSize: 78 }}
              >
                {audit.grade}
              </div>
              <div className="flex-1 min-w-[240px]">
                <div className="font-mono text-xs tracking-[0.15em] text-ink-faint uppercase">
                  {domain} · {audit.score}/100
                </div>
                <p className="mt-2 text-lg leading-snug">{audit.headline}</p>
              </div>
            </div>

            <div className="mt-8 border border-rule">
              {audit.checks.map((c) => {
                const s = STATUS[c.status];
                return (
                  <div key={c.id} className="p-5 border-b border-rule last:border-b-0">
                    <div className="flex items-baseline gap-3 font-mono">
                      <span style={{ color: s.color }} className="font-bold w-4">{s.mark}</span>
                      <span className="font-semibold text-sm w-24">{c.label}</span>
                      <span
                        className="text-[10px] tracking-[0.12em] border px-2 py-0.5"
                        style={{ color: s.color, borderColor: s.color }}
                      >
                        {s.word}
                      </span>
                    </div>
                    <p className="mt-2 ml-7 text-ink-soft text-sm leading-relaxed">{c.detail}</p>
                    {c.fix && c.status !== "pass" && (
                      <p className="mt-2 ml-7 text-sm bg-paper-deep px-3 py-2 font-mono">
                        <strong>Fix:</strong> {c.fix}
                      </p>
                    )}
                    {c.record && (
                      <p className="mt-2 ml-7 font-mono text-[11px] text-ink-faint break-all">
                        {c.record}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {failing.length > 0 && (
              <p className="mt-6 font-mono text-sm text-ink-soft">
                {failing.length} thing{failing.length > 1 ? "s" : ""} to fix. Each one is
                a DNS record — no software to install.
              </p>
            )}
          </>
        ) : (
          <>
            <h1 className="font-display font-black text-4xl sm:text-5xl leading-[1.05] tracking-tight">
              Couldn&apos;t audit {domain}
            </h1>
            <p className="mt-5 text-ink-soft max-w-xl leading-relaxed">
              Either the domain doesn&apos;t resolve, or our engine was cold. Try it
              again below — the first request after an idle period can take a
              moment.
            </p>
          </>
        )}

        <div className="mt-14 border-t-2 border-ink pt-10">
          <h2 className="font-display font-black text-2xl mb-2">Audit another domain</h2>
          <p className="text-ink-soft mb-6 max-w-xl leading-relaxed">
            Free, no signup, public DNS only. Nothing is sent to the domain.
          </p>
          <DomainAudit />
        </div>
      </section>

      <section className="border-y-2 border-ink bg-paper-deep">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="font-display font-black text-2xl mb-4">
            Why DMARC decides this
          </h2>
          <p className="text-ink-soft leading-relaxed">
            SPF and DKIM describe who is allowed to send as your domain. DMARC is
            the record that tells receiving servers to actually act on that — and
            mails you a report when someone tries to forge you. Without it, the
            other two are documentation nobody is required to read, and a
            forged message from your domain is delivered like any other.
          </p>
          <p className="text-ink-soft leading-relaxed mt-4">
            A DMARC record set to <code className="font-mono text-sm">p=none</code> is
            monitoring only. It is the right place to start and the wrong place
            to stop.
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
