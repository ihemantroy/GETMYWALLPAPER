import Link from "next/link";
import { Upload, Inbox, Images, Download, Eye } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/glass-card";
import { formatCount } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function stats() {
  const admin = createAdminClient();
  const [pub, pend, agg] = await Promise.all([
    admin.from("wallpapers").select("id", { count: "exact", head: true }).eq("status", "published"),
    admin.from("wallpapers").select("id", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("wallpapers").select("view_count, download_count").eq("status", "published"),
  ]);
  type Row = { view_count?: number; download_count?: number };
  const rows: Row[] = agg.data ?? [];
  const views = rows.reduce((s: number, r: Row) => s + (r.view_count ?? 0), 0);
  const downloads = rows.reduce((s: number, r: Row) => s + (r.download_count ?? 0), 0);
  return { published: pub.count ?? 0, pending: pend.count ?? 0, views, downloads };
}

export default async function AdminDashboard() {
  const s = await stats();
  const cards = [
    { label: "Published", value: formatCount(s.published), icon: Images },
    { label: "In review", value: formatCount(s.pending), icon: Inbox, href: "/admin/queue" },
    { label: "Total views", value: formatCount(s.views), icon: Eye },
    { label: "Total downloads", value: formatCount(s.downloads), icon: Download },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-chalk-muted">Your catalog at a glance.</p>
        </div>
        <Link href="/admin/upload" className="focusable inline-flex h-11 items-center gap-2 rounded-pill px-5 text-sm font-semibold btn-accent">
          <Upload size={17} /> Upload
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const inner = (
            <GlassCard interactive={false} className="p-6">
              <c.icon className="mb-3 text-accent" size={20} />
              <p className="font-display text-3xl font-bold">{c.value}</p>
              <p className="mt-1 text-sm text-chalk-muted">{c.label}</p>
            </GlassCard>
          );
          return c.href ? (
            <Link key={c.label} href={c.href} className="focusable block">{inner}</Link>
          ) : (
            <div key={c.label}>{inner}</div>
          );
        })}
      </div>

      {s.pending > 0 && (
        <GlassCard interactive={false} className="mt-6 flex items-center justify-between p-6">
          <p className="text-sm text-chalk">
            <b>{s.pending}</b> community submission{s.pending > 1 ? "s" : ""} waiting for review.
          </p>
          <Link href="/admin/queue" className="focusable text-sm font-semibold text-accent hover:underline">
            Review now →
          </Link>
        </GlassCard>
      )}
    </div>
  );
}
