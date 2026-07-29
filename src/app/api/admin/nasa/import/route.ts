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
    const { id, photographer, photographer_url, alt, categoryId } = b;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    // resolve the full-resolution asset for this NASA id
    const assetRes = await fetch(`https://images-api.nasa.gov/asset/${encodeURIComponent(String(id))}`);
    if (!assetRes.ok) return NextResponse.json({ error: "Could not resolve asset" }, { status: 502 });
    const asset = await assetRes.json();
    const hrefs: string[] = (asset.collection?.items || [])
      .map((i: { href?: string }) => i.href)
      .filter(Boolean);
    const pick =
      hrefs.find((h) => /~orig\.(jpe?g|png)$/i.test(h)) ||
      hrefs.find((h) => /~large\.(jpe?g|png)$/i.test(h)) ||
      hrefs.find((h) => /\.(jpe?g|png)$/i.test(h));
    if (!pick) return NextResponse.json({ error: "No image asset found" }, { status: 404 });

    const imgRes = await fetch(pick);
    if (!imgRes.ok) return NextResponse.json({ error: "Could not fetch image" }, { status: 502 });
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const ext = pick.toLowerCase().includes(".png") ? "png" : "jpg";

    // real dimensions read from the actual file
    let w = 0, h = 0;
    try {
      const sharp = (await import("sharp")).default;
      const m = await sharp(buf).metadata();
      w = m.width || 0;
      h = m.height || 0;
    } catch {}

    const admin = createAdminClient();
    const path = `import/nasa-${slugify(String(id)).slice(0, 60)}.${ext}`;
    const { error: upErr } = await admin.storage
      .from("wallpapers")
      .upload(path, buf, { cacheControl: "31536000", upsert: true, contentType: `image/${ext === "png" ? "png" : "jpeg"}` });
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    const title = alt && String(alt).trim() ? String(alt).trim().slice(0, 80) : `NASA ${id}`;
    const devices = w && h ? suggestDevices(w, h) : ["desktop"];

    const { error: insErr } = await admin.from("wallpapers").insert({
      slug: `${slugify(title)}-nasa`.slice(0, 90),
      title,
      storage_path: path,
      width: w, height: h, file_size: buf.length,
      orientation: w >= h ? "landscape" : "portrait",
      device: devices[0], devices,
      category_id: categoryId || null,
      credit: photographer || "NASA",
      credit_url: photographer_url || `https://images.nasa.gov/details/${id}`,
      tags: ["space", "nasa"],
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
