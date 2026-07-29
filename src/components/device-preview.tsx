"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Smartphone, Monitor, Tablet, Check, Sparkles, Loader2 } from "lucide-react";
import type { Wallpaper } from "@/lib/types";
import { publicUrl, renderUrl } from "@/lib/supabase/storage";
import { RESOLUTIONS } from "@/lib/constants";
import { detectDevice, type DeviceKind } from "@/lib/device";
import { GlassButton } from "@/components/ui/glass-button";
import { formatBytes, cn } from "@/lib/utils";

const FRAMES: { key: DeviceKind; icon: typeof Smartphone; label: string }[] = [
  { key: "phone", icon: Smartphone, label: "Phone" },
  { key: "desktop", icon: Monitor, label: "Desktop" },
  { key: "tablet", icon: Tablet, label: "Tablet" },
];

type Res = { label: string; w: number; h: number; mine?: boolean; original?: boolean };

export function DevicePreview({ w }: { w: Wallpaper }) {
  const [frame, setFrame] = useState<DeviceKind>(
    w.orientation === "portrait" ? "phone" : w.orientation === "square" ? "tablet" : "desktop",
  );
  const [resIndex, setResIndex] = useState(0);
  const [detected, setDetected] = useState<DeviceKind | null>(null);
  const [myScreen, setMyScreen] = useState<Res | null>(null);
  const [busy, setBusy] = useState(false);
  // real pixel dimensions read from the actual image — never trust stored values
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const userPicked = useRef(false);

  const realW = natural?.w ?? w.width;
  const realH = natural?.h ?? w.height;

  useEffect(() => {
    const d = detectDevice();
    setDetected(d);
    const dpr = window.devicePixelRatio || 1;
    const w0 = Math.round(window.screen.width * dpr);
    const h0 = Math.round(window.screen.height * dpr);
    if (w0 && h0) setMyScreen({ label: "Your screen", w: w0, h: h0, mine: true });
  }, []);

  // once the true image shape is known, pick the matching download-size set
  // (unless the user already chose one) — corrects any wrong stored dimensions
  useEffect(() => {
    if (!natural || userPicked.current) return;
    const wide = natural.w >= natural.h;
    const nearSquare = Math.abs(natural.w - natural.h) < natural.w * 0.12;
    setFrame(nearSquare ? "tablet" : wide ? "desktop" : "phone");
  }, [natural]);

  const options: Res[] = useMemo(() => {
    const base = RESOLUTIONS[frame] ?? RESOLUTIONS.desktop;
    const list: Res[] = [{ label: "Original", w: realW, h: realH, original: true }];
    if (myScreen) {
      const portrait = myScreen.h > myScreen.w;
      const frameIsPortrait = frame === "phone" || frame === "tablet";
      if (portrait === frameIsPortrait) list.push(myScreen);
    }
    return [...list, ...base];
  }, [frame, myScreen, realW, realH]);

  const chosen = options[Math.min(resIndex, options.length - 1)];
  const preview = useMemo(() => renderUrl(w.storage_path, { width: 1400, quality: 92 }), [w.storage_path]);

  async function download() {
    setBusy(true);
    try {
      await fetch(`/api/download/${w.id}`, { method: "POST" }).catch(() => {});
      window.dispatchEvent(new Event("wallpaper-downloaded"));

      const filename = chosen.original
        ? `${w.slug}-original-${realW}x${realH}.jpg`
        : `${w.slug}-${chosen.w}x${chosen.h}.jpg`;
      const src = chosen.original
        ? publicUrl(w.storage_path)
        : renderUrl(w.storage_path, { width: chosen.w, height: chosen.h, quality: 95 });
      try {
        const res = await fetch(src);
        if (!res.ok) throw new Error("source unavailable");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        trigger(url, filename);
        setTimeout(() => URL.revokeObjectURL(url), 4000);
      } catch {
        trigger(publicUrl(w.storage_path), filename);
      }
    } finally {
      setBusy(false);
    }
  }

  function trigger(href: string, filename: string) {
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      {/* preview stage — wallpaper fitted to the chosen device (center-cropped like a real screen) */}
      <div className="surface relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-card p-5 sm:p-8">
        <div
          style={{ backgroundColor: w.dominant_color ?? "#0b0b12" }}
          className={cn(
            "relative overflow-hidden shadow-lift ring-1 ring-white/10 transition-all duration-500",
            frame === "phone" && "aspect-[9/19.5] w-[210px] max-w-full rounded-[2rem]",
            frame === "desktop" && "aspect-[16/9] w-full max-w-lg rounded-xl",
            frame === "tablet" && "aspect-[3/4] w-[290px] max-w-full rounded-2xl",
          )}
        >
          {!loaded && <div className="liquid-skeleton absolute inset-0" />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt={w.title}
            onLoad={(e) => {
              setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight });
              setLoaded(true);
            }}
            onError={() => setLoaded(true)}
            className={cn(
              "h-full w-full object-cover object-center transition-opacity duration-500",
              loaded ? "opacity-100" : "opacity-0",
            )}
          />
        </div>
      </div>

      {/* controls */}
      <div className="flex flex-col gap-5">
        <div>
          <p className="mb-2 text-xs uppercase tracking-widest text-chalk-faint">Preview on</p>
          <div className="surface flex gap-1 rounded-pill p-1">
            {FRAMES.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => { userPicked.current = true; setFrame(key); setResIndex(0); }}
                className={cn(
                  "focusable flex flex-1 items-center justify-center gap-1.5 rounded-pill py-2 text-xs font-medium transition",
                  frame === key ? "bg-white/15 text-chalk" : "text-chalk-muted hover:text-chalk",
                )}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
          {detected === frame && (
            <p className="mt-2 flex items-center gap-1 text-xs text-accent">
              <Check size={12} /> matched to your device
            </p>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-widest text-chalk-faint">Resolution</p>
          <div className="flex flex-wrap gap-2">
            {options.map((r, i) => (
              <button
                key={r.label + i}
                onClick={() => setResIndex(i)}
                className={cn(
                  "focusable inline-flex items-center gap-1.5 rounded-pill px-3.5 py-2 text-xs font-medium transition",
                  i === resIndex ? "btn-accent" : "surface text-chalk-muted hover:text-chalk",
                )}
              >
                {r.mine && <Sparkles size={12} />}
                {r.label}
                <span className="font-mono opacity-70">{r.w}×{r.h}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between text-xs text-chalk-muted">
            <span>Original {realW}×{realH}</span>
            <span className="font-mono">{formatBytes(w.file_size)}</span>
          </div>
          <GlassButton variant="iris" size="lg" className="w-full" onClick={download} disabled={busy}>
            {busy ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {chosen?.original
              ? `Download original · ${realW}×${realH}`
              : chosen?.mine
                ? `Download for your screen · ${chosen.w}×${chosen.h}`
                : `Download · ${chosen?.w}×${chosen?.h}`}
          </GlassButton>
          <p className="text-center text-[11px] text-chalk-faint">
            Auto-fitted to the exact pixels you pick — no manual cropping.
          </p>
        </div>
      </div>
    </div>
  );
}
