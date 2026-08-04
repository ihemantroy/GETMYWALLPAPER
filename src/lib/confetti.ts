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

// ============================================================================
//  partyPoppers() — the big waitlist celebration.
//  Multi-emitter cannon burst: both bottom corners fire up-and-inward, a
//  top-center fountain rains down, and a delayed second "bang" doubles it up.
//  Squares, dots, ribbons, spinning streamers and stars in brand colors.
//  Dependency-free, self-cleaning, and honors prefers-reduced-motion.
// ============================================================================

type Shape = "square" | "dot" | "ribbon" | "star" | "streamer";

type Popper = {
  x: number; y: number; vx: number; vy: number;
  size: number; color: string; rot: number; vr: number;
  shape: Shape; wob: number; wobSpeed: number; drag: number; born: number;
};

const PARTY_COLORS = [
  "#16B089", // teal (accent-2)
  "#2DD4A7", // mint
  "#0D8B6C", // brand green (accent)
  "#5EEAD4", // aqua
  "#FBBF24", // gold
  "#FFFFFF", // white
  "#F472B6", // pink pop
  "#60A5FA", // blue pop
];

function drawStar(c: CanvasRenderingContext2D, r: number) {
  c.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    i === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
  }
  c.closePath();
  c.fill();
}

export function partyPoppers(durationMs = 3200): void {
  if (typeof window === "undefined") return;

  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText =
    "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483647";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) { canvas.remove(); return; }
  const c = ctx;

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

  const parts: Popper[] = [];
  const pick = () => PARTY_COLORS[(Math.random() * PARTY_COLORS.length) | 0];
  const shapeOf = (): Shape => {
    const r = Math.random();
    if (r < 0.36) return "square";
    if (r < 0.58) return "dot";
    if (r < 0.78) return "ribbon";
    if (r < 0.9) return "streamer";
    return "star";
  };

  // Fire a cannon of `n` pieces from (ox,oy) in a cone around `angle` (radians).
  function cannon(n: number, ox: number, oy: number, angle: number, spread: number, power: number, born: number) {
    for (let i = 0; i < n; i++) {
      const a = angle + (Math.random() - 0.5) * spread;
      const sp = power * (0.55 + Math.random() * 0.6);
      const shape = shapeOf();
      parts.push({
        x: ox, y: oy,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        size: (shape === "streamer" ? 14 : 6) + Math.random() * 8,
        color: pick(),
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.4,
        shape,
        wob: Math.random() * Math.PI * 2,
        wobSpeed: 0.05 + Math.random() * 0.08,
        drag: 0.985 + Math.random() * 0.01,
        born,
      });
    }
  }

  const base = reduce ? 40 : Math.min(160, Math.max(90, Math.floor(W() / 9)));

  const fireVolley = (t: number) => {
    // bottom-left → up and to the right
    cannon(base, 4, H() - 4, -Math.PI / 2.35, 0.9, 20, t);
    // bottom-right → up and to the left
    cannon(base, W() - 4, H() - 4, -Math.PI + Math.PI / 2.35, 0.9, 20, t);
    // top-center fountain → gentle rain
    cannon(Math.floor(base * 0.7), W() / 2, -10, Math.PI / 2, Math.PI, 8, t);
  };

  const start = performance.now();
  fireVolley(start);
  // Second "bang" for a double-pop, unless reduced motion.
  const secondAt = reduce ? Infinity : start + 340;

  const gravity = 0.34;
  let raf = 0;
  let fired2 = false;

  const cleanup = () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    canvas.style.transition = "opacity 500ms ease";
    canvas.style.opacity = "0";
    window.setTimeout(() => canvas.remove(), 520);
  };

  const frame = (now: number) => {
    const elapsed = now - start;
    if (!fired2 && now >= secondAt) { fireVolley(now); fired2 = true; }

    c.clearRect(0, 0, W(), H());
    for (const p of parts) {
      p.vy += gravity;
      p.vx *= p.drag;
      p.wob += p.wobSpeed;
      // ribbons & streamers flutter sideways as they fall
      const sway = p.shape === "ribbon" || p.shape === "streamer" ? Math.sin(p.wob) * 1.6 : 0;
      p.x += p.vx + sway;
      p.y += p.vy;
      p.rot += p.vr;

      const age = now - p.born;
      const fade = age > durationMs * 0.7 ? Math.max(0, 1 - (age - durationMs * 0.7) / (durationMs * 0.3)) : 1;

      c.save();
      c.globalAlpha = fade;
      c.translate(p.x, p.y);
      c.rotate(p.rot);
      c.fillStyle = p.color;
      const s = p.size;
      if (p.shape === "square") c.fillRect(-s / 2, -s / 2, s, s);
      else if (p.shape === "dot") { c.beginPath(); c.arc(0, 0, s / 2, 0, Math.PI * 2); c.fill(); }
      else if (p.shape === "ribbon") c.fillRect(-s / 2, -s / 6, s, s / 3);
      else if (p.shape === "streamer") c.fillRect(-s / 2, -1.5, s, 3);
      else drawStar(c, s / 1.6);
      c.restore();
    }

    if (elapsed < durationMs) raf = requestAnimationFrame(frame);
    else cleanup();
  };

  raf = requestAnimationFrame(frame);
}
