"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * A thin gradient bar at the very top that appears the instant a navigation
 * starts (link click OR an `app:navstart` event dispatched before router.push)
 * and completes when the route/query actually changes. Pure perceived-speed:
 * the user always sees "something is coming."
 */
function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");
  const [width, setWidth] = useState(0);
  const trickle = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safety = useRef<ReturnType<typeof setTimeout> | null>(null);
  const first = useRef(true);
  const key = pathname + "?" + searchParams.toString();

  function clearRunning() {
    if (trickle.current) clearInterval(trickle.current);
    if (safety.current) clearTimeout(safety.current);
  }

  function start() {
    if (hideT.current) clearTimeout(hideT.current);
    clearRunning();
    setPhase("loading");
    setWidth(10);
    trickle.current = setInterval(() => {
      setWidth((w) => (w < 88 ? w + Math.max(0.6, (92 - w) * 0.09) : w));
    }, 170);
    safety.current = setTimeout(finish, 6000); // never stick forever
  }

  function finish() {
    clearRunning();
    setWidth(100);
    setPhase("done");
    hideT.current = setTimeout(() => {
      setPhase("idle");
      setWidth(0);
    }, 320);
  }

  // START — internal link clicks + explicit app:navstart event
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href");
      const target = a.getAttribute("target");
      if (!href || href.startsWith("#") || target === "_blank" || href.startsWith("mailto:")) return;
      try {
        const url = new URL(href, location.href);
        if (url.origin !== location.origin) return;
        if (url.pathname + url.search === location.pathname + location.search) return; // same page
      } catch {
        return;
      }
      start();
    }
    const onNav = () => start();
    document.addEventListener("click", onClick, true);
    window.addEventListener("app:navstart", onNav);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("app:navstart", onNav);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FINISH — when the route or query actually changed
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (phase === "idle") return null;

  return (
    <div
      aria-hidden
      style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 200, pointerEvents: "none" }}
    >
      <div
        style={{
          height: "100%",
          width: `${width}%`,
          background: "linear-gradient(90deg, #6E8BFF, #9CB4FF)",
          boxShadow: "0 0 12px rgba(110,139,255,0.6)",
          borderRadius: "0 4px 4px 0",
          opacity: phase === "done" ? 0 : 1,
          transition: phase === "done" ? "width .32s ease, opacity .32s ease" : "width .17s ease",
        }}
      />
    </div>
  );
}

export function TopProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressBar />
    </Suspense>
  );
}
