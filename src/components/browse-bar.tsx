"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Layers, Monitor, Smartphone, Tablet, ChevronDown } from "lucide-react";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

const TABS = [
  { slug: "", label: "All", Icon: Layers },
  { slug: "desktop", label: "Desktop", Icon: Monitor },
  { slug: "phone", label: "Phone", Icon: Smartphone },
  { slug: "tablet", label: "Tablet", Icon: Tablet },
] as const;

/**
 * The filter row under the page title — device type tabs on the left,
 * sort + category selects on the right. Mirrors Magnific's browse header.
 */
export function BrowseBar({ categories = [] }: { categories?: Category[] }) {
  const router = useRouter();
  const sp = useSearchParams();

  const device = sp.get("device") ?? "";
  const sort = sp.get("sort") ?? "latest";
  const category = sp.get("category") ?? "";

  const push = useCallback(
    (mut: (p: URLSearchParams) => void) => {
      const p = new URLSearchParams(sp.toString());
      mut(p);
      p.delete("page");
      const s = p.toString();
      window.dispatchEvent(new Event("app:navstart"));
      router.push(s ? `/?${s}` : "/", { scroll: false });
    },
    [router, sp],
  );

  return (
    <div className="flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
      {/* device type tabs */}
      <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
        {TABS.map(({ slug, label, Icon }) => {
          const on = device === slug;
          return (
            <button
              key={label}
              onClick={() => push((p) => (slug ? p.set("device", slug) : p.delete("device")))}
              aria-pressed={on}
              className={cn(
                "focusable inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition",
                on ? "btn-primary" : "border border-line text-chalk-muted hover:text-chalk",
              )}
            >
              <Icon size={15} /> {label}
            </button>
          );
        })}
      </div>

      {/* sort + category */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => push((p) => (e.target.value === "latest" ? p.delete("sort") : p.set("sort", e.target.value)))}
            className="focusable h-10 appearance-none rounded-full border border-line bg-ink-2 pl-4 pr-9 text-sm font-medium text-chalk"
          >
            <option value="latest">Newest</option>
            <option value="popular">Popular</option>
          </select>
          <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-chalk-faint" />
        </div>

        {categories.length > 0 && (
          <div className="relative">
            <select
              value={category}
              onChange={(e) => push((p) => (e.target.value ? p.set("category", e.target.value) : p.delete("category")))}
              className="focusable h-10 appearance-none rounded-full border border-line bg-ink-2 pl-4 pr-9 text-sm font-medium text-chalk"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-chalk-faint" />
          </div>
        )}
      </div>
    </div>
  );
}
