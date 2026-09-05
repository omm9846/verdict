import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Sign in | Verdict",
  description: "Sign in to Verdict with a one-time link. No password to forget.",
};

const ERRORS: Record<string, string> = {
  missing: "That link had no token in it. Ask for a new one.",
  expired: "That link has expired or was already used. Ask for a new one.",
  google_not_configured: "Google sign-in is not configured yet.",
  google_denied: "Google sign-in was cancelled.",
  state_missing: "The sign-in took too long and had to start over.",
  state_mismatch: "That sign-in could not be verified. Please start again.",
  google_exchange: "Google rejected the sign-in. This usually means the OAuth client is misconfigured.",
  google_no_token: "Google did not return an identity token.",
  google_unverified: "That Google account has no verified email address.",
  google_wrong_audience: "That sign-in was issued for a different application.",
  google_failed: "Google sign-in failed. Please try again.",
  profile_failed: "We could not create your account. Please try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message = error ? (ERRORS[error] ?? "Sign-in failed. Please try again.") : null;

  return (
    <main className="min-h-screen">
      <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="font-display font-black text-2xl tracking-tight">
          VERDICT<span className="text-stamp-dead">.</span>
        </Link>
        <Link href="/clean" className="font-mono text-sm hover:text-stamp-live transition-colors">
          check a list
        </Link>
      </nav>

      <section className="max-w-md mx-auto px-6 pt-16 pb-24">
        <p className="font-mono text-xs tracking-[0.25em] uppercase text-ink-faint mb-5">
          sign in
        </p>
        <h1 className="font-display font-black text-4xl leading-[1.05] tracking-tight">
          No password.
        </h1>
        <p className="mt-5 text-ink-soft leading-relaxed">
          Enter your address and we send a link that signs you in. It works once
          and expires in fifteen minutes.
        </p>

        {message && (
          <div
            className="mt-8 border-2 p-4 font-mono text-sm"
            style={{ borderColor: "var(--color-stamp-dead)" }}
          >
            {message}
            <div className="text-ink-faint text-xs mt-2">code: {error}</div>
          </div>
        )}

        <div className="mt-8">
          <LoginForm />
        </div>

        <p className="mt-8 font-mono text-xs text-ink-faint leading-relaxed">
          Free accounts verify 5 addresses a day. The paid plan raises the cap
          and adds CSV upload and API access.
        </p>
      </section>
    </main>
  );
}
