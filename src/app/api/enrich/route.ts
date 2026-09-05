import { NextResponse } from "next/server";
import {
  LIMITS,
  TRIAL_PER_DAY,
  clientIpHash,
  consumeQuota,
  consumeTrial,
  profileForApiKey,
} from "@/lib/auth";

const ENGINE =
  process.env.NEXT_PUBLIC_ENGINE_URL || "https://verdict-engine-4g97.onrender.com";

type Check = { check: string; ok: boolean | null; detail: string };

type Access =
  | { kind: "key"; plan: string; used: number; limit: number }
  | { kind: "trial"; used: number; limit: number };

/** Who is calling, and may they.
 *
 *  Three cases, in the order a real user meets them:
 *
 *    no key       a small daily allowance per IP, so the column can be mapped
 *                 and run down a test list before anyone pays
 *    free key     refused. A key is an account, and API access is what the
 *                 paid plan is for
 *    paid key     the plan's daily cap
 *
 *  Quota is charged before the engine is called. Refusing afterwards would
 *  hand out the work for free to anyone willing to ignore the status code.
 */
async function authorise(
  req: Request
): Promise<{ access: Access } | { error: NextResponse }> {
  const header = req.headers.get("authorization") ?? "";
  const raw = header.startsWith("Bearer ")
    ? header.slice(7).trim()
    : (req.headers.get("x-api-key") ?? "").trim();

  if (!raw) {
    const trial = await consumeTrial(clientIpHash(req));
    if (!trial.ok) {
      return {
        error: NextResponse.json(
          {
            error:
              `free trial used up (${trial.limit} enrichments a day). ` +
              `Add an API key to keep going.`,
            used: trial.used,
            limit: trial.limit,
            getKeyAt: "https://tryverdict.org/dashboard",
            upgradeAt: "https://tryverdict.org/#pricing",
          },
          { status: 429 }
        ),
      };
    }
    return { access: { kind: "trial", used: trial.used, limit: trial.limit } };
  }

  const profile = await profileForApiKey(raw);
  if (!profile) {
    return {
      error: NextResponse.json(
        { error: "that API key is not valid", getKeyAt: "https://tryverdict.org/dashboard" },
        { status: 401 }
      ),
    };
  }

  if (!LIMITS[profile.plan].api) {
    return {
      error: NextResponse.json(
        {
          error: "API access is on the paid plan",
          plan: profile.plan,
          upgradeAt: "https://tryverdict.org/#pricing",
        },
        { status: 403 }
      ),
    };
  }

  const quota = await consumeQuota(profile);
  if (!quota.ok) {
    return {
      error: NextResponse.json(
        {
          error: `daily limit reached (${quota.limit} a day on the ${profile.plan} plan)`,
          used: quota.used,
          limit: quota.limit,
        },
        { status: 429 }
      ),
    };
  }

  return {
    access: {
      kind: "key",
      plan: profile.plan,
      used: quota.used,
      limit: quota.limit,
    },
  };
}

/** One address in, flat fields out.
 *
 *  Clay, Zapier, Make and n8n all enrich a row at a time and map top-level
 *  JSON keys to columns. Nested objects and arrays cannot be mapped, so the
 *  batch endpoint's shape is unusable there however good the data is.
 */
export async function POST(req: Request) {
  let email = "";
  try {
    const body = await req.json();
    email = String(body.email ?? body.Email ?? "").trim();
  } catch {
    return NextResponse.json({ error: "send { \"email\": \"...\" }" }, { status: 400 });
  }

  if (!email) {
    return NextResponse.json({ error: "no email supplied" }, { status: 400 });
  }

  const gate = await authorise(req);
  if ("error" in gate) return gate.error;
  const { access } = gate;

  let data: {
    verdict?: string;
    detail?: string;
    mx?: string | null;
    suggestion?: string;
    checks?: Check[];
  };

  try {
    const res = await fetch(`${ENGINE}/api/precheck`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      return NextResponse.json({ error: "engine unavailable" }, { status: 502 });
    }
    data = await res.json();
  } catch {
    return NextResponse.json({ error: "engine unreachable" }, { status: 504 });
  }

  const check = (id: string) => data.checks?.find((c) => c.check === id);
  const verdict = data.verdict ?? "UNKNOWN";
  const remaining = Math.max(0, access.limit - access.used);

  return NextResponse.json(
    {
      email,
      verdict,

      // The field most people will filter on. Only DEAD is a definite no; an
      // address we could not probe is not the same as a bad one, and treating
      // it as one deletes reachable contacts.
      sendable: verdict !== "DEAD",
      definitely_dead: verdict === "DEAD",

      reason: data.detail ?? "",
      mx: data.mx ?? "",

      domain_accepts_mail: check("mx")?.ok === true,
      is_role_account: check("role_account")?.ok === false,
      is_disposable: check("disposable")?.ok === false,
      behind_gateway: check("gateway")?.ok === false,
      looks_like_typo: Boolean(data.suggestion),
      did_you_mean: data.suggestion ?? "",
      has_spf: check("spf")?.ok === true,
      has_dmarc: check("dmarc")?.ok === true,

      // Stated in the payload rather than only in the docs, so nobody builds a
      // workflow believing a mailbox was contacted when it was not.
      smtp_probed: false,
      note:
        "DNS tier. Confirms whether the domain can receive mail, catches typos "
        + "and burner domains. Confirming a specific mailbox needs an SMTP probe "
        + "on port 25, which no cloud host permits.",

      plan: access.kind === "key" ? access.plan : "trial",
      remaining_today: remaining,
    },
    {
      headers: {
        "X-RateLimit-Limit": String(access.limit),
        "X-RateLimit-Remaining": String(remaining),
      },
    }
  );
}

export async function GET() {
  return NextResponse.json({
    endpoint: "POST https://tryverdict.org/api/enrich",
    body: { email: "someone@example.com" },
    auth:
      `Authorization: Bearer vk_... (or x-api-key). ` +
      `${TRIAL_PER_DAY} calls a day without a key, so you can try it first.`,
    getKeyAt: "https://tryverdict.org/dashboard",
    docs: "https://tryverdict.org/integrations/clay",
  });
}
