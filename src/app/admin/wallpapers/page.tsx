import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/server";
import { renderUrl } from "@/lib/supabase/storage";
import { GlassCard } from "@/components/ui/glass-card";
import { EmptyState } from "@/components/empty-state";
import { WallpaperRowActions } from "@/app/admin/wallpapers/row-actions";
import { WallpaperEditor } from "@/app/admin/wallpapers/editor";
import { formatCount } from "@/lib/utils";
import type { Wallpaper, Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminWallpapers() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("wallpapers")
    .select("*")
    .in("status", ["published", "scheduled"])
    .order("created_at", { ascending: false })
    .limit(100);
  const items = (data ?? []) as Wallpaper[];
  const { data: cats } = await admin.from("categories").select("id, slug, name, sort_order").order("sort_order");
  const categories = (cats ?? []) as Category[];

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl font-bold">Wallpapers</h1>
      <p className="mt-1 text-sm text-chalk-muted">Manage your published and scheduled catalog.</p>

      <div className="mt-8 space-y-2">
        {items.length === 0 ? (
          <EmptyState title="Nothing published" body="Upload wallpapers to see them here." cta={{ href: "/admin/upload", label: "Upload" }} />
        ) : (
          items.map((w) => (
            <GlassCard key={w.id} interactive={false} className="flex items-center gap-4 p-3">
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
                <Image src={renderUrl(w.storage_path, { width: 200 })} alt={w.title} fill sizes="80px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{w.title}</p>
                <p className="text-xs text-chalk-faint">
                  {w.status === "scheduled" ? "Scheduled" : "Published"} · {formatCount(w.download_count)} downloads · {(w.devices && w.devices.length ? w.devices : [w.device]).join(", ")}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <WallpaperEditor w={w} categories={categories} />
                <WallpaperRowActions id={w.id} storagePath={w.storage_path} featured={w.is_featured} wotd={w.is_wotd} />
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}
