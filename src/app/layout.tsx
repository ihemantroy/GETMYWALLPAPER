import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import Script from "next/script";
import "./globals.css";
import { Nav } from "@/components/nav";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { ChromeGate } from "@/components/chrome-gate";
import { PwaRegister } from "@/components/pwa-register";
import { InstallProvider } from "@/components/install-provider";
import { InstallButton } from "@/components/install-button";
import { IosInstallGuide } from "@/components/ios-install-guide";
import { TopProgressBar } from "@/components/top-progress-bar";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { Footer } from "@/components/footer";
import { SITE } from "@/lib/constants";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://getyourwallpaper.com").replace("://www.", "://");

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
  verification: { google: "atnxPpuz7uE_i-7wrTed-LjQsjxGBsNsTuHXIVQYFHQ" },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0D0D0F" },
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
  ],
};

const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

async function NavWrapper() {
  const user = await getSessionUser();
  const admin = user ? await isAdmin() : false;
  return <Nav admin={admin} userInitial={user?.email?.[0] ?? null} />;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Apply saved theme before first paint — prevents a light/dark flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t='dark';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`,
          }}
        />
        {/* Capture the install prompt event immediately — Chrome can fire it
            before React mounts, and if no listener is ready yet the event is
            lost and the Install button never appears. Stash it on window. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){window.__bip=null;window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__bip=e;window.dispatchEvent(new Event('bip:captured'));});window.addEventListener('appinstalled',function(){window.__bip=null;window.dispatchEvent(new Event('bip:installed'));});})();`,
          }}
        />
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="GetYourWallpaper" />
        <style>{`:root{--font-display:'General Sans',system-ui,sans-serif;--font-sans:'General Sans',system-ui,sans-serif}`}</style>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": `${siteUrl}/#organization`,
                  name: "GetYourWallpaper",
                  url: siteUrl,
                  logo: `${siteUrl}/icon-512.png`,
                  email: "ihemantroy@gmail.com",
                },
                {
                  "@type": "WebSite",
                  "@id": `${siteUrl}/#website`,
                  name: "GetYourWallpaper",
                  url: siteUrl,
                  description: SITE.description,
                  publisher: { "@id": `${siteUrl}/#organization` },
                  potentialAction: {
                    "@type": "SearchAction",
                    target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/?q={search_term_string}` },
                    "query-input": "required name=search_term_string",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body>
        <PwaRegister />
        <InstallProvider>
          <TopProgressBar />
          <ChromeGate><NavWrapper /></ChromeGate>
          <div className="min-h-screen">{children}</div>
          <ChromeGate><Footer /></ChromeGate>
          <InstallButton />
          <IosInstallGuide />
        </InstallProvider>
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