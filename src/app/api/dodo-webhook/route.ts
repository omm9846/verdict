import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// Dodo follows the Standard Webhooks spec: the signed content is
// `{id}.{timestamp}.{body}`, HMAC-SHA256 with the secret, base64 encoded, and
// the header carries one or more space-separated `v1,<sig>` values so a key
// can be rotated without downtime.
const TOLERANCE_SECONDS = 5 * 60;

function timingSafeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function verify(raw: string, headers: Headers, secret: string): string | null {
  const id = headers.get("webhook-id");
  const timestamp = headers.get("webhook-timestamp");
  const signature = headers.get("webhook-signature");
  if (!id || !timestamp || !signature) return "missing webhook headers";

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return "bad timestamp";
  // Reject replays of a request captured earlier, and requests from a clock
  // far enough out that the timestamp cannot be trusted.
  if (Math.abs(Date.now() / 1000 - ts) > TOLERANCE_SECONDS) {
    return "timestamp outside tolerance";
  }

  // The secret is distributed as whsec_<base64>; the bytes after the prefix
  // are the key.
  const key = secret.startsWith("whsec_")
    ? Buffer.from(secret.slice(6), "base64")
    : Buffer.from(secret);

  const expected = crypto
    .createHmac("sha256", key)
    .update(`${id}.${timestamp}.${raw}`)
    .digest("base64");

  const provided = signature
    .split(" ")
    .map((part) => (part.startsWith("v1,") ? part.slice(3) : null))
    .filter((v): v is string => Boolean(v));

  if (!provided.length) return "no v1 signature present";
  return provided.some((sig) => timingSafeEqual(sig, expected))
    ? null
    : "signature mismatch";
}

export async function POST(req: Request) {
  const secret = process.env.DODO_WEBHOOK_SECRET;
  if (!secret) {
    console.error("dodo webhook: DODO_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  // Signature covers the exact bytes sent, so the body must be read raw and
  // parsed only after verification.
  const raw = await req.text();
  const problem = verify(raw, req.headers, secret);
  if (problem) {
    console.warn("dodo webhook rejected:", problem);
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let event: { type?: string; data?: Record<string, unknown> };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const type = event.type ?? "";
  const data = event.data ?? {};

  // Only the events that mean money actually moved.
  if (type === "payment.succeeded" || type === "subscription.active") {
    const email = String(
      (data.customer as Record<string, unknown> | undefined)?.email ??
        data.email ??
        ""
    ).toLowerCase();
    const ref = String(
      (data.metadata as Record<string, unknown> | undefined)?.ref ?? ""
    );

    console.log(`dodo ${type}: ${email || "unknown"}${ref ? ` via ref=${ref}` : ""}`);

    // Record it, but never fail the webhook on a storage problem: Dodo retries
    // on a non-2xx, and a retry storm over a logging failure is worse than a
    // missing row we can reconcile from their dashboard.
    void record(email, ref, type).catch((e) =>
      console.error("dodo webhook record:", e?.message ?? e)
    );
  }

  return NextResponse.json({ received: true });
}

async function record(email: string, ref: string, type: string) {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !email) return;

  const supabase = createClient(url, key);
  const { error } = await supabase
    .from("customers")
    .insert({ email, ref: ref || null, event: type });

  // The table may not exist yet. Log it rather than throwing, so a first sale
  // is never lost to a missing migration.
  if (error) console.error("customers insert:", error.message);
}
