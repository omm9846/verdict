import { NextResponse } from "next/server";
import { LIMITS, currentProfile, usageToday } from "@/lib/auth";

export async function GET() {
  const profile = await currentProfile();
  if (!profile) return NextResponse.json({ signedIn: false });

  const used = await usageToday(profile);
  const limits = LIMITS[profile.plan];

  return NextResponse.json({
    signedIn: true,
    email: profile.email,
    plan: profile.plan,
    usage: { used, limit: limits.perDay, remaining: Math.max(0, limits.perDay - used) },
    features: { csv: limits.csv, api: limits.api },
  });
}
