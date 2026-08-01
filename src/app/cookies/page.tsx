import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: `How ${SITE.name} uses cookies and similar technologies, including advertising cookies from Google AdSense.`,
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 pb-20 pt-28">
      <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Cookie Policy</h1>
      <p className="mt-3 text-sm text-chalk-faint">Last updated: August 2026</p>

      <div className="mt-8 space-y-8 leading-relaxed text-chalk-muted">
        <section>
          <p>
            This Cookie Policy explains what cookies are, how {SITE.name} uses them on {SITE.domain}, and how you can
            control them. It should be read together with our{" "}
            <Link href="/privacy" className="text-accent underline underline-offset-2">Privacy Policy</Link>.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl font-semibold text-chalk">What are cookies?</h2>
          <p>Cookies are small text files placed on your device when you visit a website. They help the site remember your actions and preferences over time, and they let site owners and partners understand how the site is used.</p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl font-semibold text-chalk">Types of cookies we use</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li><span className="text-chalk">Essential cookies</span> — required for the Site to function, such as keeping you signed in and remembering your theme (light/dark) and preferences.</li>
            <li><span className="text-chalk">Analytics cookies</span> — help us understand which wallpapers and pages are popular so we can improve the Site.</li>
            <li><span className="text-chalk">Advertising cookies</span> — set by advertising partners such as Google to show relevant ads and limit how often you see them.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl font-semibold text-chalk">Third-party and advertising cookies</h2>
          <p>
            We use Google AdSense to display advertising. Google and other third-party vendors use cookies to serve ads
            based on your prior visits to this and other websites. Google&apos;s use of advertising cookies enables it and
            its partners to serve ads to you based on your visits to this Site and other sites on the internet.
          </p>
          <p className="mt-3">You can opt out of personalized advertising by visiting your{" "}
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2">Google Ads Settings</a>, or opt out of some third-party vendors at{" "}
            <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2">aboutads.info/choices</a>.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl font-semibold text-chalk">Managing cookies</h2>
          <p>Most browsers let you view, block, and delete cookies through their settings. You can also browse in private/incognito mode. Note that blocking essential cookies may stop parts of the Site from working correctly.</p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl font-semibold text-chalk">Changes &amp; contact</h2>
          <p>We may update this Cookie Policy as our practices evolve. For questions, see our{" "}
            <Link href="/contact" className="text-accent underline underline-offset-2">Contact page</Link>.</p>
        </section>
      </div>
    </article>
  );
}
