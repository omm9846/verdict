"use client";

import { useState } from "react";

type Result = {
  email: string;
  verdict: string;
  detail: string;
  suggestion?: string;
};

type Batch = {
  checked: number;
  summary: {
    unsendable: number;
    risky: number;
    no_objection: number;
    no_evidence: number;
    typos_found: number;
  };
  unsendable: { email: string; reason: string }[];
  typos: { email: string; did_you_mean: string }[];
  results: Result[];
  usage?: { used: number; limit: number };
  error?: string;
  upgradeAt?: string;
};

// PLAUSIBLE is deliberately not shown as "valid": DNS cannot confirm a mailbox
// exists, and every competitor labelling it that way is the reason this
// product exists.
const VERDICT: Record<string, { color: string; label: string }> = {
  DEAD: { color: "var(--color-stamp-dead)", label: "Cannot receive mail" },
  RISKY: { color: "var(--color-stamp-risky)", label: "Risky" },
  PLAUSIBLE: { color: "var(--color-stamp-live)", label: "No objection" },
  SEND: { color: "var(--color-stamp-live)", label: "Confirmed live" },
  CATCHALL: { color: "var(--color-stamp-risky)", label: "Unverifiable" },
  UNKNOWN: { color: "var(--color-ink-faint)", label: "No evidence" },
};

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

export function VerifyPanel({
  canBatch,
  used,
  limit,
}: {
  canBatch: boolean;
  used: number;
  limit: number;
}) {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [single, setSingle] = useState("");
  const [raw, setRaw] = useState("");
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [spent, setSpent] = useState(used);

  const found = Array.from(new Set((raw.match(EMAIL_RE) ?? []).map((a) => a.toLowerCase())));
  const remaining = Math.max(0, limit - spent);

  async function run(emails: string[]) {
    if (!emails.length || loading) return;
    setLoading(true);
    setErr("");
    setBatch(null);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      });
      const data: Batch = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "something went wrong");
        return;
      }
      setBatch(data);
      if (data.usage) setSpent(data.usage.used);
    } catch {
      setErr("could not reach the engine. try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Read in the browser; the file itself is never uploaded, only the
    // addresses found in it.
    setRaw(await file.text());
  }

  function downloadClean() {
    if (!batch) return;
    const bad = new Set(batch.unsendable.map((u) => u.email));
    const clean = batch.results.map((r) => r.email).filter((e) => !bad.has(e));
    const url = URL.createObjectURL(new Blob([clean.join("\n")], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "verified-list.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  const s = batch?.summary;

  return (
    <div className="border-2 border-ink bg-card">
      <div className="flex border-b border-rule">
        {(["single", "bulk"] as const).map((m) => {
          const locked = m === "bulk" && !canBatch;
          return (
            <button
              key={m}
              type="button"
              onClick={() => !locked && setMode(m)}
              className={`px-5 py-3 font-mono text-xs tracking-[0.12em] uppercase transition-colors ${
                mode === m
                  ? "bg-ink text-paper"
                  : locked
                    ? "text-ink-faint cursor-not-allowed"
                    : "hover:bg-paper-deep"
              }`}
            >
              {m === "single" ? "one address" : "a whole list"}
              {locked && " · pro"}
            </button>
          );
        })}
        <div className="ml-auto px-5 py-3 font-mono text-xs text-ink-faint tabular-nums self-center">
          {remaining} of {limit} left today
        </div>
      </div>

      <div className="p-6">
        {mode === "single" ? (
          <form
            onSubmit={(e) => { e.preventDefault(); run([single.trim()]); }}
            className="flex gap-3 flex-wrap"
          >
            <input
              type="email"
              required
              value={single}
              onChange={(e) => setSingle(e.target.value)}
              placeholder="someone@company.com"
              className="flex-1 min-w-[240px] font-mono text-base px-4 py-3 border border-rule bg-paper text-ink outline-none focus:border-ink"
            />
            <button
              type="submit"
              disabled={loading || remaining < 1}
              className="font-mono text-sm font-semibold px-6 py-3 bg-ink text-paper hover:bg-stamp-live transition-colors disabled:opacity-50"
            >
              {loading ? "checking..." : "Check it →"}
            </button>
          </form>
        ) : (
          <div>
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              rows={7}
              placeholder={"paste addresses, or drop an Apollo / Hunter / Clay export\n\none@example.com\ntwo@example.com"}
              className="w-full font-mono text-sm px-4 py-3 border border-rule bg-paper text-ink outline-none focus:border-ink resize-y"
            />
            <div className="flex gap-3 items-center flex-wrap mt-3">
              <button
                type="button"
                onClick={() => run(found.slice(0, remaining))}
                disabled={loading || !found.length || remaining < 1}
                className="font-mono text-sm font-semibold px-6 py-3 bg-ink text-paper hover:bg-stamp-live transition-colors disabled:opacity-50"
              >
                {loading ? "checking..." : `Check ${Math.min(found.length, remaining)} →`}
              </button>
              <label className="font-mono text-xs text-ink-faint border border-rule px-4 py-3 cursor-pointer hover:border-ink transition-colors">
                upload a CSV
                <input type="file" accept=".csv,.txt" onChange={onFile} className="hidden" />
              </label>
              <span className="font-mono text-xs text-ink-faint">
                {found.length
                  ? `${found.length} found${found.length > remaining ? `, ${remaining} will run` : ""}`
                  : "nothing pasted yet"}
              </span>
            </div>
          </div>
        )}

        {err && (
          <p className="mt-4 font-mono text-sm" style={{ color: "var(--color-stamp-dead)" }}>
            {err}
          </p>
        )}

        {batch && s && (
          <div className="mt-6 border border-rule">
            <div className="flex flex-wrap border-b border-rule">
              {[
                { n: s.unsendable, label: "cannot receive", color: "var(--color-stamp-dead)" },
                { n: s.typos_found, label: "look like typos", color: "var(--color-stamp-risky)" },
                { n: s.risky, label: "risky", color: "var(--color-stamp-risky)" },
                { n: s.no_objection, label: "no objection", color: "var(--color-stamp-live)" },
              ].map((x) => (
                <div key={x.label} className="flex-1 min-w-[130px] p-5 border-r border-rule last:border-r-0">
                  <div
                    className="font-display font-black text-3xl leading-none tabular-nums"
                    style={{ color: x.color }}
                  >
                    {x.n}
                  </div>
                  <div className="font-mono text-[11px] text-ink-faint mt-2">{x.label}</div>
                </div>
              ))}
            </div>

            {batch.results.length <= 1 ? (
              batch.results.map((r) => {
                const v = VERDICT[r.verdict] ?? { color: "var(--color-ink-faint)", label: r.verdict };
                return (
                  <div key={r.email} className="p-5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className="font-mono text-[11px] tracking-[0.12em] uppercase border px-3 py-1"
                        style={{ color: v.color, borderColor: v.color }}
                      >
                        {v.label}
                      </span>
                      <span className="font-mono text-sm">{r.email}</span>
                    </div>
                    <p className="mt-3 text-sm text-ink-soft leading-relaxed">{r.detail}</p>
                    {r.suggestion && (
                      <button
                        type="button"
                        onClick={() => { setSingle(r.suggestion!); run([r.suggestion!]); }}
                        className="mt-3 font-mono text-xs border border-dashed border-ink px-3 py-2 hover:bg-paper-deep"
                      >
                        try {r.suggestion} instead →
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <>
                {batch.unsendable.length > 0 && (
                  <div className="p-5 border-b border-rule">
                    <div className="font-mono text-xs font-semibold mb-2">
                      Remove these — the domain accepts no mail
                    </div>
                    {batch.unsendable.slice(0, 15).map((u) => (
                      <div key={u.email} className="font-mono text-xs text-ink-soft py-0.5">
                        <span style={{ color: "var(--color-stamp-dead)" }}>✕</span> {u.email}
                      </div>
                    ))}
                    {batch.unsendable.length > 15 && (
                      <div className="font-mono text-[11px] text-ink-faint mt-2">
                        and {batch.unsendable.length - 15} more
                      </div>
                    )}
                  </div>
                )}
                {batch.typos.length > 0 && (
                  <div className="p-5 border-b border-rule">
                    <div className="font-mono text-xs font-semibold mb-2">
                      One character from a real inbox
                    </div>
                    {batch.typos.slice(0, 15).map((t) => (
                      <div key={t.email} className="font-mono text-xs text-ink-soft py-0.5">
                        {t.email} <span className="text-ink-faint">→</span>{" "}
                        <strong className="text-ink">{t.did_you_mean}</strong>
                      </div>
                    ))}
                  </div>
                )}
                <div className="p-5 flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={downloadClean}
                    className="font-mono text-xs font-semibold px-4 py-2.5 bg-ink text-paper hover:bg-stamp-live transition-colors"
                  >
                    Download the cleaned list
                  </button>
                  <span className="font-mono text-xs text-ink-faint">
                    {batch.checked} checked, {s.unsendable} removed
                  </span>
                </div>
              </>
            )}

            <div className="px-5 py-3 bg-paper-deep border-t border-rule font-mono text-[11px] text-ink-faint leading-relaxed">
              Where no SMTP probe was possible, the result says so rather than
              guessing. &ldquo;No objection&rdquo; means the domain accepts mail,
              not that this mailbox exists.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
