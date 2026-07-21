import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 text-center">
      <GlassCard interactive={false} className="p-12">
        <p className="font-display text-7xl font-bold text-accent">404</p>
        <h1 className="mt-4 font-display text-2xl font-semibold">This wall is blank</h1>
        <p className="mt-2 text-sm text-chalk-muted">
          The page you&apos;re after doesn&apos;t exist — but there are thousands of wallpapers that do.
        </p>
        <Link
          href="/"
          className="focusable mt-6 inline-flex h-11 items-center rounded-pill px-6 text-sm font-semibold btn-accent"
        >
          Browse wallpapers
        </Link>
      </GlassCard>
    </div>
  );
}
