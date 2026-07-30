import Link from "next/link";
import {
  Crown, Sparkles, TrendingUp, Flame, Upload, ChevronRight, Download, Heart as HeartIcon,
  Car, Rocket, Gamepad2, Bike, Shield, Star, Zap, Mountain, Palette, Ghost, Image as ImageIcon,
} from "lucide-react";
import type { Wallpaper, Category } from "@/lib/types";
import { renderUrl } from "@/lib/supabase/storage";
import { FavoriteButton } from "@/components/favorite-button";
import { HeroSearch } from "@/components/hero-search";

const POPULAR = ["4K", "Nature", "Anime", "Dark", "Cyberpunk", "Minimal"];

function fmt(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "K" : String(n ?? 0);
}
function quality(w: number) {
  return w >= 7000 ? "8K" : w >= 3840 ? "4K" : w >= 2560 ? "2K" : "HD";
}
function catIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("nature")) return Mountain;
  if (n.includes("anime")) return Ghost;
  if (n.includes("car")) return Car;
  if (n.includes("space")) return Rocket;
  if (n.includes("minimal")) return Sparkles;
  if (n.includes("cyber") || n.includes("neon")) return Zap;
  if (n.includes("abstract")) return Palette;
  if (n.includes("gam")) return Gamepad2;
  if (n.includes("hero") || n.includes("super")) return Shield;
  if (n.includes("bike")) return Bike;
  if (n.includes("actor") || n.includes("celeb")) return Star;
  if (n.includes("girl") || n.includes("love")) return HeartIcon;
  return ImageIcon;
}

export function HeroHome({
  wotd, featured, categories, total,
}: {
  wotd: Wallpaper | null;
  featured: Wallpaper[];
  categories: Category[];
  total: number;
}) {
  const nameById = new Map(categories.map((c) => [c.id, c.name]));
  const heroImg = wotd ?? featured[0] ?? null;
  const trending = featured.slice(0, 6);
  const cats = [...categories]
    .filter((c) => (c.count ?? 0) > 0)
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
  const topCat = cats[0];
  const collThumbs = featured.slice(0, 5);

  return (
    <div className="space-y-14">
      {/* ---- HERO ---- */}
      <section className="grid gap-4 lg:grid-cols-3">
        {/* big image + overlaid content */}
        <div className="animate-fade-up relative min-h-[440px] overflow-hidden rounded-3xl border border-white/[0.06] lg:col-span-2">
          {heroImg && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={renderUrl(heroImg.storage_path, { width: 1600, quality: 90 })}
              alt={heroImg.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
          <div className="relative flex h-full flex-col justify-center p-7 sm:p-10">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3.5 py-1.5 text-xs font-medium text-chalk-muted backdrop-blur">
              <Crown size={13} className="text-accent-2" /> #1 Wallpaper Destination
            </div>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.03] tracking-tight sm:text-6xl">
              Stunning Wallpapers<br />For <span className="text-gradient-soft">Every Screen</span>
            </h1>
            <p className="mt-4 max-w-md text-chalk-muted">
              Discover, download and set the best wallpapers for your devices. Handpicked. High quality. Free.
            </p>
            <div className="mt-6">
              <HeroSearch />
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-chalk-faint">Popular:</span>
              {POPULAR.map((p) => (
                <Link
                  key={p}
                  href={`/?q=${encodeURIComponent(p)}`}
                  className="focusable rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-chalk-muted transition hover:text-chalk"
                >
                  {p}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* right cards */}
        <div className="flex flex-col gap-4">
          {/* Featured collection */}
          {topCat && (
            <Link
              href={`/?category=${topCat.slug}`}
              className="focusable card-min group rounded-3xl p-5"
            >
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-xs font-medium text-chalk-muted">
                  <Sparkles size={13} className="text-accent-2" /> Featured Collection
                </p>
                <ChevronRight size={16} className="text-chalk-faint transition group-hover:translate-x-0.5 group-hover:text-accent" />
              </div>
              <p className="mt-1 font-display text-xl font-bold">{topCat.name}</p>
              <div className="mt-3 flex gap-1.5">
                {collThumbs.map((t) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={t.id}
                    src={renderUrl(t.storage_path, { width: 120, quality: 70 })}
                    alt=""
                    className="h-14 flex-1 rounded-lg object-cover"
                  />
                ))}
              </div>
            </Link>
          )}

          {/* Top this week */}
          <Link href="/?sort=popular" className="focusable card-min group flex items-center justify-between rounded-3xl p-5">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium text-chalk-muted">
                <TrendingUp size={13} className="text-accent" /> Top rated
              </p>
              <p className="mt-1 flex items-center gap-1.5 font-display text-2xl font-bold">
                <Flame size={18} className="text-accent-2" /> {fmt(total)}
              </p>
              <p className="text-xs text-chalk-faint">Wallpapers live</p>
            </div>
            <svg width="88" height="44" viewBox="0 0 88 44" fill="none" className="text-accent">
              <path d="M2 38 L14 30 L26 34 L38 20 L50 26 L62 12 L74 18 L86 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
            </svg>
          </Link>

          {/* Contribute */}
          <div className="card-min rounded-3xl p-5">
            <p className="flex items-center gap-1.5 text-xs font-medium text-chalk-muted">
              <Upload size={13} className="text-accent" /> Contribute
            </p>
            <p className="mt-1 font-display text-lg font-bold">Share your creativity</p>
            <p className="mt-1 text-xs text-chalk-muted">Upload your wallpapers and get featured on our homepage.</p>
            <Link href="/contribute" className="btn-accent focusable mt-4 inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold">
              <Upload size={15} /> Upload Wallpaper
            </Link>
          </div>
        </div>
      </section>

      {/* ---- TRENDING NOW ---- */}
      {trending.length > 0 && (
        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
              <Flame size={22} className="text-accent-2" /> Trending Now
            </h2>
            <Link href="/?sort=popular" className="focusable text-sm text-chalk-muted transition hover:text-chalk">
              View all <ChevronRight size={14} className="inline" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {trending.map((w) => (
              <div key={w.id} className="group relative overflow-hidden rounded-2xl border border-white/[0.06]">
                <Link href={`/wallpaper/${w.slug}`} className="block">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={renderUrl(w.storage_path, { width: 500, quality: 78 })}
                      alt={w.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundColor: w.dominant_color ?? "#12121b" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent" />
                    <span className="absolute left-2.5 top-2.5 rounded-md bg-black/50 px-2 py-0.5 text-[11px] font-semibold backdrop-blur">
                      {quality(w.width)}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 p-3">
                      <p className="truncate text-sm font-semibold text-white">{w.title}</p>
                      <div className="mt-0.5 flex items-center justify-between text-[11px] text-white/70">
                        <span className="truncate">{w.category_id ? nameById.get(w.category_id) : "Wallpaper"}</span>
                        <span className="flex items-center gap-1"><Download size={10} /> {fmt(w.download_count ?? 0)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="absolute right-2.5 top-2.5">
                  <FavoriteButton id={w.id} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---- BROWSE CATEGORIES ---- */}
      {cats.length > 0 && (
        <section>
          <h2 className="mb-5 font-display text-2xl font-bold">Browse Categories</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {cats.slice(0, 12).map((c) => {
              const Icon = catIcon(c.name);
              return (
                <Link
                  key={c.id}
                  href={`/?category=${c.slug}`}
                  className="focusable card-min group flex items-center gap-3 rounded-2xl p-4"
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-accent transition group-hover:text-accent-2">
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{c.name}</p>
                    <p className="text-xs text-chalk-faint">{fmt(c.count ?? 0)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
