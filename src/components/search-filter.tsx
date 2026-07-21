"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Search, Monitor, Tablet, Smartphone, Heart } from "lucide-react";
import { DEVICES, SORTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const deviceIcon: Record<string, typeof Monitor> = {
  desktop: Monitor, tablet: Tablet, phone: Smartphone,
};

export function SearchFilter() {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");

  const device = sp.get("device") ?? "";
  const sort = sp.get("sort") ?? "latest";
  const favActive = sp.get("view") === "favorites";

  const push = useCallback(
    (mut: (p: URLSearchParams) => void) => {
      const p = new URLSearchParams(sp.toString());
      mut(p);
      const s = p.toString();
      router.push(s ? `/?${s}` : "/", { scroll: false });
    },
    [router, sp],
  );

  useEffect(() => setQ(sp.get("q") ?? ""), [sp]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    push((p) => (q ? p.set("q", q) : p.delete("q")));
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submitSearch} className="relative">
        <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-chalk-faint" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search wallpapers, vibes, colors…"
          className="focusable surface h-12 w-full rounded-pill pl-11 pr-4 text-sm text-chalk placeholder:text-chalk-faint"
        />
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <Pill active={!device && !favActive} onClick={() => push((p) => { p.delete("device"); p.delete("view"); })}>
          All
        </Pill>
        {DEVICES.map((d) => {
          const Icon = deviceIcon[d.slug];
          return (
            <Pill
              key={d.slug}
              active={device === d.slug && !favActive}
              onClick={() => push((p) => { p.set("device", d.slug); p.delete("view"); })}
            >
              <Icon size={14} /> {d.label}
            </Pill>
          );
        })}

        <div className="ml-auto flex items-center gap-2">
          {SORTS.map((s) => (
            <Pill key={s.slug} active={sort === s.slug && !favActive} onClick={() => push((p) => { p.set("sort", s.slug); p.delete("view"); })}>
              {s.label}
            </Pill>
          ))}
          <Pill active={favActive} onClick={() => push((p) => favActive ? p.delete("view") : p.set("view", "favorites"))}>
            <Heart size={14} fill={favActive ? "currentColor" : "none"} /> Favorites
          </Pill>
        </div>
      </div>
    </div>
  );
}

function Pill({
  children, active, onClick,
}: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "focusable inline-flex h-9 items-center gap-1.5 rounded-pill px-4 text-sm transition",
        active ? "btn-accent font-semibold" : "surface text-chalk-muted hover:text-chalk",
      )}
    >
      {children}
    </button>
  );
}
