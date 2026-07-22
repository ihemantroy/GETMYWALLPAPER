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
    const { id, original, width, height, photographer, photographer_url, alt, categoryId, download_location } = b;
    if (!original || !id) return NextResponse.json({ error: "Missing image" }, { status: 400 });

    const key = process.env.UNSPLASH_ACCESS_KEY;
    // Unsplash guideline: ping the download endpoint when a photo is used
    if (download_location && key) {
      fetch(download_location, { headers: { Authorization: `Client-ID ${key}` } }).catch(() => {});
    }

    const imgRes = await fetch(original);
    if (!imgRes.ok) return NextResponse.json({ error: "Could not fetch image" }, { status: 502 });
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const contentType = imgRes.headers.get("content-type") || "image/jpeg";
    const ext = contentType.includes("png") ? "png" : "jpg";

    const admin = createAdminClient();
    const path = `import/unsplash-${id}.${ext}`;
    const { error: upErr } = await admin.storage
      .from("wallpapers")
      .upload(path, buf, { cacheControl: "31536000", upsert: true, contentType });
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    const w = Number(width) || 0, h = Number(height) || 0;
    const title = (alt && String(alt).trim()) ? String(alt).trim().slice(0, 80) : `Wallpaper ${id}`;
    const devices = suggestDevices(w, h);

    const { error: insErr } = await admin.from("wallpapers").insert({
      slug: `${slugify(title)}-un${slugify(String(id))}`,
      title,
      storage_path: path,
      width: w, height: h, file_size: buf.length,
      orientation: w >= h ? "landscape" : "portrait",
      device: devices[0], devices,
      category_id: categoryId || null,
      credit: photographer || "Unsplash",
      credit_url: photographer_url || "https://unsplash.com",
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
