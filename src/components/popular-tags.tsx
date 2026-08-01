import Link from "next/link";

// Curated quick-search chips, styled after Magnific's keyword row.
const TAGS = [
  "4K", "Dark", "Minimal", "Nature", "Abstract", "Anime",
  "Space", "Cars", "Aesthetic", "Neon", "Gradient", "AMOLED",
];

export function PopularTags() {
  return (
    <div className="no-scrollbar -mx-1 mb-6 flex gap-2 overflow-x-auto px-1">
      <span className="shrink-0 self-center pr-1 text-xs font-semibold uppercase tracking-wider text-chalk-faint">
        Popular
      </span>
      {TAGS.map((t) => (
        <Link
          key={t}
          href={`/?q=${encodeURIComponent(t.toLowerCase())}`}
          className="focusable shrink-0 rounded-full border border-line px-3.5 py-1.5 text-sm text-chalk-muted transition hover:border-accent/50 hover:text-chalk"
        >
          {t}
        </Link>
      ))}
    </div>
  );
}
