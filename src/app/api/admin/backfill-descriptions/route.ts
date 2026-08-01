import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { describeWallpaper } from "@/lib/ai";
import { publicUrl } from "@/lib/supabase/storage";

export const runtime = "nodejs";
// Gemini vision calls are slower than embeddings, so keep batches small and
// give this function the full room Vercel allows without Fluid Compute.
export const maxDuration = 60;

const BATCH_SIZE = 3;
const DELAY_BETWEEN_ROWS_MS = 2000;
const MAX_RETRIES = 3;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function describeWithRetry(url: string) {
  let attempt = 0;
  for (;;) {
    try {
      return await describeWallpaper(url);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const isRateLimit = msg.includes("(429)") || msg.toLowerCase().includes("rate limit");
      attempt++;
      if (!isRateLimit || attempt > MAX_RETRIES) throw e;
      // Exponential backoff: 3s, 6s, 12s, 24s
      await sleep(3000 * 2 ** (attempt - 1));
    }
  }
}

type BackfillRow = {
  id: string;
  storage_path: string;
  title: string;
  description: string | null;
  alt_text: string | null;
  tags: string[] | null;
};

// A row "needs" a backfill if it's missing a description, alt text, or has no
// tags at all — matches the AdSense "low value content" fix: every published
// wallpaper should carry real, visible text.
export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const admin = createAdminClient();
  const { data: rows, error } = await admin
    .from("wallpapers")
    .select("id, storage_path, title, description, alt_text, tags")
    .eq("status", "published")
    .or("description.is.null,alt_text.is.null,tags.is.null")
    .limit(BATCH_SIZE);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // .or() above can't express "tags is an empty array", so also catch that here.
  const needsWork = ((rows ?? []) as BackfillRow[]).filter(
    (r: BackfillRow) => !r.description || !r.alt_text || !r.tags || (Array.isArray(r.tags) && r.tags.length === 0),
  );

  let processed = 0;
  let lastError: string | null = null;
  for (const row of needsWork) {
    try {
      const meta = await describeWithRetry(publicUrl(row.storage_path));
      // Never overwrite an existing value an admin may have set by hand —
      // only fill in what's actually missing.
      const patch: Record<string, unknown> = {};
      if (!row.description) patch.description = meta.description;
      if (!row.alt_text) patch.alt_text = meta.altText;
      if (!row.tags || row.tags.length === 0) patch.tags = meta.tags;
      if (Object.keys(patch).length > 0) {
        await admin.from("wallpapers").update(patch).eq("id", row.id);
      }
      processed++;
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
      console.error("backfill description failed for", row.id, lastError);
    }
    await sleep(DELAY_BETWEEN_ROWS_MS);
  }

  const { data: remainingRows, count } = await admin
    .from("wallpapers")
    .select("id, description, alt_text, tags", { count: "exact" })
    .eq("status", "published")
    .or("description.is.null,alt_text.is.null,tags.is.null");
  const remaining = ((remainingRows ?? []) as BackfillRow[]).filter(
    (r: BackfillRow) => !r.description || !r.alt_text || !r.tags || (Array.isArray(r.tags) && r.tags.length === 0),
  ).length || (count ?? 0);

  if (processed === 0 && needsWork.length > 0 && lastError) {
    return NextResponse.json(
      { error: `Description backfill failed: ${lastError}`, processed, remaining },
      { status: 502 },
    );
  }

  return NextResponse.json({ processed, remaining, lastError });
}
