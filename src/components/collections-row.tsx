import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Wallpaper } from "@/lib/types";
import { renderUrl } from "@/lib/supabase/storage";

const COLLECTIONS = [
  { slug: "dark", name: "Dark Aesthetic" },
  { slug: "amoled", name: "Neon Dreams" },
  { slug: "nature", name: "Mountain Escape" },
  { slug: "space", name: "Galaxy Collection" },
  { slug: "minimal", name: "Minimal Setup" },
  { slug: "4k", name: "Ultra 4K" },
];

export function CollectionsRow({ covers }: { covers: Wallpaper[] }) {
  if (!covers.length) return null;
  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent/80">Curated</p>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">Collections</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {COLLECTIONS.map((c, i) => {
          const cover = covers[i % covers.length];
          return (
            <Link
              key={c.slug}
              href={`/wallpapers/${c.slug}`}
              className="focusable group relative block overflow-hidden rounded-3xl border border-white/[0.06]"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={renderUrl(cover.storage_path, { width: 700, quality: 78 })}
                  alt={c.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundColor: cover.dominant_color ?? "#0b0b12" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                <h3 className="font-display text-xl font-bold text-white">{c.name}</h3>
                <span className="glass-strong inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-semibold text-white transition group-hover:gap-2.5">
                  Explore <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
