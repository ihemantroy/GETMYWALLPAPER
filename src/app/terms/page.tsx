import type { Metadata } from "next";
export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-2xl px-6 pb-16 pt-28">
      <h1 className="font-display text-4xl font-bold tracking-tight">Terms</h1>
      <div className="mt-6 space-y-4 text-chalk-muted">
        <p>Wallpapers are for personal use. Don&apos;t resell them or claim them as your own.</p>
        <p>When you contribute, you confirm you own the rights to the image and grant us permission to display and distribute it on the platform.</p>
        <p>We may remove any content at our discretion.</p>
        <p className="text-xs text-chalk-faint">This is a starter document — have it reviewed before launch.</p>
      </div>
    </article>
  );
}
