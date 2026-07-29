import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  const key = process.env.PIXABAY_API_KEY;
  if (!key) return NextResponse.json({ error: "Add PIXABAY_API_KEY in Vercel to enable import." }, { status: 400 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const page = searchParams.get("page") || "1";
  const orientation = searchParams.get("orientation") || "all"; // all | horizontal | vertical

  const params = new URLSearchParams({
    key,
    image_type: "photo",
    orientation,
    per_page: "28",
    page,
    safesearch: "true",
    order: q ? "popular" : "popular",
    min_width: "1920",
  });
  if (q) params.set("q", q);

  const res = await fetch(`https://pixabay.com/api/?${params.toString()}`);
  if (!res.ok) return NextResponse.json({ error: "Pixabay request failed" }, { status: 502 });
  const data = await res.json();

  const photos = (data.hits || []).map((h: Record<string, unknown>) => ({
    id: h.id,
    width: h.imageWidth,
    height: h.imageHeight,
    photographer: h.user,
    photographer_url: `https://pixabay.com/users/${h.user}-${h.user_id}/`,
    alt: h.tags,
    thumb: h.webformatURL,
    original: h.largeImageURL,
  }));

  return NextResponse.json({ photos, page: Number(page) });
}
