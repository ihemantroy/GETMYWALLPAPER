"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Box,
  Zap,
  CircleSlash,
  Activity,
  Users,
  ArrowRight,
  Play,
  Apple,
  PartyPopper,
} from "lucide-react";

// 👉 Replace with your Play Store link / App Store link / waitlist form once live.
const WAITLIST_LINK = "#";
const PLAY_STORE_LINK = "#";
const APP_STORE_LINK = "#";

// 👉 Set your real launch date/time here (local time is fine).
const LAUNCH_DATE = new Date("2026-09-15T00:00:00");

// 👉 Starting waitlist count. Replace with a real count from your DB once wired up.
const WAITLIST_START = 1000;

const FEATURES = [
  { icon: Box, label: "Real Depth" },
  { icon: Sparkles, label: "4K Quality" },
  { icon: Activity, label: "AMOLED Ready" },
  { icon: Zap, label: "Battery Optimized" },
  { icon: CircleSlash, label: "No Ads" },
  { icon: Activity, label: "Live Motion" },
] as const;

const AVATAR_COLORS = ["#0D8B6C", "#16B089", "#2DD4A7", "#0B6E56", "#22C55E"];
const CONFETTI_COLORS = ["#0D8B6C", "#16B089", "#2DD4A7", "#F4F4F6", "#FBBF24", "#60A5FA"];

function useCountdown(target: Date) {
  const [left, setLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    function tick() {
      const diff = Math.max(0, target.getTime() - Date.now());
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setLeft({ d, h, m, s });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return left;
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="gyw-timebox flex w-16 flex-col items-center rounded-2xl border border-line bg-ink-2/80 py-3 sm:w-[4.5rem]">
      <span className="font-display text-2xl font-bold tabular-nums text-accent sm:text-[1.75rem]">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-0.5 text-[11px] text-chalk-faint">{label}</span>
    </div>
  );
}

type Confetto = {
  id: number;
  left: number;
  color: string;
  size: number;
  duration: number;
  delay: number;
  rotate: number;
  drift: number;
  shape: "rect" | "circle";
};

/** Full-viewport confetti burst — fixed positioning so it works identically on phone, tablet, laptop and desktop. */
function ConfettiOverlay({ show }: { show: boolean }) {
  const pieces = useMemo<Confetto[]>(() => {
    if (!show) return [];
    return Array.from({ length: 140 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 6 + Math.random() * 8,
      duration: 2.6 + Math.random() * 1.8,
      delay: Math.random() * 0.5,
      rotate: Math.random() * 360,
      drift: (Math.random() - 0.5) * 160,
      shape: Math.random() > 0.5 ? "rect" : "circle",
    }));
  }, [show]);

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      <style>{`
        @keyframes gyw-confetti-fall {
          0% { transform: translate(0, -10vh) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--drift), 110vh) rotate(720deg); opacity: 0.9; }
        }
        @keyframes gyw-pop-in {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.6); }
          15% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
          85% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.96); }
        }
      `}</style>

      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.shape === "rect" ? p.size * 0.4 : p.size,
            background: p.color,
            borderRadius: p.shape === "circle" ? "9999px" : "2px",
            ["--drift" as string]: `${p.drift}px`,
            animation: `gyw-confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}

      <div
        className="fixed left-1/2 top-1/2 flex items-center gap-2 rounded-2xl border border-accent/40 bg-ink-2/95 px-6 py-4 text-center shadow-lift backdrop-blur"
        style={{ animation: "gyw-pop-in 3s ease forwards" }}
      >
        <PartyPopper size={22} className="text-accent" />
        <span className="font-display text-base font-bold text-chalk sm:text-lg">
          You're on the list! 🎉
        </span>
      </div>
    </div>
  );
}

/**
 * "Introducing 3D Parallax" hero banner — announces the upcoming 3D parallax
 * wallpaper app with a live countdown, waitlist CTA (with a confetti celebration
 * on join), feature badges and an animated phone mockup that parallax-shifts
 * with the cursor.
 */
export function ParallaxAppBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const { d, h, m, s } = useCountdown(LAUNCH_DATE);
  const [count, setCount] = useState(WAITLIST_START);
  const [joined, setJoined] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const my = ((e.clientY - r.top) / r.height) * 2 - 1;
    el.style.setProperty("--mx", mx.toFixed(3));
    el.style.setProperty("--my", my.toFixed(3));
  }
  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--mx", "0");
    el.style.setProperty("--my", "0");
  }

  // On touch devices, tilt the layers with the phone's gyroscope instead of the mouse.
  useEffect(() => {
    const isTouch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
    if (!isTouch) return;

    function onOrientation(e: DeviceOrientationEvent) {
      const el = ref.current;
      if (!el || e.beta == null || e.gamma == null) return;
      const mx = Math.max(-1, Math.min(1, e.gamma / 30));
      const my = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
      el.style.setProperty("--mx", mx.toFixed(3));
      el.style.setProperty("--my", my.toFixed(3));
    }

    type OrientationEventCtor = typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<"granted" | "denied">;
    };
    const Ctor = (window as unknown as { DeviceOrientationEvent?: OrientationEventCtor }).DeviceOrientationEvent;

    if (Ctor?.requestPermission) {
      // iOS 13+ requires a user gesture to grant permission; ask on first touch.
      const grant = () => {
        Ctor.requestPermission?.().then((state) => {
          if (state === "granted") window.addEventListener("deviceorientation", onOrientation);
        });
        window.removeEventListener("touchstart", grant);
      };
      window.addEventListener("touchstart", grant, { once: true });
      return () => window.removeEventListener("touchstart", grant);
    }

    window.addEventListener("deviceorientation", onOrientation);
    return () => window.removeEventListener("deviceorientation", onOrientation);
  }, []);

  function handleJoinWaitlist(e: React.MouseEvent) {
    e.preventDefault();
    if (joined) return;
    setJoined(true);
    setCount((c) => c + 1);
    setCelebrate(true);
    // TODO: wire this up to your real waitlist endpoint (e.g. POST to /api/waitlist).
    window.setTimeout(() => setCelebrate(false), 3200);
  }

  return (
    <section
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ ["--mx" as string]: "0", ["--my" as string]: "0" }}
      className="gyw-banner glass-strong relative mb-8 overflow-hidden rounded-3xl border border-accent/25 p-6 sm:p-10"
    >
      <style>{`
        @keyframes gyw-rise { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:none } }
        @keyframes gyw-glow { 0%,100% { opacity:.45; transform:scale(1) } 50% { opacity:.8; transform:scale(1.08) } }
        @keyframes gyw-shine { 0% { transform:translateX(-120%) } 60%,100% { transform:translateX(320%) } }
        @keyframes gyw-count-pop { 0% { transform:scale(1) } 40% { transform:scale(1.25) } 100% { transform:scale(1) } }
        @keyframes gyw-bob { 0%,100% { transform:translateY(0) } 50% { transform:translateY(var(--bob,-6px)) } }
        @keyframes gyw-ring-pulse { 0%,100% { opacity:.55; transform:scale(1) } 50% { opacity:.9; transform:scale(1.035) } }
        @keyframes gyw-moon-pulse { 0%,100% { opacity:.5; transform:scale(1) } 50% { opacity:.85; transform:scale(1.15) } }
        @keyframes gyw-fog-drift { 0% { transform:translateX(-4%) } 50% { transform:translateX(4%) } 100% { transform:translateX(-4%) } }
        .gyw-banner .gyw-content { animation: gyw-rise .7s ease both; }
        .gyw-banner .gyw-glow { animation: gyw-glow 5s ease-in-out infinite; }
        .gyw-banner .gyw-cta:hover .gyw-shine { animation: gyw-shine 1s ease; }
        .gyw-timebox { transition: transform .2s ease; }
        .gyw-count-bump { animation: gyw-count-pop .4s ease; }
        .gyw-float { animation: gyw-bob var(--bob-dur,6s) ease-in-out infinite; animation-delay: var(--bob-delay,0s); }
        .gyw-parallax { transform: translate(calc(var(--mx) * var(--depth,10) * 1px), calc(var(--my) * var(--depth,10) * 1px)) rotate(calc(var(--mx) * var(--depth,10) * 0.06deg)); transition: transform .18s ease-out; will-change: transform; }
        .gyw-ring { animation: gyw-ring-pulse 5s ease-in-out infinite; }
        .gyw-moon-glow { animation: gyw-moon-pulse 4.5s ease-in-out infinite; }
        .gyw-fog { animation: gyw-fog-drift 14s ease-in-out infinite; }
      `}</style>

      {/* glowing accent blobs */}
      <div className="gyw-glow pointer-events-none absolute -right-10 -top-16 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
      <div
        className="gyw-glow pointer-events-none absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-accent/10 blur-3xl"
        style={{ animationDelay: "1.5s" }}
      />

      <ConfettiOverlay show={celebrate} />

      {/* ---------- TOP: copy + phone mockup ---------- */}
      <div className="gyw-content relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
            <Sparkles size={13} /> Exclusive App
          </span>

          <p className="mt-5 text-lg text-chalk-muted sm:text-xl">Introducing</p>
          <h2 className="mt-1 font-display text-5xl font-black leading-none tracking-tight sm:text-6xl">
            <span className="text-accent">3D</span>{" "}
            <span className="text-chalk">PARALLAX</span>
          </h2>
          <p className="mt-4 text-xl font-semibold text-chalk sm:text-2xl">
            The next generation of <span className="text-accent">wallpapers.</span>
          </p>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-chalk-muted sm:text-base">
            Experience real depth that moves with you. Your wallpaper reacts to every movement of
            your phone. No videos. No GIFs. Pure 3D depth.
          </p>

          {/* feature badges */}
          <div className="mt-6 flex flex-wrap gap-2.5">
            {FEATURES.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-ink-2/70 px-3.5 py-1.5 text-xs font-medium text-chalk-muted"
              >
                <Icon size={13} className="text-accent" />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* hero art — layered depth: sky, mountains, pagoda island, tree island each parallax independently */}
        <div className="relative mx-auto w-full max-w-[420px] shrink-0 pb-6 sm:max-w-[460px] lg:max-w-[500px]">
          {/* glowing ring, behind the phone */}
          <div className="gyw-ring pointer-events-none absolute inset-[4%] rounded-full border border-accent/40" />
          <div className="gyw-ring pointer-events-none absolute inset-[4%] -z-10 rounded-full bg-accent/20 blur-3xl" />

          {/* phone frame — clips the layered scene */}
          <div className="relative aspect-square w-full overflow-hidden rounded-[9%] border-[5px] border-white/10 bg-[#050a10] shadow-2xl">
            {/* sky + moon (back-most, opaque) */}
            <div className="gyw-float absolute inset-0" style={{ ["--bob-dur" as string]: "9s", ["--bob" as string]: "-3px" }}>
              <div className="gyw-parallax relative h-full w-full" style={{ ["--depth" as string]: 4 }}>
                <Image
                  src="/images/parallax-layers/sky.png"
                  alt="Starry night sky with a full moon"
                  fill
                  className="object-cover object-[60%_28%] scale-110"
                  sizes="500px"
                  priority
                />
              </div>
            </div>

            {/* moon glow bloom */}
            <div className="gyw-moon-glow pointer-events-none absolute left-[46%] top-[14%] h-20 w-20 -translate-x-1/2 rounded-full bg-white/70 blur-2xl" />

            {/* mountains */}
            <div className="gyw-float absolute inset-x-0 bottom-[6%]" style={{ ["--bob-dur" as string]: "7s", ["--bob-delay" as string]: "0.3s", ["--bob" as string]: "-5px" }}>
              <div className="gyw-parallax relative mx-auto aspect-[3/2] w-[96%]" style={{ ["--depth" as string]: 12 }}>
                <Image
                  src="/images/parallax-layers/mountains.png"
                  alt="Layered dark mountain silhouettes"
                  fill
                  className="object-contain object-bottom"
                  sizes="500px"
                />
              </div>
            </div>

            {/* pagoda island (left) */}
            <div className="gyw-float absolute bottom-[3%] left-[-8%] w-[56%]" style={{ ["--bob-dur" as string]: "6s", ["--bob-delay" as string]: "0.6s", ["--bob" as string]: "-8px" }}>
              <div className="gyw-parallax relative aspect-[3/2] w-full" style={{ ["--depth" as string]: 20 }}>
                <Image
                  src="/images/parallax-layers/pagoda-island.png"
                  alt="Floating island with a lit pagoda and a blossom tree"
                  fill
                  className="object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
                  sizes="300px"
                />
              </div>
            </div>

            {/* tree island (right) */}
            <div className="gyw-float absolute bottom-[1%] right-[-10%] w-[58%]" style={{ ["--bob-dur" as string]: "6.5s", ["--bob-delay" as string]: "0.15s", ["--bob" as string]: "-7px" }}>
              <div className="gyw-parallax relative aspect-[19/20] w-full" style={{ ["--depth" as string]: 24 }}>
                <Image
                  src="/images/parallax-layers/main-island.png"
                  alt="Floating island with blossom trees"
                  fill
                  className="object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
                  sizes="300px"
                />
              </div>
            </div>

            {/* drifting fog at the base */}
            <div className="gyw-fog pointer-events-none absolute inset-x-[-10%] bottom-0 h-[22%] bg-gradient-to-t from-[#0d1a1e] via-[#0d1a1e]/60 to-transparent blur-md" />

            {/* cohesion vignette */}
            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_60px_25px_rgba(0,0,0,0.55)]" />
            {/* top notch */}
            <div className="absolute left-1/2 top-1 h-3 w-14 -translate-x-1/2 rounded-full bg-black/70" />
          </div>

          {/* small island popping out past the frame — strongest parallax, front-most */}
          <div
            className="gyw-float absolute -bottom-2 left-[6%] z-20 w-[26%] drop-shadow-[0_14px_18px_rgba(0,0,0,0.55)]"
            style={{ ["--bob-dur" as string]: "5s", ["--bob-delay" as string]: "0.4s", ["--bob" as string]: "-10px" }}
          >
            <div className="gyw-parallax relative aspect-[15/14] w-full" style={{ ["--depth" as string]: 34 }}>
              <Image
                src="/images/parallax-layers/small-island.png"
                alt="A small floating rock island"
                fill
                className="object-contain"
                sizes="140px"
              />
            </div>
          </div>

          {/* coming soon chat bubble */}
          <div className="absolute right-2 top-6 z-20 flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-accent/30 bg-ink-2/95 px-3 py-2 shadow-lift backdrop-blur sm:right-6">
            <span className="text-[11px] font-bold uppercase tracking-wide text-accent">
              Coming Soon
            </span>
            <Play size={11} className="text-chalk-muted" />
            <Apple size={12} className="text-chalk-muted" />
          </div>
        </div>
      </div>

      {/* ---------- BOTTOM: waitlist strip + countdown + store badges ---------- */}
      <div className="relative mt-8 flex flex-col gap-5 border-t border-line pt-6 lg:flex-row lg:items-center lg:justify-between">
        {/* waitlist box */}
        <div className="flex flex-col gap-4 rounded-2xl border border-line bg-ink-2/60 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
              <Users size={20} />
            </span>
            <div>
              <p className="font-semibold text-chalk">Be First To Experience 3D</p>
              <p className="text-xs text-chalk-muted">Join the waitlist and get early access</p>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {AVATAR_COLORS.map((c, i) => (
                    <span
                      key={i}
                      className="h-5 w-5 rounded-full border-2 border-ink-2"
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <span key={count} className="gyw-count-bump text-xs text-accent">
                  {count.toLocaleString()}{" "}
                  <span className="text-chalk-faint">people already joined</span>
                </span>
              </div>
            </div>
          </div>

          <Link
            href={WAITLIST_LINK}
            onClick={handleJoinWaitlist}
            aria-disabled={joined}
            className="gyw-cta btn-accent focusable relative inline-flex h-11 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full px-6 text-sm font-bold disabled:opacity-70"
          >
            <span className="gyw-shine pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-12 bg-white/25" />
            {joined ? (
              <>
                You're in! <PartyPopper size={15} />
              </>
            ) : (
              <>
                Join Waitlist <ArrowRight size={15} />
              </>
            )}
          </Link>
        </div>

        {/* countdown */}
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <span className="text-xs text-chalk-faint">Launching In</span>
          <div className="flex gap-2">
            <TimeBox value={d} label="Days" />
            <TimeBox value={h} label="Hours" />
            <TimeBox value={m} label="Minutes" />
            <TimeBox value={s} label="Seconds" />
          </div>
        </div>

        {/* store badges */}
        <div className="flex gap-3">
          <Link
            href={PLAY_STORE_LINK}
            className="focusable flex items-center gap-2 rounded-xl border border-line bg-ink-2/70 px-4 py-2.5 text-chalk transition hover:border-accent/40"
          >
            <Play size={18} className="text-chalk" />
            <span className="text-left leading-tight">
              <span className="block text-[10px] text-chalk-faint">Coming soon to</span>
              <span className="block text-sm font-semibold">Google Play</span>
            </span>
          </Link>
          <Link
            href={APP_STORE_LINK}
            className="focusable flex items-center gap-2 rounded-xl border border-line bg-ink-2/70 px-4 py-2.5 text-chalk transition hover:border-accent/40"
          >
            <Apple size={18} className="text-chalk" />
            <span className="text-left leading-tight">
              <span className="block text-[10px] text-chalk-faint">Coming soon to</span>
              <span className="block text-sm font-semibold">App Store</span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
