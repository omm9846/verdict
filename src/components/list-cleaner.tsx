"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_ENGINE_URL || "https://verdict-engine-4g97.onrender.com";
const MAX = 500;

type Result = {
  email: string;
  verdict: string;
  detail: string;
  suggestion?: string;
};

type Batch = {
  checked: number;
  truncated_at: number | null;
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
  error?: string;
};

export function ListCleaner() {
  const [raw, setRaw] = useState("");
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const addresses = Array.from(
    new Set((raw.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) ?? [])
      .map((a) => a.toLowerCase()))
  );

  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (!addresses.length || loading) return;
    setLoading(true);
    setBatch(null);
    setErr("");
    try {
      const r = await fetch(`${API}/api/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: addresses.slice(0, MAX) }),
      });
      const d: Batch = await r.json();
      if (d.error) setErr(d.error);
      else setBatch(d);
    } catch {
      setErr("engine unreachable, try again in a moment");
    }
    setLoading(false);
  }

  function downloadClean() {
    if (!batch) return;
    const bad = new Set(batch.unsendable.map((u) => u.email));
    const clean = batch.results
      .filter((r) => !bad.has(r.email))
      .map((r) => r.email)
      .join("\n");
    const url = URL.createObjectURL(new Blob([clean], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "clean-list.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  const s = batch?.summary;

  return (
    <div style={{ width: "100%", maxWidth: 760, fontFamily: "'IBM Plex Mono', monospace" }}>
      <form onSubmit={run}>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={"paste your list here\n\none@example.com\ntwo@example.com\n\nor paste a whole CSV, we pull the addresses out"}
          rows={9}
          style={{
            width: "100%", fontFamily: "inherit", fontSize: 14,
            padding: "14px 16px", border: "1px solid #ddd", background: "#fff",
            color: "#1a1a2e", outline: "none", resize: "vertical",
          }}
        />
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
          <button
            type="submit"
            disabled={loading || !addresses.length}
            style={{
              fontFamily: "inherit", fontSize: 14, fontWeight: 600,
              padding: "13px 26px", background: "#1a1a2e", color: "#fff",
              border: "none", cursor: loading || !addresses.length ? "not-allowed" : "pointer",
              opacity: !addresses.length ? 0.45 : 1,
            }}
          >
            {loading ? "checking..." : "Check the list →"}
          </button>
          <span style={{ fontSize: 12, color: "#888" }}>
            {addresses.length
              ? `${addresses.length} address${addresses.length === 1 ? "" : "es"} found${addresses.length > MAX ? `, first ${MAX} checked` : ""}`
              : "no addresses yet"}
          </span>
        </div>
      </form>

      {err && <p style={{ color: "#c0392b", fontSize: 13, marginTop: 12 }}>{err}</p>}

      {s && (
        <div style={{ marginTop: 22, border: "2px solid #1a1a2e", background: "#fff" }}>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {[
              { n: s.unsendable, label: "cannot receive mail", color: "#ff6b5e" },
              { n: s.typos_found, label: "look like typos", color: "#f0a850" },
              { n: s.risky, label: "gateway or role", color: "#f0a850" },
              { n: s.no_objection, label: "no objection", color: "#2dd4a0" },
            ].map((x) => (
              <div key={x.label} style={{ flex: "1 1 150px", padding: "18px 20px", borderRight: "1px solid #eee", borderBottom: "1px solid #eee" }}>
                <div style={{ fontFamily: "var(--font-display), Georgia, serif", fontWeight: 900, fontSize: 32, lineHeight: 1, color: x.color }}>
                  {x.n}
                </div>
                <div style={{ fontSize: 11, color: "#777", marginTop: 6 }}>{x.label}</div>
              </div>
            ))}
          </div>

          {batch.unsendable.length > 0 && (
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #eee" }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                Remove these. The domain accepts no mail at all.
              </div>
              {batch.unsendable.slice(0, 12).map((u) => (
                <div key={u.email} style={{ fontSize: 12, color: "#555", padding: "2px 0" }}>
                  <span style={{ color: "#ff6b5e" }}>✕</span> {u.email}
                </div>
              ))}
              {batch.unsendable.length > 12 && (
                <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
                  and {batch.unsendable.length - 12} more
                </div>
              )}
            </div>
          )}

          {batch.typos.length > 0 && (
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #eee" }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                One character from a real inbox
              </div>
              {batch.typos.slice(0, 12).map((t) => (
                <div key={t.email} style={{ fontSize: 12, color: "#555", padding: "2px 0" }}>
                  {t.email} <span style={{ color: "#999" }}>&rarr;</span>{" "}
                  <strong>{t.did_you_mean}</strong>
                </div>
              ))}
            </div>
          )}

          <div style={{ padding: "16px 20px", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button
              type="button"
              onClick={downloadClean}
              style={{
                fontFamily: "inherit", fontSize: 12, fontWeight: 600,
                padding: "9px 16px", background: "#1a1a2e", color: "#fff",
                border: "none", cursor: "pointer",
              }}
            >
              Download the cleaned list
            </button>
            <span style={{ fontSize: 11, color: "#888" }}>
              {batch.checked} checked, {s.unsendable} removed
            </span>
          </div>

          <div style={{ padding: "13px 20px", background: "#faf8f5", fontSize: 11, color: "#777", lineHeight: 1.7, borderTop: "1px solid #eee" }}>
            That is everything DNS can prove. Whether an individual mailbox
            exists needs an SMTP probe on port 25, and no cloud host allows one,
            ours included. For that, run it on your own machine against your
            last campaign&apos;s bounce list:{" "}
            <code style={{ background: "#fff", padding: "1px 5px" }}>
              python -m engine backtest bounced.csv
            </code>
          </div>
        </div>
      )}

      <p style={{ fontSize: 11, color: "#999", marginTop: 12, lineHeight: 1.7 }}>
        Free, no signup, up to {MAX} addresses a go. Nothing you paste is stored.
      </p>
    </div>
  );
}
