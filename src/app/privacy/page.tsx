import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl px-6 pb-16 pt-28">
      <h1 className="font-display text-4xl font-bold tracking-tight">Privacy</h1>
      <div className="mt-6 space-y-4 text-chalk-muted">
        <p>
          We keep this simple. We store your account email and the favorites/collections you create,
          so we can show them back to you. We don&apos;t sell your data.
        </p>
        <p>
          We use privacy-respecting analytics to understand which wallpapers are popular. We also use
          Google AdSense to show ads on this site, which may use cookies to serve relevant advertising.
          You can browse without an account.
        </p>
        <p>
          You can manage your ad personalization settings at{" "}
          <a
            href="https://adssettings.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-chalk underline"
          >
            Google Ads Settings
          </a>
          .
        </p>
        <p>
          Questions?{" "}
          <a href="mailto:ihemantroy@gmail.com" className="text-chalk underline">ihemantroy@gmail.com</a>
        </p>
      </div>
    </article>
  );
}
