import { NextResponse } from "next/server";
import { LIMITS, admin, currentProfile, newApiKey } from "@/lib/auth";

const MAX_KEYS = 5;

export async function GET() {
  const profile = await currentProfile();
  if (!profile) return NextResponse.json({ error: "sign in" }, { status: 401 });

  const { data } = await admin()
    .from("api_keys")
    .select("id, label, created_at, last_used_at")
    .eq("profile_id", profile.id)
    .is("revoked_at", null)
    .order("created_at", { ascending: false });

  // Only metadata. The key itself was never stored, so there is nothing here
  // that could be shown again even by mistake.
  return NextResponse.json({ keys: data ?? [] });
}

export async function POST(req: Request) {
  const profile = await currentProfile();
  if (!profile) return NextResponse.json({ error: "sign in" }, { status: 401 });

  if (!LIMITS[profile.plan].api) {
    return NextResponse.json(
      { error: "API access is on the paid plan", upgradeAt: "/#pricing" },
      { status: 403 }
    );
  }

  let label = "";
  try {
    label = String((await req.json()).label ?? "").trim().slice(0, 40);
  } catch {
    label = "";
  }

  const db = admin();
  const { count } = await db
    .from("api_keys")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profile.id)
    .is("revoked_at", null);

  if ((count ?? 0) >= MAX_KEYS) {
    return NextResponse.json(
      { error: `at most ${MAX_KEYS} active keys. Revoke one first.` },
      { status: 409 }
    );
  }

  const { key, hash } = newApiKey();
  const { error } = await db.from("api_keys").insert({
    profile_id: profile.id,
    key_hash: hash,
    label: label || "untitled",
  });

  if (error) {
    console.error("api key create:", error.message);
    return NextResponse.json({ error: "could not create the key" }, { status: 500 });
  }

  // The only time the key is ever readable. It is stored as a hash, so if this
  // response is lost the key is gone and a new one has to be made.
  return NextResponse.json({ key, label: label || "untitled" });
}

export async function DELETE(req: Request) {
  const profile = await currentProfile();
  if (!profile) return NextResponse.json({ error: "sign in" }, { status: 401 });

  let id: number | null = null;
  try {
    id = Number((await req.json()).id);
  } catch {
    id = null;
  }
  if (!id || !Number.isFinite(id)) {
    return NextResponse.json({ error: "which key?" }, { status: 400 });
  }

  // Scoped to this profile, so an id from another account revokes nothing.
  const { error } = await admin()
    .from("api_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id)
    .eq("profile_id", profile.id);

  if (error) {
    console.error("api key revoke:", error.message);
    return NextResponse.json({ error: "could not revoke" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
