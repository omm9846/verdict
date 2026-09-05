import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import { admin, setSession } from "@/lib/auth";
import { STATE_COOKIE } from "../route";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://tryverdict.org";

function fail(reason: string) {
  return NextResponse.redirect(`${SITE}/login?error=${reason}`);
}

export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return fail("google_not_configured");

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return fail("google_denied");

  // CSRF check. The cookie is consumed either way, so a state value cannot be
  // replayed against a second attempt.
  const jar = await cookies();
  const expected = jar.get(STATE_COOKIE)?.value;
  jar.delete(STATE_COOKIE);

  if (!expected) return fail("state_missing");
  const a = Buffer.from(state);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return fail("state_mismatch");
  }

  let email: string;
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${url.origin}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });
    if (!res.ok) {
      console.error("google token exchange:", res.status, (await res.text()).slice(0, 200));
      return fail("google_exchange");
    }

    const { id_token } = (await res.json()) as { id_token?: string };
    if (!id_token) return fail("google_no_token");

    // The token came straight from Google's token endpoint over TLS, in
    // response to a code we just issued, so the claims can be read directly.
    // A token arriving from anywhere else would need its signature checked
    // against Google's JWKS first.
    const payload = JSON.parse(
      Buffer.from(id_token.split(".")[1], "base64url").toString()
    ) as { email?: string; email_verified?: boolean | string; aud?: string };

    // An unverified address would let someone claim an account by signing up
    // to Google with an address they do not control.
    const verified =
      payload.email_verified === true || payload.email_verified === "true";
    if (!payload.email || !verified) return fail("google_unverified");
    if (payload.aud !== clientId) return fail("google_wrong_audience");

    email = payload.email.toLowerCase();
  } catch (e) {
    console.error("google callback:", e);
    return fail("google_failed");
  }

  // Same profiles table as the magic link, so one person is one account
  // however they signed in, and a Dodo payment on this address already
  // matches.
  const db = admin();
  const { data: existing } = await db
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  let profileId = existing?.id as string | undefined;
  if (!profileId) {
    const { data: created, error } = await db
      .from("profiles")
      .insert({ email, plan: "free" })
      .select("id")
      .single();
    if (error || !created) {
      console.error("google profile create:", error?.message);
      return fail("profile_failed");
    }
    profileId = created.id;
  }

  if (!profileId) return fail("profile_failed");
  await setSession(profileId);
  return NextResponse.redirect(`${SITE}/dashboard`);
}
