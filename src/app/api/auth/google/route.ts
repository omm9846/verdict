import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://tryverdict.org";
export const STATE_COOKIE = "verdict_oauth_state";

// Must match Google exactly, and must be identical in the token
// exchange. Deriving it from the request would vary by host.
export const REDIRECT_URI = `${SITE}/api/auth/google/callback`;

/** Start the Google flow.
 *
 *  The state value is random, stored in a short-lived httpOnly cookie, and
 *  compared on the way back. Without it, an attacker can hand someone a
 *  prepared callback URL and sign them into an account they do not own.
 */
export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(`${SITE}/login?error=google_not_configured`);
  }

  const state = crypto.randomBytes(24).toString("base64url");
  (await cookies()).set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "openid email",
    state,
    // We only ever need the email once, at sign-in, so there is no refresh
    // token to store and nothing to keep in sync afterwards.
    prompt: "select_account",
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  );
}
