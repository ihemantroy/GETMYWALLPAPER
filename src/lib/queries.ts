import { createClient } from "@/lib/supabase/server";
import type { Wallpaper, Category } from "@/lib/types";
import { colorBucket } from "@/lib/utils";
import { embedText } from "@/lib/ai";

type BrowseParams = {
  device?: string;
  category?: string;   // category slug
  q?: string;
  color?: string;      // colour family slug (see COLOR_BUCKETS)
  sort?: "latest" | "popular";
  mode?: "keyword" | "vibe"; // "vibe" = AI natural-language / semantic search
  limit?: number;
  offset?: number;
};

/** Re-order a set of published wallpapers to match an ordered list of ids from a vector search. */
async function hydrateByIds(ids: string[]): Promise<Wallpaper[]> {
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("wallpapers").select("*").in("id", ids).eq("status", "published");
  const byId = new Map((data ?? []).map((w) => [w.id, w as Wallpaper]));
  return ids.map((id) => byId.get(id)).filter((w): w is Wallpaper => Boolean(w));
}

/** Feature 3: AI natural-language / semantic search ("cozy autumn", "dark minimal blue"). */
export async function semanticSearch(query: string, limit = PER_PAGE): Promise<Wallpaper[]> {
  try {
    const vector = await embedText(query);
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("match_wallpapers", {
      query_embedding: vector,
      match_count: limit,
    });
    if (error) throw new Error(error.message);
    const ids = (data ?? []).map((r: { id: string }) => r.id);
    return hydrateByIds(ids);
  } catch (e) {
    console.error("semanticSearch failed, falling back to keyword search", e instanceof Error ? e.message : e);
    const { items } = await getWallpapersPage({ q: query, mode: "keyword", limit });
    return items;
  }
}

/** Feature 4: "Find similar" — nearest neighbours of a wallpaper's own embedding. */
export async function getSimilarByEmbedding(w: Wallpaper, limit = 6): Promise<Wallpaper[]> {
  const supabase = await createClient();
  const { data: row } = await supabase.from("wallpapers").select("embedding").eq("id", w.id).maybeSingle();
  if (!row?.embedding) return [];
  const { data, error } = await supabase.rpc("match_wallpapers", {
    query_embedding: row.embedding,
    match_count: limit,
    exclude_id: w.id,
  });
  if (error) {
    console.error("getSimilarByEmbedding", error.message);
    return [];
  }
  const ids = (data ?? []).map((r: { id: string }) => r.id);
  return hydrateByIds(ids);
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("category_counts")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) return [];
  return (data ?? []) as Category[];
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
  const { device, category, q, color, sort = "latest", mode = "keyword", page = 1, limit = PER_PAGE } = params;

  // Feature 3: AI natural-language / semantic search takes a separate path —
  // it ranks by vector similarity rather than a normal filtered query.
  if (mode === "vibe" && q) {
    const items = await semanticSearch(q, limit);
    return { items, total: items.length };
  }

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

  // Colour search: Supabase can't range-match a hex, so pull a bounded set and
  // bucket the dominant colour in JS, then paginate the filtered list.
  if (color) {
    const { data, error } = await query.range(0, 799);
    if (error) {
      console.error("getWallpapersPage(color)", error.message);
      return { items: [], total: 0 };
    }
    const filtered = (data ?? []).filter((w) => colorBucket(w.dominant_color) === color);
    const from = (Math.max(1, page) - 1) * limit;
    return { items: filtered.slice(from, from + limit), total: filtered.length };
  }

  const from = (Math.max(1, page) - 1) * limit;
  const { data, count, error } = await query.range(from, from + limit - 1);
  if (error) {
    console.error("getWallpapersPage", error.message);
    return { items: [], total: 0 };
  }
  return { items: data ?? [], total: count ?? 0 };
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

