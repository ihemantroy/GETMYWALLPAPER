"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Check,
} from "lucide-react";
import { partyPoppers } from "@/lib/confetti";

// 👉 Store / App Store links once live.
const PLAY_STORE_LINK = "#";
const APP_STORE_LINK = "#";

// 👉 Your real launch date/time (local time is fine).
const LAUNCH_DATE = new Date("2026-09-15T00:00:00");

// Fallback display count if the /api/waitlist backend isn't wired up yet.
const WAITLIST_FALLBACK = 1000;

// How far (in degrees) the whole phone tilts in 3D at full cursor deflection.
const TILT = 9;

const FEATURES = [
  { icon: Box, label: "Real Depth" },
  { icon: Sparkles, label: "4K Quality" },
  { icon: Activity, label: "AMOLED Ready" },
  { icon: Zap, label: "Battery Optimized" },
  { icon: CircleSlash, label: "No Ads" },
  { icon: Activity, label: "Live Motion" },
] as const;

const AVATAR_COLORS = ["#0D8B6C", "#16B089", "#2DD4A7", "#0B6E56", "#22C55E"];

// ----------------------------------------------------------------------------
//  Small hooks
// ----------------------------------------------------------------------------

function useCountdown(target: Date) {
  const [left, setLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    function tick() {
      const diff = Math.max(0, target.getTime() - Date.now());
      setLeft({
        d: Math.floor(diff / 86_400_000),
        h: Math.floor((diff / 3_600_000) % 24),
        m: Math.floor((diff / 60_000) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return left;
}

/** Eases a displayed integer toward `target` so the counter visibly ticks up. */
function useAnimatedNumber(target: number | null) {
  const [display, setDisplay] = useState(0);
  const current = useRef(0);
  useEffect(() => {
    if (target == null) return;
    const from = current.current;
    const to = target;
    if (from === to) return;
    const dur = Math.min(1400, 350 + Math.abs(to - from) * 1.1);
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = Math.round(from + (to - from) * eased);
      current.current = v;
      setDisplay(v);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return display;
}

function getBrowserId(): string {
  try {
    let id = localStorage.getItem("gyw_bid");
    if (!id) {
      id =
        (crypto as Crypto & { randomUUID?: () => string }).randomUUID?.() ??
        `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem("gyw_bid", id);
    }
    return id;
  } catch {
    return `b_${Math.random().toString(36).slice(2, 12)}`;
  }
}

// ----------------------------------------------------------------------------
//  Countdown box
// ----------------------------------------------------------------------------

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

// ----------------------------------------------------------------------------
//  Banner
// ----------------------------------------------------------------------------

/**
 * "Introducing 3D Parallax" hero banner. The phone scene tilts in genuine 3D on
 * a requestAnimationFrame spring (buttery, no CSS-transition lag), the front
 * rock floats above the glass on the Z axis, a glass glare tracks the cursor,
 * and joining the waitlist fires a full party-popper celebration while a live,
 * persistent counter ticks up.
 */
export function ParallaxAppBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const { d, h, m, s } = useCountdown(LAUNCH_DATE);

  const [count, setCount] = useState<number | null>(null);
  const shownCount = useAnimatedNumber(count);
  const [joined, setJoined] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [askEmail, setAskEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSaved, setEmailSaved] = useState(false);
  const backendOk = useRef(true);

  // ---- live count: load real number, persist locally, poll gently ----------
  useEffect(() => {
    try {
      if (localStorage.getItem("gyw_wl_joined") === "1") setJoined(true);
    } catch {}

    let alive = true;
    const cached = (() => {
      try {
        const n = Number(localStorage.getItem("gyw_wl_count"));
        return Number.isFinite(n) && n > 0 ? n : null;
      } catch {
        return null;
      }
    })();

    async function load() {
      try {
        const r = await fetch("/api/waitlist", { cache: "no-store" });
        const j = await r.json();
        if (!alive) return;
        if (j?.degraded) backendOk.current = false;
        const n = Number(j?.count);
        if (Number.isFinite(n)) {
          setCount((prev) => (prev != null && n < prev ? prev : n));
          try {
            localStorage.setItem("gyw_wl_count", String(n));
          } catch {}
        }
      } catch {
        backendOk.current = false;
        if (alive) setCount((prev) => prev ?? cached ?? WAITLIST_FALLBACK);
      }
    }

    // Show the cached number instantly, then reconcile with the server.
    setCount(cached ?? WAITLIST_FALLBACK);
    load();

    // Gently reflect others joining while the tab is open (only if backend live).
    const poll = setInterval(() => {
      if (backendOk.current) load();
    }, 30_000);

    return () => {
      alive = false;
      clearInterval(poll);
    };
  }, []);

  // ---- 3D spring motion: ease cursor/gyro values every frame ---------------
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let curX = 0,
      curY = 0,
      tgtX = 0,
      tgtY = 0,
      inside = false,
      running = false,
      raf = 0;

    const write = () => {
      el.style.setProperty("--mx", curX.toFixed(4));
      el.style.setProperty("--my", curY.toFixed(4));
      el.style.setProperty("--rx", (-curY * TILT).toFixed(3) + "deg");
      el.style.setProperty("--ry", (curX * TILT).toFixed(3) + "deg");
      el.style.setProperty("--gx", (50 + curX * 34).toFixed(2) + "%");
      el.style.setProperty("--gy", (50 + curY * 34).toFixed(2) + "%");
    };

    const loop = () => {
      curX += (tgtX - curX) * 0.09;
      curY += (tgtY - curY) * 0.09;
      write();
      const settled =
        !inside && Math.abs(curX - tgtX) < 0.0004 && Math.abs(curY - tgtY) < 0.0004;
      if (settled) {
        curX = tgtX;
        curY = tgtY;
        write();
        running = false;
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tgtX = ((e.clientX - r.left) / r.width) * 2 - 1;
      tgtY = ((e.clientY - r.top) / r.height) * 2 - 1;
      tgtX = Math.max(-1, Math.min(1, tgtX));
      tgtY = Math.max(-1, Math.min(1, tgtY));
      inside = true;
      el.classList.add("is-hot");
      kick();
    };
    const onLeave = () => {
      inside = false;
      tgtX = 0;
      tgtY = 0;
      el.classList.remove("is-hot");
      kick();
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    // Touch devices: tilt with the gyroscope instead of the (absent) cursor.
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    let detachGyro = () => {};
    if (isTouch) {
      const onOrientation = (ev: DeviceOrientationEvent) => {
        if (ev.beta == null || ev.gamma == null) return;
        tgtX = Math.max(-1, Math.min(1, ev.gamma / 30));
        tgtY = Math.max(-1, Math.min(1, (ev.beta - 45) / 30));
        inside = true;
        kick();
      };
      type Ctor = typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<"granted" | "denied">;
      };
      const C = (window as unknown as { DeviceOrientationEvent?: Ctor }).DeviceOrientationEvent;
      if (C?.requestPermission) {
        const grant = () => {
          C.requestPermission?.().then((st) => {
            if (st === "granted") window.addEventListener("deviceorientation", onOrientation);
          });
        };
        window.addEventListener("touchstart", grant, { once: true });
        detachGyro = () => {
          window.removeEventListener("touchstart", grant);
          window.removeEventListener("deviceorientation", onOrientation);
        };
      } else {
        window.addEventListener("deviceorientation", onOrientation);
        detachGyro = () => window.removeEventListener("deviceorientation", onOrientation);
      }
    }

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      detachGyro();
    };
  }, []);

  // ---- join ----------------------------------------------------------------
  const postJoin = useCallback(async (mail?: string) => {
    try {
      const r = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ browserId: getBrowserId(), email: mail ?? null }),
      });
      const j = await r.json();
      const n = Number(j?.count);
      if (Number.isFinite(n)) {
        setCount(n);
        try {
          localStorage.setItem("gyw_wl_count", String(n));
        } catch {}
      } else {
        backendOk.current = false;
      }
    } catch {
      backendOk.current = false;
    }
  }, []);

  const handleJoin = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      if (joined) {
        // Already in — let them enjoy the confetti again, but don't recount.
        partyPoppers();
        return;
      }
      setJoined(true);
      setAskEmail(true);
      setCelebrate(true);
      partyPoppers();

      // Optimistic bump so the number moves instantly...
      setCount((c) => {
        const next = (c ?? WAITLIST_FALLBACK) + 1;
        try {
          localStorage.setItem("gyw_wl_joined", "1");
          localStorage.setItem("gyw_wl_count", String(next));
        } catch {}
        return next;
      });
      // ...then reconcile with the real server total.
      postJoin();
      window.setTimeout(() => setCelebrate(false), 3400);
    },
    [joined, postJoin],
  );

  const handleSaveEmail = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
      if (!ok) return;
      setEmailSaved(true);
      postJoin(email.trim());
      window.setTimeout(() => setAskEmail(false), 1600);
    },
    [email, postJoin],
  );

  const badge = useMemo(
    () =>
      celebrate ? (
        <div className="pointer-events-none fixed inset-0 z-[2147483646] flex items-center justify-center">
          <div className="gyw-badge flex items-center gap-2 rounded-2xl border border-accent/40 bg-ink-2/95 px-6 py-4 shadow-lift backdrop-blur">
            <PartyPopper size={22} className="text-accent" />
            <span className="font-display text-base font-bold text-chalk sm:text-lg">
              You&apos;re on the list! 🎉
            </span>
          </div>
        </div>
      ) : null,
    [celebrate],
  );

  return (
    <section
      ref={ref}
      style={{
        ["--mx" as string]: "0",
        ["--my" as string]: "0",
        ["--rx" as string]: "0deg",
        ["--ry" as string]: "0deg",
        ["--gx" as string]: "50%",
        ["--gy" as string]: "50%",
      }}
      className="gyw-banner glass-strong relative mb-8 overflow-hidden rounded-3xl border border-accent/25 p-6 sm:p-10"
    >
      <style>{`
        @keyframes gyw-rise { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:none } }
        @keyframes gyw-glow { 0%,100% { opacity:.45; transform:scale(1) } 50% { opacity:.8; transform:scale(1.08) } }
        @keyframes gyw-shine { 0% { transform:translateX(-120%) } 60%,100% { transform:translateX(320%) } }
        @keyframes gyw-bob { 0%,100% { transform:translateY(0) } 50% { transform:translateY(var(--bob,-6px)) } }
        @keyframes gyw-ring-pulse { 0%,100% { opacity:.5; transform:scale(1) } 50% { opacity:.9; transform:scale(1.03) } }
        @keyframes gyw-moon-pulse { 0%,100% { opacity:.5; transform:scale(1) } 50% { opacity:.85; transform:scale(1.15) } }
        @keyframes gyw-fog-drift { 0% { transform:translateX(-4%) } 50% { transform:translateX(4%) } 100% { transform:translateX(-4%) } }
        @keyframes gyw-count-pop { 0% { transform:scale(1) } 40% { transform:scale(1.28) } 100% { transform:scale(1) } }
        @keyframes gyw-scene-in { from { opacity:0; transform:translateY(30px) scale(.94) } to { opacity:1; transform:translateY(0) scale(1) } }
        @keyframes gyw-badge-pop {
          0% { opacity:0; transform:scale(.6) translateY(8px) }
          16% { opacity:1; transform:scale(1.06) translateY(0) }
          80% { opacity:1; transform:scale(1) }
          100% { opacity:0; transform:scale(.97) }
        }

        .gyw-banner .gyw-content { animation: gyw-rise .7s ease both; }
        .gyw-banner .gyw-glow { animation: gyw-glow 5s ease-in-out infinite; }
        .gyw-banner .gyw-cta:hover .gyw-shine { animation: gyw-shine 1s ease; }
        .gyw-timebox { transition: transform .2s ease; }
        .gyw-count-bump { display:inline-block; animation: gyw-count-pop .5s ease; }
        .gyw-badge { animation: gyw-badge-pop 3.4s cubic-bezier(.22,1,.36,1) forwards; }

        /* 3D stack: stage holds the perspective, tilt does the rotation. */
        .gyw-stage { perspective: 1100px; }
        .gyw-lift { transition: transform .6s cubic-bezier(.22,1,.36,1); transform: translateZ(0) scale(1); }
        .gyw-banner.is-hot .gyw-lift { transform: scale(1.025); }
        .gyw-intro { animation: gyw-scene-in 1s cubic-bezier(.22,1,.36,1) both; }
        .gyw-tilt {
          transform-style: preserve-3d;
          transform: rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));
        }

        /* idle bob (outer) + eased parallax slide (inner). No CSS transition on
           the slide — the rAF spring already smooths it, so it stays butter. */
        .gyw-float { animation: gyw-bob var(--bob-dur,6s) ease-in-out infinite; animation-delay: var(--bob-delay,0s); transform-style: preserve-3d; }
        .gyw-parallax {
          transform: translate3d(calc(var(--mx) * var(--depth,10) * 1px), calc(var(--my) * var(--depth,10) * 1px), 0);
          will-change: transform;
        }
        /* the rock that breaks the frame gets real Z-pop so it floats over glass */
        .gyw-pop {
          transform: translate3d(calc(var(--mx) * var(--depth,10) * 1px), calc(var(--my) * var(--depth,10) * 1px), 60px);
          will-change: transform;
        }

        .gyw-ring { animation: gyw-ring-pulse 5s ease-in-out infinite; }
        .gyw-moon-glow { animation: gyw-moon-pulse 4.5s ease-in-out infinite; }
        .gyw-fog { animation: gyw-fog-drift 14s ease-in-out infinite; }

        /* glass glare that tracks the cursor across the screen */
        .gyw-glare {
          position:absolute; inset:-30%;
          background: radial-gradient(38% 38% at var(--gx,50%) var(--gy,50%), rgba(255,255,255,.22), rgba(255,255,255,.05) 45%, transparent 65%);
          mix-blend-mode: screen; opacity:.7; pointer-events:none;
        }
        .gyw-spot {
          position:absolute; inset:0; pointer-events:none; opacity:0; transition:opacity .5s ease;
          background: radial-gradient(300px 300px at var(--gx,50%) var(--gy,50%), rgb(var(--accent) / .10), transparent 70%);
        }
        .gyw-banner.is-hot .gyw-spot { opacity:1; }

        @media (prefers-reduced-motion: reduce) {
          .gyw-float, .gyw-ring, .gyw-moon-glow, .gyw-fog, .gyw-tilt, .gyw-intro, .gyw-content { animation: none !important; }
          .gyw-parallax, .gyw-pop { transform: none !important; }
          .gyw-tilt { transform: none !important; }
        }
      `}</style>

      {/* ambient glow blobs + cursor spotlight */}
      <div className="gyw-glow pointer-events-none absolute -right-10 -top-16 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
      <div
        className="gyw-glow pointer-events-none absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-accent/10 blur-3xl"
        style={{ animationDelay: "1.5s" }}
      />
      <div className="gyw-spot" />

      {badge}

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

        {/* hero art — 3D layered depth */}
        <div className="gyw-stage relative mx-auto w-full max-w-[420px] shrink-0 pb-6 sm:max-w-[460px] lg:max-w-[500px]">
          <div className="gyw-lift">
            <div className="gyw-intro">
              <div className="gyw-tilt relative">
              {/* glowing ring behind the phone */}
              <div className="gyw-ring pointer-events-none absolute inset-[4%] rounded-full border border-accent/40" />
              <div className="gyw-ring pointer-events-none absolute inset-[4%] -z-10 rounded-full bg-accent/20 blur-3xl" />

              {/* phone frame clips the layered scene */}
              <div className="relative aspect-square w-full overflow-hidden rounded-[9%] border-[5px] border-white/10 bg-[#050a10] shadow-2xl">
                {/* sky + moon (back-most) */}
                <div className="gyw-float absolute inset-0" style={{ ["--bob-dur" as string]: "9s", ["--bob" as string]: "-3px" }}>
                  <div className="gyw-parallax relative h-full w-full" style={{ ["--depth" as string]: 4 }}>
                    <Image
                      src="/images/parallax-layers/sky.png"
                      alt="Starry night sky with a full moon"
                      fill
                      className="scale-110 object-cover object-[60%_28%]"
                      sizes="500px"
                      priority
                    />
                  </div>
                </div>

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

                {/* drifting fog */}
                <div className="gyw-fog pointer-events-none absolute inset-x-[-10%] bottom-0 h-[22%] bg-gradient-to-t from-[#0d1a1e] via-[#0d1a1e]/60 to-transparent blur-md" />

                {/* cursor-tracked glass glare */}
                <div className="gyw-glare" />

                {/* cohesion vignette + notch */}
                <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_60px_25px_rgba(0,0,0,0.55)]" />
                <div className="absolute left-1/2 top-1 h-3 w-14 -translate-x-1/2 rounded-full bg-black/70" />
              </div>

              {/* rock that pops OUT of the frame — front-most, floats above glass */}
              <div
                className="gyw-float absolute -bottom-2 left-[6%] z-20 w-[26%] drop-shadow-[0_18px_22px_rgba(0,0,0,0.6)]"
                style={{ ["--bob-dur" as string]: "5s", ["--bob-delay" as string]: "0.4s", ["--bob" as string]: "-10px" }}
              >
                <div className="gyw-pop relative aspect-[15/14] w-full" style={{ ["--depth" as string]: 34 }}>
                  <Image
                    src="/images/parallax-layers/small-island.png"
                    alt="A small floating rock island"
                    fill
                    className="object-contain"
                    sizes="140px"
                  />
                </div>
              </div>

              {/* coming soon bubble */}
              <div className="absolute right-2 top-6 z-20 flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-accent/30 bg-ink-2/95 px-3 py-2 shadow-lift backdrop-blur sm:right-6">
                <span className="text-[11px] font-bold uppercase tracking-wide text-accent">
                  Coming Soon
                </span>
                <Play size={11} className="text-chalk-muted" />
                <Apple size={12} className="text-chalk-muted" />
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- BOTTOM: waitlist + countdown + store badges ---------- */}
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
                <span className="text-xs text-accent">
                  <span key={count ?? 0} className="gyw-count-bump font-semibold tabular-nums">
                    {shownCount.toLocaleString()}
                  </span>{" "}
                  <span className="text-chalk-faint">people already joined</span>
                </span>
              </div>

              {/* optional email capture appears after joining */}
              {askEmail && !emailSaved && (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEmail(e as unknown as React.MouseEvent);
                    }}
                    placeholder="Email for a launch-day reminder (optional)"
                    className="focusable h-9 w-full min-w-0 rounded-full border border-line bg-ink px-4 text-xs text-chalk placeholder:text-chalk-faint sm:w-64"
                  />
                  <button
                    onClick={handleSaveEmail}
                    className="btn-accent focusable inline-flex h-9 shrink-0 items-center rounded-full px-4 text-xs font-bold"
                  >
                    Save
                  </button>
                </div>
              )}
              {emailSaved && (
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-accent">
                  <Check size={13} /> We&apos;ll ping you on launch day.
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleJoin}
            className="gyw-cta btn-accent focusable relative inline-flex h-11 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full px-6 text-sm font-bold"
          >
            <span className="gyw-shine pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-12 bg-white/25" />
            {joined ? (
              <>
                You&apos;re in! <PartyPopper size={15} />
              </>
            ) : (
              <>
                Join Waitlist <ArrowRight size={15} />
              </>
            )}
          </button>
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
