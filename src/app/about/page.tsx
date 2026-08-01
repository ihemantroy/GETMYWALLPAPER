import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description: `About ${SITE.name} — a hand-picked wallpaper platform for every device.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 pb-20 pt-28">
      <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">About {SITE.name}</h1>

      <div className="mt-8 space-y-6 leading-relaxed text-chalk-muted">
        <p>
          {SITE.name} is a free wallpaper platform built on one simple idea: finding a great background for your screen
          should be fast, clean, and enjoyable. The internet is full of wallpaper dumps buried under pop-ups and
          watermarks. We wanted the opposite — a calm, well-organized library where every wallpaper is sized for real
          devices and ready to download in a click.
        </p>

        <h2 className="pt-2 font-display text-2xl font-semibold text-chalk">What we offer</h2>
        <p>
          Our collection spans phone, tablet, and desktop wallpapers across a wide range of styles — minimal and
          abstract, nature and landscapes, dark and AMOLED-friendly designs, gradients, anime, cars, space, and more.
          Each wallpaper page lets you preview the image at full quality and download it at the resolution that fits your
          screen, from HD up to 4K where the source allows.
        </p>

        <h2 className="pt-2 font-display text-2xl font-semibold text-chalk">Made for your device</h2>
        <p>
          Screens come in many shapes, so we organize wallpapers by device. Phone wallpapers are tall and built to fill
          modern mobile displays edge to edge; desktop wallpapers are wide for monitors and laptops; tablet wallpapers
          sit comfortably in between. Filter by device and you&apos;ll only see wallpapers that actually fit.
        </p>

        <h2 className="pt-2 font-display text-2xl font-semibold text-chalk">Create your own</h2>
        <p>
          Beyond browsing, you can make something original with our <Link href="/create" className="text-accent underline underline-offset-2">Create</Link> tools:
          turn a photo into a glowing aura lock screen, design a clean gradient, or build a pure-black AMOLED wallpaper —
          all sized to your exact screen and downloaded without a watermark.
        </p>

        <h2 className="pt-2 font-display text-2xl font-semibold text-chalk">Respecting creators</h2>
        <p>
          We care about the artists behind the images. Where a wallpaper has a known source or creator, we show credit
          and a link. We respond quickly to takedown requests — if you believe your work appears here without permission,
          our <Link href="/dmca" className="text-accent underline underline-offset-2">DMCA / Copyright</Link> page explains
          how to reach us.
        </p>

        <h2 className="pt-2 font-display text-2xl font-semibold text-chalk">Get involved</h2>
        <p>
          Have wallpapers worth sharing? Anyone can <Link href="/contribute" className="text-accent underline underline-offset-2">contribute</Link> —
          approved submissions publish with credit to you. Questions or feedback are always welcome via our{" "}
          <Link href="/contact" className="text-accent underline underline-offset-2">Contact</Link> page, and you&apos;ll
          find quick answers in our <Link href="/faq" className="text-accent underline underline-offset-2">FAQ</Link>.
        </p>
      </div>
    </article>
  );
}
