"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";
import type { Wallpaper } from "@/lib/types";
import { renderUrl } from "@/lib/supabase/storage";
import { FavoriteButton } from "@/components/favorite-button";

function isNew(w: Wallpaper) {
  const d = w.published_at ?? w.created_at;
  return d ? Date.now() - new Date(d).getTime() < 7 * 864e5 : false;
}

// portrait for phone/tablet, landscape for laptop/desktop — uniform tiles per view.
// Literal class strings so Tailwind's JIT picks them up.
const ASPECT_BY_DEVICE: Record<string, string> = {
  phone: "aspect-[9/16]",
  tablet: "aspect-[3/4]",
  desktop: "aspect-[16/10]",
};

export function WallpaperCard({
  w, categoryName, priority = false, device,
}: { w: Wallpaper; categoryName?: string; priority?: boolean; device?: string }) {
  const aspect = (device && ASPECT_BY_DEVICE[device]) || "aspect-[3/4]";
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  // Cached / server-rendered images can finish loading before React attaches
  // onLoad, so the event never fires — check completeness on mount so the
  // image is never left permanently hidden.
  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], ["4deg", "-4deg"]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], ["-4deg", "4deg"]), { stiffness: 200, damping: 18 });

  // liquid-drop specular highlight that tracks the cursor across the glass
  const gx = useTransform(mx, (v) => `${(v + 0.5) * 100}%`);
  const gy = useTransform(my, (v) => `${(v + 0.5) * 100}%`);
  const glare = useMotionTemplate`radial-gradient(190px circle at ${gx} ${gy}, rgba(255,255,255,0.35), rgba(255,255,255,0.06) 45%, transparent 68%)`;

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }
  const reset = () => { mx.set(0); my.set(0); };

  const hot = (w.download_count ?? 0) >= 20;
  const fresh = isNew(w);

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "120px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group relative [perspective:1200px]"
    >
      <motion.div onMouseMove={onMove} onMouseLeave={reset} style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}>
        <Link
          href={`/wallpaper/${w.slug}`}
          className={`focusable relative block ${aspect} overflow-hidden rounded-card ring-1 ring-white/10 transition-shadow duration-300 hover:shadow-lift`}
        >
          {/* uniform tiles — thumbnail is framed to a tidy portrait (center-crop);
              the full-resolution wallpaper still downloads uncropped */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={renderUrl(w.storage_path, {
              width: 640,
              height: Math.round(640 * (w.height / w.width)),
            })}
            alt={w.title}
            loading={priority ? "eager" : "lazy"}
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-[transform,filter,opacity] duration-700 ease-out group-hover:scale-[1.05] ${loaded ? "opacity-100 blur-0" : "opacity-0 blur-md"}`}
            style={{ backgroundColor: w.dominant_color ?? "#12121b" }}
          />

          {/* liquid-glass rim light */}
          <div className="liquid-rim pointer-events-none absolute inset-0" style={{ transform: "translateZ(6px)" }} />

          {/* liquid shine — a light band glides across once the tile appears */}
          <div className={`liquid-sheen pointer-events-none absolute inset-0 ${loaded ? "liquid-sheen--run" : ""}`} style={{ transform: "translateZ(8px)" }} />

          {/* cursor-tracked specular droplet — the premium liquid glass touch */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: glare, transform: "translateZ(12px)" }}
          />

          <div className="pointer-events-none absolute left-3 top-3 flex gap-1.5" style={{ transform: "translateZ(30px)" }}>
            {fresh && (
              <span className="glass-strong inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-[11px] font-semibold text-white">
                <Sparkles size={11} /> NEW
              </span>
            )}
            {hot && (
              <span className="inline-flex items-center gap-1 rounded-pill bg-gradient-to-r from-orange-500 to-pink-500 px-2.5 py-1 text-[11px] font-semibold text-white">
                <Flame size={11} /> HOT
              </span>
            )}
          </div>

          <div className="glass-cap pointer-events-none absolute inset-x-0 bottom-0 translate-y-1 p-3.5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100" style={{ transform: "translateZ(20px)" }}>
            <p className="truncate text-[13px] font-semibold text-white sm:text-[15px]">{w.title}</p>
            {categoryName && <p className="mt-0.5 text-[11px] text-white/70 sm:text-xs">{categoryName}</p>}
          </div>
        </Link>

        <div className="absolute right-3 top-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ transform: "translateZ(40px)" }}>
          <FavoriteButton id={w.id} />
        </div>
      </motion.div>
    </motion.article>
  );
}
