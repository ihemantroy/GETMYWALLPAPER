import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { describeWallpaper, describeWallpaperFromBase64 } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) return NextResponse.json({ error: "Missing file" }, { status: 400 });
      const buf = Buffer.from(await file.arrayBuffer());
      const meta = await describeWallpaperFromBase64(buf.toString("base64"), file.type || "image/jpeg");
      return NextResponse.json(meta);
    }

    const { imageUrl } = await req.json();
    if (!imageUrl) return NextResponse.json({ error: "Missing imageUrl" }, { status: 400 });
    const meta = await describeWallpaper(String(imageUrl));
    return NextResponse.json(meta);
  } catch (e) {
    const message = e instanceof Error ? e.message : "AI description failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
