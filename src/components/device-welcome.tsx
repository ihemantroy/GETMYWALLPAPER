"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Monitor, Tablet, Smartphone } from "lucide-react";
import { SITE } from "@/lib/constants";

const KEY = "gyw_device";

const OPTIONS = [
  { slug: "phone", label: "Phone", hint: "Tall wallpapers for mobile", Icon: Smartphone },
  { slug: "tablet", label: "Tablet", hint: "Sized for iPad and tablets", Icon: Tablet },
  { slug: "desktop", label: "Desktop / Laptop", hint: "Wide wallpapers for big screens", Icon: Monitor },
] as const;

/**
 * First-visit prompt asking which device the visitor wants wallpapers for.
 * Renders on the client only, so search engines still crawl the full homepage.
 * Shown once — the answer is remembered for future visits.
 */
export function DeviceWelcome() {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setOpen(true);
    } catch {
      /* private mode — just skip the prompt */
    }
  }, []);

  function pick(slug: string) {
    try { localStorage.setItem(KEY, slug); } catch { /* ignore */ }
    setOpen(false);
    const next = new URLSearchParams(Array.from(params.entries()));
    next.set("device", slug);
    next.delete("page");
    router.replace(`/?${next.toString()}`, { scroll: false });
  }

  function skip() {
    try { localStorage.setItem(KEY, "all"); } catch { /* ignore */ }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="device-welcome-title"
      className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-5 backdrop-blur-sm"
    >
      <div className="glass-strong w-full max-w-lg rounded-xl2 p-7 text-center sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-2">
          Welcome to {SITE.name}
        </p>
        <h2 id="device-welcome-title" className="mt-2 font-display text-3xl font-bold sm:text-4xl">
          What are you looking for?
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-chalk-muted">
          Pick your screen and we&apos;ll only show wallpapers that fit it perfectly.
        </p>

        <div className="mt-7 grid gap-3">
          {OPTIONS.map(({ slug, label, hint, Icon }) => (
            <button
              key={slug}
              onClick={() => pick(slug)}
              className="focusable surface group flex items-center gap-4 rounded-card p-4 text-left transition hover:bg-white/10"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-pill bg-accent/15 text-accent transition group-hover:bg-accent/25">
                <Icon size={20} />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-chalk">{label}</span>
                <span className="block text-xs text-chalk-muted">{hint}</span>
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={skip}
          className="focusable mt-5 text-xs text-chalk-faint underline underline-offset-4 transition hover:text-chalk"
        >
          Show me everything instead
        </button>
      </div>
    </div>
  );
}
