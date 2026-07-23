"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Monitor, Tablet, Smartphone, Layers } from "lucide-react";

const KEY = "gyw_device";
const OPTIONS = [
  { slug: "phone", label: "Phone", Icon: Smartphone },
  { slug: "tablet", label: "Tablet", Icon: Tablet },
  { slug: "desktop", label: "Desktop", Icon: Monitor },
] as const;

/**
 * Device selector. Does NOT guess — the visitor chooses (see DeviceWelcome).
 * On return visits it re-applies whatever they picked last time.
 */
export function DeviceSwitcher() {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("device");
  const ran = useRef(false);

  // Re-apply the remembered choice when arriving without one in the URL.
  useEffect(() => {
    if (ran.current || current) return;
    ran.current = true;
    let saved: string | null = null;
    try { saved = localStorage.getItem(KEY); } catch { /* private mode */ }
    if (!saved || saved === "all") return; // never asked yet, or they chose "everything"
    const next = new URLSearchParams(Array.from(params.entries()));
    next.set("device", saved);
    router.replace(`/?${next.toString()}`, { scroll: false });
  }, [current, params, router]);

  function choose(slug: string | null) {
    try { localStorage.setItem(KEY, slug ?? "all"); } catch { /* ignore */ }
    const next = new URLSearchParams(Array.from(params.entries()));
    if (slug) next.set("device", slug);
    else next.delete("device");
    next.delete("page");
    router.push(next.toString() ? `/?${next.toString()}` : "/", { scroll: false });
  }

  return (
    <div className="mb-8">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-chalk-faint">
        Showing wallpapers for
      </p>
      <div className="surface inline-flex flex-wrap gap-1 rounded-pill p-1">
        {OPTIONS.map(({ slug, label, Icon }) => {
          const on = current === slug;
          return (
            <button
              key={slug}
              onClick={() => choose(slug)}
              aria-pressed={on}
              className={`focusable inline-flex items-center gap-2 rounded-pill px-4 py-2 text-sm font-medium transition ${
                on ? "btn-accent" : "text-chalk-muted hover:text-chalk"
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          );
        })}
        <button
          onClick={() => choose(null)}
          aria-pressed={!current}
          className={`focusable inline-flex items-center gap-2 rounded-pill px-4 py-2 text-sm font-medium transition ${
            !current ? "btn-accent" : "text-chalk-muted hover:text-chalk"
          }`}
        >
          <Layers size={15} /> All
        </button>
      </div>
    </div>
  );
}
