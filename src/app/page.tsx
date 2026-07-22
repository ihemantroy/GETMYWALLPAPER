import Link from "next/link";
import { Shuffle, Download, Sun } from "lucide-react";
import { getWallpapersPage, getCategories, getFeatured, getWallpaperOfTheDay, PER_PAGE } from "@/lib/queries";
import { renderUrl } from "@/lib/supabase/storage";
import { CategoryRail } from "@/components/category-rail";
import { CategoryPills } from "@/components/category-pills";
import { SearchFilter } from "@/components/search-filter";
import { WallpaperGrid } from "@/components/wallpaper-grid";
import { WallpaperCard } from "@/components/wallpaper-card";
import { FavoritesView } from "@/components/favorites-view";
import { Countdown } from "@/components/countdown";
import { Pagination } from "@/components/pagination";
import { YourDaily } from "@/components/your-daily";
import { AdSlot } from "@/components/ad-slot";

export const revalidate = 120;

type SP = { [k: string]: string | string[] | undefined };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function Home({ searchParams }: { searchParams: Promise<SP> }) {
  const spRaw = await searchParams;
  const page = Math.max(1, parseInt(one(spRaw.page) ?? "1", 10) || 1);
  const params = {
    category: one(spRaw.category),
    device: one(spRaw.device),
    sort: one(spRaw.sort) as "latest" | "popular" | undefined,
    q: one(spRaw.q),
    view: one(spRaw.view),
    page: page > 1 ? String(page) : undefined,
  };
  const isFav = params.view === "favorites";
  const filtering = Boolean(params.category || params.device || params.q || isFav);
  const showIntro = !filtering && page === 1; // hero + featured only on the clean first page

  const [categories, featured, wotd, pageData] = await Promise.all([
    getCategories(),
    showIntro ? getFeatured(4) : Promise.resolve([]),
    showIntro ? getWallpaperOfTheDay() : Promise.resolve(null),
    isFav ? Promise.resolve({ items: [], total: 0 }) : getWallpapersPage({
      category: params.category, device: params.device,
      sort: params.sort ?? "latest", q: params.q, page,
    }),
  ]);
  const { items: wallpapers, total } = pageData;
  const catName = params.category ? categories.find((c) => c.slug === params.category)?.name : undefined;

  return (
    <main className="mx-auto max-w-7xl px-5 pb-24 pt-28 sm:px-8">
      {showIntro && (
        <>
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

          {wotd && (
            <section className="mb-12">
              <Link
                href={`/wallpaper/${wotd.slug}`}
                className="group relative block overflow-hidden rounded-xl2 ring-1 ring-white/10"
              >
                <div className="relative aspect-[16/8] w-full sm:aspect-[16/6]">
                  <img
                    src={renderUrl(wotd.storage_path, { width: 1600 })}
                    alt={wotd.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />
                </div>
                <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 p-6 sm:p-8">
                  <div className="min-w-0">
                    <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-accent-2">
                      <Sun size={13} /> Wallpaper of the Day
                    </p>
                    <p className="mt-2 truncate font-display text-2xl font-bold text-white sm:text-4xl">{wotd.title}</p>
                    <div className="mt-3"><Countdown /></div>
                  </div>
                  <span className="btn-accent hidden shrink-0 items-center gap-2 rounded-pill px-6 py-3 text-sm font-semibold sm:inline-flex">
                    <Download size={16} /> Get it
                  </span>
                </div>
              </Link>
            </section>
          )}

          {featured.length > 0 && (
            <section className="mb-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent-2">Handpicked</p>
              <h2 className="mb-4 mt-1 font-display text-2xl font-bold">Featured</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {featured.slice(0, 4).map((w, i) => (
                  <WallpaperCard key={w.id} w={w} priority={i < 2} />
                ))}
              </div>
            </section>
          )}
          <YourDaily />
        </>
      )}

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <div className="surface sticky top-24 rounded-card p-3">
            <CategoryRail categories={categories} active={params.category} params={params} />
          </div>
        </aside>

        <section className="min-w-0">
          <SearchFilter />
          <div className="mt-4 lg:hidden">
            <CategoryPills categories={categories} active={params.category} params={params} />
          </div>

          <div className="mt-8">
            {!isFav && total > 0 && (
              <p className="mb-5 text-sm text-chalk-muted">
                {catName ? <>Showing <span className="text-chalk">{catName}</span> · </> : filtering ? "Filtered · " : ""}
                <span className="text-chalk">{total}</span> wallpaper{total === 1 ? "" : "s"}
                {" "}· page <span className="text-chalk">{page}</span> of {Math.max(1, Math.ceil(total / PER_PAGE))}
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
                    title: filtering ? "No matches" : page > 1 ? "Nothing on this page" : "The wall is empty — for now",
                    body: filtering
                      ? "Try a different category or device."
                      : page > 1
                        ? "Head back to page 1."
                        : "Wallpapers appear here the moment they're published. Head to the admin panel to add your first.",
                    cta: filtering || page > 1 ? (page > 1 ? { href: "/", label: "Back to page 1" } : undefined) : { href: "/admin/upload", label: "Upload wallpapers" },
                  }}
                />
                <Pagination page={page} total={total} perPage={PER_PAGE} params={params} />
                {showIntro && wallpapers.length >= 8 && <AdSlot className="mt-10" />}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
