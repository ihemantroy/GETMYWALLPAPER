"use client";

import { useState } from "react";
import { Wand2, Loader2, Download, UploadCloud, Check, X, RotateCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GlassButton } from "@/components/ui/glass-button";
import { publicUrl } from "@/lib/supabase/storage";
import { slugify } from "@/lib/utils";
import type { Wallpaper } from "@/lib/types";

const IDEAS = ["make it night time", "add falling snow", "turn it into watercolor", "make the sky vivid orange sunset"];

function quality(px: number) {
  return px >= 7000 ? "8K" : px >= 3840 ? "4K" : px >= 2560 ? "2K" : "HD";
}

/**
 * Same framed preview as WallpaperImage, plus a click-to-edit affordance.
 * Editing uses Pollinations' free "kontext" image-to-image model — no API key.
 */
export function WallpaperEditor({ w }: { w: Wallpaper }) {
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedUrl, setEditedUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const dw = nat?.w || w.width || 4;
  const dh = nat?.h || w.height || 3;
  const label = dw / dh > 1.15 ? "Landscape" : dw / dh < 0.87 ? "Portrait" : "Square";
  const originalUrl = publicUrl(w.storage_path);
  const shownUrl = editedUrl ?? originalUrl;

  async function applyEdit() {
    if (!prompt.trim() || busy) return;
    setBusy(true);
    setError(null);
    setSubmitted(false);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, width: dw, height: dh, image: shownUrl }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Edit failed");
      setEditedUrl(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Edit failed");
    } finally {
      setBusy(false);
    }
  }

  async function download() {
    const res = await fetch(shownUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(w.title)}-edited.jpg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function publishAsNew() {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const imgRes = await fetch(shownUrl);
      const blob = await imgRes.blob();
      const signRes = await fetch("/api/submit/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: blob.type || "image/jpeg", ext: "jpg" }),
      });
      const sign = await signRes.json();
      if (!signRes.ok) throw new Error(sign.error || "Could not start upload");

      const supabase = createClient();
      const { error: upErr } = await supabase.storage.from("wallpapers").uploadToSignedUrl(sign.path, sign.token, blob);
      if (upErr) throw new Error(upErr.message);

      const submitRes = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${w.title} (${prompt.slice(0, 40)})`,
          path: sign.path,
          width: dw,
          height: dh,
          fileSize: blob.size,
          device: w.device,
          devices: w.devices ?? [w.device],
          tags: "ai-edited," + slugify(prompt).split("-").slice(0, 5).join(","),
          credit: "AI-edited remix",
        }),
      });
      const submitJson = await submitRes.json();
      if (!submitRes.ok) throw new Error(submitJson.error || "Submission failed");
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex justify-center">
      <div className="w-fit max-w-full">
        <div className="surface relative w-fit max-w-full overflow-hidden rounded-card p-2 sm:p-3">
          <span className="absolute left-3.5 top-3.5 z-10 inline-flex items-center gap-1.5 rounded-full glass-strong px-3 py-1 text-xs font-semibold text-chalk">
            {quality(Math.max(dw, dh))} · {dw}×{dh} · {label}
          </span>

          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="focusable absolute right-3.5 top-3.5 z-10 inline-flex items-center gap-1.5 rounded-full glass-strong px-3 py-1.5 text-xs font-semibold text-chalk transition hover:bg-white/10"
          >
            <Wand2 size={13} className="text-accent" /> {editing ? "Close editor" : "Edit with AI"}
          </button>

          {!loaded && <div className="liquid-skeleton absolute inset-2 rounded-lg sm:inset-3" />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={shownUrl}
            alt={w.alt_text || w.title}
            width={dw}
            height={dh}
            onLoad={(e) => { setNat({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight }); setLoaded(true); }}
            onError={() => setLoaded(true)}
            className={`block h-auto w-auto max-w-full rounded-lg object-contain transition-opacity duration-300 sm:max-h-[58vh] sm:max-w-[760px] ${loaded ? "opacity-100" : "opacity-0"}`}
            style={{ backgroundColor: w.dominant_color ?? "rgb(var(--ink-3))" }}
          />
        </div>

        {editing && (
          <div className="surface mt-3 space-y-3 rounded-card p-4">
            <p className="text-sm font-medium">Describe the change you want</p>
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="add falling snow, make it night time…"
                className="focusable h-11 min-w-0 flex-1 rounded-pill bg-white/5 px-4 text-sm text-chalk placeholder:text-chalk-faint"
              />
              <GlassButton variant="iris" onClick={applyEdit} disabled={busy || !prompt.trim()}>
                {busy ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                {busy ? "Editing…" : "Apply"}
              </GlassButton>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {IDEAS.map((idea) => (
                <button
                  key={idea}
                  type="button"
                  onClick={() => setPrompt(idea)}
                  className="rounded-full border border-line px-2.5 py-1 text-xs text-chalk-muted transition hover:text-chalk"
                >
                  {idea}
                </button>
              ))}
            </div>

            {error && <p className="text-sm text-accent-2">{error}</p>}

            {editedUrl && (
              <div className="flex flex-wrap items-center gap-3 border-t border-line pt-3">
                <GlassButton size="sm" onClick={() => { setEditedUrl(null); setPrompt(""); setSubmitted(false); }}>
                  <RotateCcw size={14} /> Revert to original
                </GlassButton>
                <GlassButton size="sm" onClick={download}>
                  <Download size={14} /> Download
                </GlassButton>
                {!submitted ? (
                  <GlassButton size="sm" variant="iris" onClick={publishAsNew} disabled={submitting}>
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                    {submitting ? "Submitting…" : "Publish as new wallpaper"}
                  </GlassButton>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm text-accent">
                    <Check size={15} /> Submitted for review
                  </span>
                )}
                <button onClick={() => setEditing(false)} className="ml-auto text-chalk-faint hover:text-chalk" aria-label="Close">
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
