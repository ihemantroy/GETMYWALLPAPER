import { Suspense } from "react";
import Link from "next/link";
import { getWallpapersPage, getCategories, getFeatured, getWallpaperOfTheDay, getHeroSetting, PER_PAGE } from "@/lib/queries";
import { CategoryRail } from "@/components/category-rail";
import { CategoryPills } from "@/components/category-pills";
import { SearchFilter } from "@/components/search-filter";
import { WallpaperGrid } from "@/components/wallpaper-grid";
import { FavoritesView } from "@/components/favorites-view";
import { Pagination } from "@/components/pagination";
import { HeroHome } from "@/components/hero-home";
import { ShareVision } from "@/components/share-vision";
import { DeviceSwitcher } from "@/components/device-switcher";
import { DeviceWelcome } from "@/components/device-welcome";
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
  const isBrowseAll = params.view === "all";
  const filtering = Boolean(params.category || params.q || isFav);
  const showIntro = !filtering && !isBrowseAll && page === 1; // clean, image-first homepage

  const [categories, featured, wotd, pageData, heroSetting] = await Promise.all([
    getCategories(),
    showIntro ? getFeatured(8, params.device) : Promise.resolve([]),
    showIntro ? getWallpaperOfTheDay(params.device) : Promise.resolve(null),
    isFav ? Promise.resolve({ items: [], total: 0 }) : getWallpapersPage({
      category: params.category, device: params.device,
      sort: params.sort ?? "latest", q: params.q, page,
    }),
    showIntro ? getHeroSetting(params.device) : Promise.resolve(null),
  ]);
  const { items: wallpapers, total } = pageData;
  const catName = params.category ? categories.find((c) => c.slug === params.category)?.name : undefined;
  const downloads = [...featured, ...wallpapers].reduce((s, w) => s + (w.download_count ?? 0), 0);
  // rich pool (featured + latest) so trending/collections can pull real landscape images
  const showcase = [...featured, ...wallpapers].filter((w, i, arr) => arr.findIndex((x) => x.id === w.id) === i);

  return (
    <main className="mx-auto max-w-7xl px-5 pb-24 pt-28 sm:px-8">
      <div className="aurora" aria-hidden />
      <Suspense fallback={null}><DeviceWelcome /></Suspense>

      {showIntro ? (
        /* ---------- CLEAN HOMEPAGE ---------- */
        <div className="space-y-16">
          <Suspense fallback={null}><DeviceSwitcher /></Suspense>
          <HeroHome wotd={wotd} featured={showcase} categories={categories} total={total} downloads={downloads} device={params.device} heroOverride={heroSetting?.wallpaper ?? null} heroFocus={heroSetting?.focus} />

          <ShareVision />

          <section>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">Latest wallpapers</h2>
              <Link href="/?view=all" className="focusable text-sm text-chalk-muted transition hover:text-chalk">
                Browse all →
              </Link>
            </div>
            <WallpaperGrid
              wallpapers={wallpapers}
              categories={categories}
              device={params.device}
              empty={{
                title: "The wall is empty — for now",
                body: "Wallpapers appear here the moment they're published.",
                cta: { href: "/admin/upload", label: "Upload wallpapers" },
              }}
            />
          </section>
        </div>
      ) : (
        /* ---------- BROWSE ---------- */
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
                    device={params.device}
                    empty={{
                      title: filtering ? "No matches" : page > 1 ? "Nothing on this page" : "Empty",
                      body: filtering ? "Try a different category or device." : "Head back to page 1.",
                      cta: page > 1 ? { href: "/", label: "Back to page 1" } : undefined,
                    }}
                  />
                  <Pagination page={page} total={total} perPage={PER_PAGE} params={params} />
                  <AdSlot className="mt-10" />
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
