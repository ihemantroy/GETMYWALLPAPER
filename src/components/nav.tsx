"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Search } from "lucide-react";
import { NotifyBell } from "@/components/notify-bell";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Categories", href: "/?view=all" },
  { label: "Collections", href: "/#collections" },
  { label: "Top Rated", href: "/?view=all&sort=popular" },
  { label: "Latest", href: "/?view=all&sort=latest" },
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
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-white/[0.07] bg-ink/70 backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent bg-ink/30 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-5 sm:px-8">
        {/* logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl btn-accent font-display text-lg font-black text-white">W</span>
          <span className="hidden font-display text-lg font-bold tracking-tight sm:block">
            <span className="text-accent">GetYour</span>Wallpaper
          </span>
        </Link>

        {/* center links */}
        <nav className="mx-auto hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link key={l.label} href={l.href} className="rounded-full px-3.5 py-2 text-sm font-medium text-chalk-muted transition hover:text-chalk">
              {l.label}
            </Link>
          ))}
          {admin && (
            <Link href="/admin" className="rounded-full px-3.5 py-2 text-sm font-medium text-chalk-muted transition hover:text-chalk">Admin</Link>
          )}
        </nav>

        {/* right cluster */}
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <form onSubmit={submit} className="relative hidden md:block">
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-chalk-faint" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search wallpapers…"
              className="focusable h-10 w-52 rounded-full border border-white/10 bg-white/[0.04] pl-9 pr-3 text-sm text-chalk placeholder:text-chalk-faint [&::-webkit-search-cancel-button]:hidden"
            />
          </form>

          <NotifyBell />

          {userInitial ? (
            <div className="grid h-10 w-10 place-items-center rounded-full btn-accent text-sm font-bold">{userInitial.toUpperCase()}</div>
          ) : (
            <Link href="/auth/login" className="btn-accent focusable hidden h-10 items-center rounded-full px-4 text-sm font-semibold sm:inline-flex">Sign in</Link>
          )}

          <button
            onClick={() => setOpen((v) => !v)}
            className="focusable grid h-10 w-10 place-items-center rounded-full text-chalk-muted transition hover:bg-white/10 hover:text-chalk lg:hidden"
            aria-label="Menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/[0.07] bg-ink/95 backdrop-blur-xl lg:hidden">
          <div className="mx-auto max-w-7xl px-3 py-2">
            <form onSubmit={submit} className="relative m-2">
              <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-chalk-faint" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search wallpapers…"
                className="focusable h-11 w-full rounded-full border border-white/10 bg-white/[0.04] pl-9 pr-3 text-sm text-chalk placeholder:text-chalk-faint [&::-webkit-search-cancel-button]:hidden"
              />
            </form>
            {LINKS.map((l) => (
              <Link key={l.label} href={l.href} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm text-chalk-muted transition hover:bg-white/10 hover:text-chalk">
                {l.label}
              </Link>
            ))}
            {admin && (
              <Link href="/admin" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm text-chalk-muted transition hover:bg-white/10 hover:text-chalk">Admin</Link>
            )}
            {!userInitial && (
              <Link href="/auth/login" onClick={() => setOpen(false)} className="btn-accent focusable m-2 flex h-10 items-center justify-center rounded-full text-sm font-semibold">Sign in</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
