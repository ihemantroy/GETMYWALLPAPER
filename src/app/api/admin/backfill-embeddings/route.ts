import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { embedImageUrl } from "@/lib/ai";
import { publicUrl } from "@/lib/supabase/storage";

export const runtime = "nodejs";

// Small batch per call so we stay well inside Vercel Hobby's 10s function limit.
// The admin UI calls this repeatedly until `remaining` hits 0.
const BATCH_SIZE = 5;

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
  for (const row of rows ?? []) {
    try {
      const vec = await embedImageUrl(publicUrl(row.storage_path));
      await admin.from("wallpapers").update({ embedding: vec }).eq("id", row.id);
      processed++;
    } catch (e) {
      console.error("backfill embed failed for", row.id, e instanceof Error ? e.message : e);
    }
  }

  const { count: remaining } = await admin
    .from("wallpapers")
    .select("id", { count: "exact", head: true })
    .eq("status", "published")
    .is("embedding", null);

  return NextResponse.json({ processed, remaining: remaining ?? 0 });
}
