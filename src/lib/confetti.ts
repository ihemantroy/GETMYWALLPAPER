// Dependency-free, full-screen confetti burst. No libraries to install.
// Call celebrate() once — it creates a canvas over everything, animates, and
// cleans itself up.

type Particle = {
  x: number; y: number; vx: number; vy: number;
  size: number; color: string; rot: number; vr: number; shape: number;
};

export function celebrate(durationMs = 2600): void {
  if (typeof window === "undefined") return;

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText =
    "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483647";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) { canvas.remove(); return; }
  const c = ctx; // non-null alias for closures

  const dpr = window.devicePixelRatio || 1;
  const W = () => window.innerWidth;
  const H = () => window.innerHeight;
  const resize = () => {
    canvas.width = W() * dpr;
    canvas.height = H() * dpr;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  const colors = ["#22c55e", "#4ade80", "#a3e635", "#facc15", "#38bdf8", "#f472b6", "#ffffff"];
  const count = Math.min(240, Math.max(120, Math.floor(W() / 5)));
  const parts: Particle[] = [];
  // Fire two jets from the bottom corners toward the middle.
  for (let i = 0; i < count; i++) {
    const fromLeft = i % 2 === 0;
    parts.push({
      x: fromLeft ? 0 : W(),
      y: H() + 10,
      vx: (fromLeft ? 1 : -1) * (Math.random() * 7 + 4),
      vy: -(Math.random() * 13 + 9),
      size: Math.random() * 8 + 5,
      color: colors[(Math.random() * colors.length) | 0],
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.35,
      shape: (Math.random() * 3) | 0,
    });
  }

  const gravity = 0.32;
  const start = performance.now();
  let raf = 0;

  const cleanup = () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    canvas.style.transition = "opacity 400ms ease";
    canvas.style.opacity = "0";
    window.setTimeout(() => canvas.remove(), 450);
  };

  const frame = (now: number) => {
    const elapsed = now - start;
    c.clearRect(0, 0, W(), H());
    for (const p of parts) {
      p.vy += gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.99;
      p.rot += p.vr;
      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.rot);
      c.fillStyle = p.color;
      const s = p.size;
      if (p.shape === 0) c.fillRect(-s / 2, -s / 2, s, s);            // square
      else if (p.shape === 1) { c.beginPath(); c.arc(0, 0, s / 2, 0, Math.PI * 2); c.fill(); } // dot
      else c.fillRect(-s / 2, -s / 6, s, s / 3);                      // ribbon
      c.restore();
    }
    if (elapsed < durationMs) raf = requestAnimationFrame(frame);
    else cleanup();
  };

  raf = requestAnimationFrame(frame);
}
