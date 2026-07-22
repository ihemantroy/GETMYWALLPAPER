"use client";

import { useEffect, useState } from "react";
import { UploadCloud, Check, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createWallpaper } from "@/app/admin/actions";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { DEVICES } from "@/lib/constants";
import { suggestDevices } from "@/lib/device";
import type { Category } from "@/lib/types";
import { slugify, formatBytes } from "@/lib/utils";

type Item = {
  file: File;
  name: string;
  status: "queued" | "uploading" | "done" | "error";
  message?: string;
};

function readDimensions(file: File): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve({ w: 0, h: 0 });
    img.src = URL.createObjectURL(file);
  });
}

export default function AdminUploadPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [devices, setDevices] = useState<string[]>(["desktop"]);
  const [autoDevices, setAutoDevices] = useState(true);
  const [credit, setCredit] = useState("");
  const [creditUrl, setCreditUrl] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [schedule, setSchedule] = useState("");
  const [featured, setFeatured] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    createClient()
      .from("categories")
      .select("id, slug, name, sort_order")
      .order("sort_order")
      .then(({ data }) => setCategories((data ?? []) as Category[]));
  }, []);

  function add(files: FileList | null) {
    if (!files) return;
    setItems((prev) => [
      ...prev,
      ...Array.from(files).map((file) => ({
        file,
        name: file.name.replace(/\.[^.]+$/, ""),
        status: "queued" as const,
      })),
    ]);
  }

  function setName(i: number, v: string) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, name: v } : it)));
  }
  function remove(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function publishAll() {
    setRunning(true);
    const supabase = createClient();
    const tagList = tags.split(",").map((t) => slugify(t.trim())).filter(Boolean);

    for (let i = 0; i < items.length; i++) {
      if (items[i].status === "done") continue;
      setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, status: "uploading" } : it)));
      try {
        const { file, name } = items[i];
        const { w, h } = await readDimensions(file);
        const useDevices = autoDevices ? suggestDevices(w, h) : devices;
        const ext = file.name.split(".").pop() || "jpg";
        const path = `admin/${crypto.randomUUID()}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from("wallpapers")
          .upload(path, file, { cacheControl: "31536000", upsert: false });
        if (upErr) throw new Error(upErr.message);

        await createWallpaper({
          title: name,
          storage_path: path,
          width: w,
          height: h,
          file_size: file.size,
          device: useDevices[0] ?? "desktop",
          devices: useDevices,
          category_id: categoryId || null,
          credit: credit || null,
          credit_url: creditUrl || null,
          tags: tagList,
          scheduled_for: schedule || null,
          is_featured: featured,
        });

        setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, status: "done" } : it)));
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed";
        setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, status: "error", message } : it)));
      }
    }
    setRunning(false);
  }

  const pending = items.filter((i) => i.status !== "done").length;

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-bold">Upload wallpapers</h1>
      <p className="mt-1 text-sm text-chalk-muted">
        Drop one or many. Set a publish time to schedule a drop, or leave it blank to publish now.
      </p>

      <label className="mt-6 block">
        <div className="surface flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-2 rounded-card border border-dashed border-white/15 text-chalk-muted transition hover:bg-white/5">
          <UploadCloud size={28} className="text-accent" />
          <span className="text-sm">Click or drop images here (bulk supported)</span>
          <input
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/avif"
            onChange={(e) => add(e.target.files)}
            className="hidden"
          />
        </div>
      </label>

      <GlassCard interactive={false} className="mt-5 grid gap-4 p-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={autoDevices} onChange={(e) => setAutoDevices(e.target.checked)} className="h-4 w-4 accent-[#7C5CFF]" />
            Auto-detect devices from each image
          </label>
          <p className={`mb-2 text-sm font-medium ${autoDevices ? "opacity-40" : ""}`}>Or set manually <span className="text-chalk-faint">(pick one or more)</span></p>
          <div className={`flex flex-wrap gap-2 ${autoDevices ? "pointer-events-none opacity-40" : ""}`}>
            {DEVICES.map((d) => {
              const on = devices.includes(d.slug);
              return (
                <button
                  key={d.slug}
                  type="button"
                  onClick={() =>
                    setDevices((prev) =>
                      prev.includes(d.slug)
                        ? (prev.length > 1 ? prev.filter((x) => x !== d.slug) : prev)
                        : [...prev, d.slug],
                    )
                  }
                  className={`focusable rounded-pill px-3.5 py-1.5 text-xs font-medium transition ${
                    on ? "btn-accent" : "surface text-chalk-muted hover:text-chalk"
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Category <span className="text-chalk-faint">(applies to the whole batch)</span></p>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="focusable surface h-11 w-full rounded-pill px-4 text-sm text-chalk [color-scheme:dark]"
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {categories.length === 0 && (
            <p className="mt-1.5 text-xs text-chalk-faint">
              No categories yet — create some under Categories.
            </p>
          )}
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Tags (comma-separated)</p>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="cyberpunk, neon, dark"
            className="focusable surface h-11 w-full rounded-pill px-4 text-sm text-chalk placeholder:text-chalk-faint"
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Credit <span className="text-chalk-faint">(creator / owner)</span></p>
          <input
            value={credit}
            onChange={(e) => setCredit(e.target.value)}
            placeholder="e.g. @artist or Photographer Name"
            className="focusable surface h-11 w-full rounded-pill px-4 text-sm text-chalk placeholder:text-chalk-faint"
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Credit link <span className="text-chalk-faint">(optional)</span></p>
          <input
            value={creditUrl}
            onChange={(e) => setCreditUrl(e.target.value)}
            placeholder="https://instagram.com/artist"
            className="focusable surface h-11 w-full rounded-pill px-4 text-sm text-chalk placeholder:text-chalk-faint"
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Schedule publish (optional)</p>
          <input
            type="datetime-local"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            className="focusable surface h-11 w-full rounded-pill px-4 text-sm text-chalk [color-scheme:dark]"
          />
        </div>
        <label className="flex items-center gap-3 self-end pb-2">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="h-4 w-4 accent-[#7C5CFF]"
          />
          <span className="text-sm">Feature on homepage</span>
        </label>
      </GlassCard>

      {items.length > 0 && (
        <div className="mt-5 space-y-2">
          {items.map((it, i) => (
            <div key={i} className="surface flex items-center gap-3 rounded-card p-3">
              <StatusIcon status={it.status} />
              <input
                value={it.name}
                onChange={(e) => setName(i, e.target.value)}
                className="focusable h-9 flex-1 rounded-pill bg-white/5 px-3 text-sm text-chalk"
              />
              <span className="hidden text-xs text-chalk-faint sm:inline">{formatBytes(it.file.size)}</span>
              {it.status === "error" && <span className="text-xs text-accent-2">{it.message}</span>}
              {it.status !== "uploading" && (
                <button onClick={() => remove(i)} aria-label="Remove" className="text-chalk-faint hover:text-chalk">
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-6 flex items-center gap-3">
          <GlassButton variant="iris" size="lg" onClick={publishAll} disabled={running || pending === 0}>
            {running ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
            {schedule ? "Schedule" : "Publish"} {pending || items.length}
          </GlassButton>
          <button onClick={() => setItems([])} disabled={running} className="text-sm text-chalk-muted hover:text-chalk">
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: Item["status"] }) {
  if (status === "done") return <Check className="text-accent" size={18} />;
  if (status === "uploading") return <Loader2 className="animate-spin text-accent" size={18} />;
  if (status === "error") return <X className="text-accent-2" size={18} />;
  return <div className="h-2 w-2 rounded-full bg-chalk-faint" />;
}
