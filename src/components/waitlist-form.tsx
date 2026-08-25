"use client";

import { useState } from "react";

export function WaitlistForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    try {
      const r = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const d = await r.json();
      if (r.ok) {
        setState("ok");
        setMessage(d.message || "you're in.");
      } else {
        setState("error");
        setMessage(d.error || "something went wrong.");
      }
    } catch {
      setState("error");
      setMessage("network error. try again.");
    }
  }

  if (state === "ok") {
    return (
      <div className={`font-mono text-sm px-4 py-3 border ${dark ? "border-stamp-live text-stamp-live" : "text-stamp-live"}`}>
        ✓ {message}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 font-mono text-sm bg-card border border-rule px-4 py-3 text-ink placeholder-ink-faint focus:outline-none focus:border-ink transition-colors"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="font-mono text-sm px-6 py-3 bg-ink text-paper hover:bg-stamp-live transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {state === "loading" ? "..." : "Get early access"}
        </button>
      </div>
      {state === "error" && (
        <p className="font-mono text-xs text-stamp-dead mt-2">{message}</p>
      )}
    </form>
  );
}