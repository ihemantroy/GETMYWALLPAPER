import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const title = String(b.title || "").trim();
    const path = String(b.path || "");
    if (!title || !path) return NextResponse.json({ error: "Missing title or file" }, { status: 400 });

    const width = Number(b.width) || 0;
    const height = Number(b.height) || 0;
    const tags = String(b.tags || "").split(",").map((t: string) => slugify(t.trim())).filter(Boolean);

    const admin = createAdminClient();
    const { error } = await admin.from("wallpapers").insert({
      slug: `${slugify(title)}-${Date.now().toString(36)}${Math.floor(Math.random() * 1e3)}`,
      title,
      storage_path: path,
      width,
      height,
      file_size: Number(b.fileSize) || 0,
      orientation: width >= height ? "landscape" : "portrait",
      device: String(b.device || "desktop"),
      devices: Array.isArray(b.devices) && b.devices.length ? b.devices : [String(b.device || "desktop")],
      category_id: b.categoryId || null,
      credit: (b.credit && String(b.credit).trim()) || null,
      credit_url: (b.creditUrl && String(b.creditUrl).trim()) || null,
      tags,
      status: "pending",
      is_community: true,
      uploader_id: null,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
