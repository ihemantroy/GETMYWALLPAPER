import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Displayed number = BASE + real signups. Bump this if you want a bigger head start.
const BASE = 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function totalCount(admin: ReturnType<typeof createAdminClient>): Promise<number> {
  const { count, error } = await admin
    .from("waitlist")
    .select("*", { count: "exact", head: true });
  if (error) throw error;
  return BASE + (count ?? 0);
}

/** Live waitlist count. Falls back to BASE (marked `degraded`) if the table or
 *  service-role key isn't set up yet, so the UI still shows a sensible number. */
export async function GET() {
  try {
    const admin = createAdminClient();
    const count = await totalCount(admin);
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: BASE, degraded: true });
  }
}

/** Record a join (deduped per browser). Optional email is stored if valid.
 *  Returns the fresh total so the client can reconcile its optimistic count. */
export async function POST(req: Request) {
  try {
    const { browserId, email } = (await req.json()) as {
      browserId?: unknown;
      email?: unknown;
    };

    if (typeof browserId !== "string" || browserId.length < 6 || browserId.length > 64) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const cleanEmail =
      typeof email === "string" && EMAIL_RE.test(email.trim())
        ? email.trim().toLowerCase().slice(0, 320)
        : null;

    const admin = createAdminClient();
    const { error } = await admin.from("waitlist").upsert(
      { browser_id: browserId, ...(cleanEmail ? { email: cleanEmail } : {}) },
      { onConflict: "browser_id", ignoreDuplicates: false },
    );
    if (error) throw error;

    const count = await totalCount(admin);
    return NextResponse.json({ ok: true, count });
  } catch {
    // Table/env not ready — tell the client so it keeps its optimistic count.
    return NextResponse.json({ error: "Waitlist not configured", degraded: true }, { status: 503 });
  }
}
