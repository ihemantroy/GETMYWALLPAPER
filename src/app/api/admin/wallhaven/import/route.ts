import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { suggestDevices } from "@/lib/device";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  try {
    const b = await req.json();
    const { id, original, photographer, photographer_url, alt, categoryId } = b;
    if (!original || !id) return NextResponse.json({ error: "Missing image" }, { status: 400 });

    const imgRes = await fetch(original);
    if (!imgRes.ok) return NextResponse.json({ error: "Could not fetch image" }, { status: 502 });
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const contentType = imgRes.headers.get("content-type") || "image/jpeg";
    const ext = contentType.includes("png") ? "png" : "jpg";

    // read the true stored dimensions from the actual file (never trust API metadata)
    let w = 0, h = 0;
    try {
      const sharp = (await import("sharp")).default;
      const m = await sharp(buf).metadata();
      w = m.width || 0;
      h = m.height || 0;
    } catch {}

    const admin = createAdminClient();
    const path = `import/wallhaven-${id}.${ext}`;
    const { error: upErr } = await admin.storage
      .from("wallpapers")
      .upload(path, buf, { cacheControl: "31536000", upsert: true, contentType });
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    const rawTitle = alt ? String(alt).split(",")[0].trim() : "";
    const title = rawTitle ? rawTitle.slice(0, 80) : `Wallpaper ${id}`;
    const devices = w && h ? suggestDevices(w, h) : ["desktop"];

    const { error: insErr } = await admin.from("wallpapers").insert({
      slug: `${slugify(title)}-wh${id}`.slice(0, 90),
      title,
      storage_path: path,
      width: w, height: h, file_size: buf.length,
      orientation: w >= h ? "landscape" : "portrait",
      device: devices[0], devices,
      category_id: categoryId || null,
      credit: photographer || "Wallhaven",
      credit_url: photographer_url || "https://wallhaven.cc/",
      tags: [],
      status: "published",
      is_community: false,
      published_at: new Date().toISOString(),
    });
    if (insErr) return NextResponse.json({ error: "already imported" }, { status: 409 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
