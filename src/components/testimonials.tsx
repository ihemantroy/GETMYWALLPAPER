import { Star } from "lucide-react";

const REVIEWS = [
  { name: "Aditya R.", text: "Finally a wallpaper site that fits my phone perfectly. No cropping, no fuss." },
  { name: "Meera K.", text: "The quality is unreal — grabbed a 4K one for my desktop, looks stunning." },
  { name: "Sam O.", text: "Clean, fast, and free. This is how a wallpaper site should feel." },
  { name: "Priya S.", text: "Love the daily drops. My home screen has never looked this good." },
  { name: "Dev M.", text: "The one-tap download at my exact resolution is genius. Bookmarked." },
  { name: "Lena T.", text: "Feels like a premium app, not a website. Beautiful design." },
];

function Card({ name, text }: { name: string; text: string }) {
  return (
    <div className="w-80 shrink-0 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl">
      <div className="flex gap-0.5 text-accent-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={14} className="fill-accent-2" />
        ))}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-chalk-muted">&ldquo;{text}&rdquo;</p>
      <div className="mt-4 flex items-center gap-2.5">
        <div className="grid h-8 w-8 place-items-center rounded-full btn-accent text-xs font-bold">
          {name.charAt(0)}
        </div>
        <span className="text-sm font-medium">{name}</span>
      </div>
    </div>
  );
}

export function Testimonials() {
  const loop = [...REVIEWS, ...REVIEWS];
  return (
    <section>
      <div className="mb-6 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent/80">Loved worldwide</p>
        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">What people say</h2>
      </div>
      <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        <div className="marquee-x gap-4">
          {loop.map((r, i) => (
            <Card key={i} {...r} />
          ))}
        </div>
      </div>
    </section>
  );
}
