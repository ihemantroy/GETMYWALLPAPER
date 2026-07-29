import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Disclaimer for GetYourWallpaper — how our wallpapers may be used and the limits of our liability.",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <article className="mx-auto max-w-2xl px-6 pb-16 pt-28">
      <h1 className="font-display text-4xl font-bold tracking-tight">Disclaimer</h1>
      <div className="mt-6 space-y-4 text-chalk-muted">
        <p>
          GetYourWallpaper provides wallpapers for personal, non-commercial use. We make every effort to
          feature original and license-clean artwork, and to credit creators where a source is known.
        </p>
        <p>
          The wallpapers are provided &quot;as is&quot; without warranty of any kind. We do not guarantee that
          any image is suitable for a particular purpose, and we are not liable for any loss or damage
          arising from downloading or using content from this site.
        </p>
        <p>
          Some wallpapers may be submitted by users or imported from third-party sources. If you believe
          any content infringes your rights, please see our{" "}
          <a href="/dmca" className="text-chalk underline">DMCA / takedown</a> page — we act on valid requests
          promptly.
        </p>
        <p>
          External links on this site are provided for convenience; we are not responsible for the content
          of third-party websites.
        </p>
        <p>
          Questions about this disclaimer?{" "}
          <a href="mailto:ihemantroy@gmail.com" className="text-chalk underline">ihemantroy@gmail.com</a>
        </p>
      </div>
    </article>
  );
}
