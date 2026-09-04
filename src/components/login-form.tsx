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
    <div className="font-mono">
      <a
        href="/api/auth/google"
        className="w-full flex items-center justify-center gap-3 border border-ink bg-card text-ink text-sm py-3.5 hover:bg-paper-deep transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
          <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
          <path fill="#FBBC05" d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.96H.96a9 9 0 0 0 0 8.08l3.01-2.32Z" />
          <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.32C4.68 5.16 6.66 3.58 9 3.58Z" />
        </svg>
        Continue with Google
      </a>

      <div className="flex items-center gap-3 my-5 text-xs text-ink-faint">
        <div className="h-px flex-1 bg-rule" />
        or
        <div className="h-px flex-1 bg-rule" />
      </div>

      <form onSubmit={submit}>
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
    </div>
  );
}
