import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify emails inside Clay — HTTP API enrichment | Verdict",
  description:
    "Add Verdict as an HTTP API enrichment in Clay and check every address in "
    + "your table before it reaches a sequence. 25 a day free with no signup, "
    + "an API key for volume.",
  keywords: [
    "clay email verification",
    "clay http api enrichment",
    "clay verify email column",
    "clay waterfall email validation",
  ],
  alternates: { canonical: "https://tryverdict.org/integrations/clay" },
};

const FIELDS: [string, string][] = [
  ["verdict", "DEAD, RISKY, PLAUSIBLE or UNKNOWN"],
  ["sendable", "false only when the address is definitely dead"],
  ["definitely_dead", "the domain cannot receive mail at all"],
  ["reason", "why, in a sentence"],
  ["looks_like_typo", "one character from a real provider"],
  ["did_you_mean", "the address it was probably meant to be"],
  ["is_role_account", "info@, sales@ and friends — a shared inbox"],
  ["is_disposable", "a burner provider"],
  ["behind_gateway", "Mimecast, Proofpoint and similar"],
  ["domain_accepts_mail", "the domain has a working mail server"],
  ["has_spf", "the domain publishes SPF"],
  ["has_dmarc", "the domain publishes DMARC"],
  ["mx", "the mail server that answered"],
];

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[3rem_1fr] gap-4 py-7 border-b border-rule">
      <span className="font-display font-black text-3xl text-ink-faint leading-none">{n}</span>
      <div>
        <h3 className="font-display font-bold text-xl">{title}</h3>
        <div className="mt-3 space-y-3 text-ink-soft leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export default function ClayPage() {
  return (
    <main className="min-h-screen">
      <div className="bg-ink text-paper font-mono text-[11px] tracking-[0.18em] uppercase">
        <div className="max-w-6xl mx-auto px-6 py-1.5 flex justify-between">
          <span>integration</span>
          <span className="hidden sm:inline">25 a day, no key</span>
          <span>open source · MIT</span>
        </div>
      </div>

      <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="font-display font-black text-2xl tracking-tight">
          VERDICT<span className="text-stamp-dead">.</span>
        </Link>
        <div className="flex items-center gap-6 font-mono text-sm">
          <Link href="/clean" className="hover:text-stamp-live transition-colors">check a list</Link>
          <Link href="/alternatives" className="hover:text-stamp-live transition-colors">comparisons</Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-6 pt-8 pb-16">
        <p className="font-mono text-xs tracking-[0.25em] uppercase text-ink-faint mb-5">
          clay integration
        </p>
        <h1 className="font-display font-black text-4xl sm:text-5xl leading-[1.05] tracking-tight">
          Check every address in your Clay table.
        </h1>
        <p className="mt-6 text-lg text-ink-soft leading-relaxed">
          Your waterfall finds addresses. This tells you which of them can
          actually receive mail, before a single one reaches a sequence. It is
          an HTTP API enrichment, so there is nothing to install, and the
          first 25 rows a day need no key at all.
        </p>

        <div className="mt-10 border-2 border-ink bg-card">
          <div className="px-6 py-4 border-b border-rule font-mono text-xs tracking-[0.15em] uppercase text-ink-faint">
            setup, about two minutes
          </div>
          <div className="px-6">
            <Step n="1" title="Add the enrichment">
              <p>
                In your Clay table, click <strong>Add enrichment</strong>, search
                for <strong>HTTP API</strong>, and select it.
              </p>
            </Step>

            <Step n="2" title="Point it at the endpoint">
              <p>Method <strong>POST</strong>, and this URL:</p>
              <pre className="bg-paper-deep border border-rule p-4 font-mono text-sm overflow-x-auto">
https://tryverdict.org/api/enrich
              </pre>
              <p>
                Leave the headers empty for now. You get 25 enrichments a day
                without a key, which is enough to map the columns and run it
                down a test list before deciding anything.
              </p>
            </Step>

            <Step n="3" title="Send the email column">
              <p>
                In the <strong>Body</strong> field, type <code className="font-mono text-sm">/</code>{" "}
                to insert your email column, and wrap it in quotes so the JSON
                stays valid:
              </p>
              <pre className="bg-paper-deep border border-rule p-4 font-mono text-sm overflow-x-auto">
{`{ "email": "/Email" }`}
              </pre>
              <p className="text-sm">
                Replace <code className="font-mono text-sm">/Email</code> with
                whichever column holds the address.
              </p>
            </Step>

            <Step n="4" title="Map the fields you want">
              <p>
                Run it on one row first. Clay will show the response, and every
                field below is top-level, so each one maps straight to a column.
              </p>
            </Step>

            <Step n="5" title="Add your key before you run the table">
              <p>
                Past 25 rows a day the endpoint answers{" "}
                <code className="font-mono text-sm">429</code> instead of a
                verdict, which in Clay looks like an enrichment that silently
                stopped working. Add the header before you run a real table:
              </p>
              <pre className="bg-paper-deep border border-rule p-4 font-mono text-sm overflow-x-auto">
{`Authorization: Bearer vk_your_key_here`}
              </pre>
              <p className="text-sm">
                Keys live in your{" "}
                <Link href="/dashboard" className="border-b border-ink-faint">
                  dashboard
                </Link>
                . The response carries{" "}
                <code className="font-mono text-sm">remaining_today</code> so
                you can see what is left without guessing.
              </p>
            </Step>
          </div>
        </div>

        <h2 className="font-display font-black text-2xl mt-14 mb-4">What comes back</h2>
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-sm border-collapse min-w-[460px]">
            <thead>
              <tr className="border-b-2 border-ink text-left">
                <th className="py-2 pr-6 font-semibold">field</th>
                <th className="py-2 font-semibold">meaning</th>
              </tr>
            </thead>
            <tbody>
              {FIELDS.map(([field, meaning]) => (
                <tr key={field} className="border-b border-rule">
                  <td className="py-2.5 pr-6 whitespace-nowrap">{field}</td>
                  <td className="py-2.5 text-ink-soft">{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="font-display font-black text-2xl mt-14 mb-4">
          A filter worth getting right
        </h2>
        <p className="text-ink-soft leading-relaxed">
          Filter on <code className="font-mono text-sm">definitely_dead = false</code>{" "}
          rather than on a positive signal. Only a domain that cannot receive
          mail at all is a definite no. Everything else is a spectrum, and
          treating &ldquo;we could not confirm this&rdquo; as &ldquo;this is
          bad&rdquo; deletes contacts you could have reached.
        </p>
        <p className="text-ink-soft leading-relaxed mt-4">
          <code className="font-mono text-sm">looks_like_typo</code> is the one
          worth acting on immediately. A typosquatted domain has perfectly valid
          DNS, so every other signal says it is fine, while the mail goes to
          someone who registered the misspelling on purpose.
        </p>

        <div className="mt-12 border-2 border-ink bg-card p-7">
          <h2 className="font-display font-black text-xl mb-3">
            What this cannot tell you
          </h2>
          <p className="text-ink-soft leading-relaxed">
            Whether a specific mailbox exists. That needs an SMTP conversation
            on port 25, and every cloud provider blocks it, so no hosted
            enrichment can do it — ours included, and neither can the ones that
            say otherwise. The response carries{" "}
            <code className="font-mono text-sm">smtp_probed: false</code> so a
            workflow cannot quietly assume a mailbox was contacted.
          </p>
          <p className="text-ink-soft leading-relaxed mt-4">
            For a real probe, run the engine on your own machine. It is MIT
            licensed, and your list never leaves the machine it runs on.
          </p>
          <pre className="mt-4 bg-paper-deep border border-rule p-4 font-mono text-xs overflow-x-auto">
{`git clone https://github.com/omm9846/verdict.git
cd verdict/backend && pip install -r requirements.txt

python -m engine verify someone@example.com`}
          </pre>
        </div>

        <h2 className="font-display font-black text-2xl mt-14 mb-4">
          Running it on a real table
        </h2>
        <p className="text-ink-soft leading-relaxed">
          25 rows a day free, no signup, so you can decide whether the data is
          worth anything before you pay for it. Above that a key is{" "}
          <strong>$59 a month for 5,000 enrichments a day</strong>, which is
          more than most Clay tables will ever ask for.
        </p>
        <p className="text-ink-soft leading-relaxed mt-4">
          Worth being plain about what that money is doing: it pays for a
          machine with outbound port 25, which is the only way anyone can
          confirm an individual mailbox. Until that machine exists this
          endpoint is DNS tier for everybody, subscribers included, and it says
          so in every response. When it does exist, the same key starts
          returning real SMTP results at no extra cost.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/#pricing"
            className="font-mono text-sm border-2 border-ink px-5 py-2.5 hover:bg-ink hover:text-paper transition-colors"
          >
            see the plan
          </Link>
          <Link
            href="/dashboard"
            className="font-mono text-sm border-2 border-rule px-5 py-2.5 hover:border-ink transition-colors"
          >
            get a key
          </Link>
        </div>

        <h2 className="font-display font-black text-2xl mt-14 mb-4">
          Works the same anywhere
        </h2>
        <p className="text-ink-soft leading-relaxed">
          The endpoint takes one address and returns flat fields, which is the
          shape Zapier, Make and n8n want too. Same URL, same body, same
          response.
        </p>
        <pre className="mt-5 bg-paper-deep border border-rule p-4 font-mono text-xs overflow-x-auto">
{`curl -X POST https://tryverdict.org/api/enrich \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer vk_your_key_here" \\
  -d '{"email":"someone@example.com"}'`}
        </pre>

        <p className="mt-12 font-mono text-xs text-ink-faint leading-relaxed">
          Questions, or a field you need that is not here? Email{" "}
          <a href="mailto:hello@tryverdict.org" className="border-b border-ink-faint">
            hello@tryverdict.org
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
