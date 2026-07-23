"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

function toHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export function PaletteStrip({ src }: { src: string }) {
  const [colors, setColors] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const s = 40;
        const c = document.createElement("canvas");
        c.width = s; c.height = s;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, s, s);
        const d = ctx.getImageData(0, 0, s, s).data;
        const buckets: Record<string, { r: number; g: number; b: number; n: number }> = {};
        for (let i = 0; i < d.length; i += 4) {
          if (d[i + 3] < 128) continue;
          const key = `${d[i] >> 4}-${d[i + 1] >> 4}-${d[i + 2] >> 4}`;
          (buckets[key] ??= { r: 0, g: 0, b: 0, n: 0 });
          const bk = buckets[key];
          bk.r += d[i]; bk.g += d[i + 1]; bk.b += d[i + 2]; bk.n++;
        }
        const top = Object.values(buckets).sort((a, b) => b.n - a.n).slice(0, 5);
        setColors(top.map((bk) => toHex(Math.round(bk.r / bk.n), Math.round(bk.g / bk.n), Math.round(bk.b / bk.n))));
      } catch { /* tainted canvas — skip */ }
    };
    img.src = src;
  }, [src]);

  if (colors.length === 0) return null;

  function copyAll() {
    const css = `:root {\n${colors.map((h, i) => `  --color-${i + 1}: ${h};`).join("\n")}\n}`;
    navigator.clipboard?.writeText(css).then(() => {
      setCopied("__all__");
      setTimeout(() => setCopied(null), 1400);
    });
  }

  function copy(hex: string) {
    navigator.clipboard?.writeText(hex).then(() => {
      setCopied(hex);
      setTimeout(() => setCopied(null), 1400);
    });
  }

  return (
    <div className="mt-8">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-chalk-faint">Palette</p>
      <div className="flex flex-wrap gap-2">
        {colors.map((hex) => (
          <button
            key={hex}
            onClick={() => copy(hex)}
            className="focusable surface group inline-flex items-center gap-2 rounded-pill py-1.5 pl-1.5 pr-3 text-xs font-medium text-chalk transition hover:bg-white/10"
            title="Copy hex"
          >
            <span className="h-6 w-6 rounded-full ring-1 ring-white/20" style={{ background: hex }} />
            <span className="font-mono">{hex}</span>
            {copied === hex ? <Check size={12} className="text-accent" /> : <Copy size={12} className="text-chalk-faint group-hover:text-chalk" />}
          </button>
        ))}
        <button
          onClick={copyAll}
          className="focusable surface inline-flex items-center gap-2 rounded-pill px-3 py-1.5 text-xs font-medium text-chalk-muted transition hover:text-chalk"
          title="Copy all as CSS variables"
        >
          {copied === "__all__" ? <Check size={12} className="text-accent" /> : <Copy size={12} />}
          {copied === "__all__" ? "Copied CSS" : "Copy all as CSS"}
        </button>
      </div>
    </div>
  );
}
