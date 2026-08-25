"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_ENGINE_URL || "https://verdict-engine-4g97.onrender.com";

type VerdictResult = {
  ok?: boolean;
  email?: string;
  verdict?: string;
  detail?: string;
  reason?: string;
};

export function VerdictChecker() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<VerdictResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const r = await fetch(`${API}/api/gate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, person: "you", firm: "", domain: email.split("@")[1] }),
      });
      const d = await r.json();
      setResult(d);
    } catch {
      setResult({ reason: "engine unreachable — try again" });
    }
    setLoading(false);
  }

  const chipColor =
    result?.verdict === "SEND" ? "#2dd4a0"
    : result?.verdict === "DEAD" ? "#ff6b5e"
    : "#f0a850";

  const friendlyLabel =
    result?.verdict === "UNKNOWN"
      ? "CAN'T AUTO-CHECK (server refused — try a different email or contact us)"
      : result?.verdict === "CATCHALL"
      ? "DOMAIN ACCEPTS ALL ADDRESSES (can't confirm individually)"
      : (result?.verdict || "CHECKING").toUpperCase();

  return (
    <div style={{ width: "100%", maxWidth: 600 }}>
      <form onSubmit={check} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
              border: `1px solid ${result ? chipColor : "#ddd"}`,
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
            }}
          >
            {loading ? "probing..." : "Check it →"}
          </button>
        </div>

        {result && (
          <div
            style={{
              marginTop: 12,
              padding: "14px 20px",
              border: `2px solid ${chipColor}`,
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 15,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <span
              className="stamp"
              style={{
                color: chipColor,
                borderColor: chipColor,
                fontSize: 13,
                padding: "4px 14px",
                whiteSpace: "nowrap",
              }}
            >
              {(friendlyLabel || "CHECKING").toUpperCase()}
            </span>
            <span style={{ color: "#555" }}>{result.email}</span>
            {result.detail && (
              <span style={{ color: "#999", fontSize: 12 }}>({result.detail.slice(0, 40)})</span>
            )}
          </div>
        )}
      </form>
      <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#999", marginTop: 8 }}>
        free · no signup · probes over SMTP, catch-all aware
      </p>
    </div>
  );
}