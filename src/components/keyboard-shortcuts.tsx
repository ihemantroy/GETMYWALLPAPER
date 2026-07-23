"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const DEVICE_KEYS: Record<string, string> = { "1": "phone", "2": "tablet", "3": "desktop" };

/** Global shortcuts: "/" focuses search, 1/2/3 switch device, Esc clears search. */
export function KeyboardShortcuts() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = document.activeElement as HTMLElement | null;
      const typing =
        el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);

      // Esc always works — step out of the search box.
      if (e.key === "Escape" && typing) {
        (el as HTMLInputElement).blur();
        return;
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "/") {
        const input = document.getElementById("site-search") as HTMLInputElement | null;
        if (input) {
          e.preventDefault();
          input.focus();
          input.select();
        }
        return;
      }

      const device = DEVICE_KEYS[e.key];
      if (device) {
        e.preventDefault();
        try { localStorage.setItem("gyw_device", device); } catch { /* private mode */ }
        const next = new URLSearchParams(Array.from(params.entries()));
        next.set("device", device);
        next.delete("page");
        router.push(`/?${next.toString()}`, { scroll: false });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, params]);

  return null;
}
