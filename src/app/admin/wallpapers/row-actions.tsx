"use client";

import { useTransition } from "react";
import { Star, Trash2, Loader2 } from "lucide-react";
import { deleteWallpaper, toggleFeatured } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

export function WallpaperRowActions({
  id,
  storagePath,
  featured,
}: {
  id: string;
  storagePath: string;
  featured: boolean;
}) {
  const [pending, start] = useTransition();

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => start(() => toggleFeatured(id, !featured))}
        disabled={pending}
        aria-label={featured ? "Unfeature" : "Feature"}
        className={cn(
          "focusable surface grid h-9 w-9 place-items-center rounded-pill transition",
          featured ? "text-accent" : "text-chalk-muted hover:text-chalk",
        )}
      >
        <Star size={15} fill={featured ? "currentColor" : "none"} />
      </button>
      <button
        onClick={() => {
          if (confirm("Delete this wallpaper permanently?")) start(() => deleteWallpaper(id, storagePath));
        }}
        disabled={pending}
        aria-label="Delete"
        className="focusable surface grid h-9 w-9 place-items-center rounded-pill text-chalk-muted transition hover:text-accent-2"
      >
        {pending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
      </button>
    </div>
  );
}
