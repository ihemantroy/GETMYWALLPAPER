"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";
import type { Wallpaper } from "@/lib/types";
import { renderUrl } from "@/lib/supabase/storage";
import { FavoriteButton } from "@/components/favorite-button";

function isNew(w: Wallpaper) {
  const d = w.published_at ?? w.created_at;
  return d ? Date.now() - new Date(d).getTime() < 7 * 864e5 : false;
}

export function WallpaperCard({
  w, categoryName, priority = false,
}: { w: Wallpaper; categoryName?: string; priority?: boolean }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], ["5deg", "-5deg"]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], ["-5deg", "5deg"]), { stiffness: 200, damping: 18 });

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
          className="focusable relative block overflow-hidden rounded-card ring-1 ring-white/10 transition-shadow duration-300 hover:shadow-lift"
        >
          {/* natural sizing — the image defines its own shape, so it never crops */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={renderUrl(w.storage_path, { width: 640 })}
            alt={w.title}
            loading={priority ? "eager" : "lazy"}
            className="block h-auto w-full transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
            style={{ backgroundColor: w.dominant_color ?? "#12121b" }}
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

          <div className="glass-cap pointer-events-none absolute inset-x-0 bottom-0 translate-y-1 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100" style={{ transform: "translateZ(20px)" }}>
            <p className="truncate text-[15px] font-semibold text-white">{w.title}</p>
            {categoryName && <p className="mt-0.5 text-xs text-white/70">{categoryName}</p>}
          </div>
        </Link>

        <div className="absolute right-3 top-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ transform: "translateZ(40px)" }}>
          <FavoriteButton id={w.id} />
        </div>
      </motion.div>
    </motion.article>
  );
}
