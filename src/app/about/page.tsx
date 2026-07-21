import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = { title: "About", description: `About ${SITE.name}.` };

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-2xl px-6 pb-16 pt-28">
      <h1 className="font-display text-4xl font-bold tracking-tight">A taste-making wallpaper platform</h1>
      <div className="mt-6 space-y-4 text-chalk-muted">
        <p>
          {SITE.name} exists for one reason: the internet is full of wallpaper dumps, and almost none of them
          have taste. We&apos;re the opposite — every wallpaper here is chosen by a human, tuned for real
          screens, and delivered in modern formats that load instantly.
        </p>
        <p>
          No endless scrolling through low-effort uploads. No watermarks. No walls of ads breaking a clean,
          dark interface. Just the best wallpapers, matched to whatever device you&apos;re on.
        </p>
        <p>
          Have something worth sharing? Anyone can{" "}
          <a href="/contribute" className="text-chalk underline">contribute</a> — approved submissions publish
          with credit to you.
        </p>
      </div>
    </article>
  );
}
