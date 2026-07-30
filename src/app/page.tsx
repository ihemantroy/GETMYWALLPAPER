import { Suspense } from "react";
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
import { HomeSections } from "@/components/home-sections";
import { CountUp } from "@/components/count-up";
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
    showIntro ? getFeatured(4, params.device) : Promise.resolve([]),
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
          <section className="mb-16 max-w-3xl">
            <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium tracking-wide text-chalk-muted backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              New wallpapers, every day
            </div>
            <h1 className="animate-fade-up mt-6 font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-[5.25rem] sm:leading-[0.98]" style={{ animationDelay: "0.08s" }}>
              Wallpapers that<br />
              <span className="text-gradient-soft">fit your screen.</span>
            </h1>
            <p className="animate-fade-up mt-6 max-w-lg text-lg leading-relaxed text-chalk-muted" style={{ animationDelay: "0.16s" }}>
              A calm, premium space for wallpapers that actually fit — sized to your exact screen,
              free forever, and refreshed every day.
            </p>
            <div className="animate-fade-up mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: "0.24s" }}>
              <Countdown />
              <a
                href="/api/random"
                className="focusable inline-flex items-center gap-2 rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-chalk transition hover:border-white/25 hover:bg-white/[0.04]"
              >
                <Shuffle size={15} /> Surprise me
              </a>
            </div>
            <div className="animate-fade-up mt-10 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-white/[0.06] pt-6" style={{ animationDelay: "0.32s" }}>
              <div>
                <p className="font-display text-2xl font-semibold tracking-tight text-chalk"><CountUp value={total} suffix="+" /></p>
                <p className="mt-0.5 text-xs uppercase tracking-widest text-chalk-faint">Wallpapers</p>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold tracking-tight text-chalk"><CountUp value={categories.length} /></p>
                <p className="mt-0.5 text-xs uppercase tracking-widest text-chalk-faint">Categories</p>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold tracking-tight text-chalk">4K</p>
                <p className="mt-0.5 text-xs uppercase tracking-widest text-chalk-faint">Quality</p>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold tracking-tight text-chalk">Free</p>
                <p className="mt-0.5 text-xs uppercase tracking-widest text-chalk-faint">Always</p>
              </div>
            </div>
          </section>

          <Suspense fallback={null}><DeviceSwitcher /></Suspense>

          {wotd && (
            <section className="mb-12">
              <Link
                href={`/wallpaper/${wotd.slug}`}
                className={`group relative block overflow-hidden rounded-xl2 ring-1 ring-white/10 ${
                  params.device === "phone" || params.device === "tablet" ? "mx-auto w-full max-w-sm" : ""
                }`}
              >
                <div
                  className={
                    params.device === "phone" || params.device === "tablet"
                      ? "relative aspect-[3/4] w-full"
                      : "relative aspect-[16/8] w-full sm:aspect-[16/6]"
                  }
                >
                  <img
                    src={renderUrl(wotd.storage_path, { width: 1600, quality: 90 })}
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
                  <WallpaperCard key={w.id} w={w} device={params.device} priority={i < 2} />
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
