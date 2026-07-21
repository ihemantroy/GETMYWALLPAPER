"use client";

import { useState } from "react";
import { Mail, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  async function google() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-32">
      <GlassCard interactive={false} className="p-8">
        <h1 className="font-display text-2xl font-bold">Welcome in</h1>
        <p className="mt-1 text-sm text-chalk-muted">Sign in to save favorites, build vibe boards and contribute.</p>

        {sent ? (
          <div className="mt-6 flex items-start gap-3 rounded-card bg-accent/10 p-4 text-sm">
            <Check className="mt-0.5 shrink-0 text-accent" size={18} />
            <p className="text-chalk">Check your inbox — we sent a magic link to <b>{email}</b>.</p>
          </div>
        ) : (
          <>
            <form onSubmit={sendLink} className="mt-6 space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="focusable surface h-12 w-full rounded-pill px-5 text-sm text-chalk placeholder:text-chalk-faint"
              />
              <GlassButton type="submit" variant="iris" size="lg" className="w-full" disabled={loading}>
                <Mail size={18} /> {loading ? "Sending…" : "Email me a link"}
              </GlassButton>
            </form>
            {error && <p className="mt-3 text-sm text-accent-2">{error}</p>}
            <div className="my-5 flex items-center gap-3 text-xs text-chalk-faint">
              <span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" />
            </div>
            <GlassButton onClick={google} variant="glass" size="lg" className="w-full">
              Continue with Google
            </GlassButton>
          </>
        )}
      </GlassCard>
    </div>
  );
}
