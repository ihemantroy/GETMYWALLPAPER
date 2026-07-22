import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { subscription, vibe } = await req.json();
    if (!subscription?.endpoint || !subscription?.keys) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }
    const admin = createAdminClient();
    const { error } = await admin.from("push_subscriptions").upsert(
      {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        vibe: vibe || null,
      },
      { onConflict: "endpoint" },
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
