"use client";

import { useState } from "react";
import { Wand2, Loader2, Download, UploadCloud, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { RESOLUTIONS, DEVICES } from "@/lib/constants";
import { slugify } from "@/lib/utils";

const IDEAS = [
  "misty pine forest at dawn, moody, 4K",
  "cozy autumn café window, warm light",
  "neon cyberpunk alley in the rain",
  "minimal pastel gradient, soft grain",
  "deep space nebula, purple and teal",
];

export function AiGenerateStudio() {
  const [prompt, setPrompt] = useState("");
  const [device, setDevice] = useState<"phone" | "desktop" | "tablet">("phone");
  const [resIdx, setResIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const res = RESOLUTIONS[device][resIdx] ?? RESOLUTIONS[device][0];

  async function generate() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    setSubmitted(false);
    try {
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, width: res.w, height: res.h }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || "Generation failed");
      // Pollinations can take a few seconds to render — the <img> tag's own
      // loading spinner covers that; we just wait for the URL to be ready.
      setImageUrl(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  async function download() {
    if (!imageUrl) return;
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(prompt).slice(0, 40) || "ai-wallpaper"}.jpg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** Submit the generated image into the same community review queue as /contribute. */
  async function submitToGallery() {
    if (!imageUrl || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const imgRes = await fetch(imageUrl);
      const blob = await imgRes.blob();
      const contentType = blob.type || "image/jpeg";

      const signRes = await fetch("/api/submit/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType, ext: "jpg" }),
      });
      const sign = await signRes.json();
      if (!signRes.ok) throw new Error(sign.error || "Could not start upload");

      const supabase = createClient();
      const { error: upErr } = await supabase.storage
        .from("wallpapers")
        .uploadToSignedUrl(sign.path, sign.token, blob);
      if (upErr) throw new Error(upErr.message);

      const submitRes = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: prompt.slice(0, 80),
          path: sign.path,
          width: res.w,
          height: res.h,
          fileSize: blob.size,
          device,
          devices: [device],
          tags: "ai-generated," + slugify(prompt).split("-").slice(0, 5).join(","),
          credit: "AI-generated",
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
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <GlassCard interactive={false} className="space-y-5 p-5">
        <div>
          <p className="mb-2 text-sm font-medium">Describe the wallpaper you want</p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="misty pine forest at dawn, moody, 4K"
            rows={3}
            className="focusable surface w-full resize-none rounded-card px-4 py-3 text-sm text-chalk placeholder:text-chalk-faint"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
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
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Sized for</p>
          <div className="flex flex-wrap gap-2">
            {DEVICES.map((d) => (
              <button
                key={d.slug}
                type="button"
                onClick={() => {
                  setDevice(d.slug as typeof device);
                  setResIdx(0);
                }}
                className={`focusable rounded-pill px-3.5 py-1.5 text-xs font-medium transition ${
                  device === d.slug ? "btn-accent" : "surface text-chalk-muted hover:text-chalk"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          <select
            value={resIdx}
            onChange={(e) => setResIdx(Number(e.target.value))}
            className="focusable surface mt-2 h-10 w-full rounded-pill px-4 text-sm text-chalk [color-scheme:dark]"
          >
            {RESOLUTIONS[device].map((r, i) => (
              <option key={r.label} value={i}>
                {r.label} — {r.w}×{r.h}
              </option>
            ))}
          </select>
        </div>

        <GlassButton variant="iris" size="lg" onClick={generate} disabled={loading || !prompt.trim()} className="w-full">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
          {loading ? "Generating…" : "Generate"}
        </GlassButton>
        {error && <p className="text-sm text-accent-2">{error}</p>}
        <p className="text-xs text-chalk-faint">
          Free AI generation (Pollinations), capped per visitor to keep it available for everyone.
        </p>
      </GlassCard>

      <GlassCard interactive={false} className="flex min-h-[420px] flex-col items-center justify-center gap-4 p-5">
        {!imageUrl && !loading && (
          <p className="text-sm text-chalk-faint">Your generated wallpaper will appear here.</p>
        )}
        {loading && (
          <div className="flex flex-col items-center gap-3 text-chalk-muted">
            <Loader2 size={28} className="animate-spin text-accent" />
            <p className="text-sm">Painting your wallpaper…</p>
          </div>
        )}
        {imageUrl && !loading && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={prompt}
              className="max-h-[520px] w-auto rounded-card border border-line object-contain"
            />
            <div className="flex flex-wrap items-center justify-center gap-3">
              <GlassButton onClick={download}>
                <Download size={16} /> Download
              </GlassButton>
              {!submitted ? (
                <GlassButton variant="iris" onClick={submitToGallery} disabled={submitting}>
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                  {submitting ? "Submitting…" : "Publish to gallery"}
                </GlassButton>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm text-accent">
                  <Check size={16} /> Submitted for review
                </span>
              )}
            </div>
          </>
        )}
      </GlassCard>
    </div>
  );
}
