import { NextResponse } from "next/server";
import {
  LIMITS,
  consumeQuota,
  currentProfile,
  profileForApiKey,
  type Profile,
} from "@/lib/auth";

const ENGINE =
  process.env.NEXT_PUBLIC_ENGINE_URL || "https://verdict-engine-4g97.onrender.com";
const MAX_BATCH = 500;

/** Session cookie for the GUI, bearer key for the API. Both resolve to the
 *  same profile, so quota and plan rules are enforced once rather than twice. */
async function authenticate(req: Request): Promise<Profile | null> {
  const header = req.headers.get("authorization") ?? "";
  if (header.startsWith("Bearer ")) {
    return profileForApiKey(header.slice(7).trim());
  }
  return currentProfile();
}

export async function POST(req: Request) {
  let emails: string[] = [];
  try {
    const body = await req.json();
    emails = Array.isArray(body.emails)
      ? body.emails
      : body.email
        ? [body.email]
        : [];
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  emails = emails
    .map((e) => String(e ?? "").trim())
    .filter(Boolean)
    .slice(0, MAX_BATCH);

  if (!emails.length) {
    return NextResponse.json({ error: "no addresses supplied" }, { status: 400 });
  }

  const profile = await authenticate(req);
  if (!profile) {
    return NextResponse.json(
      { error: "sign in to verify addresses", signInAt: "/login" },
      { status: 401 }
    );
  }

  const limits = LIMITS[profile.plan];

  // A batch is a plan feature, not just a bigger number: one address at a time
  // is what the free tier is for.
  if (emails.length > 1 && !limits.csv) {
    return NextResponse.json(
      {
        error: "batch verification is on the paid plan",
        plan: profile.plan,
        upgradeAt: "/#pricing",
      },
      { status: 403 }
    );
  }

  // Charge before doing the work. Refusing after spending the effort would
  // let a caller exhaust the engine for free.
  const quota = await consumeQuota(profile, emails.length);
  if (!quota.ok) {
    return NextResponse.json(
      {
        error: `daily limit reached (${quota.limit} a day on the ${profile.plan} plan)`,
        used: quota.used,
        limit: quota.limit,
        upgradeAt: "/#pricing",
      },
      { status: 429 }
    );
  }

  try {
    const res = await fetch(`${ENGINE}/api/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails }),
      signal: AbortSignal.timeout(60_000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "engine unavailable" }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({
      ...data,
      plan: profile.plan,
      usage: { used: quota.used, limit: quota.limit },
    });
  } catch {
    return NextResponse.json({ error: "engine unreachable" }, { status: 504 });
  }
}
