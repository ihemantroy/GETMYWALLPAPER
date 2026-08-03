import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

// Peapix is fully open (no API key) and serves DAILY Bing + Windows Spotlight
// wallpapers. It has NO search endpoint, so the `q` param is ignored — this
// route always returns the current daily feed. Pagination isn't supported
// either, so page 2+ returns an empty list (the "Load more" button stops).
export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || "1");
  const country = searchParams.get("country") || "us"; // Bing region: us, in, jp, gb, de…

  if (page > 1) return NextResponse.json({ photos: [], page });

  const [bing, spotlight] = await Promise.allSettled([
    fetch(`https://peapix.com/bing/feed?country=${country}&n=24`).then((r) => {
      if (!r.ok) throw new Error("bing");
      return r.json();
    }),
    fetch(`https://peapix.com/spotlight/feed?n=12`).then((r) => {
      if (!r.ok) throw new Error("spotlight");
      return r.json();
    }),
  ]);

  const raw: Record<string, any>[] = [];
  if (bing.status === "fulfilled") raw.push(...bing.value);
  if (spotlight.status === "fulfilled") raw.push(...spotlight.value);

  if (raw.length === 0) {
    return NextResponse.json({ error: "Peapix feed unavailable" }, { status: 502 });
  }

  const photos = raw.map((img) => {
    // pageUrl like https://peapix.com/bing/38085 -> id "bing-38085" (unique
    // across the bing/spotlight feeds, safe for a storage path & slug)
    const parts = (img.pageUrl || "").split("/").filter(Boolean);
    const idPart = parts.slice(-2).join("-") || Math.random().toString(36).slice(2);
    return {
      id: idPart,
      width: 0,                                 // Peapix omits dimensions; import reads the real ones
      height: 0,
      photographer: img.copyright || "Peapix",  // photo credit (Getty etc.)
      photographer_url: img.pageUrl || "https://peapix.com/",
      alt: img.title || "",
      thumb: img.thumbUrl,                       // 640px preview
      original: img.imageUrl || img.fullUrl,     // original resolution download
    };
  });

  return NextResponse.json({ photos, page });
}
