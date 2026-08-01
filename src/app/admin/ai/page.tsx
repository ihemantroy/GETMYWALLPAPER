"use client";

import { useState } from "react";
import { Loader2, Sparkles, Check } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";

export default function AdminAiPage() {
  const [running, setRunning] = useState(false);
  const [processed, setProcessed] = useState(0);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runBackfill() {
    setRunning(true);
    setError(null);
    setProcessed(0);
    try {
      let left = Infinity;
      while (left > 0) {
        const res = await fetch("/api/admin/backfill-embeddings", { method: "POST" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Backfill failed");
        setProcessed((p) => p + json.processed);
        setRemaining(json.remaining);
        left = json.remaining;
        if (json.processed === 0 && json.remaining > 0) break; // avoid infinite loop on persistent failures
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Backfill failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-bold">AI features</h1>
      <p className="mt-1 text-sm text-chalk-muted">
        Manage the AI-powered wallpaper generator, auto-descriptions, semantic search, and find-similar.
      </p>

      <GlassCard interactive={false} className="mt-6 space-y-3 p-5">
        <h2 className="font-display text-lg font-semibold">Embeddings backfill</h2>
        <p className="text-sm text-chalk-muted">
          Semantic search and &ldquo;Find similar&rdquo; need every wallpaper to have an AI embedding. New uploads get one
          automatically — use this to fill in older wallpapers uploaded before this feature existed.
        </p>
        <GlassButton variant="iris" onClick={runBackfill} disabled={running}>
          {running ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {running ? "Processing…" : "Backfill missing embeddings"}
        </GlassButton>
        {processed > 0 && (
          <p className="flex items-center gap-1.5 text-sm text-accent">
            <Check size={15} /> Embedded {processed} wallpaper{processed === 1 ? "" : "s"}
            {remaining ? ` — ${remaining} left, keep this tab open` : " — all done"}
          </p>
        )}
        {error && <p className="text-sm text-accent-2">{error}</p>}
      </GlassCard>

      <GlassCard interactive={false} className="mt-4 space-y-2 p-5 text-sm text-chalk-muted">
        <h2 className="font-display text-lg font-semibold text-chalk">Required environment variables</h2>
        <p><code className="text-chalk">GEMINI_API_KEY</code> — powers AI auto title/description/alt-text/tags on upload.</p>
        <p><code className="text-chalk">JINA_API_KEY</code> — powers semantic search and find-similar.</p>
        <p className="text-chalk-faint">The AI wallpaper generator (Pollinations) needs no key.</p>
      </GlassCard>
    </div>
  );
}
