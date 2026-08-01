"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, ChevronDown, Loader2, Check } from "lucide-react";
import type { Wallpaper } from "@/lib/types";
import { publicUrl, renderUrl } from "@/lib/supabase/storage";
import { RESOLUTIONS } from "@/lib/constants";
import { formatBytes } from "@/lib/utils";

type Res = { label: string; w: number; h: number; original?: boolean; mine?: boolean };

/**
 * Prominent Download button with a size dropdown — mirrors Magnific's detail
 * page. Defaults to the original file; the chevron opens other resolutions.
 */
export function DownloadButton({ w }: { w: Wallpaper }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [myScreen, setMyScreen] = useState<Res | null>(null);
  const [natRatio, setNatRatio] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dpr = window.devicePixelRatio || 1;
    const sw = Math.round(window.screen.width * dpr);
    const sh = Math.round(window.screen.height * dpr);
    if (sw && sh) setMyScreen({ label: "Your screen", w: sw, h: sh, mine: true });
  }, []);

  // Read the real (rendered) aspect ratio so presets match what's on screen,
  // even when the stored width/height are wrong (EXIF rotation / swapped).
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => { if (img.naturalWidth && img.naturalHeight) setNatRatio(img.naturalWidth / img.naturalHeight); };
    img.src = publicUrl(w.storage_path);
  }, [w.storage_path]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const portrait = natRatio != null ? natRatio < 1 : w.height >= w.width;
  const presets = RESOLUTIONS[portrait ? "phone" : "desktop"] ?? [];

  // Corrected "original" dimensions, matching the true orientation.
  const storedLong = Math.max(w.width, w.height) || 0;
  const orig = (() => {
    if (natRatio == null || !storedLong) return { w: w.width, h: w.height };
    return natRatio >= 1
      ? { w: storedLong, h: Math.round(storedLong / natRatio) }
      : { w: Math.round(storedLong * natRatio), h: storedLong };
  })();

  const options: Res[] = useMemo(() => {
    const list: Res[] = [{ label: "Original", w: orig.w, h: orig.h, original: true }];
    if (myScreen) {
      const screenPortrait = myScreen.h > myScreen.w;
      if (screenPortrait === portrait) list.push(myScreen);
    }
    return [...list, ...presets];
  }, [myScreen, presets, portrait, orig.w, orig.h]);

  async function download(r: Res) {
    setBusy(r.label);
    setOpen(false);
    try {
      await fetch(`/api/download/${w.id}`, { method: "POST" }).catch(() => {});
      window.dispatchEvent(new Event("wallpaper-downloaded"));
      const filename = r.original
        ? `${w.slug}-${orig.w}x${orig.h}.jpg`
        : `${w.slug}-${r.w}x${r.h}.jpg`;
      const src = r.original
        ? publicUrl(w.storage_path)
        : renderUrl(w.storage_path, { width: r.w, height: r.h, quality: 95 });
      try {
        const res = await fetch(src);
        if (!res.ok) throw new Error("unavailable");
        const url = URL.createObjectURL(await res.blob());
        trigger(url, filename);
        setTimeout(() => URL.revokeObjectURL(url), 4000);
      } catch {
        trigger(publicUrl(w.storage_path), filename);
      }
    } finally {
      setBusy(null);
    }
  }

  function trigger(href: string, filename: string) {
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div ref={ref} className="relative flex">
      <button
        onClick={() => download(options[0])}
        disabled={!!busy}
        className="btn-primary focusable inline-flex h-11 items-center gap-2 rounded-l-full pl-5 pr-4 text-sm font-semibold disabled:opacity-70"
      >
        {busy ? <Loader2 size={17} className="animate-spin" /> : <Download size={17} />}
        Download
      </button>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={!!busy}
        aria-label="Choose size"
        className="btn-primary focusable grid h-11 w-10 place-items-center rounded-r-full border-l border-black/15 disabled:opacity-70"
      >
        <ChevronDown size={16} className={open ? "rotate-180 transition" : "transition"} />
      </button>

      {open && (
        <div className="glass-strong absolute right-0 top-12 z-20 w-64 rounded-card p-1.5 shadow-lift">
          {options.map((r) => (
            <button
              key={r.label}
              onClick={() => download(r)}
              className="focusable flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-chalk transition hover:bg-ink-3"
            >
              <span className="flex items-center gap-2">
                {busy === r.label ? <Loader2 size={13} className="animate-spin" /> : r.mine ? <Check size={13} className="text-accent" /> : <Download size={13} className="text-chalk-faint" />}
                {r.label}
              </span>
              <span className="font-mono text-xs text-chalk-faint">{r.w}×{r.h}</span>
            </button>
          ))}
          <p className="px-3 pb-1.5 pt-2 text-[11px] text-chalk-faint">
            Original · {formatBytes(w.file_size)} · fitted to the exact pixels you pick.
          </p>
        </div>
      )}
    </div>
  );
}
