import { Shuffle } from "lucide-react";
import { getWallpapers, getCategories, getFeatured } from "@/lib/queries";
import { CategoryRail } from "@/components/category-rail";
import { CategoryPills } from "@/components/category-pills";
import { SearchFilter } from "@/components/search-filter";
import { WallpaperGrid } from "@/components/wallpaper-grid";
import { WallpaperCard } from "@/components/wallpaper-card";
import { FavoritesView } from "@/components/favorites-view";
import { Countdown } from "@/components/countdown";
import { AdSlot } from "@/components/ad-slot";

export const revalidate = 120;

type SP = { [k: string]: string | string[] | undefined };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function Home({ searchParams }: { searchParams: Promise<SP> }) {
  const spRaw = await searchParams;
  const params = {
    category: one(spRaw.category),
    device: one(spRaw.device),
    sort: one(spRaw.sort) as "latest" | "popular" | undefined,
    q: one(spRaw.q),
    view: one(spRaw.view),
  };
  const isFav = params.view === "favorites";
  const filtering = Boolean(params.category || params.device || params.q || isFav);

  const [categories, featured, wallpapers] = await Promise.all([
    getCategories(),
    filtering ? Promise.resolve([]) : getFeatured(10),
    isFav ? Promise.resolve([]) : getWallpapers({
      category: params.category, device: params.device,
      sort: params.sort ?? "latest", q: params.q,
    }),
  ]);
  const catName = params.category ? categories.find((c) => c.slug === params.category)?.name : undefined;

  return (
    <main className="mx-auto max-w-7xl px-5 pb-24 pt-28 sm:px-8">
      {!filtering && (
        <>
          {/* hero — left-aligned like PXL */}
          <section className="mb-10 max-w-3xl">
            <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl">
              Wallpapers that<br />fit your <span className="text-accent">screen.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-chalk-muted">
              Fresh drops daily, sized exactly for your desktop, tablet, or phone. Free, always.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Countdown />
              <a href="/api/random" className="surface focusable inline-flex items-center gap-2 rounded-pill px-5 py-2.5 text-sm font-semibold text-chalk transition hover:bg-white/10">
                <Shuffle size={15} /> Surprise me
              </a>
            </div>
          </section>

          {/* featured — shown exactly like the grid: natural, uncropped */}
          {featured.length > 0 && (
            <section className="mb-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent-2">Handpicked</p>
              <h2 className="mb-4 mt-1 font-display text-2xl font-bold">Featured</h2>
              <div className="masonry columns-[240px]">
                {featured.slice(0, 4).map((w, i) => (
                  <WallpaperCard key={w.id} w={w} priority={i < 2} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* two-column: left categories rail · right search + grid (PXL layout) */}
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <div className="surface sticky top-24 rounded-card p-3">
            <CategoryRail categories={categories} active={params.category} params={params} />
          </div>
        </aside>

        <section>
          <SearchFilter />
          {/* mobile categories */}
          <div className="mt-4 lg:hidden">
            <CategoryPills categories={categories} active={params.category} params={params} />
          </div>

          <div className="mt-8">
            {filtering && !isFav && (
              <p className="mb-5 text-sm text-chalk-muted">
                {catName ? <>Showing <span className="text-chalk">{catName}</span></> : "Filtered results"}
              </p>
            )}
            {isFav ? (
              <FavoritesView categories={categories} />
            ) : (
              <>
                <WallpaperGrid
                  wallpapers={wallpapers}
                  categories={categories}
                  empty={{
                    title: filtering ? "No matches" : "The wall is empty — for now",
                    body: filtering
                      ? "Try a different category or device."
                      : "Wallpapers appear here the moment they're published. Head to the admin panel to add your first.",
                    cta: filtering ? undefined : { href: "/admin/upload", label: "Upload wallpapers" },
                  }}
                />
                {!filtering && wallpapers.length >= 8 && <AdSlot className="mt-10" />}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
