import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return NextResponse.json({ error: "Add UNSPLASH_ACCESS_KEY in Vercel to enable Unsplash import." }, { status: 400 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const page = searchParams.get("page") || "1";
  const per = "28";

  const url = q
    ? `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=${per}&page=${page}`
    : `https://api.unsplash.com/photos?order_by=popular&per_page=${per}&page=${page}`;

  const res = await fetch(url, { headers: { Authorization: `Client-ID ${key}` } });
  if (!res.ok) return NextResponse.json({ error: "Unsplash request failed" }, { status: 502 });
  const data = await res.json();
  const arr = q ? (data.results || []) : (Array.isArray(data) ? data : []);

  const photos = arr.map((p: Record<string, any>) => ({
    id: p.id,
    width: p.width, height: p.height,
    photographer: p.user?.name || "Unsplash",
    photographer_url: p.user?.links?.html
      ? `${p.user.links.html}?utm_source=getyourwallpaper&utm_medium=referral`
      : "https://unsplash.com",
    alt: p.alt_description || p.description || "",
    thumb: p.urls?.small,
    original: p.urls?.full,
    download_location: p.links?.download_location || null,
  }));
  return NextResponse.json({ photos, page: Number(page) });
}
