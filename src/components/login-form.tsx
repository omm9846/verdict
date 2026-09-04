"use client";

import { useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || state === "sending") return;
    setState("sending");
    try {
      const res = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setState("sent");
        setMessage(data.message ?? "check your inbox");
      } else {
        setState("error");
        setMessage(data.error ?? "could not send the link");
      }
    } catch {
      setState("error");
      setMessage("network error. try again.");
    }
  }

  if (state === "sent") {
    return (
      <div
        className="border-2 p-6 font-mono text-sm"
        style={{ borderColor: "var(--color-stamp-live)" }}
      >
        <div className="font-semibold mb-2">Link sent</div>
        <p className="text-ink-soft leading-relaxed">
          Check <strong>{email}</strong>. The link works once and expires in
          fifteen minutes.
        </p>
        <button
          type="button"
          onClick={() => { setState("idle"); setMessage(""); }}
          className="mt-4 underline underline-offset-2 text-ink-faint hover:text-ink"
        >
          use a different address
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="font-mono">
      <label htmlFor="email" className="block text-xs text-ink-faint mb-2">
        your email
      </label>
      <input
        id="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        autoComplete="email"
        className="w-full text-base px-4 py-3.5 border border-rule bg-card text-ink outline-none focus:border-ink"
      />
      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-3 w-full bg-ink text-paper text-sm font-semibold py-3.5 hover:bg-stamp-live transition-colors disabled:opacity-60"
      >
        {state === "sending" ? "sending..." : "Email me a link →"}
      </button>
      {state === "error" && (
        <p className="mt-3 text-xs" style={{ color: "var(--color-stamp-dead)" }}>
          {message}
        </p>
      )}
    </form>
  );
}
