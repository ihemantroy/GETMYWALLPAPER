import { NextResponse } from "next/server";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/server";
import { getDailyForVibe } from "@/lib/queries";
import { VAPID_PUBLIC_KEY } from "@/lib/constants";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: Request) {
  // protect the endpoint — Vercel Cron sends this header when CRON_SECRET is set
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!priv) return NextResponse.json({ error: "VAPID_PRIVATE_KEY not set" }, { status: 400 });

  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:ihemantroy@gmail.com", VAPID_PUBLIC_KEY, priv);

  const admin = createAdminClient();
  const { data: subs } = await admin.from("push_subscriptions").select("*");
  if (!subs || subs.length === 0) return NextResponse.json({ sent: 0 });

  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://getyourwallpaper.com";
  const cache = new Map<string, { title: string; url: string } | null>();
  let sent = 0;

  for (const s of subs) {
    const vibe = s.vibe || "";
    if (!cache.has(vibe)) {
      const w = await getDailyForVibe(vibe || undefined);
      cache.set(vibe, w ? { title: w.title, url: `${site}/wallpaper/${w.slug}` } : null);
    }
    const daily = cache.get(vibe);
    if (!daily) continue;

    const payload = JSON.stringify({
      title: "Your wallpaper of the day ☀️",
      body: daily.title,
      url: daily.url,
      icon: "/icon-192.png",
    });
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        payload,
      );
      sent++;
    } catch (err: unknown) {
      const code = (err as { statusCode?: number })?.statusCode;
      if (code === 404 || code === 410) {
        await admin.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
      }
    }
  }
  return NextResponse.json({ sent });
}
