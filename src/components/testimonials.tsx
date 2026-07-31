import { Star } from "lucide-react";
import type { Testimonial } from "@/lib/types";

// Fallback so the marquee never renders empty even if no reviews are passed in.
const FALLBACK: Testimonial[] = [
  { name: "Pritam", text: "Every wallpaper just fits — no cropping, no stretching. My home screen finally looks premium.", role: "Phone" },
  { name: "Aman", text: "Grabbed a 4K one for my laptop and it looks unreal. The quality here is on another level.", role: "Desktop" },
  { name: "Shubham", text: "Clean, fast, and free. One-tap download at my exact resolution is genius.", role: "Phone" },
];

function Card({ name, text, role, rating = 5 }: Testimonial) {
  const stars = Math.min(5, Math.max(1, rating || 5));
  return (
    <div className="w-80 shrink-0 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl">
      <div className="flex gap-0.5 text-accent-2">
        {Array.from({ length: stars }).map((_, i) => (
          <Star key={i} size={14} className="fill-accent-2" />
        ))}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-chalk-muted">&ldquo;{text}&rdquo;</p>
      <div className="mt-4 flex items-center gap-2.5">
        <div className="grid h-8 w-8 place-items-center rounded-full btn-accent text-xs font-bold">{name.charAt(0)}</div>
        <div className="leading-tight">
          <p className="text-sm font-medium">{name}</p>
          {role && <p className="text-[11px] text-chalk-faint">{role}</p>}
        </div>
      </div>
    </div>
  );
}

export function Testimonials({ reviews }: { reviews?: Testimonial[] }) {
  const list = reviews && reviews.length ? reviews : FALLBACK;
  // duplicate so the marquee scrolls seamlessly
  const loop = [...list, ...list];
  return (
    <section>
      <div className="mb-6 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent/80">Loved by users</p>
        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">What people say</h2>
      </div>
      <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        <div className="marquee-x gap-4">
          {loop.map((r, i) => <Card key={(r.id ?? r.name) + i} {...r} />)}
        </div>
      </div>
    </section>
  );
}
