"use client";

import { useState } from "react";
import { ChevronDown, Download, Loader2 } from "lucide-react";
import type { Wallpaper } from "@/lib/types";
import { renderUrl } from "@/lib/supabase/storage";
import { RESOLUTION_GRID } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ResolutionGrid({ w }: { w: Wallpaper }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  async function download(width: number, height: number) {
    const key = `${width}x${height}`;
    setBusy(key);
    try {
      fetch(`/api/download/${w.id}`, { method: "POST" }).catch(() => {});
      const src = renderUrl(w.storage_path, { width, height, quality: 95 });
      const res = await fetch(src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${w.slug}-${width}x${height}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      window.dispatchEvent(new Event("wallpaper-downloaded"));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="surface overflow-hidden rounded-card">
      <button
        onClick={() => setOpen((v) => !v)}
        className="focusable flex w-full items-center justify-between px-5 py-4 text-sm font-semibold"
      >
        <span className="flex items-center gap-2">
          <Download size={16} /> Download in different resolutions
        </span>
        <ChevronDown size={18} className={cn("text-chalk-muted transition", open && "rotate-180")} />
      </button>

      {open && (
        <div className="space-y-5 border-t border-line px-5 py-5">
          {RESOLUTION_GRID.map(({ group, sizes }) => (
            <div key={group}>
              <p className="mb-2 text-xs uppercase tracking-widest text-chalk-faint">{group}</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map(([width, height]) => {
                  const key = `${width}x${height}`;
                  return (
                    <button
                      key={key}
                      onClick={() => download(width, height)}
                      disabled={busy === key}
                      className="focusable inline-flex items-center gap-1.5 rounded-pill border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-xs text-chalk-muted transition hover:border-white/20 hover:text-chalk disabled:opacity-60"
                    >
                      {busy === key && <Loader2 size={12} className="animate-spin" />}
                      {width}×{height}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <p className="pt-1 text-[11px] text-chalk-faint">
            Each size is auto-fitted to those exact pixels — no manual cropping. Choose a size at or below the
            original ({w.width}×{w.height}) for the sharpest result.
          </p>
        </div>
      )}
    </div>
  );
}
