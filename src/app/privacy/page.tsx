import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE.name} collects, uses, and protects your information, including cookies and third-party advertising.`,
  alternates: { canonical: "/privacy" },
};

const EMAIL = "ihemantroy@gmail.com";

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 pb-20 pt-28">
      <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Privacy Policy</h1>
      <p className="mt-3 text-sm text-chalk-faint">Last updated: August 2026</p>

      <div className="mt-8 space-y-8 leading-relaxed text-chalk-muted">
        <section>
          <p>
            This Privacy Policy explains how {SITE.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;)
            collects, uses, and safeguards information when you visit {SITE.domain} (the &ldquo;Site&rdquo;). By using
            the Site, you agree to the practices described here. If you do not agree, please discontinue use of the Site.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl font-semibold text-chalk">1. Information we collect</h2>
          <p>We aim to collect as little as possible. Depending on how you use the Site, this may include:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li><span className="text-chalk">Account information</span> — if you create an account, we store your email address and the favorites or collections you save.</li>
            <li><span className="text-chalk">Usage data</span> — pages viewed, wallpapers downloaded, and general interaction data, used to understand what content is popular.</li>
            <li><span className="text-chalk">Device and log data</span> — such as browser type, approximate region, and IP address, collected automatically by our hosting and analytics providers.</li>
            <li><span className="text-chalk">Cookies and similar technologies</span> — see the Cookies section below and our <Link href="/cookies" className="text-accent underline underline-offset-2">Cookie Policy</Link>.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl font-semibold text-chalk">2. How we use information</h2>
          <p>We use the information we collect to operate and improve the Site — to deliver wallpapers and downloads, remember your preferences and favorites, measure which content is popular, keep the Site secure, and display advertising that helps keep the Site free. We do not sell your personal information.</p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl font-semibold text-chalk">3. Cookies</h2>
          <p>
            Cookies are small files stored on your device. We use essential cookies to make the Site work and remember
            preferences, and we allow selected partners (analytics and advertising) to set cookies. You can control or
            delete cookies through your browser settings; disabling some cookies may affect functionality. Full detail is
            in our <Link href="/cookies" className="text-accent underline underline-offset-2">Cookie Policy</Link>.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl font-semibold text-chalk">4. Advertising and third parties (Google AdSense)</h2>
          <ul className="mt-1 list-disc space-y-2 pl-5">
            <li>Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this and other websites.</li>
            <li>Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your visit to this Site and/or other sites on the internet.</li>
            <li>You may opt out of personalized advertising by visiting{" "}
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2">Google Ads Settings</a>.</li>
            <li>You can opt out of some third-party vendors&apos; use of cookies for personalized advertising at{" "}
              <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2">aboutads.info/choices</a>.</li>
            <li>Third-party advertising partners may include Google AdSense and other networks that operate under their own privacy policies.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl font-semibold text-chalk">5. Your rights (GDPR &amp; CCPA)</h2>
          <p>Depending on where you live, you may have the right to access, correct, or delete your personal data, to object to or restrict certain processing, and to opt out of the &ldquo;sale&rdquo; or &ldquo;sharing&rdquo; of personal information. To exercise any of these rights, contact us at the email below and we will respond within a reasonable time.</p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl font-semibold text-chalk">6. Children&apos;s privacy</h2>
          <p>The Site is not directed to children under 13 (or the minimum age required in your jurisdiction), and we do not knowingly collect personal information from them. If you believe a child has provided us information, contact us and we will delete it.</p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl font-semibold text-chalk">7. Data retention &amp; security</h2>
          <p>We retain personal information only as long as needed for the purposes described here, then delete or anonymize it. We use reasonable technical and organizational measures to protect your data, though no method of transmission over the internet is completely secure.</p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl font-semibold text-chalk">8. Changes to this policy</h2>
          <p>We may update this Privacy Policy from time to time. Material changes will be reflected by the &ldquo;Last updated&rdquo; date above. Continued use of the Site after changes means you accept the revised policy.</p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl font-semibold text-chalk">9. Contact</h2>
          <p>Questions about this policy or your data? Email <a href={`mailto:${EMAIL}`} className="text-accent underline underline-offset-2">{EMAIL}</a> or use our <Link href="/contact" className="text-accent underline underline-offset-2">Contact page</Link>.</p>
        </section>
      </div>
    </article>
  );
}
