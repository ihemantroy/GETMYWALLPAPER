"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
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

type Res = { label: string; w: number; h: number; mine?: boolean };

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000 * 20);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function DevicePreview({ w }: { w: Wallpaper }) {
  const [frame, setFrame] = useState<DeviceKind>("desktop");
  const [resIndex, setResIndex] = useState(0);
  const [detected, setDetected] = useState<DeviceKind | null>(null);
  const [myScreen, setMyScreen] = useState<Res | null>(null);
  const [busy, setBusy] = useState(false);
  const clock = useClock();

  useEffect(() => {
    const d = detectDevice();
    setDetected(d);
    setFrame(d === "ultrawide" ? "desktop" : d);
    // exact device pixels — the "fit your screen" magic
    const dpr = window.devicePixelRatio || 1;
    const w0 = Math.round(window.screen.width * dpr);
    const h0 = Math.round(window.screen.height * dpr);
    if (w0 && h0) setMyScreen({ label: "Your screen", w: w0, h: h0, mine: true });
  }, []);

  // build options: put "Your screen" first when it matches this frame's orientation
  const options: Res[] = useMemo(() => {
    const base = RESOLUTIONS[frame] ?? RESOLUTIONS.desktop;
    if (myScreen) {
      const portrait = myScreen.h > myScreen.w;
      const frameIsPortrait = frame === "phone" || frame === "tablet";
      if (portrait === frameIsPortrait) return [myScreen, ...base];
    }
    return base;
  }, [frame, myScreen]);

  const chosen = options[Math.min(resIndex, options.length - 1)];
  const preview = useMemo(() => renderUrl(w.storage_path, { width: 900 }), [w.storage_path]);

  async function download() {
    setBusy(true);
    try {
      await fetch(`/api/download/${w.id}`, { method: "POST" }).catch(() => {});
      window.dispatchEvent(new Event("wallpaper-downloaded"));

      const filename = `${w.slug}-${chosen.w}x${chosen.h}.jpg`;
      // deliver the wallpaper resized to the EXACT chosen resolution
      const fitted = renderUrl(w.storage_path, { width: chosen.w, height: chosen.h, quality: 92 });
      try {
        const res = await fetch(fitted);
        if (!res.ok) throw new Error("transform unavailable");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        trigger(url, filename);
        setTimeout(() => URL.revokeObjectURL(url), 4000);
      } catch {
        trigger(publicUrl(w.storage_path), filename); // fallback: full original
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
      {/* preview stage */}
      <div className="surface relative flex min-h-[380px] items-center justify-center overflow-hidden rounded-card p-8">
        <div
          className={cn(
            "relative overflow-hidden shadow-lift transition-all duration-500",
            frame === "phone" && "aspect-[9/19.5] w-[190px] rounded-[2rem] ring-4 ring-black/40",
            frame === "desktop" && "aspect-[16/9] w-full max-w-md rounded-xl ring-2 ring-black/40",
            frame === "tablet" && "aspect-[3/4] w-[240px] rounded-2xl ring-4 ring-black/40",
          )}
        >
          <Image src={preview} alt={`${w.title} on ${frame}`} fill className="object-cover" sizes="500px" />

          {/* live lock-screen clock on the phone frame */}
          {frame === "phone" && clock && (
            <div className="absolute inset-x-0 top-10 flex flex-col items-center text-white drop-shadow-lg">
              <p className="text-xs font-medium opacity-90">
                {clock.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
              </p>
              <p className="text-5xl font-semibold tabular-nums leading-tight">
                {clock.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false })}
              </p>
            </div>
          )}
          {frame === "phone" && (
            <div className="absolute left-1/2 top-2 h-1.5 w-16 -translate-x-1/2 rounded-full bg-black/50" />
          )}
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
                onClick={() => { setFrame(key); setResIndex(0); }}
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
            <span>Original {w.width}×{w.height}</span>
            <span className="font-mono">{formatBytes(w.file_size)}</span>
          </div>
          <GlassButton variant="iris" size="lg" className="w-full" onClick={download} disabled={busy}>
            {busy ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {chosen?.mine ? `Download for your screen · ${chosen.w}×${chosen.h}` : `Download · ${chosen?.w}×${chosen?.h}`}
          </GlassButton>
          <p className="text-center text-[11px] text-chalk-faint">
            Auto-fitted to the exact pixels you pick — no manual cropping.
          </p>
        </div>
      </div>
    </div>
  );
}
