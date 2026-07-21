import Link from "next/link";
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
  if (categories.length === 0) return null;
  return (
    <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
      <Pill href={withCategory(params)} label="Everything" active={!active} />
      {categories.map((c) => (
        <Pill key={c.id} href={withCategory(params, c.slug)} label={c.name} count={c.count} active={active === c.slug} />
      ))}
    </div>
  );
}

function Pill({ href, label, count, active }: { href: string; label: string; count?: number; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "focusable inline-flex shrink-0 items-center gap-1.5 rounded-pill px-4 py-2 text-sm transition",
        active ? "btn-accent font-semibold" : "surface text-chalk-muted hover:text-chalk",
      )}
    >
      {label}
      {typeof count === "number" && (
        <span className={cn("text-xs", active ? "text-white/70" : "text-chalk-faint")}>{count}</span>
      )}
    </Link>
  );
}
