import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function hrefFor(params: Record<string, string | undefined>, page: number) {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v && k !== "page" && p.set(k, v));
  if (page > 1) p.set("page", String(page));
  const s = p.toString();
  return s ? `/?${s}` : "/";
}

/** Build a compact page list with ellipses: 1 … 4 5 [6] 7 8 … 20 */
function pageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 1) out.push("…");
  out.push(total);
  return out;
}

export function Pagination({
  page, total, perPage, params,
}: { page: number; total: number; perPage: number; params: Record<string, string | undefined> }) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <PageLink href={hrefFor(params, page - 1)} disabled={page <= 1} aria-label="Previous">
        <ChevronLeft size={16} />
      </PageLink>

      {pageList(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-2 text-sm text-chalk-faint">…</span>
        ) : (
          <Link
            key={p}
            href={hrefFor(params, p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "focusable grid h-10 min-w-10 place-items-center rounded-pill px-3 text-sm font-medium transition",
              p === page ? "btn-accent" : "surface text-chalk-muted hover:text-chalk",
            )}
          >
            {p}
          </Link>
        ),
      )}

      <PageLink href={hrefFor(params, page + 1)} disabled={page >= totalPages} aria-label="Next">
        <ChevronRight size={16} />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href, disabled, children, ...rest
}: { href: string; disabled?: boolean; children: React.ReactNode; "aria-label"?: string }) {
  if (disabled) {
    return (
      <span className="surface grid h-10 w-10 place-items-center rounded-pill text-chalk-faint opacity-40" {...rest}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className="surface focusable grid h-10 w-10 place-items-center rounded-pill text-chalk-muted transition hover:text-chalk" {...rest}>
      {children}
    </Link>
  );
}
