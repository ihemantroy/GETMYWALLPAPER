"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Check } from "lucide-react";
import { COLOR_BUCKETS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ColorFilter() {
  const router = useRouter();
  const sp = useSearchParams();
  const active = sp.get("color") ?? "";

  const pick = useCallback(
    (slug: string) => {
      const p = new URLSearchParams(sp.toString());
      if (active === slug) p.delete("color");
      else p.set("color", slug);
      p.delete("page");
      p.delete("view");
      const s = p.toString();
      router.push(s ? `/?${s}` : "/", { scroll: false });
    },
    [router, sp, active],
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs uppercase tracking-widest text-chalk-faint">Colour</span>
      {COLOR_BUCKETS.map((c) => {
        const on = active === c.slug;
        return (
          <button
            key={c.slug}
            onClick={() => pick(c.slug)}
            aria-label={c.label}
            aria-pressed={on}
            title={c.label}
            className={cn(
              "focusable relative h-7 w-7 rounded-full ring-1 ring-white/20 transition-transform duration-200 hover:scale-110",
              on && "scale-110 ring-2 ring-white/70",
            )}
            style={{ backgroundColor: c.swatch }}
          >
            {on && (
              <Check
                size={14}
                className="absolute inset-0 m-auto text-white drop-shadow"
                strokeWidth={3}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
