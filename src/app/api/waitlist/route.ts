import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  let email = "";
  try {
    const body = await req.json();
    email = (body.email || "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
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
  const { error } = await supabase
    .from("waitlist")
    .insert({ email, source: "landing" });

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