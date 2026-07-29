import type { Wallpaper, Category } from "@/lib/types";
import { WallpaperCard } from "@/components/wallpaper-card";
import { EmptyState } from "@/components/empty-state";

export function WallpaperGrid({
  wallpapers,
  categories = [],
  empty,
  device,
}: {
  wallpapers: Wallpaper[];
  categories?: Category[];
  empty?: { title?: string; body?: string; cta?: { href: string; label: string } };
  device?: string;
}) {
  if (wallpapers.length === 0) {
    return <EmptyState {...empty} />;
  }
  const nameById = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {wallpapers.map((w, i) => (
        <WallpaperCard
          key={w.id}
          w={w}
          device={device}
          categoryName={w.category_id ? nameById.get(w.category_id) : undefined}
          priority={i < 4}
        />
      ))}
    </div>
  );
}
