"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, ImagePlus, Loader2, Moon } from "lucide-react";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new window.Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

/** Crush dark areas to pure #000 (OLED turns those pixels off) while keeping
 *  bright subjects. `intensity` 0..100 controls how much of the image goes black. */
function amoledify(ctx: CanvasRenderingContext2D, W: number, H: number, img: HTMLImageElement, intensity: number) {
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(img, 0, 0, W, H);
  const t = intensity / 100;
  const threshold = 30 + t * 150; // 30..180 — higher = more of the image crushed to black
  const data = ctx.getImageData(0, 0, W, H);
  const d = data.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (lum <= threshold) {
      let f = lum / threshold;      // 0..1
      f = f * f;                    // ease toward black
      d[i] = r * f; d[i + 1] = g * f; d[i + 2] = b * f;
    }
  }
  ctx.putImageData(data, 0, 0);
}

const PRESETS = [
  { label: "Subtle", v: 30 },
  { label: "Deep", v: 55 },
  { label: "Pure black", v: 80 },
];

export function AmoledStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [intensity, setIntensity] = useState(55);
  const [busy, setBusy] = useState(false);

  const render = useCallback(() => {
    const c = canvasRef.current;
    if (!c || !img) return;
    const cw = c.clientWidth || 640;
    const ratio = img.naturalHeight / img.naturalWidth;
    const ch = Math.round(cw * ratio);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = cw * dpr; c.height = ch * dpr; c.style.height = `${ch}px`;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (ctx) amoledify(ctx, c.width, c.height, img, intensity);
  }, [img, intensity]);

  useEffect(() => { render(); }, [render]);
  useEffect(() => {
    const on = () => render();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, [render]);

  async function onPick(f: File | undefined) {
    if (!f) return;
    const image = await loadImage(URL.createObjectURL(f));
    setImg(image);
  }

  function download() {
    if (!img) return;
    setBusy(true);
    try {
      const off = document.createElement("canvas");
      off.width = img.naturalWidth;
      off.height = img.naturalHeight;
      const ctx = off.getContext("2d", { willReadFrequently: true });
      if (ctx) amoledify(ctx, off.width, off.height, img, intensity);
      const a = document.createElement("a");
      a.href = off.toDataURL("image/png");
      a.download = `amoled-${img.naturalWidth}x${img.naturalHeight}.png`;
      document.body.appendChild(a); a.click(); a.remove();
    } finally { setBusy(false); }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="surface flex items-center justify-center overflow-hidden rounded-card p-3" style={{ background: "#000" }}>
        {img ? (
          <canvas ref={canvasRef} className="w-full rounded-xl" />
        ) : (
          <label className="flex min-h-[420px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/15 text-chalk-faint">
            <ImagePlus size={30} />
            <span className="text-sm">Upload any image</span>
            <span className="text-xs">works best on wallpapers with dark areas</span>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => onPick(e.target.files?.[0])} className="hidden" />
          </label>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-accent-2">
            <Moon size={13} /> AMOLED · true black
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold">Make it OLED-perfect.</h2>
          <p className="mt-1 text-sm text-chalk-muted">
            Turns the dark parts of any wallpaper into pure #000 — deeper blacks, and on OLED screens those pixels switch off to save battery.
          </p>
        </div>

        {img && (
          <>
            <div>
              <p className="mb-2 text-xs uppercase tracking-widest text-chalk-faint">One-tap presets</p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button key={p.label} onClick={() => setIntensity(p.v)}
                    className={`focusable rounded-pill px-4 py-2 text-xs font-medium transition ${intensity === p.v ? "btn-accent" : "surface text-chalk-muted hover:text-chalk"}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 flex items-center justify-between text-xs uppercase tracking-widest text-chalk-faint">
                <span>Blackness</span><span className="font-mono">{intensity}%</span>
              </p>
              <input type="range" min={0} max={100} value={intensity} onChange={(e) => setIntensity(+e.target.value)} className="w-full accent-[#7C5CFF]" />
            </div>
            <label className="surface focusable flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-pill text-sm font-medium text-chalk transition hover:bg-white/10">
              <ImagePlus size={16} /> Try another image
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => onPick(e.target.files?.[0])} className="hidden" />
            </label>
          </>
        )}

        <button onClick={download} disabled={!img || busy}
          className="btn-accent focusable mt-auto flex h-12 w-full items-center justify-center gap-2 rounded-pill text-sm font-semibold transition hover:brightness-110 disabled:opacity-50">
          {busy ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} Download AMOLED wallpaper
        </button>
      </div>
    </div>
  );
}
