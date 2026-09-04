import { NextResponse } from "next/server";
import { consumeToken, setSession } from "@/lib/auth";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://tryverdict.org";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(`${SITE}/login?error=missing`);
  }

  const profile = await consumeToken(token);
  if (!profile) {
    // Expired, already used, or never existed. All three get the same answer,
    // so a stale link cannot be distinguished from a forged one.
    return NextResponse.redirect(`${SITE}/login?error=expired`);
  }

  await setSession(profile.id);
  return NextResponse.redirect(`${SITE}/account`);
}
