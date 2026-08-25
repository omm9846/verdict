import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// simple in-memory IP throttle: 3 submissions per hour per IP
const hits = new Map<string, number[]>();
const RATE_LIMIT = 3;
const WINDOW_MS = 60 * 60 * 1000;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= RATE_LIMIT) {
    hits.set(ip, list);
    return true;
  }
  list.push(now);
  hits.set(ip, list);
  return false;
}

export async function POST(req: Request) {
  // honeypot: real users never fill this hidden field
  let email = "";
  let company = "";
  try {
    const body = await req.json();
    email = (body.email || "").trim().toLowerCase();
    company = (body.company || "").trim();
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  if (company) {
    // bot filled the honeypot — pretend success, store nothing
    return NextResponse.json({ ok: true, message: "you're in." });
  }

  const ip =
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "too many attempts. try again later." },
      { status: 429 }
    );
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "enter a valid email" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "waitlist not configured" }, { status: 500 });
  }

  const supabase = createClient(url, key);
  const { error } = await supabase.from("waitlist").insert({ email });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { ok: true, message: "you're already on the list" },
        { status: 200 }
      );
    }
    console.error("waitlist insert:", error.message);
    return NextResponse.json({ error: "something broke on our end" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    message: "you're in. we'll email you when hosted spots open.",
  });
}