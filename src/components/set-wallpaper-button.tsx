"use client";

import { useState } from "react";
import { Wand2, Share2, X } from "lucide-react";

function fileName(title: string) {
  const s = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${s || "wallpaper"}.jpg`;
}

/**
 * "Set as wallpaper" — the closest a web app can get. On Android with Web Share
 * Level 2, one tap opens the system sheet where the user picks "Set as
 * wallpaper". Elsewhere it saves the image and shows short per-platform steps
 * (browsers/OSes don't allow a site to set the wallpaper directly).
 */
export function SetWallpaperButton({ fileUrl, title }: { fileUrl: string; title: string }) {
  const [showHelp, setShowHelp] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    try {
      const res = await fetch(fileUrl);
      const blob = await res.blob();
      const file = new File([blob], fileName(title), { type: blob.type || "image/jpeg" });

      const nav = navigator as Navigator & { canShare?: (data: { files: File[] }) => boolean };
      if (nav.canShare?.({ files: [file] }) && typeof navigator.share === "function") {
        await navigator.share({ files: [file], title, text: "Set as wallpaper" });
      } else {
        // Fallback: save the image, then show how to set it.
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
        setShowHelp(true);
      }
    } catch {
      setShowHelp(true); // share cancelled or fetch blocked — offer manual steps
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={busy}
        className="btn-accent focusable inline-flex h-11 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-sm font-semibold disabled:opacity-60"
      >
        <Wand2 size={16} />
        {busy ? "Preparing…" : "Set as wallpaper"}
      </button>

      {showHelp && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setShowHelp(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="glass-strong w-full max-w-sm rounded-card p-5 shadow-lift" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-chalk">Set as wallpaper</h2>
              <button onClick={() => setShowHelp(false)} aria-label="Close" className="focusable text-chalk-faint hover:text-chalk">
                <X size={18} />
              </button>
            </div>

            <p className="mb-3 text-sm text-chalk-muted">
              Saved to your device. To set it as your background:
            </p>
            <div className="space-y-3 text-sm text-chalk-muted">
              <p>
                <span className="font-semibold text-chalk">Android:</span> open the image in your Gallery, tap the menu, and choose{" "}
                <span className="text-chalk">“Set as wallpaper.”</span>
              </p>
              <p>
                <span className="font-semibold text-chalk">iPhone:</span> open{" "}
                <span className="text-chalk">Settings → Wallpaper → Add New Wallpaper</span>, then pick this image from your Photos.
              </p>
            </div>

            <p className="mt-4 flex items-center gap-1.5 text-xs text-chalk-faint">
              <Share2 size={13} /> No website can set the wallpaper for you — this is the last quick step.
            </p>

            <button onClick={() => setShowHelp(false)} className="btn-accent focusable mt-4 h-11 w-full rounded-pill text-sm font-semibold">
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
