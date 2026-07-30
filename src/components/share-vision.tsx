import Link from "next/link";
import { Upload, CloudUpload } from "lucide-react";

export function ShareVision() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-accent/10 via-white/[0.02] to-accent-2/10 p-8 sm:p-12">
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Share Your Vision.<br />Inspire Millions.
          </h2>
          <p className="mt-4 max-w-md text-chalk-muted">
            Upload your best wallpapers and get featured on our homepage. Join a growing community of creators.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/contribute" className="btn-accent focusable inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold">
              <Upload size={16} /> Upload Wallpaper
            </Link>
            <Link href="/about" className="focusable inline-flex h-12 items-center rounded-full border border-white/15 px-6 text-sm font-medium text-chalk transition hover:border-white/30 hover:bg-white/[0.04]">
              Learn More
            </Link>
          </div>
        </div>

        {/* floating glass cards (no images) */}
        <div className="relative hidden h-56 lg:block">
          <div className="absolute left-1/2 top-1/2 z-10 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full btn-accent shadow-glow">
            <CloudUpload size={30} className="text-white" />
          </div>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`absolute top-1/2 h-36 w-28 -translate-y-1/2 rounded-2xl border border-white/15 shadow-lift backdrop-blur-xl bg-gradient-to-br ${
                i === 0 ? "left-[18%] -rotate-12 from-accent/40 to-accent-2/15 float"
                : i === 1 ? "left-[42%] rotate-3 from-accent-2/35 to-accent/15 float-2"
                : "left-[64%] rotate-12 from-white/10 to-white/[0.02] float-3"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
