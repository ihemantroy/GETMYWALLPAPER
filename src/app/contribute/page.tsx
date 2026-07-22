"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Upload, Check, ImagePlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { DEVICES } from "@/lib/constants";
import type { Category } from "@/lib/types";
import { suggestDevices } from "@/lib/device";

/** Read intrinsic dimensions without uploading. */
function readDimensions(file: File): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve({ w: 0, h: 0 });
    img.src = URL.createObjectURL(file);
  });
}

export default function ContributePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [devices, setDevices] = useState<string[]>(["desktop"]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [credit, setCredit] = useState("");
  const [creditUrl, setCreditUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .from("categories")
      .select("id, slug, name, sort_order")
      .order("sort_order")
      .then(({ data }) => setCategories((data ?? []) as Category[]));
  }, []);

  function pick(f: File | undefined) {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
    // auto-pick suitable devices from the image shape
    readDimensions(f).then(({ w, h }) => setDevices(suggestDevices(w, h)));
  }

  async function submit() {
    if (!file || !title) return;
    setBusy(true);
    setError(null);
    try {
      const { w, h } = await readDimensions(file);
      const ext = file.name.split(".").pop() || "jpg";

      // 1) get a one-time signed upload URL from the server
      const signRes = await fetch("/api/submit/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type, ext }),
      });
      const sign = await signRes.json();
      if (!signRes.ok) throw new Error(sign.error || "Could not start upload");

      // 2) upload the file straight to storage (bypasses server size limits)
      const supabase = createClient();
      const { error: upErr } = await supabase.storage
        .from("wallpapers")
        .uploadToSignedUrl(sign.path, sign.token, file);
      if (upErr) throw new Error(upErr.message);

      // 3) record it in the review queue
      const finRes = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, path: sign.path, width: w, height: h, fileSize: file.size,
          device: devices[0] ?? "desktop", devices, categoryId: categoryId || null, tags,
          credit, creditUrl,
        }),
      });
      const fin = await finRes.json();
      if (!finRes.ok) throw new Error(fin.error || "Submission failed");

      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 pb-16 pt-28">
      <h1 className="mb-2 font-display text-3xl font-bold tracking-tight md:text-4xl">Contribute a wallpaper</h1>
      <p className="mb-8 text-chalk-muted">
        No account needed — submissions go to our review queue. Approved wallpapers publish automatically.
      </p>

      {done ? (
        <GlassCard interactive={false} className="p-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-pill bg-accent/15">
            <Check className="text-accent" size={26} />
          </div>
          <h2 className="font-display text-2xl font-semibold">Submitted for review</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-chalk-muted">
            Thanks — a curator will take a look. It goes live once approved.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <GlassButton href="/" variant="glass">Browse wallpapers</GlassButton>
            <GlassButton
              variant="iris"
              onClick={() => { setDone(false); setFile(null); setPreview(null); setTitle(""); setTags(""); }}
            >
              Submit another
            </GlassButton>
          </div>
        </GlassCard>
      ) : (
        <GlassCard interactive={false} className="space-y-5 p-6 md:p-8">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Image</span>
            <div className="relative flex min-h-[220px] items-center justify-center overflow-hidden rounded-card border border-dashed border-white/15 bg-white/[0.02]">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Preview" className="max-h-[320px] w-full object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-chalk-faint">
                  <ImagePlus size={28} />
                  <span className="text-sm">Tap to choose an image</span>
                </div>
              )}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                onChange={(e) => pick(e.target.files?.[0])}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </div>
          </label>

          <Field label="Title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midnight Gradient"
              className="focusable surface h-11 w-full rounded-pill px-4 text-sm text-chalk placeholder:text-chalk-faint"
            />
          </Field>

          <Field label="Works on" hint="pick one or more">
            <div className="flex flex-wrap gap-2">
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
                    className={`focusable rounded-pill px-4 py-2 text-xs font-medium transition ${
                      on ? "btn-accent" : "surface text-chalk-muted hover:text-chalk"
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Category">
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
          </Field>

          <Field label="Tags" hint="comma-separated — e.g. cyberpunk, neon, dark">
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="cyberpunk, neon, dark"
              className="focusable surface h-11 w-full rounded-pill px-4 text-sm text-chalk placeholder:text-chalk-faint"
            />
          </Field>

          <Field label="Credit" hint="your name / handle, or the original creator">
            <input
              value={credit}
              onChange={(e) => setCredit(e.target.value)}
              placeholder="e.g. @yourhandle"
              className="focusable surface h-11 w-full rounded-pill px-4 text-sm text-chalk placeholder:text-chalk-faint"
            />
          </Field>

          <Field label="Credit link" hint="optional — link to the creator">
            <input
              value={creditUrl}
              onChange={(e) => setCreditUrl(e.target.value)}
              placeholder="https://instagram.com/yourhandle"
              className="focusable surface h-11 w-full rounded-pill px-4 text-sm text-chalk placeholder:text-chalk-faint"
            />
          </Field>

          {error && <p className="text-sm text-accent-2">{error}</p>}

          <GlassButton variant="iris" size="lg" className="w-full" onClick={submit} disabled={!file || !title || busy}>
            <Upload size={18} /> {busy ? "Submitting…" : "Submit for review"}
          </GlassButton>
          <p className="text-center text-xs text-chalk-faint">
            By submitting you confirm you own the rights. See our{" "}
            <Link href="/terms" className="underline hover:text-chalk">terms</Link>.
          </p>
        </GlassCard>
      )}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-medium">{label}</span>
        {hint && <span className="text-xs text-chalk-faint">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
