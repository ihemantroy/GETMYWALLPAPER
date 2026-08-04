import { Suspense } from "react";
import { getWallpapersPage, getCategories, PER_PAGE } from "@/lib/queries";
import { WallpaperGrid } from "@/components/wallpaper-grid";
import { FavoritesView } from "@/components/favorites-view";
import { Pagination } from "@/components/pagination";
import { BrowseBar } from "@/components/browse-bar";
import { PopularTags } from "@/components/popular-tags";
import { DeviceWelcome } from "@/components/device-welcome";
import { ParallaxAppBanner } from "@/components/parallax-app-banner";
import { AdSlot } from "@/components/ad-slot";

export const revalidate = 120;

type SP = { [k: string]: string | string[] | undefined };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const DEVICE_COPY: Record<string, { title: string; sub: string }> = {
  desktop: { title: "Desktop wallpapers", sub: "High-resolution backgrounds sized for laptops and desktop monitors." },
  phone: { title: "Phone wallpapers", sub: "Portrait wallpapers made to fit modern phone screens edge to edge." },
  tablet: { title: "Tablet wallpapers", sub: "Crisp wallpapers proportioned for tablets and iPads." },
};

export default async function Home({ searchParams }: { searchParams: Promise<SP> }) {
  const spRaw = await searchParams;
  const page = Math.max(1, parseInt(one(spRaw.page) ?? "1", 10) || 1);
  const params = {
    category: one(spRaw.category),
    device: one(spRaw.device),
    sort: one(spRaw.sort) as "latest" | "popular" | undefined,
    q: one(spRaw.q),
    mode: one(spRaw.mode) as "keyword" | "vibe" | undefined,
    view: one(spRaw.view),
    page: page > 1 ? String(page) : undefined,
  };
  const isFav = params.view === "favorites";

  const [categories, pageData] = await Promise.all([
    getCategories(),
    isFav
      ? Promise.resolve({ items: [], total: 0 })
      : getWallpapersPage({
          category: params.category,
          device: params.device,
          sort: params.sort ?? "latest",
          q: params.q,
          mode: params.mode,
          page,
        }),
  ]);
  const { items: wallpapers, total } = pageData;
  const catName = params.category ? categories.find((c) => c.slug === params.category)?.name : undefined;

  // Page heading adapts to the current view
  let title = "Wallpapers";
  let sub = "Free wallpapers in HD and 4K for your desktop and phone. Browse the collection or search for a vibe.";
  if (params.q && params.mode === "vibe") { title = `“${params.q}”`; sub = `AI vibe search — closest matches by mood, not just keywords.`; }
  else if (params.q) { title = `“${params.q}”`; sub = `Wallpapers matching your search.`; }
  else if (catName) { title = catName; sub = `Wallpapers in the ${catName} collection.`; }
  else if (params.device && DEVICE_COPY[params.device]) { title = DEVICE_COPY[params.device].title; sub = DEVICE_COPY[params.device].sub; }
  else if (isFav) { title = "Your favorites"; sub = "Wallpapers you've saved. Stored on this device."; }

  return (
    <main className="mx-auto max-w-[1600px] px-4 pb-24 pt-24 sm:px-6">
      <Suspense fallback={null}><DeviceWelcome /></Suspense>

      {/* ---------- PAGE HEADING ---------- */}
      <header className="mb-6 max-w-3xl">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-chalk-muted sm:text-base">{sub}</p>
      </header>

      {/* ---------- 3D PARALLAX APP BANNER (default view only) ---------- */}
      {!isFav && !params.q && !catName && !params.device && <ParallaxAppBanner />}

      {/* ---------- POPULAR CHIPS (default view only) ---------- */}
      {!isFav && !params.q && !catName && !params.device && <PopularTags />}

      {/* ---------- FILTER BAR ---------- */}
      {!isFav && (
        <Suspense fallback={null}>
          <BrowseBar categories={categories} />
        </Suspense>
      )}

      {/* ---------- GALLERY ---------- */}
      <div className="mt-6">
        {!isFav && total > 0 && (
          <p className="mb-5 text-sm text-chalk-muted">
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
                title: params.q || catName || params.device ? "No wallpapers here yet" : "No wallpapers published yet",
                body: params.q || catName || params.device
                  ? "Try a different filter, or clear your search."
                  : "Upload wallpapers from the admin panel and they'll appear here.",
                cta: { href: "/admin/upload", label: "Upload wallpapers" },
              }}
            />
            <Pagination page={page} total={total} perPage={PER_PAGE} params={params} />
            <AdSlot className="mt-10" />
          </>
        )}
      </div>
    </main>
  );
}
