"use client";

import { useEffect } from "react";
import { Share, Plus, Check, X } from "lucide-react";
import { useInstall } from "@/components/install-provider";

/**
 * Step-by-step "Add to Home Screen" guide for iPhone/iPad users, since iOS
 * can't trigger installs automatically. Opened from the nav button and the
 * floating prompt via the shared InstallProvider.
 */
export function IosInstallGuide() {
  const { iosGuideOpen, closeIosGuide } = useInstall();

  useEffect(() => {
    if (!iosGuideOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeIosGuide();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [iosGuideOpen, closeIosGuide]);

  if (!iosGuideOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      onClick={closeIosGuide}
      role="dialog"
      aria-modal="true"
      aria-label="How to install on iPhone"
    >
      <div
        className="glass-strong w-full max-w-sm rounded-card p-5 shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-chalk">Install on iPhone</h2>
          <button onClick={closeIosGuide} aria-label="Close" className="focusable text-chalk-faint transition hover:text-chalk">
            <X size={18} />
          </button>
        </div>

        <ol className="space-y-3">
          <Step n={1} icon={<Share size={17} className="text-accent" />}>
            Tap the <span className="font-semibold text-chalk">Share</span> button at the bottom of Safari.
          </Step>
          <Step n={2} icon={<Plus size={17} className="text-accent" />}>
            Scroll down and tap <span className="font-semibold text-chalk">“Add to Home Screen”</span>.
          </Step>
          <Step n={3} icon={<Check size={17} className="text-accent" />}>
            Tap <span className="font-semibold text-chalk">Add</span> — the app appears on your home screen.
          </Step>
        </ol>

        <p className="mt-4 text-xs text-chalk-faint">
          Must be open in <span className="text-chalk-muted">Safari</span> — this won’t appear in Chrome or an in-app browser (like Instagram’s).
        </p>

        <button
          onClick={closeIosGuide}
          className="btn-accent focusable mt-4 h-11 w-full rounded-pill text-sm font-semibold"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

function Step({ n, icon, children }: { n: number; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink-3 text-sm font-semibold text-chalk">{n}</span>
      <p className="flex-1 pt-1.5 text-sm text-chalk-muted">{children}</p>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line">{icon}</span>
    </li>
  );
}
