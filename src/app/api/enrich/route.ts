import { NextResponse } from "next/server";

const ENGINE =
  process.env.NEXT_PUBLIC_ENGINE_URL || "https://verdict-engine-4g97.onrender.com";

type Check = { check: string; ok: boolean | null; detail: string };

/** One address in, flat fields out.
 *
 *  Clay, Zapier, Make and n8n all enrich a row at a time and map top-level
 *  JSON keys to columns. Nested objects and arrays cannot be mapped, so the
 *  batch endpoint's shape is unusable there however good the data is.
 *
 *  Deliberately open, like /api/batch: an enrichment step that needs a key
 *  before anyone can see whether it is useful does not get adopted.
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

  return NextResponse.json({
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
  });
}

export async function GET() {
  return NextResponse.json({
    endpoint: "POST https://tryverdict.org/api/enrich",
    body: { email: "someone@example.com" },
    docs: "https://tryverdict.org/integrations/clay",
  });
}
