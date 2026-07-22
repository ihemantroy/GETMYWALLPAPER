import Image from "next/image";
import { Download } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import { renderUrl, publicUrl } from "@/lib/supabase/storage";
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
              <a
                href={publicUrl(w.storage_path)}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-video w-full shrink-0 overflow-hidden rounded-card ring-1 ring-white/10 sm:w-48"
              >
                <Image src={renderUrl(w.storage_path, { width: 400 })} alt={w.title} fill sizes="200px" className="object-cover" />
                <span className="absolute inset-0 grid place-items-center bg-black/40 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                  View full size
                </span>
              </a>
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
                <div className="mt-auto flex flex-wrap items-center gap-3 pt-3">
                  <QueueActions id={w.id} />
                  <a
                    href={publicUrl(w.storage_path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="surface focusable inline-flex h-10 items-center gap-2 rounded-pill px-4 text-sm text-chalk-muted transition hover:text-chalk"
                  >
                    <Download size={15} /> View full
                  </a>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}
