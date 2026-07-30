"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";

export function Nav({ admin, userInitial }: { admin?: boolean; userInitial?: string | null }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-white/[0.07] bg-ink/70 backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent bg-ink/20 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="font-display text-lg font-bold tracking-tight">
          <span className="text-accent">Get</span>YourWallpaper
        </Link>

        <div className="flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hidden rounded-full px-3.5 py-2 text-sm text-chalk-muted transition hover:text-chalk sm:block"
            >
              {l.label}
            </Link>
          ))}
          {admin && (
            <Link href="/admin" className="hidden rounded-full px-3.5 py-2 text-sm text-chalk-muted transition hover:text-chalk sm:block">
              Admin
            </Link>
          )}
          {userInitial ? (
            <div className="ml-2 hidden h-9 w-9 place-items-center rounded-full btn-accent text-xs font-bold sm:grid">
              {userInitial.toUpperCase()}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="btn-accent focusable ml-2 hidden h-9 items-center rounded-full px-4 text-sm font-semibold transition hover:brightness-110 sm:inline-flex"
            >
              Sign in
            </Link>
          )}

          <button
            onClick={() => setOpen((v) => !v)}
            className="focusable ml-1 grid h-9 w-9 place-items-center rounded-full text-chalk-muted transition hover:bg-white/10 hover:text-chalk sm:hidden"
            aria-label="Menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/[0.07] bg-ink/90 backdrop-blur-xl sm:hidden">
          <div className="mx-auto max-w-7xl px-3 py-2">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm text-chalk-muted transition hover:bg-white/10 hover:text-chalk"
              >
                {l.label}
              </Link>
            ))}
            {admin && (
              <Link href="/admin" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm text-chalk-muted transition hover:bg-white/10 hover:text-chalk">
                Admin
              </Link>
            )}
            {!userInitial && (
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="btn-accent focusable m-2 flex h-10 items-center justify-center rounded-full text-sm font-semibold"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
