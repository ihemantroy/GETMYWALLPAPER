import Link from "next/link";
import { Sparkles, Monitor, Download, ShieldCheck, Zap, Layers } from "lucide-react";
import type { Category } from "@/lib/types";

const WHY = [
  { icon: Download, title: "Free, full-resolution", body: "Every wallpaper downloads in its original quality — no paywall, no watermark, no sign-up." },
  { icon: Monitor, title: "Fits your exact screen", body: "Auto-sized to your phone, tablet, or desktop pixels, so it looks crisp with no manual cropping." },
  { icon: Sparkles, title: "Fresh drops daily", body: "New, hand-picked and AI-crafted wallpapers land every day across every category." },
  { icon: Zap, title: "Fast & installable", body: "A lightweight, app-like experience you can add to your home screen and open in one tap." },
  { icon: Layers, title: "Every vibe & category", body: "Minimal, abstract, nature, AMOLED and more — organised so you find your look fast." },
  { icon: ShieldCheck, title: "Licensed sources", body: "Built from original and license-clean art, so what you download is safe to use." },
];

const COLLECTIONS = [
  { slug: "dark", label: "Dark" },
  { slug: "minimal", label: "Minimal" },
  { slug: "4k", label: "4K" },
  { slug: "amoled", label: "AMOLED" },
  { slug: "aesthetic", label: "Aesthetic" },
  { slug: "nature", label: "Nature" },
];

const FAQS = [
  { q: "Are the wallpapers on GetYourWallpaper free?", a: "Yes. Every wallpaper is completely free to download in full resolution, with no account required and no watermark." },
  { q: "Will the wallpaper fit my screen?", a: "Yes. When you download, GetYourWallpaper auto-fits the image to your exact device resolution — phone, tablet or desktop — so there is no manual cropping." },
  { q: "Do I need an account to download?", a: "No. You can browse and download freely. An account is only needed if you want to save favorites across devices or submit your own wallpapers." },
  { q: "How often are new wallpapers added?", a: "New wallpapers are published daily, including a featured Wallpaper of the Day and a personalised daily pick for your chosen vibe." },
  { q: "Can I submit my own wallpaper?", a: "Yes. Use the Submit page to contribute a wallpaper. It enters a review queue and, once approved, is published with credit to you." },
  { q: "Who do I contact about a wallpaper or a copyright concern?", a: "Email ihemantroy@gmail.com for credits, takedown or dispute requests and we will respond promptly." },
];

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent/80">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-chalk-muted">{sub}</p>}
    </div>
  );
}

export function HomeSections({ categories }: { categories: Category[] }) {
  const popular = [...categories]
    .filter((c) => (c.count ?? 0) > 0)
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
    .slice(0, 8);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <div className="mt-28 space-y-28">
      {/* Why choose */}
      <section>
        <SectionHead
          eyebrow="Why GetYourWallpaper"
          title="Wallpapers with taste."
          sub="A premium, free platform built for people who care how their screen looks."
        />
        <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-white/[0.06] sm:grid-cols-2 lg:grid-cols-3">
          {WHY.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-white/[0.015] p-7 transition hover:bg-white/[0.035]">
              <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-accent">
                <Icon size={18} />
              </div>
              <h3 className="mt-5 font-display text-base font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-chalk-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular categories */}
      {popular.length > 0 && (
        <section>
          <SectionHead eyebrow="Browse" title="Popular categories" />
          <div className="mt-10 flex flex-wrap justify-center gap-2.5">
            {popular.map((c) => (
              <Link
                key={c.id}
                href={`/?category=${c.slug}`}
                className="focusable card-min rounded-full px-5 py-2.5 text-sm font-medium text-chalk-muted transition hover:text-chalk"
              >
                {c.name} <span className="ml-1 text-chalk-faint">{c.count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Popular collections */}
      <section>
        <SectionHead eyebrow="Curated" title="Popular collections" sub="Hand-curated sets — free, in HD and 4K." />
        <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COLLECTIONS.map((c) => (
            <Link
              key={c.slug}
              href={`/wallpapers/${c.slug}`}
              className="focusable card-min group flex items-center justify-between rounded-2xl px-6 py-5"
            >
              <span className="font-display text-lg font-medium">{c.label}</span>
              <span className="text-chalk-faint transition group-hover:translate-x-1 group-hover:text-accent">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section>
        <SectionHead eyebrow="Help" title="Frequently asked questions" />
        <div className="mx-auto mt-10 max-w-2xl space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="card-min group rounded-2xl px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
                {f.q}
                <span className="ml-4 shrink-0 text-lg leading-none text-chalk-faint transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-chalk-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </div>
  );
}
