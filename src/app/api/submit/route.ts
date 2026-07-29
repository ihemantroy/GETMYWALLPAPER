import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const OK = ["image/png", "image/jpeg", "image/webp", "image/avif"];

export async function POST(req: Request) {
  try {
    const { contentType, ext } = await req.json();
    if (!OK.includes(contentType)) {
      return NextResponse.json({ error: "Only PNG, JPG, WebP or AVIF images." }, { status: 400 });
    }
    const safeExt = String(ext || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "jpg";
    const path = `community/${crypto.randomUUID()}.${safeExt}`;

    const admin = createAdminClient();
    const { data, error } = await admin.storage.from("wallpapers").createSignedUploadUrl(path);
    if (error || !data) return NextResponse.json({ error: error?.message ?? "Could not start upload" }, { status: 500 });

    return NextResponse.json({ path: data.path, token: data.token });
  } catch {
    return NextResponse.json({ error: "Could not start upload" }, { status: 500 });
  }
}
