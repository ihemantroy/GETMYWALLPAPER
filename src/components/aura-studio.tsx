"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Loader2, ImagePlus, Sparkles, Wand2 } from "lucide-react";

type Phone = { label: string; w: number; h: number };
const PHONES: Phone[] = [
  { label: "iPhone Pro", w: 1179, h: 2556 },
  { label: "iPhone Pro Max", w: 1290, h: 2796 },
  { label: "Android FHD+", w: 1080, h: 2400 },
  { label: "Android QHD+", w: 1440, h: 3200 },
];

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

/** Pull a few vibrant colors out of a photo. */
function extractColors(img: HTMLImageElement, count = 3): string[] {
  const s = 48;
  const c = document.createElement("canvas");
  c.width = s; c.height = s;
  const ctx = c.getContext("2d");
  if (!ctx) return ["#7C5CFF", "#FF3D6E"];
  ctx.drawImage(img, 0, 0, s, s);
  const data = ctx.getImageData(0, 0, s, s).data;
  const buckets: Record<string, { r: number; g: number; b: number; n: number; score: number }> = {};
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 128) continue;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    const lum = (r + g + b) / 3;
    if (sat < 0.18 || lum < 30 || lum > 232) continue;
    const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
    (buckets[key] ??= { r: 0, g: 0, b: 0, n: 0, score: 0 });
    const bk = buckets[key];
    bk.r += r; bk.g += g; bk.b += b; bk.n++; bk.score += sat;
  }
  const arr = Object.values(buckets).sort((a, b) => b.score - a.score).slice(0, count);
  let cols = arr.map((bk) => `rgb(${Math.round(bk.r / bk.n)},${Math.round(bk.g / bk.n)},${Math.round(bk.b / bk.n)})`);
  if (cols.length === 0) cols = ["#7C5CFF", "#FF3D6E", "#FF6A3D"];
  while (cols.length < 3) cols.push(cols[cols.length - 1]);
  return cols;
}

type Scene = {
  cutout: HTMLImageElement;   // person (transparent bg) or full photo fallback
  colors: string[];
  showClock: boolean;
  intensity: number;          // aura strength 0..100
};

function draw(ctx: CanvasRenderingContext2D, W: number, H: number, scene: Scene) {
  const { cutout, colors, showClock, intensity } = scene;
  ctx.clearRect(0, 0, W, H);

  // 1) deep base
  ctx.fillStyle = "#07070B";
  ctx.fillRect(0, 0, W, H);

  // 2) aura — glowing color blobs from the photo
  const spots: [number, number][] = [[0.5, 0.34], [0.22, 0.2], [0.8, 0.26], [0.32, 0.72], [0.72, 0.68]];
  const strength = 0.35 + (intensity / 100) * 0.55;
  spots.forEach(([px, py], i) => {
    const col = colors[i % colors.length];
    const r = Math.max(W, H) * (0.55 + (intensity / 100) * 0.2);
    const g = ctx.createRadialGradient(W * px, H * py, 0, W * px, H * py, r);
    g.addColorStop(0, hexA(col, strength));
    g.addColorStop(1, hexA(col, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  });

  // 3) clock (behind the person) — iOS depth style
  if (showClock) {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const date = now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = `600 ${Math.round(W * 0.045)}px "General Sans", system-ui, sans-serif`;
    ctx.fillText(date, W / 2, H * 0.135);
    ctx.font = `700 ${Math.round(W * 0.26)}px "General Sans", system-ui, sans-serif`;
    ctx.fillText(time, W / 2, H * 0.30);
  }

  // 4) halo behind the person
  const cw = cutout.naturalWidth || cutout.width;
  const ch = cutout.naturalHeight || cutout.height;
  const targetH = H * 0.82;
  const scale = targetH / ch;
  const dw = cw * scale;
  const dh = ch * scale;
  const dx = (W - dw) / 2;
  const dy = H - dh; // anchored to bottom

  const halo = ctx.createRadialGradient(W / 2, H * 0.55, 0, W / 2, H * 0.55, W * 0.6);
  halo.addColorStop(0, hexA(colors[0], 0.4 * (intensity / 100 + 0.4)));
  halo.addColorStop(1, hexA(colors[0], 0));
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, W, H);

  // 5) the person on top (in front of the clock = depth effect)
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = W * 0.03;
  ctx.shadowOffsetY = H * 0.006;
  ctx.drawImage(cutout, dx, dy, dw, dh);
  ctx.restore();
}

function hexA(color: string, a: number): string {
  // supports #rrggbb and rgb(...)
  if (color.startsWith("rgb")) {
    const nums = color.match(/\d+/g)?.slice(0, 3) ?? [124, 92, 255];
    return `rgba(${nums[0]},${nums[1]},${nums[2]},${a})`;
  }
  const h = color.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export function AuraStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState<"idle" | "processing" | "ready">("idle");
  const [status, setStatus] = useState("");
  const [scene, setScene] = useState<Scene | null>(null);
  const [phone, setPhone] = useState<Phone>(PHONES[0]);
  const [showClock, setShowClock] = useState(true);
  const [intensity, setIntensity] = useState(70);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const render = useCallback(() => {
    const c = canvasRef.current;
    if (!c || !scene) return;
    const cw = c.clientWidth || 320;
    const ch = Math.round(cw * (phone.h / phone.w));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = cw * dpr; c.height = ch * dpr; c.style.height = `${ch}px`;
    const ctx = c.getContext("2d");
    if (ctx) draw(ctx, c.width, c.height, { ...scene, showClock, intensity });
  }, [scene, phone, showClock, intensity]);

  useEffect(() => { render(); }, [render]);
  useEffect(() => {
    const on = () => render();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, [render]);

  async function onPick(f: File | undefined) {
    if (!f) return;
    setError(null);
    setStage("processing");
    setStatus("Reading your colors…");
    try {
      const url = URL.createObjectURL(f);
      const orig = await loadImage(url);
      const colors = extractColors(orig);

      setStatus("Cutting you out… (first time downloads the model, ~10s)");
      let cutout = orig;
      try {
        const { removeBackground } = await import("@imgly/background-removal");
        const blob = await removeBackground(f, { model: "isnet_fp16" });
        cutout = await loadImage(URL.createObjectURL(blob));
      } catch {
        // fallback: use the full photo if the cutout model can't load
        cutout = orig;
      }

      setScene({ cutout, colors, showClock, intensity });
      setStage("ready");
    } catch {
      setError("Couldn't process that image. Try a clear, well-lit photo.");
      setStage("idle");
    }
  }

  async function download() {
    if (!scene) return;
    setBusy(true);
    try {
      const off = document.createElement("canvas");
      off.width = phone.w; off.height = phone.h;
      const ctx = off.getContext("2d");
      if (ctx) draw(ctx, phone.w, phone.h, { ...scene, showClock, intensity });
      const a = document.createElement("a");
      a.href = off.toDataURL("image/png");
      a.download = `aura-${phone.w}x${phone.h}.png`;
      document.body.appendChild(a); a.click(); a.remove();
    } finally { setBusy(false); }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      {/* preview / dropzone */}
      <div className="surface flex items-center justify-center overflow-hidden rounded-card p-3">
        {stage === "idle" ? (
          <label className="flex min-h-[420px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/15 text-chalk-faint">
            <ImagePlus size={30} />
            <span className="text-sm">Upload a selfie or photo</span>
            <span className="text-xs">clear face, good light works best</span>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => onPick(e.target.files?.[0])} className="hidden" />
          </label>
        ) : stage === "processing" ? (
          <div className="flex min-h-[420px] w-full flex-col items-center justify-center gap-3 text-chalk-muted">
            <Loader2 className="animate-spin text-accent" size={28} />
            <span className="text-sm">{status}</span>
          </div>
        ) : (
          <canvas ref={canvasRef} className="w-full rounded-xl" />
        )}
      </div>

      {/* controls */}
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-2">Aura · world-first</p>
          <h2 className="mt-1 font-display text-2xl font-bold">Your photo, your aura.</h2>
          <p className="mt-1 text-sm text-chalk-muted">
            We cut you out, paint a glow from your colors, and slip the clock behind your head — iOS depth style.
          </p>
        </div>

        {stage !== "idle" && (
          <>
            <div>
              <p className="mb-2 text-xs uppercase tracking-widest text-chalk-faint">Phone</p>
              <div className="flex flex-wrap gap-2">
                {PHONES.map((p) => (
                  <button key={p.label} onClick={() => setPhone(p)}
                    className={`focusable rounded-pill px-3.5 py-2 text-xs font-medium transition ${phone.label === p.label ? "btn-accent" : "surface text-chalk-muted hover:text-chalk"}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 flex items-center justify-between text-xs uppercase tracking-widest text-chalk-faint">
                <span>Aura intensity</span><span className="font-mono">{intensity}%</span>
              </p>
              <input type="range" min={0} max={100} value={intensity} onChange={(e) => setIntensity(+e.target.value)} className="w-full accent-[#7C5CFF]" />
            </div>

            <label className="flex items-center gap-3">
              <input type="checkbox" checked={showClock} onChange={(e) => setShowClock(e.target.checked)} className="h-4 w-4 accent-[#7C5CFF]" />
              <span className="text-sm">Show clock (depth effect)</span>
            </label>
          </>
        )}

        {error && <p className="text-sm text-accent-2">{error}</p>}

        <div className="mt-auto space-y-3">
          {stage === "ready" && (
            <label className="surface focusable flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-pill text-sm font-medium text-chalk transition hover:bg-white/10">
              <Wand2 size={16} /> Try another photo
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => onPick(e.target.files?.[0])} className="hidden" />
            </label>
          )}
          <button onClick={download} disabled={stage !== "ready" || busy}
            className="btn-accent focusable flex h-12 w-full items-center justify-center gap-2 rounded-pill text-sm font-semibold transition hover:brightness-110 disabled:opacity-50">
            {busy ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            Download · {phone.w}×{phone.h}
          </button>
        </div>
      </div>
    </div>
  );
}
