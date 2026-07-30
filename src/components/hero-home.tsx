import Link from "next/link";
import {
  Sparkles, Flame, Download, ChevronRight, ChevronLeft, Upload, Compass,
  Image as ImageIcon, Users, Layers, Zap, Car, Rocket, Gamepad2, Moon, Palette, Ghost, Mountain, Building2, Flower2, Grid3x3, Star,
} from "lucide-react";
import type { Wallpaper, Category } from "@/lib/types";
import { renderUrl } from "@/lib/supabase/storage";
import { FavoriteButton } from "@/components/favorite-button";
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
  wotd, featured, categories, total, downloads, device,
}: {
  wotd: Wallpaper | null;
  featured: Wallpaper[];
  categories: Category[];
  total: number;
  downloads: number;
  device?: string;
}) {
  const nameById = new Map(categories.map((c) => [c.id, c.name]));
  const hero = wotd ?? featured[0] ?? null;
  const thumbs = featured.slice(0, 3);
  const trending = featured.slice(0, 6);
  const landscape = device !== "phone" && device !== "tablet";
  const cardAspect = landscape ? "aspect-[16/10]" : "aspect-[4/5]";

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

        {/* right — featured card */}
        {hero && (
          <div className="animate-fade-up relative overflow-hidden rounded-3xl border border-white/[0.08]" style={{ animationDelay: "0.1s" }}>
            <Link href={`/wallpaper/${hero.slug}`} className="block">
              <div className="relative aspect-[16/10]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={renderUrl(hero.storage_path, { width: 1400, quality: 88 })}
                  alt={hero.title}
                  className="h-full w-full object-cover"
                  style={{ backgroundColor: hero.dominant_color ?? "#0b0b12" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent" />
                <span className="btn-accent absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
                  <Star size={12} className="fill-white" /> Editor&apos;s Choice
                </span>
                <div className="absolute bottom-4 left-5">
                  <p className="font-display text-2xl font-bold text-white">{hero.title}</p>
                  {hero.credit && <p className="text-sm text-white/70">by {hero.credit}</p>}
                </div>
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
          <div className={`grid gap-4 ${landscape ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-5"}`}>
            {trending.slice(0, landscape ? 6 : 5).map((w) => (
              <div key={w.id} className="glow-card group relative overflow-hidden rounded-2xl border border-white/[0.06]">
                <Link href={`/wallpaper/${w.slug}`} className="block">
                  <div className={`relative ${cardAspect} overflow-hidden`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={renderUrl(w.storage_path, { width: 500, quality: 78 })}
                      alt={w.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundColor: w.dominant_color ?? "#12121b" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent" />
                    <span className="absolute right-2.5 top-2.5 rounded-md bg-black/50 px-2 py-0.5 text-[11px] font-semibold backdrop-blur">{quality(w.width)}</span>
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3">
                      <span className="flex items-center gap-1 text-xs font-medium text-white"><Download size={12} /> {fmt(w.download_count ?? 0)}</span>
                      <span className="truncate pl-2 text-[11px] text-white/60">{w.category_id ? nameById.get(w.category_id) : ""}</span>
                    </div>
                  </div>
                </Link>
                <div className="absolute left-2.5 top-2.5"><FavoriteButton id={w.id} /></div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
