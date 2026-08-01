"use client";

import { useState } from "react";
import type { Wallpaper } from "@/lib/types";
import { publicUrl } from "@/lib/supabase/storage";

function quality(px: number) {
  return px >= 7000 ? "8K" : px >= 3840 ? "4K" : px >= 2560 ? "2K" : "HD";
}

/**
 * The preview image. Loads the ORIGINAL stored file (not the Supabase transform,
 * which mis-rotates large images). Sized to a comfortable medium: the frame hugs
 * the image and is capped by height and width so it never dominates the page.
 */
export function WallpaperImage({ w }: { w: Wallpaper }) {
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [loaded, setLoaded] = useState(false);

  const dw = nat?.w || w.width || 4;
  const dh = nat?.h || w.height || 3;
  const label = dw / dh > 1.15 ? "Landscape" : dw / dh < 0.87 ? "Portrait" : "Square";

  return (
    <div className="flex justify-center">
      <div className="surface relative w-fit max-w-full overflow-hidden rounded-card p-2 sm:p-3">
        <span className="absolute left-3.5 top-3.5 z-10 inline-flex items-center gap-1.5 rounded-full glass-strong px-3 py-1 text-xs font-semibold text-chalk">
          {quality(Math.max(dw, dh))} · {dw}×{dh} · {label}
        </span>
        {!loaded && <div className="liquid-skeleton absolute inset-2 rounded-lg sm:inset-3" />}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={publicUrl(w.storage_path)}
          alt={w.title}
          width={dw}
          height={dh}
          onLoad={(e) => { setNat({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight }); setLoaded(true); }}
          onError={() => setLoaded(true)}
          className={`block h-auto max-h-[58vh] w-auto max-w-[760px] rounded-lg object-contain transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          style={{ backgroundColor: w.dominant_color ?? "rgb(var(--ink-3))" }}
        />
      </div>
    </div>
  );
}
