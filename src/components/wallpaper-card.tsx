"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Flame, Sparkles, Download, Link2, Check } from "lucide-react";
import type { Wallpaper } from "@/lib/types";
import { renderUrl, publicUrl } from "@/lib/supabase/storage";
import { FavoriteButton } from "@/components/favorite-button";

function isNew(w: Wallpaper) {
  const d = w.published_at ?? w.created_at;
  return d ? Date.now() - new Date(d).getTime() < 7 * 864e5 : false;
}

/**
 * Gallery tile — a clean, Magnific-style card. The image keeps its natural
 * aspect ratio (so desktop + phone uploads sit nicely in the masonry), with a
 * quiet hover overlay for the title and actions.
 */
export function WallpaperCard({
  w, categoryName, priority = false,
}: { w: Wallpaper; categoryName?: string; priority?: boolean; device?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  async function quickDownload(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    fetch(`/api/download/${w.id}`, { method: "POST" }).catch(() => {});
    try {
      const res = await fetch(publicUrl(w.storage_path));
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = `${w.slug}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch {
      window.open(publicUrl(w.storage_path), "_blank");
    }
  }

  function copyLink(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/wallpaper/${w.slug}`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const hot = (w.download_count ?? 0) >= 20;
  const fresh = isNew(w);
  const ratio = w.width && w.height ? w.width / w.height : 3 / 4;

  return (
    <article className="group relative">
      <Link
        href={`/wallpaper/${w.slug}`}
        className="focusable relative block overflow-hidden rounded-card border border-line transition-shadow duration-300 hover:shadow-lift"
        style={{ aspectRatio: String(ratio), backgroundColor: w.dominant_color ?? "rgb(var(--ink-3))" }}
      >
        {!loaded && <div className="liquid-skeleton absolute inset-0" />}
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
          className={`absolute inset-0 h-full w-full object-cover transition-[transform,opacity] duration-500 ease-out group-hover:scale-[1.03] ${loaded ? "opacity-100" : "opacity-0"}`}
        />

        {/* badges */}
        <div className="pointer-events-none absolute left-2.5 top-2.5 flex gap-1.5">
          {fresh && (
            <span className="glass-strong inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-chalk">
              <Sparkles size={11} /> New
            </span>
          )}
          {hot && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-2 py-0.5 text-[11px] font-semibold text-white">
              <Flame size={11} /> Hot
            </span>
          )}
        </div>

        {/* hover caption */}
        <div className="glass-cap pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-white">{w.title}</p>
            {categoryName && <p className="mt-0.5 truncate text-[11px] text-white/70">{categoryName}</p>}
          </div>
          {typeof w.download_count === "number" && w.download_count > 0 && (
            <span className="flex shrink-0 items-center gap-1 text-[11px] text-white/80">
              <Download size={12} /> {w.download_count}
            </span>
          )}
        </div>
      </Link>

      {/* quick actions — Magnific-style hover cluster */}
      <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <button
          onClick={quickDownload}
          aria-label="Download"
          title="Download"
          className="focusable grid h-8 w-8 place-items-center rounded-full glass-strong text-chalk transition hover:bg-ink-3"
        >
          <Download size={15} />
        </button>
        <button
          onClick={copyLink}
          aria-label="Copy link"
          title="Copy link"
          className="focusable grid h-8 w-8 place-items-center rounded-full glass-strong text-chalk transition hover:bg-ink-3"
        >
          {copied ? <Check size={15} className="text-green-400" /> : <Link2 size={15} />}
        </button>
        <FavoriteButton id={w.id} />
      </div>
    </article>
  );
}
