import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { pollinationsUrl } from "@/lib/ai";

export const runtime = "nodejs";

// Free tier friendliness: cap generations per client per rolling 24h window.
const DAILY_LIMIT = 20;
const WINDOW_MS = 24 * 60 * 60 * 1000;

function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  const ip = fwd ? fwd.split(",")[0].trim() : "unknown";
  return ip;
}

export async function POST(req: Request) {
  try {
    const { prompt, width, height, image } = await req.json();
    const p = String(prompt || "").trim();
    if (!p) return NextResponse.json({ error: "Enter a prompt first." }, { status: 400 });
    if (p.length > 500) return NextResponse.json({ error: "Prompt is too long." }, { status: 400 });
    const sourceImageUrl = typeof image === "string" && image.startsWith("http") ? image : undefined;

    const w = Math.min(Math.max(Number(width) || 1080, 256), 3840);
    const h = Math.min(Math.max(Number(height) || 1920, 256), 3840);

    const admin = createAdminClient();
    const key = clientKey(req);
    const since = new Date(Date.now() - WINDOW_MS).toISOString();

    const { count } = await admin
      .from("generation_log")
      .select("id", { count: "exact", head: true })
      .eq("client_key", key)
      .gte("created_at", since);

    if ((count ?? 0) >= DAILY_LIMIT) {
      return NextResponse.json(
        { error: `Free limit reached (${DAILY_LIMIT}/day). Try again tomorrow.` },
        { status: 429 },
      );
    }

    await admin.from("generation_log").insert({ client_key: key });

    const seed = Math.floor(Math.random() * 1_000_000);
    const url = pollinationsUrl(p, w, h, { seed, sourceImageUrl });

    return NextResponse.json({ url, remaining: DAILY_LIMIT - (count ?? 0) - 1 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
