import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/server";
import { DEVICES, COLOR_BUCKETS, VIBES, KEYWORD_TOPICS } from "@/lib/constants";

const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://getyourwallpaper.com").replace("://www.", "://");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/contribute", "/about", "/contact", "/privacy", "/terms", "/disclaimer", "/dmca"].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "daily" as const,
    priority: path === "" ? 1 : 0.6,
  }));

  const deviceRoutes = DEVICES.map((d) => ({
    url: `${base}/?device=${d.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // SEO landing pages: /wallpapers/<topic>
  const topicSlugs = [
    ...DEVICES.map((d) => d.slug),
    ...COLOR_BUCKETS.map((c) => c.slug),
    ...VIBES.map((v) => v.slug),
    ...KEYWORD_TOPICS.map((k) => k.slug),
  ];
  const topicRoutes = topicSlugs.map((slug) => ({
    url: `${base}/wallpapers/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
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
    // category landing pages too
    catRoutes = catRoutes.concat(
      (cats ?? []).map((c: { slug: string }) => ({
        url: `${base}/wallpapers/${c.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    );

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

  return [...staticRoutes, ...deviceRoutes, ...topicRoutes, ...catRoutes, ...walls];
}
