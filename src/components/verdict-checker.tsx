"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_ENGINE_URL || "https://verdict-engine-4g97.onrender.com";
const WAITLIST_API = "/api/waitlist";
const REPO = "https://github.com/omm9846/verdict";

type Check = { check: string; ok: boolean | null; detail: string };

type VerdictResult = {
  email?: string;
  verdict?: string;
  detail?: string;
  mx?: string | null;
  checks?: Check[];
  suggestion?: string;
  reason?: string;
};

// DEAD and RISKY are findings; PLAUSIBLE is deliberately not "valid" — DNS
// alone cannot confirm a mailbox exists, and saying otherwise is the lie the
// rest of the category tells.
const CHIP: Record<string, { color: string; label: string }> = {
  DEAD: { color: "#ff6b5e", label: "DEAD" },
  RISKY: { color: "#f0a850", label: "RISKY" },
  PLAUSIBLE: { color: "#2dd4a0", label: "NO OBJECTION" },
  UNKNOWN: { color: "#8b8b9e", label: "NO EVIDENCE" },
};

const CHECK_LABEL: Record<string, string> = {
  syntax: "address format",
  typo: "spelling",
  disposable: "burner domain",
  mx: "accepts mail",
  role_account: "reaches a person",
  gateway: "filtering gateway",
  provider: "provider type",
  spf: "SPF",
  dmarc: "DMARC",
};

// The wait is ~1-3s of real DNS work. Naming each step turns dead time into
// an explanation of what the engine actually does, which is more convincing
// than a spinner and costs nothing.
const PHASES = [
  "reading the address",
  "checking the spelling",
  "resolving the mail server",
  "reading SPF",
  "reading DMARC",
  "weighing it up",
];

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴",
                "⠦", "⠧", "⠇", "⠏"];

function Deliberating() {
  const [tick, setTick] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setTick((t) => t + 1), 90);
    return () => clearInterval(id);
  }, [reduced]);

  if (reduced) return <>deliberating...</>;

  // Phases advance every ~700ms and hold on the last one rather than looping,
  // so a slow response never looks like it restarted.
  const phase = PHASES[Math.min(Math.floor(tick / 8), PHASES.length - 1)];

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span aria-hidden="true" style={{ width: 9, display: "inline-block" }}>
        {FRAMES[tick % FRAMES.length]}
      </span>
      <span>{phase}</span>
    </span>
  );
}

export function VerdictChecker() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<VerdictResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [promptWaitlist, setPromptWaitlist] = useState(false);
  const [wlEmail, setWlEmail] = useState("");
  const [wlState, setWlState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [wlMsg, setWlMsg] = useState("");

  async function joinWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!wlEmail || wlState === "loading") return;
    setWlState("loading");
    try {
      const r = await fetch(WAITLIST_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: wlEmail, source: "checker" }),
      });
      const d = await r.json();
      if (r.ok) { setWlState("ok"); setWlMsg(d.message || "you're in."); }
      else { setWlState("error"); setWlMsg(d.error || "try again."); }
    } catch {
      setWlState("error");
      setWlMsg("network error. try again.");
    }
  }

  async function check(target?: string) {
    const addr = (target ?? email).trim();
    if (!addr || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const r = await fetch(`${API}/api/precheck`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: addr }),
      });
      setResult(await r.json());
      setPromptWaitlist(true);
    } catch {
      setResult({ reason: "engine unreachable — try again" });
    }
    setLoading(false);
  }

  const chip = CHIP[result?.verdict ?? ""] ?? { color: "#8b8b9e", label: result?.verdict ?? "" };

  return (
    <div style={{ width: "100%", maxWidth: 600 }}>
      <form
        onSubmit={(e) => { e.preventDefault(); check(); }}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="paste any email address..."
            style={{
              flex: 1,
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 16,
              padding: "14px 18px",
              border: `1px solid ${result ? chip.color : "#ddd"}`,
              background: "#fff",
              color: "#1a1a2e",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 14,
              fontWeight: 600,
              padding: "14px 28px",
              background: "#1a1a2e",
              color: "#fff",
              border: "none",
              cursor: loading ? "wait" : "pointer",
              whiteSpace: "nowrap",
              minWidth: 190,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {loading ? <Deliberating /> : "Rule on it →"}
          </button>
        </div>
      </form>

      {result?.reason && (
        <div style={{ marginTop: 12, fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: "#c0392b" }}>
          {result.reason}
        </div>
      )}

      {result?.verdict && (
        <div
          style={{
            marginTop: 14,
            border: `2px solid ${chip.color}`,
            fontFamily: "'IBM Plex Mono', monospace",
            background: "#fff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "14px 18px" }}>
            <span
              className="stamp"
              style={{ color: chip.color, borderColor: chip.color, fontSize: 13, padding: "4px 14px", whiteSpace: "nowrap" }}
            >
              {chip.label}
            </span>
            <span style={{ fontSize: 13, color: "#555", flex: 1, minWidth: 200 }}>{result.detail}</span>
          </div>

          {result.suggestion && (
            <div style={{ padding: "0 18px 14px" }}>
              <button
                type="button"
                onClick={() => { setEmail(result.suggestion!); check(result.suggestion!); }}
                style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 12,
                  padding: "7px 12px", background: "#faf8f5",
                  border: "1px dashed #1a1a2e", cursor: "pointer", color: "#1a1a2e",
                }}
              >
                try {result.suggestion} instead →
              </button>
            </div>
          )}

          {result.checks && result.checks.length > 0 && (
            <div style={{ borderTop: "1px solid #eee", padding: "10px 18px 14px" }}>
              {result.checks.map((c) => (
                <div
                  key={c.check}
                  style={{ display: "flex", gap: 10, fontSize: 12, padding: "3px 0", color: "#666" }}
                >
                  <span style={{ color: c.ok === false ? "#ff6b5e" : c.ok === null ? "#aaa" : "#2dd4a0", width: 12 }}>
                    {c.ok === false ? "✕" : c.ok === null ? "–" : "✓"}
                  </span>
                  <span style={{ width: 130, color: "#999" }}>{CHECK_LABEL[c.check] ?? c.check}</span>
                  <span style={{ flex: 1 }}>{c.detail}</span>
                </div>
              ))}
              {result.mx && (
                <div style={{ display: "flex", gap: 10, fontSize: 12, padding: "3px 0", color: "#666" }}>
                  <span style={{ width: 12, color: "#2dd4a0" }}>✓</span>
                  <span style={{ width: 130, color: "#999" }}>mail server</span>
                  <span style={{ flex: 1 }}>{result.mx}</span>
                </div>
              )}
            </div>
          )}

          <div style={{ borderTop: "1px solid #eee", padding: "11px 18px", background: "#faf8f5", fontSize: 11, color: "#777", lineHeight: 1.6 }}>
            That is every question DNS can answer. Whether this <em>specific</em> mailbox
            exists takes an SMTP probe — and no cloud host allows outbound port 25, ours
            included. So the gate runs on your machine, where your list stays.{" "}
            <a href={REPO} style={{ color: "#1a1a2e", textDecoration: "underline" }}>
              Run the full engine locally →
            </a>
          </div>
        </div>
      )}

      {promptWaitlist && wlState !== "ok" && (
        <div
          style={{
            marginTop: 16,
            padding: "16px 20px",
            border: "1px dashed #1a1a2e",
            background: "#faf8f5",
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            want the whole gate — batch checks, discovery, SMTP probes before send?
          </div>
          <form onSubmit={joinWaitlist} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              type="email"
              required
              value={wlEmail}
              onChange={(e) => setWlEmail(e.target.value)}
              placeholder={email || "your@email.com"}
              style={{
                flex: 1, minWidth: 160,
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 14, padding: "9px 14px", border: "1px solid #ddd",
              }}
            />
            <button
              type="submit"
              disabled={wlState === "loading"}
              style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600,
                padding: "9px 16px", background: "#1a1a2e", color: "#fff",
                border: "none", cursor: wlState === "loading" ? "wait" : "pointer",
              }}
            >
              {wlState === "loading" ? "..." : "Join the waitlist →"}
            </button>
          </form>
          {wlState === "error" && (
            <div style={{ fontSize: 11, color: "#c0392b", marginTop: 6 }}>{wlMsg}</div>
          )}
        </div>
      )}

      {wlState === "ok" && (
        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#2dd4a0", marginTop: 12 }}>
          {wlMsg}
        </p>
      )}

      <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#999", marginTop: 8 }}>
        free · no signup · nothing you type is stored
      </p>
    </div>
  );
}
