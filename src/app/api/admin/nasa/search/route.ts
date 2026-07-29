import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

// NASA Images API — public domain, no key required.
export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim() || "galaxy nebula";
  const page = searchParams.get("page") || "1";

  const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(q)}&media_type=image&page=${page}`;
  const res = await fetch(url);
  if (!res.ok) return NextResponse.json({ error: "NASA request failed" }, { status: 502 });
  const data = await res.json();

  const items = (data.collection?.items || [])
    .map((it: Record<string, unknown>) => {
      const d = ((it.data as Record<string, unknown>[]) || [])[0] || {};
      const link = ((it.links as Record<string, unknown>[]) || [])[0] || {};
      return {
        id: d.nasa_id,
        width: 0,
        height: 0,
        photographer: (d.center as string) || "NASA",
        photographer_url: `https://images.nasa.gov/details/${d.nasa_id}`,
        alt: d.title,
        thumb: link.href,
        original: d.nasa_id, // resolved to the full asset at import time
      };
    })
    .filter((x: { id?: unknown; thumb?: unknown }) => x.id && x.thumb);

  return NextResponse.json({ photos: items, page: Number(page) });
}
