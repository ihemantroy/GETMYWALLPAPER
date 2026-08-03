"use client";

import { useState } from "react";
import { Download, X, Share } from "lucide-react";
import { useInstall } from "@/components/install-provider";

/**
 * Floating install prompt at the bottom of the screen. Shares state with the
 * nav button via InstallProvider. iOS Safari can't auto-prompt, so it shows
 * the manual "Share → Add to Home Screen" hint there.
 */
export function InstallButton() {
  const { canInstall, isIosSafari, promptInstall, openIosGuide } = useInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="glass-strong pointer-events-auto flex items-center gap-3 rounded-pill px-4 py-2.5 shadow-lift">
        {isIosSafari ? (
          <button
            onClick={() => openIosGuide()}
            className="focusable flex items-center gap-2 text-sm text-chalk"
          >
            <Share size={16} className="text-accent" />
            How to install on iPhone
          </button>
        ) : (
          <>
            <span className="text-sm text-chalk">Install GetYourWallpaper</span>
            <button
              onClick={() => promptInstall()}
              className="btn-accent focusable inline-flex h-9 items-center gap-1.5 rounded-pill px-4 text-sm font-semibold"
            >
              <Download size={15} /> Install
            </button>
          </>
        )}
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="focusable text-chalk-faint transition hover:text-chalk"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
