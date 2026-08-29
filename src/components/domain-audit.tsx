"use client";

import { useState } from "react";

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

const STATUS: Record<string, { color: string; mark: string; word: string }> = {
  pass: { color: "#2dd4a0", mark: "✓", word: "PASS" },
  warn: { color: "#f0a850", mark: "!", word: "WEAK" },
  fail: { color: "#ff6b5e", mark: "✕", word: "FAIL" },
  info: { color: "#8b8b9e", mark: "–", word: "INFO" },
};

const GRADE_COLOR: Record<string, string> = {
  A: "#2dd4a0", B: "#2dd4a0", C: "#f0a850", D: "#f0a850", F: "#ff6b5e",
};

export function DomainAudit() {
  const [domain, setDomain] = useState("");
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [copied, setCopied] = useState(false);
  const [sentMsg, setSentMsg] = useState("");

  function copyLink(d: string) {
    const url = `https://tryverdict.org/audit/${d}`;
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1500); };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(done, done);
    } else {
      done();
    }
  }

  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (!domain.trim() || loading) return;
    setLoading(true);
    setAudit(null);
    setErr("");
    setSent("idle");
    setCopied(false);
    try {
      const r = await fetch(`${API}/api/domain-audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim() }),
      });
      const d: Audit = await r.json();
      if (d.error) setErr(d.error);
      else setAudit(d);
    } catch {
      setErr("engine unreachable — try again in a moment");
    }
    setLoading(false);
  }

  async function emailReport(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || sent === "loading" || !audit) return;
    setSent("loading");
    try {
      const r = await fetch("/api/audit-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), audit }),
      });
      const d = await r.json();
      if (r.ok) { setSent("ok"); setSentMsg(d.message || "sent — check your inbox."); }
      else { setSent("error"); setSentMsg(d.error || "could not send. try again."); }
    } catch {
      setSent("error");
      setSentMsg("network error. try again.");
    }
  }

  const failing = audit?.checks?.filter((c) => c.status === "fail" || c.status === "warn") ?? [];

  return (
    <div style={{ width: "100%", maxWidth: 720, fontFamily: "'IBM Plex Mono', monospace" }}>
      <form onSubmit={run} style={{ display: "flex", gap: 10 }}>
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="yourcompany.com"
          required
          style={{
            flex: 1, fontFamily: "inherit", fontSize: 16, padding: "14px 18px",
            border: "1px solid #ddd", background: "#fff", color: "#1a1a2e",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            fontFamily: "inherit", fontSize: 14, fontWeight: 600,
            padding: "14px 28px", background: "#1a1a2e", color: "#fff",
            border: "none", cursor: loading ? "wait" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {loading ? "auditing..." : "Audit it →"}
        </button>
      </form>

      {err && (
        <p style={{ color: "#c0392b", fontSize: 13, marginTop: 12 }}>{err}</p>
      )}

      {audit?.checks && (
        <div style={{ marginTop: 20, border: "2px solid #1a1a2e", background: "#fff" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 20, padding: "20px 22px",
            borderBottom: "1px solid #eee", flexWrap: "wrap",
          }}>
            <div style={{
              fontFamily: "var(--font-display), Georgia, serif", fontWeight: 900,
              fontSize: 56, lineHeight: 1,
              color: GRADE_COLOR[audit.grade ?? "F"] ?? "#8b8b9e",
            }}>
              {audit.grade}
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 12, color: "#999", letterSpacing: "0.15em" }}>
                {audit.domain.toUpperCase()} · {audit.score}/100
              </div>
              <div style={{ fontSize: 15, color: "#1a1a2e", marginTop: 6, lineHeight: 1.5 }}>
                {audit.headline}
              </div>
            </div>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
            padding: "10px 22px", borderBottom: "1px solid #eee",
            background: "#faf8f5", fontSize: 12,
          }}>
            <span style={{ color: "#888" }}>permanent link</span>
            <a
              href={`/audit/${audit.domain}`}
              style={{ color: "#1a1a2e", fontWeight: 600, wordBreak: "break-all" }}
            >
              tryverdict.org/audit/{audit.domain}
            </a>
            <button
              type="button"
              onClick={() => copyLink(audit.domain)}
              style={{
                fontFamily: "inherit", fontSize: 11, padding: "4px 10px",
                border: "1px solid #ddd", background: "#fff", cursor: "pointer",
                color: copied ? "#2dd4a0" : "#1a1a2e", marginLeft: "auto",
              }}
            >
              {copied ? "copied" : "copy"}
            </button>
          </div>

          {audit.checks.map((c) => {
            const s = STATUS[c.status];
            return (
              <div key={c.id} style={{ padding: "14px 22px", borderBottom: "1px solid #f2f2f2" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                  <span style={{ color: s.color, width: 14, fontWeight: 700 }}>{s.mark}</span>
                  <span style={{ width: 84, fontWeight: 600, fontSize: 13 }}>{c.label}</span>
                  <span style={{
                    color: s.color, fontSize: 10, letterSpacing: "0.12em",
                    border: `1px solid ${s.color}`, padding: "1px 7px",
                  }}>{s.word}</span>
                </div>
                <div style={{ fontSize: 13, color: "#555", marginTop: 7, marginLeft: 26, lineHeight: 1.6 }}>
                  {c.detail}
                </div>
                {c.fix && c.status !== "pass" && (
                  <div style={{ fontSize: 12, color: "#1a1a2e", marginTop: 6, marginLeft: 26, background: "#faf8f5", padding: "7px 10px" }}>
                    <strong>Fix:</strong> {c.fix}
                  </div>
                )}
                {c.record && (
                  <div style={{ fontSize: 11, color: "#999", marginTop: 6, marginLeft: 26, wordBreak: "break-all" }}>
                    {c.record}
                  </div>
                )}
              </div>
            );
          })}

          {sent !== "ok" ? (
            <div style={{ padding: "18px 22px", background: "#faf8f5" }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                {failing.length > 0
                  ? `Email me the ${failing.length} fix${failing.length > 1 ? "es" : ""} for ${audit.domain}`
                  : `Email me this report for ${audit.domain}`}
              </div>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 10 }}>
                One email with the exact records to publish. Nothing else unless you ask.
              </div>
              <form onSubmit={emailReport} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@yourcompany.com"
                  style={{
                    flex: 1, minWidth: 180, fontFamily: "inherit", fontSize: 14,
                    padding: "10px 14px", border: "1px solid #ddd",
                  }}
                />
                <button
                  type="submit"
                  disabled={sent === "loading"}
                  style={{
                    fontFamily: "inherit", fontSize: 12, fontWeight: 600,
                    padding: "10px 18px", background: "#1a1a2e", color: "#fff",
                    border: "none", cursor: sent === "loading" ? "wait" : "pointer",
                  }}
                >
                  {sent === "loading" ? "sending..." : "Send it →"}
                </button>
              </form>
              {sent === "error" && (
                <div style={{ fontSize: 11, color: "#c0392b", marginTop: 6 }}>{sentMsg}</div>
              )}
            </div>
          ) : (
            <div style={{ padding: "18px 22px", background: "#faf8f5", fontSize: 13, color: "#2dd4a0" }}>
              {sentMsg}
            </div>
          )}
        </div>
      )}

      <p style={{ fontSize: 11, color: "#999", marginTop: 12, lineHeight: 1.7 }}>
        Public DNS only — nothing is sent to the domain, nothing is stored unless
        you ask for the report. DKIM selectors can&apos;t be enumerated from
        outside, so a &ldquo;not found&rdquo; there may just mean a custom selector.
      </p>
    </div>
  );
}
