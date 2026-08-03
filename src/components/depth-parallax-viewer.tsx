"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Boxes, X, Sparkles } from "lucide-react";
import { getForeground } from "@/lib/foreground";

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

/** Button + fullscreen depth-parallax overlay (subject floats in front). */
export function DepthParallaxButton({ src, title }: { src: string; title: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="3D depth view"
        aria-label="Open 3D depth view"
        className="focusable grid h-11 w-11 place-items-center rounded-full border border-line text-chalk-muted transition hover:text-chalk"
      >
        <Boxes size={18} />
      </button>
      {open && <DepthOverlay src={src} title={title} onClose={() => setOpen(false)} />}
    </>
  );
}

function DepthOverlay({ src, title, onClose }: { src: string; title: string; onClose: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);
  const fgRef = useRef<HTMLImageElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const lastInput = useRef(0);
  const raf = useRef(0);

  const [fgUrl, setFgUrl] = useState<string | null>(null);
  const [status, setStatus] = useState("Preparing 3D…");
  const [needsMotion, setNeedsMotion] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleOrient = useCallback((e: DeviceOrientationEvent) => {
    const g = e.gamma ?? 0;
    const b = e.beta ?? 0;
    target.current = { x: clamp(g / 35), y: clamp((b - 45) / 35) };
    lastInput.current = performance.now();
  }, []);

  // Cut the subject out (cached after first run).
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const url = await getForeground(src, (pct) => {
          if (alive) setStatus(pct < 100 ? `Creating depth… ${pct}%` : "Almost there…");
        });
        if (alive) {
          setFgUrl(url);
          setStatus("");
        }
      } catch {
        if (alive) {
          setFailed(true); // graceful fallback: whole-image tilt only
          setStatus("");
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [src]);

  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      target.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      };
      lastInput.current = performance.now();
    };
    window.addEventListener("pointermove", onPointer);

    const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    if (DOE && typeof DOE.requestPermission === "function") {
      setNeedsMotion(true);
    } else if (typeof window.DeviceOrientationEvent !== "undefined") {
      window.addEventListener("deviceorientation", handleOrient);
    }

    const tick = (t: number) => {
      // When idle, gently drift so the scene feels alive on its own.
      if (t - lastInput.current > 2200) {
        target.current = { x: Math.sin(t * 0.0004) * 0.35, y: Math.cos(t * 0.00031) * 0.22 };
      }
      currentPos.current.x += (target.current.x - currentPos.current.x) * 0.07;
      currentPos.current.y += (target.current.y - currentPos.current.y) * 0.07;
      const { x, y } = currentPos.current;

      if (cardRef.current) {
        cardRef.current.style.transform = `perspective(1300px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
      }
      if (bgRef.current) {
        bgRef.current.style.transform = `scale(1.06) translate(${x * -8}px, ${y * -8}px)`;
      }
      if (fgRef.current) {
        // Foreground moves ~3x more than background → real separation / pop.
        fgRef.current.style.transform = `scale(1.10) translate(${x * -24}px, ${y * -24}px)`;
      }
      if (sheenRef.current) {
        sheenRef.current.style.background = `radial-gradient(circle at ${50 + x * 40}% ${50 + y * 40}%, rgba(255,255,255,0.22), transparent 55%)`;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("deviceorientation", handleOrient);
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(raf.current);
    };
  }, [handleOrient, onClose]);

  const enableMotion = useCallback(async () => {
    const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    try {
      const r = await DOE.requestPermission?.();
      if (r === "granted") {
        setNeedsMotion(false);
        window.addEventListener("deviceorientation", handleOrient);
      }
    } catch {
      /* denied */
    }
  }, [handleOrient]);

  return (
    <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/95 p-4" style={{ touchAction: "none" }}>
      <button
        onClick={onClose}
        aria-label="Close 3D view"
        className="focusable absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
      >
        <X size={20} />
      </button>

      <div style={{ transformStyle: "preserve-3d" }}>
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-2xl shadow-2xl will-change-transform"
          style={{ width: "min(88vw, 460px)", height: "min(72vh, 860px)" }}
        >
          {/* Background layer */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={bgRef} src={src} alt={title} draggable={false} className="absolute inset-0 h-full w-full object-cover will-change-transform" />
          {/* slight dim so the popped subject reads as nearer */}
          <div className="pointer-events-none absolute inset-0 bg-black/10" />

          {/* Foreground subject layer — floats in front with a real shadow */}
          {fgUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              ref={fgRef}
              src={fgUrl}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover will-change-transform"
              style={{ filter: "drop-shadow(0 18px 28px rgba(0,0,0,0.55))" }}
            />
          )}

          <div ref={sheenRef} className="pointer-events-none absolute inset-0 mix-blend-soft-light" />
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />

          {status && (
            <div className="absolute inset-0 grid place-items-center bg-black/40 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2 text-white/90">
                <Sparkles size={20} className="animate-pulse text-accent" />
                <span className="text-sm">{status}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="mt-6 max-w-xs text-center text-sm text-white/70">
        {failed
          ? "Move your mouse or tilt your phone to look around"
          : needsMotion
            ? "Tilt your phone — your subject floats in 3D"
            : "Move your mouse — or tilt your phone — the subject pops in front"}
      </p>
      {needsMotion && (
        <button onClick={enableMotion} className="btn-accent focusable mt-3 h-11 rounded-pill px-5 text-sm font-semibold">
          Enable motion
        </button>
      )}
    </div>
  );
}
