"use client";

import { usePathname } from "next/navigation";

/** Hides site chrome (nav/footer) on admin routes, which have their own shell. */
export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
