import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Same shape as the waitlist throttle: per-IP, in-memory, deliberately small.
const hits = new Map<string, number[]>();
const RATE_LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= RATE_LIMIT) {
    hits.set(ip, list);
    return true;
  }
  list.push(now);
  hits.set(ip, list);
  return false;
}

type Check = {
  id: string;
  status: "pass" | "warn" | "fail" | "info";
  label: string;
  detail: string;
  fix?: string;
  record?: string;
};

type Audit = {
  domain?: string;
  score?: number;
  grade?: string;
  headline?: string;
  checks?: Check[];
};

export async function POST(req: Request) {
  let email = "";
  let audit: Audit = {};
  try {
    const body = await req.json();
    email = (body.email || "").trim().toLowerCase();
    audit = body.audit || {};
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "enter a valid email" }, { status: 400 });
  }
  if (!audit.domain || !Array.isArray(audit.checks)) {
    return NextResponse.json({ error: "run an audit first" }, { status: 400 });
  }

  const ip =
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "too many reports requested. try again later." },
      { status: 429 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "email not configured yet" }, { status: 503 });
  }

  const from = process.env.WAITLIST_FROM ?? "Verdict <hello@tryverdict.org>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: email,
      subject: `${audit.domain} — deliverability audit (${audit.grade}, ${audit.score}/100)`,
      text: renderReport(audit),
      headers: {
        "List-Unsubscribe": "<mailto:hello@tryverdict.org?subject=unsubscribe>",
      },
    }),
  });

  if (!res.ok) {
    console.error("audit report send:", res.status, (await res.text()).slice(0, 300));
    return NextResponse.json({ error: "could not send. try again." }, { status: 502 });
  }

  // Record the request so we can follow up, but never block the send on it.
  // The report is what they asked for; the row is for us.
  void storeLead(email, audit).catch((e) =>
    console.error("audit lead store:", e?.message ?? e)
  );

  return NextResponse.json({ ok: true, message: "sent — check your inbox." });
}

async function storeLead(email: string, audit: Audit) {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  const supabase = createClient(url, key);
  // Reuses the waitlist table so this needs no migration before launch.
  // A duplicate address is not an error here — they asked for a report, not
  // to join twice.
  await supabase.from("waitlist").insert({ email });
}

function renderReport(audit: Audit): string {
  const lines: string[] = [];
  lines.push(`Deliverability audit — ${audit.domain}`);
  lines.push("");
  lines.push(`Grade: ${audit.grade}  (${audit.score}/100)`);
  lines.push(audit.headline ?? "");
  lines.push("");
  lines.push("-".repeat(64));
  lines.push("");

  for (const c of audit.checks ?? []) {
    const mark =
      c.status === "pass" ? "PASS" :
      c.status === "warn" ? "WEAK" :
      c.status === "fail" ? "FAIL" : "INFO";
    lines.push(`[${mark}]  ${c.label}`);
    lines.push(`  ${c.detail}`);
    if (c.fix && c.status !== "pass") lines.push(`  Fix: ${c.fix}`);
    if (c.record) lines.push(`  Current: ${c.record}`);
    lines.push("");
  }

  lines.push("-".repeat(64));
  lines.push("");
  lines.push("Why this matters: DMARC decides whether someone else can send");
  lines.push("mail as you. SPF and DKIM decide whether your own mail is");
  lines.push("trusted. All three are DNS records — no software to install.");
  lines.push("");
  lines.push("This audit reads public DNS only. It cannot tell you whether an");
  lines.push("individual mailbox exists; that needs an SMTP probe, and no");
  lines.push("cloud host permits outbound port 25. That's why our engine is");
  lines.push("MIT and runs on your own machine, where your list stays:");
  lines.push("");
  lines.push("  https://github.com/omm9846/verdict");
  lines.push("");
  lines.push("- Om");
  lines.push("  hello@tryverdict.org");
  lines.push("");
  lines.push('Reply "unsubscribe" and you will not hear from us again.');
  return lines.join("\n");
}
