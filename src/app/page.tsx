import { Suspense } from "react";
import { getWallpapersPage, getCategories, getFeatured, getWallpaperOfTheDay, PER_PAGE } from "@/lib/queries";
import { CategoryRail } from "@/components/category-rail";
import { CategoryPills } from "@/components/category-pills";
import { SearchFilter } from "@/components/search-filter";
import { WallpaperGrid } from "@/components/wallpaper-grid";
import { FavoritesView } from "@/components/favorites-view";
import { Pagination } from "@/components/pagination";
import { HomeSections } from "@/components/home-sections";
import { HeroHome } from "@/components/hero-home";
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
  const filtering = Boolean(params.category || params.q || isFav); // device alone still shows the full homepage
  const showIntro = !filtering && page === 1; // hero + featured only on the clean first page

  const [categories, featured, wotd, pageData] = await Promise.all([
    getCategories(),
    showIntro ? getFeatured(8, params.device) : Promise.resolve([]),
    showIntro ? getWallpaperOfTheDay(params.device) : Promise.resolve(null),
    isFav ? Promise.resolve({ items: [], total: 0 }) : getWallpapersPage({
      category: params.category, device: params.device,
      sort: params.sort ?? "latest", q: params.q, page,
    }),
  ]);
  const { items: wallpapers, total } = pageData;
  const catName = params.category ? categories.find((c) => c.slug === params.category)?.name : undefined;

  return (
    <main className="mx-auto max-w-7xl px-5 pb-24 pt-28 sm:px-8">
      <div className="aurora" aria-hidden />
      <Suspense fallback={null}><DeviceWelcome /></Suspense>
      {showIntro && (
        <>
          <Suspense fallback={null}><DeviceSwitcher /></Suspense>
          <HeroHome wotd={wotd} featured={featured} categories={categories} total={total} />
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
                  device={params.device}
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

      {showIntro && <HomeSections categories={categories} />}
    </main>
  );
}
