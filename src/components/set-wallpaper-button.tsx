"use client";

import { useEffect, useState } from "react";
import { Smartphone, X, Download, Wand2, ArrowRight } from "lucide-react";
import type { Wallpaper } from "@/lib/types";
import { publicUrl } from "@/lib/supabase/storage";
import { SHORTCUTS } from "@/lib/constants";

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  // iPadOS reports as Mac — detect via touch
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

export function SetWallpaperButton({ w }: { w: Wallpaper }) {
  const [ios, setIos] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => setIos(isIOS()), []);

  if (!ios) return null;

  const img = publicUrl(w.storage_path);
  const runUrl = `shortcuts://run-shortcut?name=${encodeURIComponent(
    SHORTCUTS.setWallpaperName,
  )}&input=text&text=${encodeURIComponent(img)}`;
  const installUrl = SHORTCUTS.setWallpaperInstallUrl;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="focusable btn-accent inline-flex h-11 items-center gap-2 rounded-pill px-5 text-sm font-semibold"
      >
        <Smartphone size={16} /> Set as wallpaper
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="glass-strong w-full max-w-md rounded-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl font-bold">Set on your iPhone</h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="focusable rounded-full p-1 text-chalk-muted hover:text-chalk">
                <X size={20} />
              </button>
            </div>

            <p className="mb-5 text-sm text-chalk-muted">
              Apply this wallpaper straight to your Lock &amp; Home Screen — no saving to Photos.
              First time only, add the free shortcut, then it&apos;s one tap forever.
            </p>

            <ol className="mb-5 space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-semibold">1</span>
                <span className="text-chalk-muted">
                  {installUrl ? (
                    <a href={installUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-chalk underline underline-offset-2 hover:text-accent">
                      Add the “Set GetYourWallpaper” shortcut
                    </a>
                  ) : (
                    <span className="font-medium text-chalk">Add the “Set GetYourWallpaper” shortcut</span>
                  )}{" "}
                  (once). Allow it to run when prompted.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-semibold">2</span>
                <span className="text-chalk-muted">Come back and tap the button below — it hands this wallpaper to the shortcut.</span>
              </li>
            </ol>

            <a href={runUrl} className="focusable btn-accent flex h-12 w-full items-center justify-center gap-2 rounded-pill text-sm font-semibold">
              <Wand2 size={17} /> Apply this wallpaper <ArrowRight size={16} />
            </a>

            <a
              href={img}
              download={`${w.slug}.jpg`}
              className="mt-3 flex items-center justify-center gap-1.5 text-xs text-chalk-faint hover:text-chalk-muted"
            >
              <Download size={13} /> or just download the image
            </a>
          </div>
        </div>
      )}
    </>
  );
}
