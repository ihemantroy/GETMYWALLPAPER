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

  if (device) query = query.eq("device", device);
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

export async function getFeatured(limit = 6): Promise<Wallpaper[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("wallpapers")
    .select("*")
    .eq("status", "published")
    .eq("is_featured", true)
    .order("published_at", { ascending: false })
    .limit(limit);
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
  else query = query.eq("device", w.device);
  const { data } = await query;
  return data ?? [];
}
