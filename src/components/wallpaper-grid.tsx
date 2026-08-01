import type { Wallpaper, Category } from "@/lib/types";
import { WallpaperCard } from "@/components/wallpaper-card";
import { EmptyState } from "@/components/empty-state";

// Column counts tuned per device: phone tiles are tall, so we show more of them
// (smaller); desktop tiles are wide, so we show fewer (bigger).
const COLS: Record<string, string> = {
  phone: "columns-3 sm:columns-4 md:columns-5 lg:columns-6 xl:columns-7",
  tablet: "columns-2 sm:columns-3 md:columns-4 lg:columns-5",
  desktop: "columns-1 sm:columns-2 lg:columns-3 xl:columns-4",
  default: "columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6",
};

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
  const cols = COLS[device ?? "default"] ?? COLS.default;

  return (
    <div className={`masonry ${cols}`}>
      {wallpapers.map((w, i) => (
        <WallpaperCard
          key={w.id}
          w={w}
          categoryName={w.category_id ? nameById.get(w.category_id) : undefined}
          priority={i < 6}
        />
      ))}
    </div>
  );
}
