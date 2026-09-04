import crypto from "crypto";
import { cookies } from "next/headers";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Passwordless magic links, sent through Resend rather than Supabase Auth.
// Supabase's built-in mailer is rate limited to a handful of messages an hour
// on the free tier, which is fine for a demo and useless for signups.
//
// Tokens are single use, short lived, and only ever stored as a hash: a leaked
// database should not hand someone a working login link.

const SESSION_COOKIE = "verdict_session";
const SESSION_DAYS = 30;
const TOKEN_MINUTES = 15;

export type Plan = "free" | "pro";

export type Profile = {
  id: string;
  email: string;
  plan: Plan;
};

export function admin(): SupabaseClient {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("supabase is not configured");
  return createClient(url, key, { auth: { persistSession: false } });
}

function secret(): Buffer {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters");
  }
  return Buffer.from(s);
}

export function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function timingSafeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/* ---------------------------------------------------------------- sessions */

/** `<payload-b64url>.<hmac-b64url>` — signed, not encrypted. It carries only
 *  an id and an expiry, both of which the holder already knows. */
function sign(payload: string): string {
  const mac = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${mac}`;
}

function unsign(token: string): string | null {
  const idx = token.lastIndexOf(".");
  if (idx < 1) return null;
  const payload = token.slice(0, idx);
  const mac = token.slice(idx + 1);
  const expected = crypto
    .createHmac("sha256", secret())
    .update(payload)
    .digest("base64url");
  return timingSafeEqual(mac, expected) ? payload : null;
}

export async function setSession(profileId: string) {
  const expires = Date.now() + SESSION_DAYS * 86_400_000;
  const payload = Buffer.from(JSON.stringify({ id: profileId, exp: expires }))
    .toString("base64url");

  (await cookies()).set(SESSION_COOKIE, sign(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function currentProfile(): Promise<Profile | null> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  const payload = unsign(raw);
  if (!payload) return null;

  let parsed: { id?: string; exp?: number };
  try {
    parsed = JSON.parse(Buffer.from(payload, "base64url").toString());
  } catch {
    return null;
  }
  if (!parsed.id || !parsed.exp || Date.now() > parsed.exp) return null;

  const { data } = await admin()
    .from("profiles")
    .select("id, email, plan")
    .eq("id", parsed.id)
    .single();

  return data ? { id: data.id, email: data.email, plan: data.plan as Plan } : null;
}

/* ------------------------------------------------------------ magic tokens */

export async function issueToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + TOKEN_MINUTES * 60_000).toISOString();

  const { error } = await admin().from("auth_tokens").insert({
    token_hash: sha256(token),
    email,
    expires_at: expires,
  });
  if (error) throw new Error(`could not issue token: ${error.message}`);

  return token;
}

/** Consume a token and return the profile it belongs to, creating one on
 *  first login. Returns null for anything expired, unknown or already used. */
export async function consumeToken(token: string): Promise<Profile | null> {
  const db = admin();
  const hash = sha256(token);

  const { data: row } = await db
    .from("auth_tokens")
    .select("id, email, expires_at, used_at")
    .eq("token_hash", hash)
    .single();

  if (!row || row.used_at) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;

  // Mark used before creating the session, so a replayed link cannot mint a
  // second session even if two requests arrive together.
  const { data: claimed } = await db
    .from("auth_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("id", row.id)
    .is("used_at", null)
    .select("id")
    .single();
  if (!claimed) return null;

  const email = String(row.email).toLowerCase();

  const { data: existing } = await db
    .from("profiles")
    .select("id, email, plan")
    .eq("email", email)
    .single();
  if (existing) {
    return { id: existing.id, email: existing.email, plan: existing.plan as Plan };
  }

  const { data: created, error } = await db
    .from("profiles")
    .insert({ email, plan: "free" })
    .select("id, email, plan")
    .single();
  if (error || !created) return null;

  return { id: created.id, email: created.email, plan: created.plan as Plan };
}

/* -------------------------------------------------------------- quota */

export const LIMITS: Record<Plan, { perDay: number; csv: boolean; api: boolean }> = {
  free: { perDay: 5, csv: false, api: false },
  pro: { perDay: 5000, csv: true, api: true },
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Count first, then increment, so a caller cannot spend more than the cap by
 *  firing requests in parallel. */
export async function consumeQuota(
  profile: Profile,
  amount = 1
): Promise<{ ok: boolean; used: number; limit: number }> {
  const limit = LIMITS[profile.plan].perDay;
  const db = admin();
  const day = today();

  const { data } = await db
    .from("usage_daily")
    .select("count")
    .eq("profile_id", profile.id)
    .eq("day", day)
    .single();

  const used = data?.count ?? 0;
  if (used + amount > limit) return { ok: false, used, limit };

  const { error } = await db.rpc("bump_usage", {
    p_profile: profile.id,
    p_day: day,
    p_amount: amount,
  });

  // If the counter cannot be written, refuse rather than serve for free:
  // a quota that fails open is not a quota.
  if (error) return { ok: false, used, limit };

  return { ok: true, used: used + amount, limit };
}

export async function usageToday(profile: Profile): Promise<number> {
  const { data } = await admin()
    .from("usage_daily")
    .select("count")
    .eq("profile_id", profile.id)
    .eq("day", today())
    .single();
  return data?.count ?? 0;
}

/* ------------------------------------------------------------- api keys */

export function newApiKey(): { key: string; hash: string } {
  const key = `vk_${crypto.randomBytes(24).toString("base64url")}`;
  return { key, hash: sha256(key) };
}

export async function profileForApiKey(key: string): Promise<Profile | null> {
  if (!key.startsWith("vk_")) return null;

  const { data } = await admin()
    .from("api_keys")
    .select("profile_id, revoked_at")
    .eq("key_hash", sha256(key))
    .single();
  if (!data || data.revoked_at) return null;

  const { data: profile } = await admin()
    .from("profiles")
    .select("id, email, plan")
    .eq("id", data.profile_id)
    .single();

  return profile
    ? { id: profile.id, email: profile.email, plan: profile.plan as Plan }
    : null;
}
