import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl px-6 pb-16 pt-28">
      <h1 className="font-display text-4xl font-bold tracking-tight">Privacy</h1>
      <div className="mt-6 space-y-4 text-chalk-muted">
        <p>We keep this simple. We store your account email and the favorites/collections you create, so we can show them back to you. We don&apos;t sell your data.</p>
        <p>We use privacy-respecting analytics to understand which wallpapers are popular, and Google AdSense may serve ads. You can browse without an account.</p>
        <p>Questions? Email <a href="mailto:hello@getyourwallpaper.com" className="text-chalk underline">hello@getyourwallpaper.com</a>.</p>
        <p className="text-xs text-chalk-faint">This is a starter policy — have it reviewed before launch.</p>
      </div>
    </article>
  );
}
