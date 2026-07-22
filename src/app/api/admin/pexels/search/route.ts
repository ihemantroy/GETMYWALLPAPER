import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  const key = process.env.PEXELS_API_KEY;
  if (!key) return NextResponse.json({ error: "Add PEXELS_API_KEY in Vercel to enable import." }, { status: 400 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const page = searchParams.get("page") || "1";
  const orientation = searchParams.get("orientation") || "";
  const per = "28";

  let url = q
    ? `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=${per}&page=${page}`
    : `https://api.pexels.com/v1/curated?per_page=${per}&page=${page}`;
  if (q && orientation) url += `&orientation=${orientation}`;

  const res = await fetch(url, { headers: { Authorization: key } });
  if (!res.ok) return NextResponse.json({ error: "Pexels request failed" }, { status: 502 });
  const data = await res.json();
  const photos = (data.photos || []).map((p: Record<string, unknown>) => {
    const src = (p.src as Record<string, string>) || {};
    return {
      id: p.id, width: p.width, height: p.height,
      photographer: p.photographer, photographer_url: p.photographer_url,
      alt: p.alt, thumb: src.large || src.medium, original: src.original,
    };
  });
  return NextResponse.json({ photos, page: Number(page) });
}
