import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Download } from "lucide-react";
import { getWallpaperBySlug, getRelated, getSimilarByEmbedding } from "@/lib/queries";
import { WallpaperGrid } from "@/components/wallpaper-grid";
import { FavoriteButton } from "@/components/favorite-button";
import { ShareButton } from "@/components/share-button";
import { DownloadButton } from "@/components/download-button";
import { WallpaperEditor } from "@/components/wallpaper-editor";
import { AdSlot } from "@/components/ad-slot";
import { renderUrl, publicUrl } from "@/lib/supabase/storage";
import { formatCount } from "@/lib/utils";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const w = await getWallpaperBySlug(slug);
  if (!w) return { title: "Wallpaper not found" };
  const image = renderUrl(w.storage_path, { width: 1200 });
  return {
    title: `${w.title} wallpaper`,
    description: w.description ?? `Download ${w.title} in up to ${w.width}×${w.height} for ${w.device}.`,
    alternates: { canonical: `/wallpaper/${w.slug}` },
    openGraph: { images: [image], title: w.title },
    twitter: { card: "summary_large_image", images: [image] },
  };
}

export default async function WallpaperPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const w = await getWallpaperBySlug(slug);
  if (!w) notFound();
  const similar = await getSimilarByEmbedding(w, 6);
  const related = similar.length > 0 ? similar : await getRelated(w);
  const isVisuallySimilar = similar.length > 0;

  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://getyourwallpaper.com").replace("://www.", "://");
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ImageObject",
        name: w.title,
        description: w.description ?? undefined,
        contentUrl: publicUrl(w.storage_path),
        thumbnailUrl: renderUrl(w.storage_path, { width: 600 }),
        width: w.width,
        height: w.height,
        uploadDate: w.published_at ?? w.created_at,
        creditText: w.credit ?? undefined,
        acquireLicensePage: `${base}/dmca`,
        isFamilyFriendly: true,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: base },
          { "@type": "ListItem", position: 2, name: String(w.device ?? "Wallpapers"), item: `${base}/?device=${w.device}` },
          { "@type": "ListItem", position: 3, name: w.title, item: `${base}/wallpaper/${w.slug}` },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-24 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* breadcrumb */}
      <nav className="mb-5 flex items-center gap-2 text-sm text-chalk-muted">
        <Link href="/" className="hover:text-chalk">Home</Link>
        <span className="text-chalk-faint">/</span>
        <Link href={`/?device=${w.device}`} className="capitalize hover:text-chalk">{w.device}</Link>
        <span className="text-chalk-faint">/</span>
        <span className="truncate text-chalk">{w.title}</span>
      </nav>

      {/* title row + download */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full btn-primary font-display text-lg font-bold">W</span>
          <div className="min-w-0">
            <h1 className="truncate font-display text-lg font-semibold tracking-tight sm:text-xl">{w.title}</h1>
            <p className="text-sm text-chalk-muted">GetYourWallpaper</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FavoriteButton id={w.id} className="h-11 w-11" />
          <ShareButton slug={w.slug} />
          <DownloadButton w={w} />
        </div>
      </div>

      {/* the image — big, centered, flat. Badge reads the real rendered size */}
      <WallpaperEditor w={w} />

      {/* meta line */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-chalk-muted">
        <span className="inline-flex items-center gap-1.5"><Download size={14} /> {formatCount(w.download_count)} downloads</span>
        {w.credit && (
          <span>
            Credit:{" "}
            {w.credit_url ? (
              <a href={w.credit_url} target="_blank" rel="noopener noreferrer" className="text-chalk underline underline-offset-2 hover:text-accent">{w.credit}</a>
            ) : (
              <span className="text-chalk">{w.credit}</span>
            )}
          </span>
        )}
      </div>

      {w.description && <p className="mt-3 max-w-2xl text-sm text-chalk-muted">{w.description}</p>}

      {/* tags */}
      {w.tags && w.tags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {w.tags.map((t) => (
            <Link key={t} href={`/?q=${t}`} className="focusable rounded-full border border-line px-3 py-1.5 text-xs text-chalk-muted transition hover:text-chalk">
              #{t}
            </Link>
          ))}
        </div>
      )}

      <AdSlot className="mt-10" />

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-6 font-display text-2xl font-semibold">
            {isVisuallySimilar ? "Visually similar" : "More like this"}
          </h2>
          <WallpaperGrid wallpapers={related} />
        </section>
      )}
    </div>
  );
}
