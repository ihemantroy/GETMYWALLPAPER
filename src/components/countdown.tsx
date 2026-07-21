"use client";

import { useEffect, useState } from "react";

/** Hype countdown to the next daily drop (local midnight). */
export function Countdown() {
  const [left, setLeft] = useState("00:00:00");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const next = new Date(now);
      next.setHours(24, 0, 0, 0);
      const diff = Math.max(0, next.getTime() - now.getTime());
      const h = Math.floor(diff / 3.6e6);
      const m = Math.floor((diff % 3.6e6) / 6e4);
      const s = Math.floor((diff % 6e4) / 1000);
      const pad = (n: number) => String(n).padStart(2, "0");
      setLeft(`${pad(h)}:${pad(m)}:${pad(s)}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="surface inline-flex items-center gap-2.5 rounded-pill px-4 py-2.5 text-sm">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-2 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-2" />
      </span>
      <span className="text-chalk-muted">next drop in</span>
      <span className="font-mono font-semibold tabular-nums text-chalk">{left}</span>
    </div>
  );
}
