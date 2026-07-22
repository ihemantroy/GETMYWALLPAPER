"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Pencil, X, Loader2 } from "lucide-react";
import { updateWallpaper } from "@/app/admin/actions";
import { DEVICES } from "@/lib/constants";
import type { Category, Wallpaper } from "@/lib/types";

export function WallpaperEditor({ w, categories }: { w: Wallpaper; categories: Category[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(w.title);
  const [categoryId, setCategoryId] = useState(w.category_id ?? "");
  const [devices, setDevices] = useState<string[]>(
    w.devices && w.devices.length ? w.devices : [w.device].filter(Boolean),
  );
  const [tags, setTags] = useState((w.tags ?? []).join(", "));
  const [credit, setCredit] = useState(w.credit ?? "");
  const [creditUrl, setCreditUrl] = useState(w.credit_url ?? "");
  const [pending, start] = useTransition();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function save() {
    start(async () => {
      await updateWallpaper(w.id, {
        title,
        category_id: categoryId || null,
        devices: devices.length ? devices : ["desktop"],
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        credit: credit || null,
        credit_url: creditUrl || null,
      });
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Edit"
        className="focusable surface grid h-9 w-9 place-items-center rounded-pill text-chalk-muted transition hover:text-chalk"
      >
        <Pencil size={15} />
      </button>

      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/70 p-4" onClick={() => setOpen(false)}>
          <div
            className="glass-strong w-full max-w-md rounded-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">Edit wallpaper</h3>
              <button onClick={() => setOpen(false)} className="text-chalk-muted hover:text-chalk"><X size={18} /></button>
            </div>

            <label className="mb-3 block">
              <span className="mb-1.5 block text-xs uppercase tracking-widest text-chalk-faint">Title</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                className="focusable surface h-11 w-full rounded-pill px-4 text-sm text-chalk" />
            </label>

            <label className="mb-3 block">
              <span className="mb-1.5 block text-xs uppercase tracking-widest text-chalk-faint">Category</span>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                className="focusable surface h-11 w-full rounded-pill px-4 text-sm text-chalk [color-scheme:dark]">
                <option value="">No category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>

            <div className="mb-3">
              <span className="mb-1.5 block text-xs uppercase tracking-widest text-chalk-faint">Devices</span>
              <div className="flex flex-wrap gap-2">
                {DEVICES.map((d) => {
                  const on = devices.includes(d.slug);
                  return (
                    <button key={d.slug} type="button"
                      onClick={() => setDevices((p) => p.includes(d.slug) ? (p.length > 1 ? p.filter((x) => x !== d.slug) : p) : [...p, d.slug])}
                      className={`focusable rounded-pill px-3.5 py-1.5 text-xs font-medium transition ${on ? "btn-accent" : "surface text-chalk-muted hover:text-chalk"}`}>
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="mb-5 block">
              <span className="mb-1.5 block text-xs uppercase tracking-widest text-chalk-faint">Tags</span>
              <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="neon, dark"
                className="focusable surface h-11 w-full rounded-pill px-4 text-sm text-chalk placeholder:text-chalk-faint" />
            </label>

            <label className="mb-3 block">
              <span className="mb-1.5 block text-xs uppercase tracking-widest text-chalk-faint">Credit</span>
              <input value={credit} onChange={(e) => setCredit(e.target.value)} placeholder="@artist"
                className="focusable surface h-11 w-full rounded-pill px-4 text-sm text-chalk placeholder:text-chalk-faint" />
            </label>
            <label className="mb-5 block">
              <span className="mb-1.5 block text-xs uppercase tracking-widest text-chalk-faint">Credit link</span>
              <input value={creditUrl} onChange={(e) => setCreditUrl(e.target.value)} placeholder="https://…"
                className="focusable surface h-11 w-full rounded-pill px-4 text-sm text-chalk placeholder:text-chalk-faint" />
            </label>

            <div className="flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="surface focusable h-10 rounded-pill px-4 text-sm text-chalk-muted hover:text-chalk">Cancel</button>
              <button onClick={save} disabled={pending}
                className="btn-accent focusable inline-flex h-10 items-center gap-2 rounded-pill px-5 text-sm font-semibold disabled:opacity-50">
                {pending ? <Loader2 size={15} className="animate-spin" /> : null} Save
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
