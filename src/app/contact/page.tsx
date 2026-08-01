import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with GetYourWallpaper for partnerships, takedown requests, wallpaper submissions, or general feedback.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <article className="mx-auto max-w-2xl px-6 pb-16 pt-28">
      <h1 className="font-display text-4xl font-bold tracking-tight">Get in touch</h1>
      <p className="mt-6 leading-relaxed text-chalk-muted">
        Partnerships, takedown requests, or just saying hi — email{" "}
        <a href="mailto:hello@getyourwallpaper.com" className="text-chalk underline">
          hello@getyourwallpaper.com
        </a>
        . We read everything and typically reply within a couple of days.
      </p>

      <div className="mt-10 space-y-6">
        <div>
          <h2 className="font-display text-lg font-semibold text-chalk">Have wallpapers to share?</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-chalk-muted">
            You don&apos;t need to email us first — anyone can submit through the{" "}
            <Link href="/contribute" className="text-accent underline underline-offset-2">Contribute</Link> page. Approved
            submissions are published with credit to you.
          </p>
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold text-chalk">Think a wallpaper shouldn&apos;t be here?</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-chalk-muted">
            See our <Link href="/dmca" className="text-accent underline underline-offset-2">DMCA / Copyright</Link> page
            for how to request a takedown — we act on valid requests quickly.
          </p>
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold text-chalk">Quick answers first</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-chalk-muted">
            Common questions about downloads, devices, and accounts are covered in our{" "}
            <Link href="/faq" className="text-accent underline underline-offset-2">FAQ</Link> — worth a
            check before emailing.
          </p>
        </div>
      </div>
    </article>
  );
}
