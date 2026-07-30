import { CountUp } from "@/components/count-up";
import { Reveal } from "@/components/reveal";

export function StatsBand({ wallpapers, categories, downloads }: { wallpapers: number; categories: number; downloads: number }) {
  const stats = [
    { node: <CountUp value={wallpapers} suffix="+" />, label: "Wallpapers" },
    { node: <CountUp value={downloads} suffix="+" />, label: "Downloads" },
    { node: <CountUp value={categories} />, label: "Categories" },
    { node: "4K", label: "Quality" },
  ];
  return (
    <Reveal>
      <div className="grid grid-cols-2 gap-4 rounded-3xl border border-white/[0.06] bg-white/[0.015] p-8 backdrop-blur-xl sm:grid-cols-4 sm:p-10">
        {stats.map((s, i) => (
          <div key={i} className="text-center">
            <p className="font-display text-4xl font-bold tracking-tight text-chalk sm:text-5xl">{s.node}</p>
            <p className="mt-2 text-xs uppercase tracking-widest text-chalk-faint">{s.label}</p>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
