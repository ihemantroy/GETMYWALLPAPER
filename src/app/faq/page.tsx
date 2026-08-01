import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: `Answers to common questions about downloading, using, and contributing wallpapers on ${SITE.name} — resolutions, licensing, devices, and more.`,
  alternates: { canonical: "/faq" },
};

const FAQS: { q: string; a: string }[] = [
  {
    q: `What is ${SITE.name}?`,
    a: `${SITE.name} is a free wallpaper platform where you can browse and download high-resolution backgrounds for your phone, tablet, desktop, and laptop. Every wallpaper is organized by device and category so you can quickly find something that fits your screen and your taste, without endless scrolling or clutter.`,
  },
  {
    q: "Are the wallpapers really free to download?",
    a: "Yes. Every wallpaper on the site can be downloaded for free, with no account required and no watermarks added to the image. We keep the experience clean so you can find a wallpaper, download it at the resolution you need, and get on with your day.",
  },
  {
    q: "Do I need an account to download wallpapers?",
    a: "No. You can browse and download without signing up. Creating a free account only adds convenience features, such as saving favorites so you can find them again later on the same browser or device.",
  },
  {
    q: "What resolutions and sizes are available?",
    a: "Most wallpapers are available in HD, 2K, and 4K where the source image supports it. On each wallpaper page you can choose the original file or pick a preset sized for your device — for example 1080p, 1440p, and 4K for desktops, or common phone resolutions for mobile. You can also choose the size that matches your own screen.",
  },
  {
    q: "How do I download a wallpaper?",
    a: "Open any wallpaper, then click the Download button. Use the small arrow next to it to pick a specific size or the original file. The image will download straight to your device — no redirects, pop-ups, or sign-up walls.",
  },
  {
    q: "How do I set a downloaded image as my wallpaper?",
    a: "On a phone, open the downloaded image in your gallery or Photos app, tap the share or options menu, and choose 'Use as wallpaper' (Android) or 'Set as Wallpaper' (iPhone). On Windows, right-click the image and choose 'Set as desktop background'. On macOS, right-click and choose 'Set Desktop Picture'.",
  },
  {
    q: "What is the difference between phone, tablet, and desktop wallpapers?",
    a: "They are sized for different screen shapes. Phone wallpapers are tall (portrait) to fill mobile screens, desktop wallpapers are wide (landscape) for monitors and laptops, and tablet wallpapers sit in between. Use the Desktop, Phone, and Tablet tabs to filter to the right shape for your device.",
  },
  {
    q: "Can I use these wallpapers on more than one device?",
    a: "Yes. Once you download a wallpaper you can set it on any of your personal devices. If you switch phones or add a second monitor, just download the size that matches the new screen.",
  },
  {
    q: "Can I use the wallpapers commercially?",
    a: "Wallpapers are intended for personal use — as backgrounds on your own devices. They are not licensed for resale, redistribution, or commercial products. Some images may carry additional attribution or licensing terms, which are shown on the wallpaper page when they apply. If you need commercial rights, please check the credit on the specific image or contact us first.",
  },
  {
    q: "Who owns the copyright to the wallpapers?",
    a: "Copyright remains with the original creators. We display credit and source links where available. We respect intellectual property and respond promptly to valid takedown requests — see our DMCA / Copyright policy for details on how to report content.",
  },
  {
    q: "How do I report a copyright or content issue?",
    a: "Visit our DMCA / Copyright page and send us the details of the image and your claim, or email us directly. We review every report and remove infringing content quickly when a claim is valid.",
  },
  {
    q: "Can I create my own wallpaper on the site?",
    a: "Yes. Use the Create tool in the top menu to make your own wallpaper — turn a photo into a glowing 'aura' lock screen, design a clean gradient, or build a pure-black AMOLED background. Everything is sized to your exact screen and downloads with no watermark.",
  },
  {
    q: "Can I submit or contribute my own wallpapers?",
    a: "Absolutely. Head to the Contribute page to submit your work. Approved submissions are published with credit to you, so other people can enjoy and download them.",
  },
  {
    q: "How do favorites work?",
    a: "Tap the heart on any wallpaper to save it to your favorites. Your favorites are stored so you can return to them from the Favorites page and download them whenever you like.",
  },
  {
    q: "Why do I sometimes see advertising on the site?",
    a: "Hosting high-resolution images and keeping the site free costs money. We may show ads, including through Google AdSense, to cover those costs. We keep advertising unobtrusive so it never gets in the way of finding and downloading wallpapers. You can manage ad personalization in your Google Ads Settings.",
  },
  {
    q: "Does the site use cookies?",
    a: "Yes, a small number. Some are essential for the site to work and to remember your preferences, and some may be set by advertising or analytics partners. You can read the full details in our Cookie Policy and Privacy Policy, and manage cookies through your browser settings.",
  },
  {
    q: "The image looks different from the thumbnail — why?",
    a: "Thumbnails are cropped to fit the grid neatly, while the wallpaper page and your download always use the full, uncropped image at its true resolution and orientation. What you download is the complete image.",
  },
  {
    q: "How can I contact you?",
    a: "We'd love to hear from you. Use the Contact page or email us directly, whether it's feedback, a request, a partnership, or a question that isn't answered here.",
  },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <article className="mx-auto max-w-3xl px-6 pb-20 pt-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <p className="text-xs font-semibold uppercase tracking-widest text-accent">Help Center</p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">Frequently asked questions</h1>
      <p className="mt-4 text-chalk-muted">
        Everything you need to know about finding, downloading, and using wallpapers on {SITE.name}. Can&apos;t find
        your answer? <Link href="/contact" className="text-accent underline underline-offset-2">Get in touch</Link>.
      </p>

      <div className="mt-10 divide-y divide-line">
        {FAQS.map((f, i) => (
          <details key={i} className="group py-5" open={i < 3}>
            <summary className="focusable flex cursor-pointer list-none items-center justify-between gap-4 text-left font-display text-lg font-semibold text-chalk marker:content-['']">
              {f.q}
              <span className="shrink-0 text-chalk-faint transition-transform duration-200 group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 leading-relaxed text-chalk-muted">{f.a}</p>
          </details>
        ))}
      </div>

      <div className="mt-12 surface rounded-card p-6">
        <h2 className="font-display text-xl font-semibold">Still have a question?</h2>
        <p className="mt-2 text-sm text-chalk-muted">
          Browse our <Link href="/about" className="text-accent underline underline-offset-2">About</Link> page, review the{" "}
          <Link href="/terms" className="text-accent underline underline-offset-2">Terms</Link> and{" "}
          <Link href="/privacy" className="text-accent underline underline-offset-2">Privacy Policy</Link>, or{" "}
          <Link href="/contact" className="text-accent underline underline-offset-2">contact us</Link> directly.
        </p>
      </div>
    </article>
  );
}
