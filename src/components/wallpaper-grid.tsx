import type { Wallpaper, Category } from "@/lib/types";
import { WallpaperCard } from "@/components/wallpaper-card";
import { EmptyState } from "@/components/empty-state";

export function WallpaperGrid({
  wallpapers,
  categories = [],
  empty,
}: {
  wallpapers: Wallpaper[];
  categories?: Category[];
  empty?: { title?: string; body?: string; cta?: { href: string; label: string } };
}) {
  if (wallpapers.length === 0) {
    return <EmptyState {...empty} />;
  }
  const nameById = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <div className="masonry columns-[240px]">
      {wallpapers.map((w, i) => (
        <WallpaperCard
          key={w.id}
          w={w}
          categoryName={w.category_id ? nameById.get(w.category_id) : undefined}
          priority={i < 4}
        />
      ))}
    </div>
  );
}
