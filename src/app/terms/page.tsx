import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `The terms that govern your use of ${SITE.name}.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 pb-20 pt-28">
      <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Terms of Use</h1>
      <p className="mt-3 text-sm text-chalk-faint">Last updated: August 2026</p>

      <div className="mt-8 space-y-8 leading-relaxed text-chalk-muted">
        <section>
          <p>These Terms of Use (&ldquo;Terms&rdquo;) govern your access to and use of {SITE.domain} (the &ldquo;Site&rdquo;) operated by {SITE.name}. By using the Site, you agree to these Terms. If you do not agree, please do not use the Site.</p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl font-semibold text-chalk">1. Use of wallpapers</h2>
          <p>Wallpapers are provided for personal, non-commercial use as backgrounds on your own devices. You may not resell, redistribute, sublicense, or use the wallpapers as part of a commercial product or service. Some images carry additional attribution or licensing terms shown on their page, which you must follow.</p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl font-semibold text-chalk">2. Intellectual property</h2>
          <p>Copyright in the wallpapers remains with their respective creators. The {SITE.name} name, design, and Site content are protected. Nothing on the Site transfers ownership of any image to you. If you believe content infringes your rights, see our <Link href="/dmca" className="text-accent underline underline-offset-2">DMCA / Copyright</Link> page.</p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl font-semibold text-chalk">3. User contributions</h2>
          <p>If you submit wallpapers or other content, you confirm you have the right to do so and grant us a license to display and distribute it on the Site with credit. You are responsible for the content you submit, and we may remove any submission at our discretion.</p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl font-semibold text-chalk">4. Acceptable use</h2>
          <p>You agree not to misuse the Site — including attempting to disrupt it, scraping content at scale, uploading unlawful or infringing material, or using automated systems in a way that harms the service or other users.</p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl font-semibold text-chalk">5. Advertising</h2>
          <p>The Site may display third-party advertising, including via Google AdSense, to keep it free to use. Your interactions with advertisers are between you and them, and are subject to their terms and policies. See our <Link href="/privacy" className="text-accent underline underline-offset-2">Privacy Policy</Link> and <Link href="/cookies" className="text-accent underline underline-offset-2">Cookie Policy</Link>.</p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl font-semibold text-chalk">6. Disclaimer &amp; limitation of liability</h2>
          <p>The Site and its content are provided &ldquo;as is&rdquo; without warranties of any kind. To the fullest extent permitted by law, we are not liable for any damages arising from your use of the Site. See our <Link href="/disclaimer" className="text-accent underline underline-offset-2">Disclaimer</Link> for more.</p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl font-semibold text-chalk">7. Changes to these Terms</h2>
          <p>We may update these Terms from time to time. Changes take effect when posted, indicated by the &ldquo;Last updated&rdquo; date above. Continued use of the Site means you accept the revised Terms.</p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl font-semibold text-chalk">8. Contact</h2>
          <p>Questions about these Terms? Reach us through our <Link href="/contact" className="text-accent underline underline-offset-2">Contact page</Link>.</p>
        </section>
      </div>
    </article>
  );
}
