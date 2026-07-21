"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Shuffle, Loader2, Plus, X } from "lucide-react";

type Style = "mesh" | "linear" | "radial" | "conic" | "amoled";

type Dim = { label: string; w: number; h: number; mine?: boolean };
const DEVICE_GROUPS: { group: string; items: Dim[] }[] = [
  { group: "Desktop", items: [
    { label: "1080p", w: 1920, h: 1080 }, { label: "1440p", w: 2560, h: 1440 },
    { label: "4K UHD", w: 3840, h: 2160 }, { label: "5K", w: 5120, h: 2880 },
  ]},
  { group: "Ultrawide", items: [
    { label: "UWQHD", w: 3440, h: 1440 }, { label: "5K2K", w: 5120, h: 2160 },
  ]},
  { group: "Laptop", items: [
    { label: "MacBook Air", w: 2560, h: 1664 }, { label: "MacBook Pro 16", w: 3456, h: 2234 },
    { label: "Laptop FHD", w: 1920, h: 1200 },
  ]},
  { group: "Phone", items: [
    { label: "iPhone Pro", w: 1179, h: 2556 }, { label: "iPhone Pro Max", w: 1290, h: 2796 },
    { label: "Android FHD+", w: 1080, h: 2400 }, { label: "Android QHD+", w: 1440, h: 3200 },
  ]},
  { group: "Tablet", items: [
    { label: "iPad", w: 1668, h: 2388 }, { label: "iPad Pro 12.9", w: 2048, h: 2732 },
  ]},
  { group: "Other", items: [
    { label: "Square", w: 2000, h: 2000 }, { label: "TV 4K", w: 3840, h: 2160 },
  ]},
];

const PRESETS: { name: string; style: Style; colors: string[] }[] = [
  { name: "Ember", style: "mesh", colors: ["#0A0A0D", "#FF3D6E", "#FF6A3D"] },
  { name: "Aurora", style: "mesh", colors: ["#08080D", "#00F5A0", "#7C5CFF"] },
  { name: "Sunset", style: "linear", colors: ["#FEE140", "#FA709A", "#FF3D6E"] },
  { name: "Ocean", style: "linear", colors: ["#4FACFE", "#00F2FE", "#7C5CFF"] },
  { name: "Candy", style: "radial", colors: ["#A18CD1", "#FBC2EB", "#FF6A3D"] },
  { name: "Midnight AMOLED", style: "amoled", colors: ["#000000", "#7C5CFF", "#FF3D6E"] },
  { name: "Vortex", style: "conic", colors: ["#7C5CFF", "#FF3D6E", "#FF6A3D", "#7C5CFF"] },
  { name: "Void", style: "amoled", colors: ["#000000", "#232350", "#3D2B6E"] },
];

function draw(
  ctx: CanvasRenderingContext2D, W: number, H: number,
  colors: string[], style: Style, angle: number, grain: number, vignette: boolean,
) {
  ctx.clearRect(0, 0, W, H);
  const stops = colors.length > 1 ? colors : [colors[0] ?? "#000", colors[0] ?? "#000"];

  if (style === "linear") {
    const a = (angle * Math.PI) / 180, x = Math.cos(a), y = Math.sin(a);
    const cx = W / 2, cy = H / 2, len = (Math.abs(x) * W + Math.abs(y) * H) / 2;
    const g = ctx.createLinearGradient(cx - x * len, cy - y * len, cx + x * len, cy + y * len);
    stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  } else if (style === "radial") {
    const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) / 1.4);
    stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  } else if (style === "conic") {
    try {
      const g = ctx.createConicGradient((angle * Math.PI) / 180, W / 2, H / 2);
      stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    } catch {
      const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) / 1.4);
      stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
  } else {
    // mesh + amoled: base fill then soft colored blobs
    ctx.fillStyle = style === "amoled" ? "#000000" : (colors[0] ?? "#08080D");
    ctx.fillRect(0, 0, W, H);
    const palette = colors.slice(style === "amoled" ? 1 : 0);
    const spots: [number, number][] = [[0.18, 0.22], [0.82, 0.28], [0.5, 0.85], [0.28, 0.7], [0.72, 0.62]];
    const alpha = style === "amoled" ? "aa" : "cc";
    spots.forEach(([px, py], i) => {
      const col = palette[i % Math.max(palette.length, 1)] ?? "#7C5CFF";
      const r = Math.max(W, H) * (style === "amoled" ? 0.42 : 0.55);
      const g = ctx.createRadialGradient(W * px, H * py, 0, W * px, H * py, r);
      g.addColorStop(0, col + alpha); g.addColorStop(1, col + "00");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    });
  }

  if (vignette) {
    const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  if (grain > 0) {
    const n = Math.floor(((W * H) / 120) * (grain / 50));
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    for (let i = 0; i < n; i++) ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
  }
}

export function GradientStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [colors, setColors] = useState<string[]>(["#0A0A0D", "#7C5CFF", "#FF3D6E"]);
  const [style, setStyle] = useState<Style>("mesh");
  const [angle, setAngle] = useState(120);
  const [grain, setGrain] = useState(30);
  const [vignette, setVignette] = useState(false);
  const [myScreen, setMyScreen] = useState<Dim | null>(null);
  const [dim, setDim] = useState<Dim>({ label: "1080p", w: 1920, h: 1080 });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const dpr = window.devicePixelRatio || 1;
    const s = { label: "My screen", w: Math.round(window.screen.width * dpr), h: Math.round(window.screen.height * dpr), mine: true };
    setMyScreen(s); setDim(s);
  }, []);

  const render = useCallback(() => {
    const c = canvasRef.current; if (!c) return;
    const cw = c.clientWidth || 640, ch = Math.round(cw * (dim.h / dim.w));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = cw * dpr; c.height = ch * dpr; c.style.height = `${ch}px`;
    const ctx = c.getContext("2d");
    if (ctx) draw(ctx, c.width, c.height, colors, style, angle, grain, vignette);
  }, [colors, style, angle, grain, vignette, dim]);

  useEffect(() => { render(); }, [render]);
  useEffect(() => {
    const on = () => render(); window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, [render]);

  function setColor(i: number, v: string) { setColors((p) => p.map((c, idx) => (idx === i ? v : c))); }
  function addColor() { setColors((p) => (p.length < 6 ? [...p, "#ffffff"] : p)); }
  function removeColor(i: number) { setColors((p) => (p.length > 2 ? p.filter((_, idx) => idx !== i) : p)); }

  function randomize() {
    const p = PRESETS[Math.floor(Math.random() * PRESETS.length)];
    setColors(p.colors); setStyle(p.style); setAngle(Math.floor(Math.random() * 360));
  }

  function onSelectDim(val: string) {
    if (val === "mine" && myScreen) return setDim(myScreen);
    const [w, h] = val.split("x").map(Number);
    const found = DEVICE_GROUPS.flatMap((g) => g.items).find((d) => d.w === w && d.h === h);
    if (found) setDim(found);
  }

  async function download() {
    setBusy(true);
    try {
      const off = document.createElement("canvas");
      off.width = dim.w; off.height = dim.h;
      const ctx = off.getContext("2d");
      if (ctx) draw(ctx, dim.w, dim.h, colors, style, angle, grain, vignette);
      const a = document.createElement("a");
      a.href = off.toDataURL("image/png");
      a.download = `gyw-${style}-${dim.w}x${dim.h}.png`;
      document.body.appendChild(a); a.click(); a.remove();
    } finally { setBusy(false); }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="surface overflow-hidden rounded-card p-3">
        <canvas ref={canvasRef} className="w-full rounded-xl" />
        <p className="mt-2 text-center text-xs text-chalk-faint">Live preview · exports at {dim.w}×{dim.h}</p>
      </div>

      <div className="flex flex-col gap-5">
        {/* presets */}
        <div>
          <p className="mb-2 text-xs uppercase tracking-widest text-chalk-faint">Presets</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button key={p.name} onClick={() => { setColors(p.colors); setStyle(p.style); }}
                className="surface focusable rounded-pill px-3 py-1.5 text-xs text-chalk-muted transition hover:text-chalk">
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* device / resolution */}
        <div>
          <p className="mb-2 text-xs uppercase tracking-widest text-chalk-faint">Size for</p>
          <select onChange={(e) => onSelectDim(e.target.value)} value={dim.mine ? "mine" : `${dim.w}x${dim.h}`}
            className="focusable surface h-11 w-full rounded-pill px-4 text-sm text-chalk [color-scheme:dark]">
            {myScreen && <option value="mine">My screen · {myScreen.w}×{myScreen.h}</option>}
            {DEVICE_GROUPS.map((g) => (
              <optgroup key={g.group} label={g.group}>
                {g.items.map((d) => (
                  <option key={d.label + d.w} value={`${d.w}x${d.h}`}>{d.label} · {d.w}×{d.h}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* style */}
        <div>
          <p className="mb-2 text-xs uppercase tracking-widest text-chalk-faint">Style</p>
          <div className="flex flex-wrap gap-2">
            {(["mesh", "linear", "radial", "conic", "amoled"] as Style[]).map((s) => (
              <button key={s} onClick={() => setStyle(s)}
                className={`focusable rounded-pill px-3.5 py-2 text-xs font-medium capitalize transition ${style === s ? "btn-accent" : "surface text-chalk-muted hover:text-chalk"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* colors — add/remove up to 6 */}
        <div>
          <p className="mb-2 flex items-center justify-between text-xs uppercase tracking-widest text-chalk-faint">
            <span>Colors</span>
            {colors.length < 6 && (
              <button onClick={addColor} className="inline-flex items-center gap-1 text-accent hover:brightness-110">
                <Plus size={12} /> add
              </button>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c, i) => (
              <div key={i} className="group relative">
                <label className="surface relative block h-11 w-11 cursor-pointer overflow-hidden rounded-xl">
                  <span className="absolute inset-0" style={{ background: c }} />
                  <input type="color" value={c} onChange={(e) => setColor(i, e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
                </label>
                {colors.length > 2 && (
                  <button onClick={() => removeColor(i)} aria-label="Remove color"
                    className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-ink-3 text-chalk-muted opacity-0 ring-1 ring-line transition group-hover:opacity-100 hover:text-accent-2">
                    <X size={11} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {(style === "linear" || style === "conic") && (
          <div>
            <p className="mb-2 flex items-center justify-between text-xs uppercase tracking-widest text-chalk-faint">
              <span>Angle</span><span className="font-mono">{angle}°</span>
            </p>
            <input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(+e.target.value)} className="w-full accent-[#7C5CFF]" />
          </div>
        )}

        <div>
          <p className="mb-2 flex items-center justify-between text-xs uppercase tracking-widest text-chalk-faint">
            <span>Grain</span><span className="font-mono">{grain}%</span>
          </p>
          <input type="range" min={0} max={100} value={grain} onChange={(e) => setGrain(+e.target.value)} className="w-full accent-[#7C5CFF]" />
        </div>

        <label className="flex items-center gap-3">
          <input type="checkbox" checked={vignette} onChange={(e) => setVignette(e.target.checked)} className="h-4 w-4 accent-[#7C5CFF]" />
          <span className="text-sm">Vignette</span>
        </label>

        <div className="mt-auto space-y-3">
          <button onClick={randomize} className="surface focusable flex h-11 w-full items-center justify-center gap-2 rounded-pill text-sm font-medium text-chalk transition hover:bg-white/10">
            <Shuffle size={16} /> Randomize
          </button>
          <button onClick={download} disabled={busy} className="btn-accent focusable flex h-12 w-full items-center justify-center gap-2 rounded-pill text-sm font-semibold transition hover:brightness-110 disabled:opacity-60">
            {busy ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            Download · {dim.w}×{dim.h}
          </button>
        </div>
      </div>
    </div>
  );
}
