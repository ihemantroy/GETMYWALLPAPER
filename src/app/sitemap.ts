import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/server";
import { DEVICES } from "@/lib/constants";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://getyourwallpaper.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/contribute", "/about", "/contact", "/privacy", "/terms"].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "daily" as const,
    priority: path === "" ? 1 : 0.6,
  }));

  const deviceRoutes = DEVICES.map((d) => ({
    url: `${base}/?device=${d.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  let catRoutes: MetadataRoute.Sitemap = [];
  let walls: MetadataRoute.Sitemap = [];
  try {
    const admin = createAdminClient();
    const { data: cats } = await admin.from("categories").select("slug");
    catRoutes = (cats ?? []).map((c: { slug: string }) => ({
      url: `${base}/?category=${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    const { data } = await admin
      .from("wallpapers")
      .select("slug, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(5000);
    type Row = { slug: string; published_at: string | null };
    walls = ((data ?? []) as Row[]).map((w) => ({
      url: `${base}/wallpaper/${w.slug}`,
      lastModified: w.published_at ?? undefined,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));
  } catch {}

  return [...staticRoutes, ...deviceRoutes, ...catRoutes, ...walls];
}
