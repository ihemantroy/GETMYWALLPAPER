import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/** Increment the download counter atomically. Fire-and-forget from the client. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const admin = createAdminClient();
    await admin.rpc("increment_counter", { row_id: id, col: "download_count" });
  } catch {
    // Counting is best-effort; never block a download.
  }
  return NextResponse.json({ ok: true });
}
