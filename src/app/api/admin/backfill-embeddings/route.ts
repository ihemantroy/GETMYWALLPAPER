import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { embedImageUrl } from "@/lib/ai";
import { publicUrl } from "@/lib/supabase/storage";

export const runtime = "nodejs";
// Retries + spacing below can take a while per row, so give this function
// more room than the 10s default (60s is the max Vercel allows without Fluid Compute).
export const maxDuration = 60;

// Small batch per call, with retries below eating into the time budget.
// The admin UI calls this repeatedly until `remaining` hits 0.
const BATCH_SIZE = 3;

// Space out embed calls and retry on Jina's token-rate-limit (429) so a burst
// of large images doesn't blow past the per-minute token cap.
const DELAY_BETWEEN_ROWS_MS = 2000;
const MAX_RETRIES = 3;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function embedWithRetry(url: string): Promise<number[]> {
  let attempt = 0;
  for (;;) {
    try {
      return await embedImageUrl(url);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const isRateLimit = msg.includes("(429)") || msg.includes("RATE_TOKEN_LIMIT_EXCEEDED");
      attempt++;
      if (!isRateLimit || attempt > MAX_RETRIES) throw e;
      // Exponential backoff: 3s, 6s, 12s, 24s
      await sleep(3000 * 2 ** (attempt - 1));
    }
  }
}

export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const admin = createAdminClient();
  const { data: rows, error } = await admin
    .from("wallpapers")
    .select("id, storage_path")
    .eq("status", "published")
    .is("embedding", null)
    .limit(BATCH_SIZE);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let processed = 0;
  let lastError: string | null = null;
  for (const row of rows ?? []) {
    try {
      const vec = await embedWithRetry(publicUrl(row.storage_path));
      await admin.from("wallpapers").update({ embedding: vec }).eq("id", row.id);
      processed++;
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
      console.error("backfill embed failed for", row.id, lastError);
    }
    await sleep(DELAY_BETWEEN_ROWS_MS);
  }

  const { count: remaining } = await admin
    .from("wallpapers")
    .select("id", { count: "exact", head: true })
    .eq("status", "published")
    .is("embedding", null);

  // If nothing in this batch succeeded but rows were attempted, surface the failure
  // instead of silently returning processed: 0 with no explanation.
  if (processed === 0 && (rows?.length ?? 0) > 0 && lastError) {
    return NextResponse.json(
      { error: `Embedding failed: ${lastError}`, processed, remaining: remaining ?? 0 },
      { status: 502 }
    );
  }

  return NextResponse.json({ processed, remaining: remaining ?? 0, lastError });
}
