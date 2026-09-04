import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Sign in | Verdict",
  description: "Sign in to Verdict with a one-time link. No password to forget.",
};

export default function LoginPage() {
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
