"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, BellRing, Sparkles, Loader2 } from "lucide-react";
import { renderUrl } from "@/lib/supabase/storage";
import { VIBES, VAPID_PUBLIC_KEY } from "@/lib/constants";

type Daily = { id: string; slug: string; title: string; storage_path: string } | null;
const KEY = "gyw_vibe";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function YourDaily() {
  const [vibe, setVibe] = useState<string | null>(null);
  const [daily, setDaily] = useState<Daily>(null);
  const [loading, setLoading] = useState(false);
  const [subState, setSubState] = useState<"idle" | "working" | "on" | "unsupported" | "denied">("idle");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    if (saved) setVibe(saved);
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) setSubState("unsupported");
  }, []);

  const loadDaily = useCallback(async (v: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/daily?vibe=${encodeURIComponent(v)}`);
      const data = await res.json();
      setDaily(data.wallpaper);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (vibe) loadDaily(vibe); }, [vibe, loadDaily]);

  function pick(v: string) {
    setVibe(v);
    localStorage.setItem(KEY, v);
  }

  async function enableReminders() {
    if (!vibe) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) { setSubState("unsupported"); return; }
    setSubState("working");
    try {
      const reg = await navigator.serviceWorker.ready;
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setSubState("denied"); return; }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON(), vibe }),
      });
      setSubState("on");
    } catch {
      setSubState("idle");
    }
  }

  return (
    <section className="mb-12">
      <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-accent-2">
        <Sparkles size={13} /> Your daily
      </p>
      <h2 className="mb-1 mt-1 font-display text-2xl font-bold">Pick your vibe</h2>
      <p className="mb-4 text-sm text-chalk-muted">Choose an aesthetic and get a fresh wallpaper for it every day.</p>

      <div className="mb-5 flex flex-wrap gap-2">
        {VIBES.map((v) => (
          <button key={v.slug} onClick={() => pick(v.slug)}
            className={`focusable rounded-pill px-4 py-2 text-sm font-medium transition ${vibe === v.slug ? "btn-accent" : "surface text-chalk-muted hover:text-chalk"}`}>
            {v.label}
          </button>
        ))}
      </div>

      {vibe && (
        <div className="grid gap-5 sm:grid-cols-[1.4fr_1fr]">
          <div className="surface relative aspect-video overflow-hidden rounded-xl2">
            {loading ? (
              <div className="grid h-full place-items-center text-chalk-muted"><Loader2 className="animate-spin" /></div>
            ) : daily ? (
              <Link href={`/wallpaper/${daily.slug}`} className="group block h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={renderUrl(daily.storage_path, { width: 1200 })} alt={daily.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="glass-cap absolute inset-x-0 bottom-0 p-4">
                  <p className="truncate font-semibold text-white">{daily.title}</p>
                </div>
              </Link>
            ) : (
              <div className="grid h-full place-items-center px-6 text-center text-sm text-chalk-muted">
                No wallpapers for this vibe yet — add some in admin.
              </div>
            )}
          </div>

          <div className="surface flex flex-col justify-center rounded-xl2 p-6">
            <p className="font-display text-lg font-semibold">Never miss a drop</p>
            <p className="mt-1 text-sm text-chalk-muted">
              Get a gentle daily reminder when your new wallpaper is ready.
            </p>
            <button
              onClick={enableReminders}
              disabled={subState === "working" || subState === "on"}
              className="btn-accent focusable mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-pill text-sm font-semibold disabled:opacity-70"
            >
              {subState === "working" ? <Loader2 size={16} className="animate-spin" /> :
               subState === "on" ? <><BellRing size={16} /> Reminders on</> :
               <><Bell size={16} /> Turn on daily reminders</>}
            </button>
            {subState === "unsupported" && <p className="mt-2 text-xs text-chalk-faint">Tip: install the app (Add to Home Screen) to enable reminders on your phone.</p>}
            {subState === "denied" && <p className="mt-2 text-xs text-accent-2">Notifications were blocked — enable them in your browser settings.</p>}
          </div>
        </div>
      )}
    </section>
  );
}
