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

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
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

  // Fire-and-forget confirmation. A signup that hears nothing back is a dead
  // end, and launch-day traffic is the worst possible time to be silent. This
  // must never be able to fail the signup itself: the row is already written,
  // and an email outage is not the visitor's problem.
  await sendConfirmation(email).catch((e) =>
    console.error("waitlist confirmation:", e?.message ?? e)
  );

  return NextResponse.json({
    ok: true,
    message: "you're in. check your inbox.",
  });
}

async function sendConfirmation(to: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.WAITLIST_FROM ?? "Verdict <hello@tryverdict.org>";
  if (!apiKey) return; // not configured yet; signups still work

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "You're on the Verdict list",
      text: CONFIRMATION,
      // Let recipients leave from their mail client. Costs nothing, and a
      // one-click unsubscribe beats a spam complaint every time.
      headers: { "List-Unsubscribe": `<mailto:${UNSUB}?subject=unsubscribe>` },
    }),
  });

  if (!res.ok) {
    throw new Error(`resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
}

const UNSUB = "hello@tryverdict.org";

const CONFIRMATION = `You're on the list.

Verdict is an open-source cold-outreach engine that verifies every mailbox
over SMTP before it ships, so dead addresses never reach your domain.

You don't have to wait for us to run it. It's MIT licensed and it runs on
your machine, which means your list is never uploaded anywhere:

  https://github.com/omm9846/verdict

One thing worth knowing while you're here: no cloud host allows outbound
port 25, ours included. That's why the checker on the site answers everything
DNS can prove and stops there, and why the real SMTP gate runs locally. Any
verifier claiming to confirm mailboxes from a browser is guessing.

We'll email you when hosted spots open. That's the only reason we'll email.

- Om
  hello@tryverdict.org

Reply "unsubscribe" and you're off the list, no hard feelings.
`;