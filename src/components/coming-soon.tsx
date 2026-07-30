import { Play, Bell, Sparkles, Layers } from "lucide-react";

const TEASERS = [
  {
    icon: Sparkles,
    title: "AI Studio for everyone",
    body: "Describe a wallpaper and generate it — coming to every visitor.",
  },
  {
    icon: Layers,
    title: "Collections & packs",
    body: "Curated bundles you can download in one tap.",
  },
];

export function ComingSoon() {
  return (
    <section>
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent/80">Coming soon</p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">The next drop</h2>
        <p className="mt-3 text-chalk-muted">Big things are on the way. Here&apos;s a peek at what&apos;s landing next.</p>
      </div>

      <div className="mt-12 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* Featured: Live Wallpapers */}
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] p-8 sm:p-10">
          <div className="live-mesh absolute inset-0 opacity-45" aria-hidden />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-transparent" aria-hidden />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              Coming soon
            </span>
            <div className="mt-6 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 backdrop-blur">
                <Play size={22} className="translate-x-0.5 fill-white text-white" />
              </div>
              <h3 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Live Wallpapers</h3>
            </div>
            <p className="mt-4 max-w-md text-chalk-muted">
              Smooth, looping, battery-friendly moving wallpapers for your phone. Motion that makes your
              home screen feel alive — arriving soon on GetYourWallpaper.
            </p>
            <a
              href="mailto:ihemantroy@gmail.com?subject=Notify%20me%20about%20Live%20Wallpapers"
              className="btn-accent focusable mt-7 inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold"
            >
              <Bell size={16} /> Notify me
            </a>
          </div>
        </div>

        {/* Smaller teasers */}
        <div className="grid gap-4">
          {TEASERS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="card-min flex flex-col justify-center rounded-3xl p-7">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-accent">
                  <Icon size={18} />
                </div>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-chalk-faint">
                  Soon
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-chalk-muted">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
