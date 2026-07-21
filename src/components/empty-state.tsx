import Link from "next/link";
import { ImageOff } from "lucide-react";

export function EmptyState({
  title = "Nothing here yet",
  body = "This space fills up the moment wallpapers are published.",
  cta,
}: {
  title?: string;
  body?: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="surface mx-auto max-w-lg rounded-card p-12 text-center">
      <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-pill bg-white/5">
        <ImageOff className="text-chalk-faint" size={24} />
      </div>
      <h3 className="font-display text-2xl font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-chalk-muted">{body}</p>
      {cta && (
        <Link href={cta.href} className="btn-accent focusable mt-6 inline-flex h-11 items-center rounded-pill px-6 text-sm font-semibold transition hover:brightness-110">
          {cta.label}
        </Link>
      )}
    </div>
  );
}
