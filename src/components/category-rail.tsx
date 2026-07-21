import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

function withParam(params: Record<string, string | undefined>, key: string, val?: string) {
  const next = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v && k !== "category" && next.set(k, v));
  if (val) next.set(key, val);
  const s = next.toString();
  return s ? `/?${s}` : "/";
}

export function CategoryRail({
  categories,
  active,
  params,
}: {
  categories: Category[];
  active?: string;
  params: Record<string, string | undefined>;
}) {
  const total = categories.reduce((s, c) => s + (c.count ?? 0), 0);

  return (
    <nav className="space-y-1">
      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-chalk-faint">
        Categories
      </p>
      <RailItem href={withParam(params, "category")} label="Everything" count={total} active={!active} />
      {categories.map((c) => (
        <RailItem
          key={c.id}
          href={withParam(params, "category", c.slug)}
          label={c.name}
          count={c.count ?? 0}
          active={active === c.slug}
        />
      ))}
    </nav>
  );
}

function RailItem({
  href, label, count, active,
}: { href: string; label: string; count: number; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center justify-between rounded-xl px-3 py-2 text-sm transition",
        active ? "bg-white/[0.06] text-chalk" : "text-chalk-muted hover:bg-white/[0.03] hover:text-chalk",
      )}
    >
      <span className="flex items-center gap-2">
        {active && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
        {label}
      </span>
      <span className="text-xs text-chalk-faint">{count}</span>
    </Link>
  );
}
