import { NextResponse } from "next/server";
import { getDailyForVibe } from "@/lib/queries";
import { publicUrl } from "@/lib/supabase/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Redirects to today's wallpaper image (optionally for a ?vibe=).
 * Stable URL an iOS "Auto-daily wallpaper" Shortcut can fetch every morning:
 *   Get Contents of URL → https://getyourwallpaper.com/api/daily/image → Set Wallpaper
 */
export async function GET(req: Request) {
  const vibe = new URL(req.url).searchParams.get("vibe") || undefined;
  const w = await getDailyForVibe(vibe);
  if (!w) return NextResponse.redirect(new URL("/", req.url));
  return NextResponse.redirect(publicUrl(w.storage_path));
}
