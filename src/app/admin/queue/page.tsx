import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/server";
import { renderUrl } from "@/lib/supabase/storage";
import { EmptyState } from "@/components/empty-state";
import { GlassCard } from "@/components/ui/glass-card";
import { QueueActions } from "@/app/admin/queue/queue-actions";
import { formatBytes } from "@/lib/utils";
import type { Wallpaper } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function QueuePage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("wallpapers")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  const items = (data ?? []) as Wallpaper[];

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl font-bold">Review queue</h1>
      <p className="mt-1 text-sm text-chalk-muted">
        Community submissions. Approving publishes them instantly.
      </p>

      <div className="mt-8 space-y-4">
        {items.length === 0 ? (
          <EmptyState
            title="Queue's clear"
            body="No submissions waiting. New contributions land here for review."
          />
        ) : (
          items.map((w) => (
            <GlassCard key={w.id} interactive={false} className="flex flex-col gap-4 p-4 sm:flex-row">
              <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-card sm:w-48">
                <Image src={renderUrl(w.storage_path, { width: 400 })} alt={w.title} fill sizes="200px" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col">
                <p className="font-display text-lg font-semibold">{w.title}</p>
                <p className="mt-0.5 text-xs text-chalk-muted">
                  {w.width}×{w.height} · {formatBytes(w.file_size)} · {w.device}
                </p>
                {w.tags && w.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {w.tags.map((t) => (
                      <span key={t} className="surface rounded-pill px-2 py-0.5 text-[11px] text-chalk-muted">#{t}</span>
                    ))}
                  </div>
                )}
                <div className="mt-auto pt-3">
                  <QueueActions id={w.id} />
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}
