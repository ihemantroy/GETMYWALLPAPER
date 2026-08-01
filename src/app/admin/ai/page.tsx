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

  const [descRunning, setDescRunning] = useState(false);
  const [descProcessed, setDescProcessed] = useState(0);
  const [descRemaining, setDescRemaining] = useState<number | null>(null);
  const [descError, setDescError] = useState<string | null>(null);

  async function runBackfill() {
    setRunning(true);
    setError(null);
    setProcessed(0);
    const MAX_CONSECUTIVE_EMPTY_BATCHES = 5;
    let consecutiveEmptyBatches = 0;
    try {
      let left = Infinity;
      while (left > 0) {
        const res = await fetch("/api/admin/backfill-embeddings", { method: "POST" });
        const json = await res.json();
        if (!res.ok && !json.remaining) throw new Error(json.error || "Backfill failed");
        setProcessed((p) => p + (json.processed || 0));
        setRemaining(json.remaining);
        left = json.remaining;

        if (json.processed === 0 && json.remaining > 0) {
          // A whole batch failed even after the server's own retries (e.g. a
          // sustained rate limit). Don't give up immediately — pause and let
          // the rate limit window reset, then try again a few times before
          // surfacing an error.
          consecutiveEmptyBatches++;
          if (consecutiveEmptyBatches > MAX_CONSECUTIVE_EMPTY_BATCHES) {
            throw new Error(
              json.error || json.lastError || "Repeated failures — stopped after several retries. See error above."
            );
          }
          await new Promise((r) => setTimeout(r, 15000));
        } else {
          consecutiveEmptyBatches = 0;
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Backfill failed");
    } finally {
      setRunning(false);
    }
  }

  async function runDescriptionBackfill() {
    setDescRunning(true);
    setDescError(null);
    setDescProcessed(0);
    const MAX_CONSECUTIVE_EMPTY_BATCHES = 5;
    let consecutiveEmptyBatches = 0;
    try {
      let left = Infinity;
      while (left > 0) {
        const res = await fetch("/api/admin/backfill-descriptions", { method: "POST" });
        const json = await res.json();
        if (!res.ok && !json.remaining) throw new Error(json.error || "Backfill failed");
        setDescProcessed((p) => p + (json.processed || 0));
        setDescRemaining(json.remaining);
        left = json.remaining;

        if (json.processed === 0 && json.remaining > 0) {
          consecutiveEmptyBatches++;
          if (consecutiveEmptyBatches > MAX_CONSECUTIVE_EMPTY_BATCHES) {
            throw new Error(
              json.error || json.lastError || "Repeated failures — stopped after several retries. See error above."
            );
          }
          await new Promise((r) => setTimeout(r, 15000));
        } else {
          consecutiveEmptyBatches = 0;
        }
      }
    } catch (e) {
      setDescError(e instanceof Error ? e.message : "Backfill failed");
    } finally {
      setDescRunning(false);
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

      <GlassCard interactive={false} className="mt-4 space-y-3 p-5">
        <h2 className="font-display text-lg font-semibold">Description &amp; tags backfill</h2>
        <p className="text-sm text-chalk-muted">
          Fills in AI-written description, alt text, and tags for any published wallpaper missing them —
          useful for wallpapers uploaded before this ran automatically, or bulk-imported without metadata.
          Existing values are never overwritten, only genuinely missing fields are filled in.
        </p>
        <GlassButton variant="iris" onClick={runDescriptionBackfill} disabled={descRunning}>
          {descRunning ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {descRunning ? "Processing…" : "Backfill missing descriptions"}
        </GlassButton>
        {descProcessed > 0 && (
          <p className="flex items-center gap-1.5 text-sm text-accent">
            <Check size={15} /> Updated {descProcessed} wallpaper{descProcessed === 1 ? "" : "s"}
            {descRemaining ? ` — ${descRemaining} left, keep this tab open` : " — all done"}
          </p>
        )}
        {descError && <p className="text-sm text-accent-2">{descError}</p>}
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
