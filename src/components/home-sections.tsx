import Link from "next/link";
import { Sparkles, Monitor, Download, ShieldCheck, Zap, Layers } from "lucide-react";
import type { Category } from "@/lib/types";

const WHY = [
  { icon: Download, title: "Free, full-resolution", body: "Every wallpaper downloads in its original quality — no paywall, no watermark, no sign-up." },
  { icon: Monitor, title: "Fits your exact screen", body: "Auto-sized to your phone, tablet, or desktop pixels, so it looks crisp with no manual cropping." },
  { icon: Sparkles, title: "Fresh drops daily", body: "New, hand-picked and AI-crafted wallpapers land every day across every category." },
  { icon: Zap, title: "Fast & installable", body: "A lightweight, app-like experience you can add to your home screen and open in one tap." },
  { icon: Layers, title: "Every vibe & category", body: "Minimal, abstract, nature, AMOLED, aesthetic and more — organised so you find your look fast." },
  { icon: ShieldCheck, title: "Licensed sources", body: "We build from original and license-clean art, so what you download is safe to use." },
];

const COLLECTIONS = [
  { slug: "dark", label: "Dark Wallpapers" },
  { slug: "minimal", label: "Minimal Wallpapers" },
  { slug: "4k", label: "4K Wallpapers" },
  { slug: "amoled", label: "AMOLED Wallpapers" },
  { slug: "aesthetic", label: "Aesthetic Wallpapers" },
  { slug: "nature", label: "Nature Wallpapers" },
];

const FAQS = [
  { q: "Are the wallpapers on GetYourWallpaper free?", a: "Yes. Every wallpaper is completely free to download in full resolution, with no account required and no watermark." },
  { q: "Will the wallpaper fit my screen?", a: "Yes. When you download, GetYourWallpaper auto-fits the image to your exact device resolution — phone, tablet or desktop — so there is no manual cropping." },
  { q: "Do I need an account to download?", a: "No. You can browse and download freely. An account is only needed if you want to save favorites across devices or submit your own wallpapers." },
  { q: "How often are new wallpapers added?", a: "New wallpapers are published daily, including a featured Wallpaper of the Day and a personalised daily pick for your chosen vibe." },
  { q: "Can I submit my own wallpaper?", a: "Yes. Use the Submit page to contribute a wallpaper. It enters a review queue and, once approved, is published with credit to you." },
  { q: "Who do I contact about a wallpaper or a copyright concern?", a: "Email ihemantroy@gmail.com for credits, takedown or dispute requests and we will respond promptly." },
];

export function HomeSections({ categories }: { categories: Category[] }) {
  const popular = [...categories]
    .filter((c) => (c.count ?? 0) > 0)
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
    .slice(0, 8);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="mt-20 space-y-20">
      {/* Why choose */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-2">Why GetYourWallpaper</p>
        <h2 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Wallpapers <span className="text-accent">with taste.</span>
        </h2>
        <p className="mt-3 max-w-2xl text-chalk-muted">
          A premium, free wallpaper platform built for people who care how their screen looks. Here is what makes it different.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WHY.map(({ icon: Icon, title, body }) => (
            <div key={title} className="surface rounded-card p-6">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-2 shadow-glow">
                <Icon size={20} className="text-white" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-chalk-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular categories */}
      {popular.length > 0 && (
        <section>
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Popular categories</h2>
          <p className="mt-2 text-chalk-muted">Jump straight to the look you want.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {popular.map((c) => (
              <Link
                key={c.id}
                href={`/?category=${c.slug}`}
                className="focusable surface rounded-pill px-5 py-3 text-sm font-medium text-chalk-muted transition hover:text-chalk"
              >
                {c.name} <span className="ml-1 text-chalk-faint">{c.count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Popular collections (real SEO landing pages) */}
      <section>
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Popular collections</h2>
        <p className="mt-2 text-chalk-muted">Curated sets people love — free, in HD and 4K.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COLLECTIONS.map((c) => (
            <Link
              key={c.slug}
              href={`/wallpapers/${c.slug}`}
              className="focusable surface group flex items-center justify-between rounded-card p-5 transition hover:ring-1 hover:ring-white/20"
            >
              <span className="font-display text-lg font-semibold">{c.label}</span>
              <span className="text-accent transition group-hover:translate-x-1">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Frequently asked questions</h2>
        <div className="mt-6 space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="surface group rounded-card p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                {f.q}
                <span className="text-chalk-faint transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-chalk-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </div>
  );
}
