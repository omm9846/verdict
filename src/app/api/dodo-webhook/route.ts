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

  const email = String(
    (data.customer as Record<string, unknown> | undefined)?.email ??
      data.email ??
      ""
  ).toLowerCase();
  const ref = String(
    (data.metadata as Record<string, unknown> | undefined)?.ref ?? ""
  );

  const status = STATUS_FOR[type];
  if (!status) {
    // Unsubscribed or unrecognised event. Acknowledge it so Dodo does not
    // retry, but say so in the logs: silently discarding events is how you
    // find out months later that access was never revoked.
    console.log(`dodo ${type}: no handler, ignored`);
    return NextResponse.json({ received: true, handled: false });
  }

  console.log(
    `dodo ${type} -> ${status}: ${email || "unknown"}${ref ? ` ref=${ref}` : ""}`
  );

  // Never fail the webhook on a storage problem: Dodo retries on non-2xx, and
  // a retry storm over a logging failure is worse than a row we can reconcile
  // from their dashboard.
  void record(email, ref, type, status).catch((e) =>
    console.error("dodo webhook record:", e?.message ?? e)
  );

  return NextResponse.json({ received: true, handled: true });
}

// Access is a consequence of the event, not of the event being a payment.
// Mapping explicitly means a cancellation revokes rather than being ignored,
// which is the failure mode of only handling the happy path.
const STATUS_FOR: Record<string, "active" | "revoked" | "attention"> = {
  "payment.succeeded": "active",
  "subscription.active": "active",
  "subscription.renewed": "active",
  "subscription.unpaused": "active",

  "subscription.cancelled": "revoked",
  "subscription.expired": "revoked",
  "subscription.failed": "revoked",

  // Dunning: payment is failing but the subscription is not dead yet. Worth
  // an email to the customer rather than cutting them off.
  "payment.failed": "attention",
  "subscription.on_hold": "attention",
  "subscription.paused": "attention",
};

async function record(
  email: string,
  ref: string,
  type: string,
  status: string
) {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !email) return;

  const supabase = createClient(url, key);

  // Billing history: one row per event, so a replayed or out-of-order
  // delivery cannot silently rewrite what happened.
  const { error } = await supabase
    .from("customers")
    .insert({ email, ref: ref || null, event: type, status });
  if (error) console.error("customers insert:", error.message);

  if (status === "attention") return; // dunning is not a plan change

  const plan = status === "active" ? "pro" : "free";

  // The address on the payment may not be one that has signed in yet, so the
  // profile is created rather than only updated. Otherwise someone pays, signs
  // in for the first time afterwards, and lands on the free plan they just
  // paid to leave.
  const { error: planError } = await supabase
    .from("profiles")
    .upsert({ email, plan }, { onConflict: "email" });

  if (planError) {
    console.error(`plan update failed for ${email}:`, planError.message);
    return;
  }
  console.log(`plan set to ${plan} for ${email}`);
}
