import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const page = searchParams.get("page") || "1";
  const orientation = searchParams.get("orientation") || "all"; // all | horizontal | vertical

  const params = new URLSearchParams({
    categories: "111",           // General + Anime + People
    purity: "100",               // SFW ONLY — required so AdSense stays safe. Do not change.
    sorting: q ? "relevance" : "toplist",
    order: "desc",
    atleast: "1920x1080",        // wallpaper-grade minimum resolution
    page,
  });
  if (q) params.set("q", q);
  // orientation -> aspect ratio hint (Wallhaven uses ratios, not an orientation flag)
  if (orientation === "vertical") params.set("ratios", "9x16,9x18,10x16");
  if (orientation === "horizontal") params.set("ratios", "16x9,16x10,21x9");

  // API key is OPTIONAL for SFW browsing, but adding it raises rate limits
  // and unlocks 64 results/page. Works fine without one.
  const key = process.env.WALLHAVEN_API_KEY;
  if (key) params.set("apikey", key);

  const res = await fetch(`https://wallhaven.cc/api/v1/search?${params.toString()}`, {
    headers: key ? { "X-API-Key": key } : undefined,
  });
  if (!res.ok) return NextResponse.json({ error: "Wallhaven request failed" }, { status: 502 });
  const data = await res.json();

  const photos = (data.data || []).map((w: Record<string, any>) => ({
    id: w.id,                                  // string, e.g. "o5x8k9"
    width: w.dimension_x,
    height: w.dimension_y,
    photographer: "Wallhaven",                 // uploader isn't returned in search results
    photographer_url: w.url,                   // link back to the wallhaven page (attribution)
    alt: w.category || "",                     // search has no tags; category is the only hint
    thumb: w.thumbs?.small || w.thumbs?.large,
    original: w.path,                          // full-resolution image URL
  }));

  return NextResponse.json({ photos, page: Number(page) });
}
