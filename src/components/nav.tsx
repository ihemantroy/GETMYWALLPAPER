import Link from "next/link";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { NAV_LINKS } from "@/lib/constants";

export async function Nav() {
  const user = await getSessionUser();
  const admin = user ? await isAdmin() : false;

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
          {user ? (
            <div className="ml-1 grid h-9 w-9 place-items-center rounded-pill btn-accent text-xs font-bold">
              {(user.email?.[0] ?? "U").toUpperCase()}
            </div>
          ) : (
            <Link href="/auth/login" className="btn-accent focusable ml-1 inline-flex h-9 items-center rounded-pill px-4 text-sm font-semibold transition hover:brightness-110">
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
