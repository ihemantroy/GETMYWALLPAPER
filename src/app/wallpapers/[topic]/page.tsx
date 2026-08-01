import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getWallpapersPage, PER_PAGE } from "@/lib/queries";
import { WallpaperGrid } from "@/components/wallpaper-grid";
import { Pagination } from "@/components/pagination";
import { DEVICES, COLOR_BUCKETS, VIBES, KEYWORD_TOPICS, SITE } from "@/lib/constants";
import { CATEGORY_COPY } from "@/lib/category-copy";

export const revalidate = 600;

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type TopicKind = "device" | "color" | "category" | "vibe" | "keyword";

type Resolved = {
  label: string;
  query: { device?: string; color?: string; category?: string; q?: string };
  device?: string;
  kind: TopicKind;
  dbDescription?: string | null;
};

async function resolve(topic: string): Promise<Resolved | null> {
  const t = topic.toLowerCase();

  const dev = DEVICES.find((d) => d.slug === t);
  if (dev) return { label: dev.slug === "desktop" ? "Desktop" : cap(dev.slug), query: { device: dev.slug }, device: dev.slug, kind: "device" };

  const color = COLOR_BUCKETS.find((c) => c.slug === t);
  if (color) return { label: color.label, query: { color: color.slug }, kind: "color" };

  const cats = await getCategories();
  const cat = cats.find((c) => c.slug === t);
  if (cat) return { label: cat.name, query: { category: cat.slug }, kind: "category", dbDescription: cat.description };

  const vibe = VIBES.find((v) => v.slug === t);
  if (vibe) return { label: vibe.label, query: { q: vibe.slug }, kind: "vibe" };

  const kw = KEYWORD_TOPICS.find((k) => k.slug === t);
  if (kw) return { label: kw.label, query: { q: kw.slug }, kind: "keyword" };

  return null;
}

// Per-kind copy so landing pages read as genuinely different write-ups rather
// than one template with the label swapped in — this is what separates a
// useful collection page from thin/duplicate content in Google's eyes.
function topicCopy(r: Resolved, slug: string) {
  const label = r.label;
  const lower = label.toLowerCase();

  const generic = topicCopyGeneric(r, label, lower);
  const override = CATEGORY_COPY[slug.toLowerCase()];

  // Priority: description written in the admin panel > hand-written copy
  // shipped in code > generic per-kind template. This is what makes the
  // admin "Add description" field actually take effect on the live page.
  if (r.dbDescription && r.dbDescription.trim()) {
    return { intro: r.dbDescription.trim(), body: override?.body ?? generic.body, faq: generic.faq };
  }
  if (override) {
    return { intro: override.intro, body: override.body ?? generic.body, faq: generic.faq };
  }
  return generic;
}

function topicCopyGeneric(r: Resolved, label: string, lower: string) {
  switch (r.kind) {
    case "device":
      return {
        intro: `${label} wallpapers are cropped and exported specifically for ${lower === "desktop" ? "monitors and laptops" : lower === "tablet" ? "tablet screens" : "phone screens"} — no stretching, no letterboxing, no guessing which resolution to grab.`,
        body: `Every image in this collection is checked against real ${lower} aspect ratios before it's published, so what you preview here is what you'll actually get edge-to-edge on your device. Sort by newest to see today's drops, or by popular to see what other visitors are downloading most.`,
        faq: [
          { q: `What resolution are these ${lower} wallpapers?`, a: `Most are available up to 4K where the source image supports it, with device-matched sizes generated automatically for common ${lower} screen ratios.` },
          { q: `Do I need an account to download?`, a: `No — downloads are free and instant. Creating a free account just lets you save favorites and sync them across devices.` },
        ],
      };
    case "color":
      return {
        intro: `A ${lower === "mono" ? "black & white" : lower} palette does a lot of quiet work on a screen — it sets the mood before you open a single app.`,
        body: `This collection groups wallpapers by dominant color rather than subject, so you can match a wallpaper to your home screen icons, your desktop theme, or just a mood you're going for. New ${lower === "mono" ? "black & white" : lower} wallpapers are added as they're published — check back for fresh options.`,
        faq: [
          { q: `How are wallpapers sorted into a color group?`, a: `Each image is analyzed for its dominant colors, and ${lower === "mono" ? "black & white" : lower}-toned wallpapers are grouped here regardless of subject matter.` },
          { q: `Can I filter by device too?`, a: `Yes — use the device filter above the grid to combine a color with a specific phone, tablet, or desktop size.` },
        ],
      };
    case "vibe":
      return {
        intro: `"${label}" is as much a feeling as a look — this collection is curated around that specific mood rather than a single subject or color.`,
        body: `We hand-pick wallpapers that consistently read as ${lower} across different subjects — nature shots, abstract art, and photography all show up here when they share that vibe. It's a good starting point if you know the mood you want but not yet the exact image.`,
        faq: [
          { q: `How do you decide what counts as "${lower}"?`, a: `Curation is manual — each wallpaper is reviewed for whether it actually reads as ${lower}, rather than relying only on tags or keywords.` },
          { q: `Is this collection updated often?`, a: `Yes, new ${lower} wallpapers are added as they're found and reviewed, so it's worth checking back.` },
        ],
      };
    case "keyword":
      return {
        intro: label === "4K" || label === "HD"
          ? `${label} wallpapers here are the real thing — checked against their actual source resolution, not just labeled ${label} and upscaled.`
          : `${label} wallpapers use a distinct visual approach, and this collection gathers the ones worth downloading in one place.`,
        body: label === "AMOLED"
          ? `True-black AMOLED wallpapers save battery on OLED phone screens by keeping large areas at pure black (#000000) rather than a dark gray. Every wallpaper in this collection has been checked for genuinely deep blacks, not just a dark-looking image.`
          : label === "Gradient"
          ? `Gradient wallpapers are smooth, clean, and distraction-free — a good pick if you want your home screen icons and widgets to stay easy to read. You can also design your own in our free gradient studio if none of these fit exactly what you're picturing.`
          : `Browse the full ${label} collection below, sorted by newest first.`,
        faq: [
          { q: `Why does ${label} matter for a wallpaper?`, a: label === "AMOLED"
              ? `On OLED/AMOLED screens, true-black pixels are switched off entirely, which can meaningfully extend battery life compared to a dark gray background.`
              : label === "Gradient"
              ? `A gradient background avoids competing with home screen icons and widgets the way a busy photo can.`
              : `It affects how sharp the wallpaper looks once it's actually set as your background, especially on high-density screens.` },
          { q: `Can I make my own?`, a: `Yes — the free Create tool lets you design a custom gradient or edit an existing wallpaper and download it sized to your screen.` },
        ],
      };
    case "category":
    default:
      return {
        intro: `A hand-picked collection of ${lower} wallpapers, updated as new ones are reviewed and published.`,
        body: `Every wallpaper here has been checked for quality and fit before publishing, so you can download with confidence rather than sorting through low-resolution reposts.`,
        faq: [
          { q: `Are these wallpapers free to use?`, a: `Yes, all wallpapers are free to download and set as your background. Check the credit line on each wallpaper page if the original creator is known.` },
          { q: `How often is this collection updated?`, a: `New ${lower} wallpapers are added on an ongoing basis as they're reviewed and published.` },
        ],
      };
  }
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
  const copy = topicCopy(r, topic);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: copy.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main className="mx-auto max-w-7xl px-5 pb-24 pt-28 sm:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <header className="mb-8 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-2">Collection</p>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          {r.label} <span className="text-accent">Wallpapers</span>
        </h1>
        <p className="mt-4 text-lg text-chalk-muted">
          {copy.intro} {total > 0 ? `${total} to browse.` : "New drops arrive regularly."}
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-chalk-muted">{copy.body}</p>
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

      <section className="mt-16 max-w-3xl border-t border-line pt-10">
        <h2 className="font-display text-2xl font-semibold">Frequently asked questions</h2>
        <div className="mt-5 space-y-5">
          {copy.faq.map((f) => (
            <div key={f.q}>
              <h3 className="font-medium text-chalk">{f.q}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-chalk-muted">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
