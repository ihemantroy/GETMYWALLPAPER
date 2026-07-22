import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Eye, Heart } from "lucide-react";
import { getWallpaperBySlug, getRelated } from "@/lib/queries";
import { DevicePreview } from "@/components/device-preview";
import { WallpaperGrid } from "@/components/wallpaper-grid";
import { FavoriteButton } from "@/components/favorite-button";
import { DownloadCounter } from "@/components/download-counter";
import { ShareButton } from "@/components/share-button";
import { AdSlot } from "@/components/ad-slot";
import { AmbientTint } from "@/components/ambient-tint";
import { PaletteStrip } from "@/components/palette-strip";
import { renderUrl, publicUrl } from "@/lib/supabase/storage";
import { formatCount } from "@/lib/utils";
import { SITE } from "@/lib/constants";

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
  const related = await getRelated(w);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    name: w.title,
    description: w.description ?? undefined,
    contentUrl: publicUrl(w.storage_path),
    width: w.width,
    height: w.height,
    uploadDate: w.published_at ?? w.created_at,
  };

  return (
    <div className="mx-auto max-w-6xl px-6 pb-16 pt-28">
      <AmbientTint src={renderUrl(w.storage_path, { width: 48 })} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-6 flex items-center gap-2 text-sm text-chalk-muted">
        <Link href="/" className="hover:text-chalk">Home</Link>
        <span>/</span>
        <Link href={`/?device=${w.device}`} className="capitalize hover:text-chalk">{w.device}</Link>
        <span>/</span>
        <span className="text-chalk">{w.title}</span>
      </nav>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{w.title}</h1>
          {w.description && <p className="mt-2 max-w-2xl text-chalk-muted">{w.description}</p>}
          <div className="mt-3 flex items-center gap-4 text-sm text-chalk-muted">
            <span className="inline-flex items-center gap-1"><Eye size={14} /> {formatCount(w.view_count)}</span>
            <DownloadCounter initial={w.download_count} />
            <span className="inline-flex items-center gap-1"><Heart size={14} /> {formatCount(w.like_count)}</span>
          </div>
          {w.credit && (
            <p className="mt-2 text-sm text-chalk-muted">
              Credit:{" "}
              {w.credit_url ? (
                <a href={w.credit_url} target="_blank" rel="noopener noreferrer" className="text-chalk underline underline-offset-2 hover:text-accent">
                  {w.credit}
                </a>
              ) : (
                <span className="text-chalk">{w.credit}</span>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ShareButton slug={w.slug} />
          <FavoriteButton id={w.id} className="h-11 w-11" />
        </div>
      </div>

      <DevicePreview w={w} />

      <PaletteStrip src={renderUrl(w.storage_path, { width: 200 })} />

      <AdSlot className="mt-6" label="Sponsored" />

      {w.tags && w.tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {w.tags.map((t) => (
            <Link key={t} href={`/?q=${t}`} className="focusable surface rounded-pill px-3 py-1.5 text-xs text-chalk-muted hover:text-chalk">
              #{t}
            </Link>
          ))}
        </div>
      )}

      <AdSlot className="mt-10" />

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-6 font-display text-2xl font-semibold">More like this</h2>
          <WallpaperGrid wallpapers={related} />
        </section>
      )}
    </div>
  );
}
