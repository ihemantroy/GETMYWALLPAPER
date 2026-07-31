import { createAdminClient } from "@/lib/supabase/server";
import { HeroManager } from "./manager";

export const dynamic = "force-dynamic";

export default async function AdminHero() {
  const admin = createAdminClient();
  const { data: wps } = await admin
    .from("wallpapers")
    .select("id, title, storage_path")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(500);
  const { data: settings } = await admin.from("homepage_hero").select("device, wallpaper_id, focus, fit");

  const current: Record<string, { wallpaper_id: string | null; focus: string; fit: string }> = {};
  (settings ?? []).forEach((s: { device: string; wallpaper_id: string | null; focus: string; fit: string }) => {
    current[s.device] = { wallpaper_id: s.wallpaper_id, focus: s.focus, fit: s.fit };
  });

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-bold">Homepage Hero</h1>
      <p className="mt-1 text-sm text-chalk-muted">
        Choose the big hero wallpaper for each device and how it&apos;s cropped. Landscape images fill the
        hero best; for a tall image, use the focus buttons to pick which part shows.
      </p>
      <HeroManager wallpapers={wps ?? []} current={current} />
    </div>
  );
}
