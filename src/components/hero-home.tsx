import Link from "next/link";
import {
  Sparkles, Flame, Download, ChevronRight, ChevronLeft, Upload, Compass,
  Image as ImageIcon, Users, Layers, Zap, Car, Rocket, Gamepad2, Moon, Palette, Ghost, Mountain, Building2, Flower2, Grid3x3, Star,
} from "lucide-react";
import type { Wallpaper, Category } from "@/lib/types";
import { renderUrl } from "@/lib/supabase/storage";
import { WallpaperGrid } from "@/components/wallpaper-grid";
import { CountUp } from "@/components/count-up";

const CAT_STRIP = [
  { label: "4K Ultra HD", href: "/wallpapers/4k", icon: Zap },
  { label: "Anime", href: "/?q=anime", icon: Ghost },
  { label: "Nature", href: "/?q=nature", icon: Mountain },
  { label: "Minimal", href: "/wallpapers/minimal", icon: Sparkles },
  { label: "Abstract", href: "/?q=abstract", icon: Palette },
  { label: "Dark Mode", href: "/wallpapers/dark", icon: Moon },
  { label: "Cars", href: "/?q=car", icon: Car },
  { label: "City", href: "/?q=city", icon: Building2 },
  { label: "Gaming", href: "/?q=gaming", icon: Gamepad2 },
  { label: "Space", href: "/?q=space", icon: Rocket },
  { label: "Flowers", href: "/?q=flower", icon: Flower2 },
  { label: "More", href: "/?view=all", icon: Grid3x3 },
];

function fmt(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "K" : String(n ?? 0);
}
function quality(w: number) {
  return w >= 7000 ? "8K" : w >= 3840 ? "4K" : w >= 2560 ? "2K" : "HD";
}

export function HeroHome({
  wotd, featured, categories, total, downloads, device, heroOverride, heroFocus, heroFit,
}: {
  wotd: Wallpaper | null;
  featured: Wallpaper[];
  categories: Category[];
  total: number;
  downloads: number;
  device?: string;
  heroOverride?: Wallpaper | null;
  heroFocus?: string;
  heroFit?: string;
}) {
  const nameById = new Map(categories.map((c) => [c.id, c.name]));
  const landscape = device !== "phone" && device !== "tablet";
  const cardAspect = landscape ? "aspect-[16/10]" : "aspect-[4/5]";
  const isLand = (w: Wallpaper) => w.width >= w.height;
  // admin-chosen hero wins; otherwise prefer a landscape image so it never zoom-crops
  const hero = heroOverride ?? featured.find(isLand) ?? wotd ?? featured[0] ?? null;
  // on desktop show only landscape wallpapers; on phone only portrait — fall back if none
  const pool = landscape ? featured.filter(isLand) : featured.filter((w) => !isLand(w));
  const deck = pool.length ? pool : featured;
  const thumbs = deck.slice(0, 3);
  const trending = deck;

  const stats = [
    { icon: ImageIcon, node: <CountUp value={total} suffix="+" />, label: "Wallpapers" },
    { icon: Users, node: <CountUp value={Math.max(total * 3, 10)} suffix="+" />, label: "Happy Users" },
    { icon: Download, node: <CountUp value={Math.max(downloads, 1)} suffix="+" />, label: "Downloads" },
    { icon: Layers, node: <CountUp value={categories.length} suffix="+" />, label: "Categories" },
  ];

  return (
    <div className="space-y-12">
      {/* ---------- HERO ---------- */}
      <section className="grid items-center gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        {/* left */}
        <div className="animate-fade-up">
          <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl">
            Redefine Your<br />Screen <span className="text-gradient-soft">Aesthetic</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-chalk-muted">
            Discover the world&apos;s best wallpapers in ultra high quality. For every screen. For every vibe.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/?view=all" className="btn-accent focusable inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold">
              <Compass size={17} /> Explore Wallpapers
            </Link>
            <Link href="/contribute" className="focusable inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-medium text-chalk transition hover:border-white/30 hover:bg-white/[0.04]">
              <Upload size={16} /> Upload &amp; Share
            </Link>
          </div>
          <div className="mt-9 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-accent">
                  <s.icon size={16} />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-lg font-bold leading-none text-chalk">{s.node}</p>
                  <p className="mt-1 text-[11px] text-chalk-faint">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* right — featured card: auto portrait/landscape, capped, no crop */}
        {hero && (
          <div className="animate-fade-up relative mx-auto w-fit max-w-full" style={{ animationDelay: "0.1s" }}>
            <Link href={`/wallpaper/${hero.slug}`} className="block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={renderUrl(hero.storage_path, { width: 1200, quality: 88 })}
                alt={hero.title}
                className="block max-h-[38vh] w-auto max-w-full rounded-3xl border border-white/[0.08] object-cover sm:max-h-[400px]"
                style={{ backgroundColor: hero.dominant_color ?? "#0b0b12" }}
              />
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-t from-ink/85 via-transparent to-transparent" />
              <span className="btn-accent absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
                <Star size={12} className="fill-white" /> Editor&apos;s Choice
              </span>
              <div className="absolute bottom-4 left-5 right-5">
                <p className="truncate font-display text-2xl font-bold text-white">{hero.title}</p>
                {hero.credit && <p className="text-sm text-white/70">by {hero.credit}</p>}
              </div>
            </Link>
            {thumbs.length > 1 && (
              <div className="absolute bottom-4 right-4 hidden items-center gap-2 sm:flex">
                {thumbs.map((t) => (
                  <Link key={t.id} href={`/wallpaper/${t.slug}`} className="h-11 w-16 overflow-hidden rounded-lg ring-1 ring-white/20 transition hover:ring-white/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={renderUrl(t.storage_path, { width: 160, quality: 70 })} alt="" className="h-full w-full object-cover" />
                  </Link>
                ))}
                <div className="ml-1 flex gap-1">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white backdrop-blur"><ChevronLeft size={15} /></span>
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white backdrop-blur"><ChevronRight size={15} /></span>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ---------- CATEGORY STRIP ---------- */}
      <section className="-mx-1 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CAT_STRIP.map((c, i) => (
          <Link
            key={c.label}
            href={c.href}
            className={`focusable inline-flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
              i === 0 ? "border-accent/40 bg-accent/15 text-chalk" : "border-white/[0.07] bg-white/[0.02] text-chalk-muted hover:border-white/20 hover:text-chalk"
            }`}
          >
            <c.icon size={16} className={i === 0 ? "text-accent" : ""} /> {c.label}
          </Link>
        ))}
      </section>

      {/* ---------- TRENDING ---------- */}
      {trending.length > 0 && (
        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
              <Flame size={20} className="text-accent-2" /> Trending Wallpapers
            </h2>
            <Link href="/?view=all&sort=popular" className="focusable text-sm text-chalk-muted transition hover:text-chalk">
              View All <ChevronRight size={14} className="inline" />
            </Link>
          </div>
          <WallpaperGrid wallpapers={trending.slice(0, 10)} categories={categories} device={device} />
        </section>
      )}
    </div>
  );
}
