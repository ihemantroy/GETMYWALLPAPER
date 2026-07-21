"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Wallpaper, Category } from "@/lib/types";
import { WallpaperGrid } from "@/components/wallpaper-grid";

export function FavoritesView({ categories }: { categories: Category[] }) {
  const [items, setItems] = useState<Wallpaper[] | null>(null);

  useEffect(() => {
    let ids: string[] = [];
    try {
      ids = JSON.parse(localStorage.getItem("favorites") || "[]");
    } catch {}
    if (!ids.length) {
      setItems([]);
      return;
    }
    const supabase = createClient();
    supabase
      .from("wallpapers")
      .select("*")
      .in("id", ids)
      .eq("status", "published")
      .then(({ data }) => setItems((data ?? []) as Wallpaper[]));
  }, []);

  if (items === null) {
    return (
      <div className="masonry columns-[240px]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="mb-4 h-64 animate-pulse rounded-card bg-white/5" />
        ))}
      </div>
    );
  }

  return (
    <WallpaperGrid
      wallpapers={items}
      categories={categories}
      empty={{
        title: "No favorites yet",
        body: "Tap the heart on any wallpaper to keep it here. Saved to this device.",
      }}
    />
  );
}
