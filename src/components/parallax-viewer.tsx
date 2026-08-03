"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Boxes, X } from "lucide-react";

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

/** Button + fullscreen 3D parallax overlay for a wallpaper. */
export function ParallaxButton({ src, title }: { src: string; title: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="3D view"
        aria-label="Open 3D view"
        className="focusable grid h-11 w-11 place-items-center rounded-full border border-line text-chalk-muted transition hover:text-chalk"
      >
        <Boxes size={18} />
      </button>
      {open && <ParallaxOverlay src={src} title={title} onClose={() => setOpen(false)} />}
    </>
  );
}

function ParallaxOverlay({ src, title, onClose }: { src: string; title: string; onClose: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const raf = useRef(0);
  const [needsMotion, setNeedsMotion] = useState(false);

  // Stable orientation handler so we can add it from the effect AND from the
  // iOS "enable motion" button, and clean up either way.
  const handleOrient = useCallback((e: DeviceOrientationEvent) => {
    const gamma = e.gamma ?? 0; // left-right tilt
    const beta = e.beta ?? 0;   // front-back tilt
    target.current = { x: clamp(gamma / 35), y: clamp((beta - 45) / 35) };
  }, []);

  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      target.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      };
    };
    window.addEventListener("pointermove", onPointer);

    // iOS 13+ requires explicit permission for motion; Android just works.
    const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    if (DOE && typeof DOE.requestPermission === "function") {
      setNeedsMotion(true);
    } else if (typeof window.DeviceOrientationEvent !== "undefined") {
      window.addEventListener("deviceorientation", handleOrient);
    }

    // Smooth follow loop (lerp) for buttery motion.
    const tick = () => {
      currentPos.current.x += (target.current.x - currentPos.current.x) * 0.08;
      currentPos.current.y += (target.current.y - currentPos.current.y) * 0.08;
      const { x, y } = currentPos.current;
      if (cardRef.current) {
        cardRef.current.style.transform = `perspective(1200px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
      }
      if (imgRef.current) {
        imgRef.current.style.transform = `scale(1.14) translate(${x * -18}px, ${y * -18}px)`;
      }
      if (sheenRef.current) {
        sheenRef.current.style.background = `radial-gradient(circle at ${50 + x * 40}% ${50 + y * 40}%, rgba(255,255,255,0.30), transparent 55%)`;
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
      const res = await DOE.requestPermission?.();
      if (res === "granted") {
        setNeedsMotion(false);
        window.addEventListener("deviceorientation", handleOrient);
      }
    } catch {
      /* user denied — pointer/tilt just won't drive it */
    }
  }, [handleOrient]);

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/90 p-4"
      style={{ touchAction: "none" }}
    >
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={src}
            alt={title}
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover will-change-transform"
          />
          <div ref={sheenRef} className="pointer-events-none absolute inset-0 mix-blend-soft-light" />
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
        </div>
      </div>

      <p className="mt-6 max-w-xs text-center text-sm text-white/70">
        {needsMotion ? "Tilt your phone to look around the wallpaper" : "Move your mouse — or tilt your phone — to look around"}
      </p>
      {needsMotion && (
        <button onClick={enableMotion} className="btn-accent focusable mt-3 h-11 rounded-pill px-5 text-sm font-semibold">
          Enable motion
        </button>
      )}
    </div>
  );
}
