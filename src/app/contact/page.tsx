import type { Metadata } from "next";
export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <article className="mx-auto max-w-2xl px-6 pb-16 pt-28">
      <h1 className="font-display text-4xl font-bold tracking-tight">Get in touch</h1>
      <p className="mt-6 text-chalk-muted">
        Partnerships, takedown requests, or just saying hi — email{" "}
        <a href="mailto:hello@getyourwallpaper.com" className="text-chalk underline">
          hello@getyourwallpaper.com
        </a>
        . We read everything.
      </p>
    </article>
  );
}
