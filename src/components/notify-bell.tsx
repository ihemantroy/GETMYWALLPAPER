"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing, Loader2 } from "lucide-react";
import { VAPID_PUBLIC_KEY } from "@/lib/constants";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

type State = "idle" | "working" | "on" | "denied" | "unsupported";

export function NotifyBell() {
  const [state, setState] = useState<State>("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") { setState("denied"); return; }
    navigator.serviceWorker.getRegistration().then((reg) => {
      reg?.pushManager.getSubscription().then((sub) => {
        if (sub) setState("on");
      });
    });
  }, []);

  async function enable() {
    if (state === "on" || state === "working") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) { setState("unsupported"); return; }
    if (!window.isSecureContext) return;

    setState("working");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setState(perm === "denied" ? "denied" : "idle"); return; }

      let reg = await navigator.serviceWorker.getRegistration();
      if (!reg) reg = await navigator.serviceWorker.register("/sw.js");
      const activeReg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<never>((_, rej) => setTimeout(() => rej(new Error("sw timeout")), 10000)),
      ]);

      let sub = await activeReg.pushManager.getSubscription();
      if (!sub) {
        sub = await activeReg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON(), vibe: "" }),
      });
      if (!res.ok) throw new Error("save failed");
      setState("on");
    } catch {
      setState("idle");
    }
  }

  const title =
    state === "on" ? "Notifications on — you'll be alerted on new wallpapers"
    : state === "denied" ? "Notifications blocked in your browser settings"
    : state === "unsupported" ? "Notifications not supported on this device"
    : "Turn on new-wallpaper notifications";

  return (
    <button
      onClick={enable}
      title={title}
      aria-label={title}
      className={`focusable grid h-10 w-10 place-items-center rounded-full border transition ${
        state === "on"
          ? "border-accent/40 bg-accent/15 text-accent"
          : "border-white/10 bg-white/[0.03] text-chalk-muted hover:text-chalk"
      }`}
    >
      {state === "working" ? <Loader2 size={17} className="animate-spin" /> : state === "on" ? <BellRing size={17} /> : <Bell size={17} />}
    </button>
  );
}
