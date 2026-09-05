"use client";

import { useEffect, useState } from "react";

type Key = {
  id: number;
  label: string | null;
  created_at: string;
  last_used_at: string | null;
};

export function ApiKeys({ enabled }: { enabled: boolean }) {
  const [keys, setKeys] = useState<Key[]>([]);
  const [label, setLabel] = useState("");
  const [fresh, setFresh] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    fetch("/api/keys")
      .then((r) => r.json())
      .then((d) => setKeys(d.keys ?? []))
      .catch(() => {});
  }, [enabled]);

  async function create() {
    if (busy) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: label.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "could not create the key");
        return;
      }
      // Shown once. It is stored as a hash, so if this is lost the key is
      // gone and a new one has to be made.
      setFresh(data.key);
      setLabel("");
      const list = await (await fetch("/api/keys")).json();
      setKeys(list.keys ?? []);
    } catch {
      setErr("network error. try again.");
    } finally {
      setBusy(false);
    }
  }

  async function revoke(id: number) {
    await fetch("/api/keys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setKeys((k) => k.filter((x) => x.id !== id));
  }

  function copy() {
    if (!fresh) return;
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1500); };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(fresh).then(done, done);
    else done();
  }

  if (!enabled) {
    return (
      <div className="border-2 border-rule bg-card p-6">
        <h3 className="font-display font-black text-lg">API access</h3>
        <p className="mt-2 text-sm text-ink-soft leading-relaxed">
          Call the verifier from your own tooling with a bearer token. Available
          on the paid plan.
        </p>
      </div>
    );
  }

  return (
    <div className="border-2 border-ink bg-card p-6">
      <h3 className="font-display font-black text-lg">API keys</h3>
      <p className="mt-2 text-sm text-ink-soft leading-relaxed">
        A key is shown once, when you create it. We store only a hash, so we
        cannot show it again.
      </p>

      {fresh && (
        <div
          className="mt-4 border-2 p-4"
          style={{ borderColor: "var(--color-stamp-live)" }}
        >
          <div className="font-mono text-xs font-semibold mb-2">
            Copy this now. It will not be shown again.
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <code className="font-mono text-xs bg-paper-deep px-3 py-2 break-all flex-1 min-w-[200px]">
              {fresh}
            </code>
            <button
              type="button"
              onClick={copy}
              className="font-mono text-xs px-4 py-2 border border-ink hover:bg-ink hover:text-paper transition-colors"
            >
              {copied ? "copied" : "copy"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-2 flex-wrap">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="what is it for? e.g. clay waterfall"
          maxLength={40}
          className="flex-1 min-w-[200px] font-mono text-sm px-3 py-2.5 border border-rule bg-paper text-ink outline-none focus:border-ink"
        />
        <button
          type="button"
          onClick={create}
          disabled={busy}
          className="font-mono text-sm font-semibold px-5 py-2.5 bg-ink text-paper hover:bg-stamp-live transition-colors disabled:opacity-50"
        >
          {busy ? "creating..." : "New key"}
        </button>
      </div>

      {err && (
        <p className="mt-3 font-mono text-xs" style={{ color: "var(--color-stamp-dead)" }}>
          {err}
        </p>
      )}

      {keys.length > 0 && (
        <div className="mt-5 border-t border-rule">
          {keys.map((k) => (
            <div
              key={k.id}
              className="flex items-center gap-3 py-3 border-b border-rule last:border-b-0 flex-wrap"
            >
              <span className="font-mono text-sm flex-1 min-w-[120px]">
                {k.label || "untitled"}
              </span>
              <span className="font-mono text-[11px] text-ink-faint">
                {k.last_used_at
                  ? `used ${new Date(k.last_used_at).toLocaleDateString()}`
                  : "never used"}
              </span>
              <button
                type="button"
                onClick={() => revoke(k.id)}
                className="font-mono text-[11px] border border-rule px-3 py-1.5 hover:border-ink transition-colors"
                style={{ color: "var(--color-stamp-dead)" }}
              >
                revoke
              </button>
            </div>
          ))}
        </div>
      )}

      <pre className="mt-5 bg-paper-deep border border-rule p-4 font-mono text-[11px] overflow-x-auto">
{`curl -X POST https://tryverdict.org/api/verify \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"emails":["someone@example.com"]}'`}
      </pre>
    </div>
  );
}
