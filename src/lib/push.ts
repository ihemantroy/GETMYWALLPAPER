import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/server";
import { VAPID_PUBLIC_KEY } from "@/lib/constants";

/** Best-effort push to every subscriber when a new wallpaper is published. */
export async function notifyNewWallpaper(title: string, slug: string) {
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!priv) return;
  try {
    webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:ihemantroy@gmail.com", VAPID_PUBLIC_KEY, priv);
    const admin = createAdminClient();
    const { data: subs } = await admin.from("push_subscriptions").select("*");
    if (!subs?.length) return;
    const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://getyourwallpaper.com").replace("://www.", "://");
    const payload = JSON.stringify({
      title: "New wallpaper just dropped 🎉",
      body: title,
      url: `${site}/wallpaper/${slug}`,
      icon: "/icon-192.png",
    });
    await Promise.allSettled(
      subs.map((s: { endpoint: string; p256dh: string; auth: string }) =>
        webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload),
      ),
    );
  } catch {
    // never block the upload on a notification failure
  }
}
