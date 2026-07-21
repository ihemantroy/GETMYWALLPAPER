"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";

export function Nav({ admin, userInitial }: { admin?: boolean; userInitial?: string | null }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav className="glass-strong pointer-events-auto flex h-14 w-full max-w-3xl items-center justify-between rounded-pill px-3 pl-5">
        <Link href="/" className="font-display text-lg font-bold tracking-tight">
          <span className="text-accent">Get</span>YourWallpaper
        </Link>

        <div className="flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hidden rounded-pill px-3.5 py-2 text-sm text-chalk-muted transition hover:bg-white/10 hover:text-chalk sm:block"
            >
              {l.label}
            </Link>
          ))}
          {admin && (
            <Link href="/admin" className="hidden rounded-pill px-3.5 py-2 text-sm text-chalk-muted transition hover:bg-white/10 hover:text-chalk sm:block">
              Admin
            </Link>
          )}
          {userInitial ? (
            <div className="ml-1 hidden h-9 w-9 place-items-center rounded-pill btn-accent text-xs font-bold sm:grid">
              {userInitial.toUpperCase()}
            </div>
          ) : (
            <Link href="/auth/login" className="btn-accent focusable ml-1 hidden h-9 items-center rounded-pill px-4 text-sm font-semibold transition hover:brightness-110 sm:inline-flex">
              Sign in
            </Link>
          )}

          {/* mobile menu toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="focusable ml-1 grid h-9 w-9 place-items-center rounded-pill text-chalk-muted transition hover:bg-white/10 hover:text-chalk sm:hidden"
            aria-label="Menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* mobile dropdown panel */}
      {open && (
        <div className="glass-strong pointer-events-auto absolute top-16 w-[calc(100%-2rem)] max-w-3xl rounded-card p-2 sm:hidden">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-card px-4 py-3 text-sm text-chalk-muted transition hover:bg-white/10 hover:text-chalk"
            >
              {l.label}
            </Link>
          ))}
          {admin && (
            <Link href="/admin" onClick={() => setOpen(false)} className="block rounded-card px-4 py-3 text-sm text-chalk-muted transition hover:bg-white/10 hover:text-chalk">
              Admin
            </Link>
          )}
          <div className="mt-1 border-t border-line pt-1">
            {userInitial ? (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-chalk-muted">
                <div className="grid h-7 w-7 place-items-center rounded-pill btn-accent text-xs font-bold">
                  {userInitial.toUpperCase()}
                </div>
                Signed in
              </div>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="btn-accent focusable m-2 flex h-10 items-center justify-center rounded-pill text-sm font-semibold"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}