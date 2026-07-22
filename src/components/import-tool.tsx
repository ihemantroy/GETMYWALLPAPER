"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, Download, Check, Loader2, Flame } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/types";

type Source = "pexels" | "unsplash";
type Photo = {
  id: number | string; width: number; height: number;
  photographer: string; photographer_url: string;
  alt: string; thumb: string; original: string;
  download_location?: string | null;
};
type Status = "idle" | "importing" | "done" | "error";

const CHIPS = ["Nature", "Abstract", "Space", "Minimal", "Dark", "Neon", "Mountains", "Ocean", "City", "Aesthetic", "Cars", "Sky"];

export function ImportTool() {
  const [source, setSource] = useState<Source>("pexels");
  const [q, setQ] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [bulk, setBulk] = useState(false);

  useEffect(() => {
    createClient().from("categories").select("id, slug, name, sort_order").order("sort_order")
      .then(({ data }) => setCategories((data ?? []) as Category[]));
  }, []);

  const load = useCallback(async (src: Source, query: string, p: number, append: boolean) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/admin/${src}/search?q=${encodeURIComponent(query)}&page=${p}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setPhotos((prev) => (append ? [...prev, ...data.photos] : data.photos));
      setPage(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
      if (!append) setPhotos([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(source, q, 1, false); /* eslint-disable-next-line */ }, [source]);

  function matchCategory(text: string): string {
    const t = (text || "").toLowerCase();
    for (const c of categories) {
      if (t.includes(c.slug.toLowerCase()) || t.includes(c.name.toLowerCase())) return c.id;
    }
    return "";
  }

  async function importOne(photo: Photo) {
    const key = String(photo.id);
    // if no category chosen, auto-match from the search term or the photo's description
    const cid = categoryId || matchCategory(q) || matchCategory(photo.alt) || null;
    setStatus((s) => ({ ...s, [key]: "importing" }));
    try {
      const res = await fetch(`/api/admin/${source}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...photo, categoryId: cid }),
      });
      setStatus((s) => ({ ...s, [key]: res.ok ? "done" : "error" }));
    } catch {
      setStatus((s) => ({ ...s, [key]: "error" }));
    }
  }

  async function importAll() {
    setBulk(true);
    for (const p of photos) {
      if (status[String(p.id)] === "done") continue;
      await importOne(p);
    }
    setBulk(false);
  }

  const Tab = ({ s, label }: { s: Source; label: string }) => (
    <button
      onClick={() => { setSource(s); setStatus({}); }}
      className={`focusable rounded-pill px-4 py-2 text-sm font-medium transition ${source === s ? "btn-accent" : "surface text-chalk-muted hover:text-chalk"}`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className="mb-5 flex gap-2">
        <Tab s="pexels" label="Pexels" />
        <Tab s="unsplash" label="Unsplash" />
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={(e) => { e.preventDefault(); load(source, q, 1, false); }} className="relative flex-1">
          <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-chalk-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search — or leave blank for most popular"
            className="focusable surface h-11 w-full rounded-pill pl-11 pr-4 text-sm text-chalk placeholder:text-chalk-faint" />
        </form>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
          className="focusable surface h-11 rounded-pill px-4 text-sm text-chalk [color-scheme:dark]">
          <option value="">Auto — match to a category</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button onClick={importAll} disabled={bulk || photos.length === 0}
          className="btn-accent focusable inline-flex h-11 items-center gap-2 rounded-pill px-5 text-sm font-semibold disabled:opacity-50">
          {bulk ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Import all on page
        </button>
      </div>

      <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1">
        <button onClick={() => { setQ(""); load(source, "", 1, false); }}
          className="surface focusable inline-flex shrink-0 items-center gap-1.5 rounded-pill px-3.5 py-1.5 text-xs text-chalk-muted hover:text-chalk">
          <Flame size={12} /> Popular
        </button>
        {CHIPS.map((c) => (
          <button key={c} onClick={() => { setQ(c); load(source, c, 1, false); }}
            className="surface focusable shrink-0 rounded-pill px-3.5 py-1.5 text-xs text-chalk-muted hover:text-chalk">{c}</button>
        ))}
      </div>

      {error && <p className="mb-4 text-sm text-accent-2">{error}</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((p) => {
          const st = status[String(p.id)] ?? "idle";
          return (
            <div key={String(p.id)} className="surface overflow-hidden rounded-card">
              <div className="relative aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumb} alt={p.alt} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="p-3">
                <p className="truncate text-xs text-chalk-muted">by {p.photographer}</p>
                <button onClick={() => importOne(p)} disabled={st === "importing" || st === "done"}
                  className={`focusable mt-2 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-pill text-xs font-semibold transition ${
                    st === "done" ? "surface text-accent" : "btn-accent"
                  } disabled:opacity-70`}>
                  {st === "importing" ? <Loader2 size={13} className="animate-spin" /> :
                   st === "done" ? <><Check size={13} /> Imported</> :
                   st === "error" ? "Retry" : <><Download size={13} /> Import</>}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {photos.length > 0 && (
        <div className="mt-8 text-center">
          <button onClick={() => load(source, q, page + 1, true)} disabled={loading}
            className="surface focusable inline-flex h-11 items-center gap-2 rounded-pill px-6 text-sm text-chalk-muted hover:text-chalk disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null} Load more
          </button>
        </div>
      )}
      {loading && photos.length === 0 && <p className="text-sm text-chalk-muted">Loading popular wallpapers…</p>}
    </div>
  );
}
