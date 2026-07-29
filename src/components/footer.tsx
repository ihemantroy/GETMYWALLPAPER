import Link from "next/link";
import { SITE, DEVICES } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line px-6 py-14">
      <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div>
          <p className="font-display text-lg font-bold">
            <span className="text-accent">Get</span>YourWallpaper
          </p>
          <p className="mt-2 max-w-xs text-sm text-chalk-muted">{SITE.tagline}</p>
          <p className="mt-4 max-w-xs text-xs text-chalk-faint">
            Credit, takedown or dispute?{" "}
            <a href="mailto:ihemantroy@gmail.com" className="text-chalk-muted underline hover:text-chalk">
              ihemantroy@gmail.com
            </a>
          </p>
        </div>

        <FooterCol title="Explore">
          <FooterLink href="/">Browse</FooterLink>
          <FooterLink href="/create">Create</FooterLink>
          <FooterLink href="/contribute">Submit</FooterLink>
          {DEVICES.map((d) => (
            <FooterLink key={d.slug} href={`/?device=${d.slug}`}>{d.label}</FooterLink>
          ))}
        </FooterCol>

        <FooterCol title="Company">
          <FooterLink href="/about">About</FooterLink>
          <FooterLink href="/contact">Contact</FooterLink>
        </FooterCol>

        <FooterCol title="Legal">
          <FooterLink href="/privacy">Privacy Policy</FooterLink>
          <FooterLink href="/terms">Terms</FooterLink>
          <FooterLink href="/disclaimer">Disclaimer</FooterLink>
          <FooterLink href="/dmca">DMCA</FooterLink>
          <FooterLink href="/sitemap.xml">Sitemap</FooterLink>
        </FooterCol>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-2 border-t border-line pt-6 text-xs text-chalk-faint sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</span>
        <span>Wallpapers with taste.</span>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-chalk-faint">{title}</p>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li><Link href={href} className="text-sm text-chalk-muted transition hover:text-chalk">{children}</Link></li>
  );
}
