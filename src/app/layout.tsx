import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Nav } from "@/components/nav";
import { ChromeGate } from "@/components/chrome-gate";
import { Footer } from "@/components/footer";
import { SITE } from "@/lib/constants";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://getyourwallpaper.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s — ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: ["wallpapers", "4k wallpapers", "iphone wallpapers", "desktop wallpapers", "aesthetic wallpapers"],
  openGraph: {
    type: "website", url: siteUrl, siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`, description: SITE.description,
  },
  twitter: { card: "summary_large_image", title: SITE.name, description: SITE.description },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = { themeColor: "#0A0A0D", colorScheme: "dark" };

const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=clash-display@600,700&f[]=general-sans@400,500,600,700&display=swap"
        />
        <style>{`:root{--font-display:'Clash Display',system-ui,sans-serif;--font-sans:'General Sans',system-ui,sans-serif}`}</style>
      </head>
      <body>
        <ChromeGate><Nav /></ChromeGate>
        <div className="min-h-screen">{children}</div>
        <ChromeGate><Footer /></ChromeGate>
        {adsenseClient && (
          <Script
            id="adsense" async strategy="afterInteractive" crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          />
        )}
      </body>
    </html>
  );
}
