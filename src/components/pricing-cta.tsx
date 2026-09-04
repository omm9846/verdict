"use client";

import { useEffect, useState } from "react";

const CHECKOUT = process.env.NEXT_PUBLIC_CHECKOUT_URL || "";
const REF_KEY = "verdict-ref";
const REF_WINDOW_DAYS = 60;

type Stored = { ref: string; at: number };

/** Remember who sent this visitor, so the sale can be attributed later.
 *
 *  Stored locally rather than server-side because attribution only has to
 *  survive until checkout, and a 60-day window matches the affiliate cookie
 *  we advertise. An expired or malformed entry is discarded rather than
 *  trusted.
 */
export function captureRef(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const fromUrl = new URLSearchParams(window.location.search).get("ref");
    if (fromUrl) {
      const clean = fromUrl.trim().slice(0, 64).replace(/[^a-zA-Z0-9_-]/g, "");
      if (clean) {
        localStorage.setItem(REF_KEY, JSON.stringify({ ref: clean, at: Date.now() }));
        return clean;
      }
    }

    const raw = localStorage.getItem(REF_KEY);
    if (!raw) return null;
    const stored: Stored = JSON.parse(raw);
    const ageDays = (Date.now() - stored.at) / 86_400_000;
    if (!stored.ref || ageDays > REF_WINDOW_DAYS) {
      localStorage.removeItem(REF_KEY);
      return null;
    }
    return stored.ref;
  } catch {
    return null;
  }
}

export function PricingCTA({
  label,
  href,
  featured,
  paid,
}: {
  label: string;
  href?: string;
  featured?: boolean;
  paid?: boolean;
}) {
  const [ref, setRef] = useState<string | null>(null);

  useEffect(() => {
    setRef(captureRef());
  }, []);

  const cls = `mt-8 w-full block text-center py-3 font-mono text-sm border transition-colors ${
    featured
      ? "bg-paper text-ink border-paper hover:bg-stamp-live hover:text-paper hover:border-stamp-live"
      : "border-ink hover:bg-ink hover:text-paper"
  }`;

  // The paid plan goes to checkout once one exists. Until then it collects an
  // address, which is the honest thing to do rather than a button that looks
  // live and does nothing.
  if (paid) {
    if (CHECKOUT) {
      const url = new URL(CHECKOUT);
      if (ref) url.searchParams.set("ref", ref);
      return (
        <a href={url.toString()} className={cls}>
          {label}
        </a>
      );
    }
    return (
      <a href="#waitlist" className={cls}>
        {label}
      </a>
    );
  }

  return (
    <a href={href ?? "https://github.com/omm9846/verdict"} className={cls}>
      {label}
    </a>
  );
}
