import { NextResponse } from "next/server";
import { issueToken } from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://tryverdict.org";

// Per-IP throttle. In-memory is enough here: the cost of a missed limit is a
// few extra emails, and the real protection is that a link only ever reaches
// the address it was requested for.
const hits = new Map<string, number[]>();
const LIMIT = 5;
const WINDOW_MS = 15 * 60 * 1000;

function throttled(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export async function POST(req: Request) {
  let email = "";
  try {
    email = String((await req.json()).email ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "enter a valid email" }, { status: 400 });
  }

  const ip =
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    "unknown";
  if (throttled(ip)) {
    return NextResponse.json(
      { error: "too many requests. try again shortly." },
      { status: 429 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "sign-in is not configured" }, { status: 503 });
  }

  try {
    const token = await issueToken(email);
    const link = `${SITE}/api/auth/callback?token=${encodeURIComponent(token)}`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.WAITLIST_FROM ?? "Verdict <hello@tryverdict.org>",
        to: email,
        subject: "Your Verdict sign-in link",
        text:
          `Click to sign in:\n\n${link}\n\n`
          + `The link works once and expires in 15 minutes.\n\n`
          + `If you did not ask for this, ignore it. Nobody can sign in as you `
          + `without this email.\n`,
      }),
    });

    if (!res.ok) {
      console.error("auth email failed:", res.status, (await res.text()).slice(0, 200));
      return NextResponse.json({ error: "could not send the link" }, { status: 502 });
    }
  } catch (e) {
    console.error("auth request:", e);
    return NextResponse.json({ error: "something broke on our end" }, { status: 500 });
  }

  // Always the same response. Saying whether an address is registered would
  // turn this endpoint into a way to enumerate customers.
  return NextResponse.json({
    ok: true,
    message: "check your inbox for a sign-in link",
  });
}
