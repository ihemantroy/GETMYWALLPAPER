import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data } = await supabase.from("wallpapers").select("slug").eq("status", "published");
  if (!data || data.length === 0) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  const pick = data[Math.floor(Math.random() * data.length)];
  return NextResponse.redirect(new URL(`/wallpaper/${pick.slug}`, req.url));
}
