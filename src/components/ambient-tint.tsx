"use client";

import { useEffect, useState } from "react";

/** Samples the wallpaper's average color and casts a soft ambient glow behind
 *  the page — like the room lighting up in the artwork's colors. */
export function AmbientTint({ src }: { src: string }) {
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const s = 16;
        const c = document.createElement("canvas");
        c.width = s; c.height = s;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, s, s);
        const d = ctx.getImageData(0, 0, s, s).data;
        let r = 0, g = 0, b = 0, n = 0;
        for (let i = 0; i < d.length; i += 4) {
          if (d[i + 3] < 128) continue;
          r += d[i]; g += d[i + 1]; b += d[i + 2]; n++;
        }
        if (n) setColor(`rgb(${Math.round(r / n)},${Math.round(g / n)},${Math.round(b / n)})`);
      } catch {
        /* cross-origin tainted canvas — skip gracefully */
      }
    };
    img.src = src;
  }, [src]);

  if (!color) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 opacity-50 transition-opacity duration-[1200ms]"
      style={{ background: `radial-gradient(65rem 45rem at 50% -12%, ${color}, transparent 62%)` }}
    />
  );
}
