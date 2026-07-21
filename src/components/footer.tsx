import Link from "next/link";
import { SITE, DEVICES } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line px-6 py-14">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-display text-lg font-bold">
            <span className="text-accent">Get</span>YourWallpaper
          </p>
          <p className="mt-2 max-w-xs text-sm text-chalk-muted">{SITE.tagline}</p>
        </div>
        <div className="flex gap-12">
          <FooterCol title="Devices">
            {DEVICES.map((d) => (
              <FooterLink key={d.slug} href={`/?device=${d.slug}`}>{d.label}</FooterLink>
            ))}
          </FooterCol>
          <FooterCol title="More">
            <FooterLink href="/contribute">Submit</FooterLink>
            <FooterLink href="/about">About</FooterLink>
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/terms">Terms</FooterLink>
          </FooterCol>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-line pt-6 text-xs text-chalk-faint">
        © {new Date().getFullYear()} {SITE.name}
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
