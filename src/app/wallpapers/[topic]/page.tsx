import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getWallpapersPage, PER_PAGE } from "@/lib/queries";
import { WallpaperGrid } from "@/components/wallpaper-grid";
import { Pagination } from "@/components/pagination";
import { DEVICES, COLOR_BUCKETS, VIBES, KEYWORD_TOPICS, SITE } from "@/lib/constants";

export const revalidate = 600;

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type Resolved = {
  label: string;
  query: { device?: string; color?: string; category?: string; q?: string };
  device?: string;
};

async function resolve(topic: string): Promise<Resolved | null> {
  const t = topic.toLowerCase();

  const dev = DEVICES.find((d) => d.slug === t);
  if (dev) return { label: dev.slug === "desktop" ? "Desktop" : cap(dev.slug), query: { device: dev.slug }, device: dev.slug };

  const color = COLOR_BUCKETS.find((c) => c.slug === t);
  if (color) return { label: color.label, query: { color: color.slug } };

  const cats = await getCategories();
  const cat = cats.find((c) => c.slug === t);
  if (cat) return { label: cat.name, query: { category: cat.slug } };

  const vibe = VIBES.find((v) => v.slug === t);
  if (vibe) return { label: vibe.label, query: { q: vibe.slug } };

  const kw = KEYWORD_TOPICS.find((k) => k.slug === t);
  if (kw) return { label: kw.label, query: { q: kw.slug } };

  return null;
}

export async function generateMetadata({
  params,
}: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic } = await params;
  const r = await resolve(topic);
  if (!r) return { title: "Wallpapers not found" };
  const title = `${r.label} Wallpapers — Free HD & 4K Downloads`;
  const description = `Download free ${r.label.toLowerCase()} wallpapers in HD and 4K, hand-picked and fitted to your exact screen. Fresh drops daily on ${SITE.name}.`;
  return {
    title,
    description,
    alternates: { canonical: `/wallpapers/${topic.toLowerCase()}` },
    openGraph: { title, description },
  };
}

export default async function TopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ topic: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { topic } = await params;
  const { page: pageRaw } = await searchParams;
  const page = Math.max(1, parseInt(pageRaw ?? "1", 10) || 1);

  const r = await resolve(topic);
  if (!r) notFound();

  const [categories, { items, total }] = await Promise.all([
    getCategories(),
    getWallpapersPage({ ...r.query, sort: "latest", page }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <main className="mx-auto max-w-7xl px-5 pb-24 pt-28 sm:px-8">
      <header className="mb-8 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-2">Collection</p>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          {r.label} <span className="text-accent">Wallpapers</span>
        </h1>
        <p className="mt-4 text-lg text-chalk-muted">
          A hand-picked collection of {r.label.toLowerCase()} wallpapers — free, in HD and 4K, and
          auto-fitted to your exact screen. {total > 0 ? `${total} to browse` : "New drops arrive daily."}.
        </p>
      </header>

      <WallpaperGrid
        wallpapers={items}
        categories={categories}
        device={r.device}
        empty={{
          title: "Nothing here yet",
          body: "New wallpapers land here the moment they're published. Check back soon.",
          cta: { href: "/", label: "Browse everything" },
        }}
      />

      {totalPages > 1 && (
        <Pagination page={page} total={total} perPage={PER_PAGE} params={{}} basePath={`/wallpapers/${topic.toLowerCase()}`} />
      )}
    </main>
  );
}
