import { NextResponse } from "next/server";

const ENGINE =
  process.env.NEXT_PUBLIC_ENGINE_URL || "https://verdict-engine-4g97.onrender.com";

const DOMAIN_RE =
  /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/;

/** The live grade badge.
 *
 *  This is the viral unit. A firm embeds
 *  <img src="https://tryverdict.org/badge/theirdomain.com.svg"> on its site,
 *  and every visitor sees a grade that Verdict issued and re-checks, not one
 *  the firm typed. It is the whole reason the seal is worth anything: the
 *  engine is MIT and the methodology is public, so unlike a closed vendor's
 *  seal, this one cannot be bought or faked.
 *
 *  Deliberately image-only-for-the-web. Cold email strips images, so the
 *  outbound credential is a plain-text line (shown on the /audit page), never
 *  this SVG. Putting a remote image in a cold email would hurt the exact
 *  deliverability the badge claims to certify.
 */

type Audit = { grade?: string; score?: number; error?: string };

function clean(raw: string): string {
  return decodeURIComponent(raw)
    .trim()
    .toLowerCase()
    .replace(/\.svg$/, "")
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0];
}

async function getAudit(domain: string): Promise<Audit | null> {
  try {
    const r = await fetch(`${ENGINE}/api/domain-audit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!r.ok) return null;
    return (await r.json()) as Audit;
  } catch {
    return null;
  }
}

// Grade to the right-hand segment. Only A and B read as an endorsement; a firm
// self-selects out of embedding anything lower, which is the correct behaviour
// - the badge is earned by fixing DNS, not by asking for it.
function segment(grade?: string, score?: number): { word: string; color: string } {
  const g = (grade ?? "").toUpperCase();
  if (g === "A" || (score ?? 0) >= 90) return { word: "clean", color: "#1f9d74" };
  if (g === "B" || (score ?? 0) >= 75) return { word: "clean", color: "#2ea043" };
  if (g === "C" || (score ?? 0) >= 60) return { word: "fair", color: "#b8860b" };
  if (g) return { word: "at risk", color: "#c8402f" };
  return { word: "unrated", color: "#6a6a78" };
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Verdana 11px is roughly 6.3px per character. Approximating keeps the badge a
// pure function with no font metrics to load.
function textWidth(s: string): number {
  return Math.ceil(s.length * 6.3);
}

function renderBadge(grade: string | undefined, score: number | undefined): string {
  const { word, color } = segment(grade, score);
  const left = "email hygiene";
  const right = grade ? `${grade} · ${word}` : word;

  const padL = 10, padR = 10;
  const lw = textWidth(left) + padL * 2;
  const rw = textWidth(right) + padR * 2;
  const w = lw + rw;
  const h = 20;
  const lc = lw / 2;
  const rc = lw + rw / 2;

  // Text is drawn twice: a dark shadow one pixel down, then the light face, so
  // it reads on any background the way shields.io badges do.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" role="img" aria-label="email hygiene: ${esc(right)}">
  <title>email hygiene: ${esc(right)}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="${w}" height="${h}" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${lw}" height="${h}" fill="#26263a"/>
    <rect x="${lw}" width="${rw}" height="${h}" fill="${color}"/>
    <rect width="${w}" height="${h}" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${lc}" y="15" fill="#010101" fill-opacity=".3">${esc(left)}</text>
    <text x="${lc}" y="14">${esc(left)}</text>
    <text x="${rc}" y="15" fill="#010101" fill-opacity=".3">${esc(right)}</text>
    <text x="${rc}" y="14">${esc(right)}</text>
  </g>
</svg>`;
}

function svg(body: string, cacheable: boolean): NextResponse {
  return new NextResponse(body, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      // Re-check roughly daily. A DNS grade does not move minute to minute, and
      // this keeps a badge on a busy site from hammering the engine while still
      // going green within a day of a firm fixing its records.
      "Cache-Control": cacheable
        ? "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800"
        : "no-store",
    },
  }) as unknown as NextResponse;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ domain: string }> }
) {
  const domain = clean((await params).domain);

  if (!DOMAIN_RE.test(domain)) {
    return svg(renderBadge(undefined, undefined), false);
  }

  const audit = await getAudit(domain);
  if (!audit || audit.error) {
    // Never fail with a broken image. An unreachable engine renders "unrated"
    // rather than a 500, so a firm's site never shows a broken badge because of
    // us. Not cached, so it recovers as soon as the engine answers.
    return svg(renderBadge(undefined, undefined), false);
  }

  return svg(renderBadge(audit.grade, audit.score), true);
}
