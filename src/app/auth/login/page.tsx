"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Check, Lock, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.replace(next);
      router.refresh();
    }
  }

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  async function google() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-32">
      <GlassCard interactive={false} className="p-8">
        <h1 className="font-display text-2xl font-bold">Welcome in</h1>
        <p className="mt-1 text-sm text-chalk-muted">Sign in to save favorites, submit wallpapers and more.</p>

        {sent ? (
          <div className="mt-6 flex items-start gap-3 rounded-card bg-accent/10 p-4 text-sm">
            <Check className="mt-0.5 shrink-0 text-accent" size={18} />
            <p className="text-chalk">Check your inbox — we sent a magic link to <b>{email}</b>.</p>
          </div>
        ) : mode === "password" ? (
          <>
            <form onSubmit={signInPassword} className="mt-6 space-y-3">
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="focusable surface h-12 w-full rounded-pill px-5 text-sm text-chalk placeholder:text-chalk-faint"
              />
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="focusable surface h-12 w-full rounded-pill px-5 text-sm text-chalk placeholder:text-chalk-faint"
              />
              <GlassButton type="submit" variant="iris" size="lg" className="w-full" disabled={loading}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                {loading ? "Signing in…" : "Sign in"}
              </GlassButton>
            </form>
            {error && <p className="mt-3 text-sm text-accent-2">{error}</p>}
            <button onClick={() => { setMode("magic"); setError(null); }} className="mt-3 text-xs text-chalk-muted underline hover:text-chalk">
              Email me a magic link instead
            </button>
            <div className="my-5 flex items-center gap-3 text-xs text-chalk-faint">
              <span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" />
            </div>
            <GlassButton onClick={google} variant="glass" size="lg" className="w-full">
              Continue with Google
            </GlassButton>
          </>
        ) : (
          <>
            <form onSubmit={sendLink} className="mt-6 space-y-3">
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="focusable surface h-12 w-full rounded-pill px-5 text-sm text-chalk placeholder:text-chalk-faint"
              />
              <GlassButton type="submit" variant="iris" size="lg" className="w-full" disabled={loading}>
                <Mail size={18} /> {loading ? "Sending…" : "Email me a link"}
              </GlassButton>
            </form>
            {error && <p className="mt-3 text-sm text-accent-2">{error}</p>}
            <button onClick={() => { setMode("password"); setError(null); }} className="mt-3 text-xs text-chalk-muted underline hover:text-chalk">
              Use email &amp; password instead
            </button>
          </>
        )}
      </GlassCard>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
