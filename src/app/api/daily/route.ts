import { NextResponse } from "next/server";
import { getDailyForVibe } from "@/lib/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const vibe = new URL(req.url).searchParams.get("vibe") || undefined;
  const w = await getDailyForVibe(vibe);
  if (!w) return NextResponse.json({ wallpaper: null });
  return NextResponse.json({
    wallpaper: { id: w.id, slug: w.slug, title: w.title, storage_path: w.storage_path },
  });
}
