"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Search } from "lucide-react";
import { NotifyBell } from "@/components/notify-bell";
import { ThemeToggle } from "@/components/theme-toggle";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Desktop", href: "/?device=desktop" },
  { label: "Phone", href: "/?device=phone" },
  { label: "Categories", href: "/?view=all" },
  { label: "Popular", href: "/?view=all&sort=popular" },
];

export function Nav({ admin, userInitial }: { admin?: boolean; userInitial?: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = q.trim();
    window.dispatchEvent(new Event("app:navstart"));
    router.push(t ? `/?q=${encodeURIComponent(t)}` : "/");
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 bg-ink/85 backdrop-blur-xl transition-colors duration-300 ${
        scrolled ? "border-b border-line" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 sm:gap-5 sm:px-6">
        {/* logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg btn-primary font-display text-lg font-bold">W</span>
          <span className="hidden font-display text-lg font-semibold tracking-tight sm:block">
            GetYour<span className="text-accent">Wallpaper</span>
          </span>
        </Link>

        {/* search — the prominent, Magnific-style bar */}
        <form onSubmit={submit} className="relative hidden max-w-xl flex-1 md:block">
          <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-chalk-faint" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search all wallpapers"
            className="focusable h-11 w-full rounded-full border border-line bg-ink-2 pl-11 pr-4 text-sm text-chalk placeholder:text-chalk-faint [&::-webkit-search-cancel-button]:hidden"
          />
        </form>

        {/* right cluster */}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <nav className="mr-1 hidden items-center gap-0.5 lg:flex">
            {LINKS.slice(0, 4).map((l) => (
              <Link key={l.label} href={l.href} className="rounded-full px-3 py-2 text-sm font-medium text-chalk-muted transition hover:text-chalk">
                {l.label}
              </Link>
            ))}
            {admin && (
              <Link href="/admin" className="rounded-full px-3 py-2 text-sm font-medium text-chalk-muted transition hover:text-chalk">Admin</Link>
            )}
          </nav>

          <ThemeToggle />
          <NotifyBell />

          {userInitial ? (
            <div className="grid h-10 w-10 place-items-center rounded-full btn-accent text-sm font-bold">{userInitial.toUpperCase()}</div>
          ) : (
            <>
              <Link href="/auth/login" className="focusable hidden h-10 items-center rounded-full px-3 text-sm font-medium text-chalk-muted transition hover:text-chalk sm:inline-flex">
                Sign in
              </Link>
              <Link href="/contribute" className="btn-primary focusable hidden h-10 items-center rounded-full px-4 text-sm font-semibold sm:inline-flex">
                Get started
              </Link>
            </>
          )}

          <button
            onClick={() => setOpen((v) => !v)}
            className="focusable grid h-10 w-10 place-items-center rounded-full text-chalk-muted transition hover:bg-ink-3 hover:text-chalk lg:hidden"
            aria-label="Menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-ink lg:hidden">
          <div className="mx-auto max-w-[1600px] px-3 py-2">
            <form onSubmit={submit} className="relative m-2">
              <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-chalk-faint" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search all wallpapers"
                className="focusable h-11 w-full rounded-full border border-line bg-ink-2 pl-11 pr-3 text-sm text-chalk placeholder:text-chalk-faint [&::-webkit-search-cancel-button]:hidden"
              />
            </form>
            {LINKS.map((l) => (
              <Link key={l.label} href={l.href} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm text-chalk-muted transition hover:bg-ink-3 hover:text-chalk">
                {l.label}
              </Link>
            ))}
            {admin && (
              <Link href="/admin" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm text-chalk-muted transition hover:bg-ink-3 hover:text-chalk">Admin</Link>
            )}
            {!userInitial && (
              <Link href="/contribute" onClick={() => setOpen(false)} className="btn-primary focusable m-2 flex h-11 items-center justify-center rounded-full text-sm font-semibold">Get started</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
