import { createClient } from "@/lib/supabase/server";
import type { Wallpaper, Category } from "@/lib/types";

type BrowseParams = {
  device?: string;
  category?: string;   // category slug
  q?: string;
  sort?: "latest" | "popular";
  limit?: number;
  offset?: number;
};

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("category_counts")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) return [];
  return (data ?? []) as Category[];
}

export async function getWallpapers(params: BrowseParams = {}): Promise<Wallpaper[]> {
  const supabase = await createClient();
  const { device, category, q, sort = "latest", limit = 30, offset = 0 } = params;

  let query = supabase.from("wallpapers").select("*").eq("status", "published");

  if (device) query = query.contains("devices", [device]);
  if (q) query = query.textSearch("search_vector", q, { type: "websearch" });

  // category is a slug → resolve to id
  if (category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category)
      .maybeSingle();
    if (cat?.id) query = query.eq("category_id", cat.id);
    else return [];
  }

  if (sort === "popular") query = query.order("download_count", { ascending: false });
  else query = query.order("published_at", { ascending: false });

  const { data, error } = await query.range(offset, offset + limit - 1);
  if (error) {
    console.error("getWallpapers", error.message);
    return [];
  }
  return data ?? [];
}

export async function getFeatured(limit = 6, device?: string): Promise<Wallpaper[]> {
  const supabase = await createClient();
  let q = supabase
    .from("wallpapers")
    .select("*")
    .eq("status", "published")
    .eq("is_featured", true);
  if (device) q = q.contains("devices", [device]);
  const { data } = await q.order("published_at", { ascending: false }).limit(limit);
  return data ?? [];
}

export async function getWallpaperBySlug(slug: string): Promise<Wallpaper | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("wallpapers")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data ?? null;
}

export async function getRelated(w: Wallpaper, limit = 6): Promise<Wallpaper[]> {
  const supabase = await createClient();
  let query = supabase
    .from("wallpapers")
    .select("*")
    .eq("status", "published")
    .neq("id", w.id)
    .limit(limit);
  if (w.category_id) query = query.eq("category_id", w.category_id);
  else query = query.contains("devices", [w.device]);
  const { data } = await query;
  return data ?? [];
}

export const PER_PAGE = 24;

export async function getWallpapersPage(
  params: BrowseParams & { page?: number } = {},
): Promise<{ items: Wallpaper[]; total: number }> {
  const supabase = await createClient();
  const { device, category, q, sort = "latest", page = 1, limit = PER_PAGE } = params;

  let query = supabase.from("wallpapers").select("*", { count: "exact" }).eq("status", "published");
  if (device) query = query.contains("devices", [device]);
  if (q) query = query.textSearch("search_vector", q, { type: "websearch" });
  if (category) {
    const { data: cat } = await supabase.from("categories").select("id").eq("slug", category).maybeSingle();
    if (cat?.id) query = query.eq("category_id", cat.id);
    else return { items: [], total: 0 };
  }
  if (sort === "popular") query = query.order("download_count", { ascending: false });
  else query = query.order("published_at", { ascending: false });

  const from = (Math.max(1, page) - 1) * limit;
  const { data, count, error } = await query.range(from, from + limit - 1);
  if (error) {
    console.error("getWallpapersPage", error.message);
    return { items: [], total: 0 };
  }
  return { items: data ?? [], total: count ?? 0 };
}

export async function getWallpaperOfTheDay(device?: string): Promise<Wallpaper | null> {
  const supabase = await createClient();
  let q = supabase
    .from("wallpapers")
    .select("*")
    .eq("status", "published")
    .eq("is_wotd", true);
  if (device) q = q.contains("devices", [device]);
  const { data } = await q.limit(1).maybeSingle();
  if (data) return data;

  // The pinned pick isn't available for this device — show that device's newest instead.
  if (device) {
    const { data: fallback } = await supabase
      .from("wallpapers")
      .select("*")
      .eq("status", "published")
      .contains("devices", [device])
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return fallback ?? null;
  }
  return null;
}

export async function getDailyForVibe(vibe?: string): Promise<Wallpaper | null> {
  const supabase = await createClient();
  let items: Wallpaper[] = [];

  if (vibe) {
    let q = supabase.from("wallpapers").select("*").eq("status", "published");
    const { data: cat } = await supabase.from("categories").select("id").eq("slug", vibe).maybeSingle();
    if (cat?.id) q = q.eq("category_id", cat.id);
    else q = q.contains("tags", [vibe]);
    const { data } = await q.order("created_at", { ascending: true }).limit(300);
    items = (data ?? []) as Wallpaper[];
  }

  if (items.length === 0) {
    const { data } = await supabase
      .from("wallpapers").select("*").eq("status", "published")
      .order("created_at", { ascending: false }).limit(300);
    items = (data ?? []) as Wallpaper[];
  }

  if (items.length === 0) return null;
  const day = Math.floor(Date.now() / 86_400_000); // changes once per day
  return items[day % items.length];
}
