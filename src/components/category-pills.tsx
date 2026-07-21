"use client";

import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

function withCategory(params: Record<string, string | undefined>, slug?: string) {
  const next = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v && k !== "category" && next.set(k, v));
  if (slug) next.set("category", slug);
  const s = next.toString();
  return s ? `/?${s}` : "/";
}

export function CategoryPills({
  categories, active, params,
}: { categories: Category[]; active?: string; params: Record<string, string | undefined> }) {
  const router = useRouter();
  if (categories.length === 0) return null;

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const slug = e.target.value;
    router.push(withCategory(params, slug || undefined));
  }

  return (
    <div className="relative">
      <select
        value={active ?? ""}
        onChange={onChange}
        className="focusable surface w-full appearance-none rounded-pill px-4 py-2.5 pr-10 text-sm text-chalk"
      >
        <option value="">Everything</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>
            {c.name}{typeof c.count === "number" ? ` (${c.count})` : ""}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-chalk-faint"
      />
    </div>
  );
}