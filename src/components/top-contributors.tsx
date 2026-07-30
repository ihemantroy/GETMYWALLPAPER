import Link from "next/link";
import { Award, ChevronRight, Upload } from "lucide-react";

const SLOTS = ["Be the first", "Open spot", "Open spot", "Open spot", "Open spot"];

export function TopContributors() {
  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
          <Award size={20} className="text-accent-2" /> Top Contributors
        </h2>
        <Link href="/contribute" className="focusable text-sm text-chalk-muted transition hover:text-chalk">
          View All <ChevronRight size={14} className="inline" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {SLOTS.map((label, i) => (
          <Link
            key={i}
            href="/contribute"
            className="focusable card-min group flex items-center gap-3 rounded-2xl p-4"
          >
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-dashed border-white/20 text-chalk-faint transition group-hover:border-accent group-hover:text-accent">
              <Upload size={16} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{i === 0 ? "You?" : "Open spot"}</p>
              <p className="truncate text-xs text-chalk-faint">{label}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
