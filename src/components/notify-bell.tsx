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

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}
function isStandalone() {
  return window.matchMedia?.("(display-mode: standalone)").matches
    || (window.navigator as unknown as { standalone?: boolean }).standalone === true;
}

type State = "idle" | "working" | "on" | "denied";

export function NotifyBell() {
  const [state, setState] = useState<State>("idle");

  useEffect(() => {
    try {
      if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) return;
      if (Notification.permission === "denied") { setState("denied"); return; }
      navigator.serviceWorker.getRegistration().then((reg) => {
        reg?.pushManager.getSubscription().then((sub) => { if (sub) setState("on"); }).catch(() => {});
      }).catch(() => {});
    } catch { /* ignore */ }
  }, []);

  async function enable() {
    if (state === "on" || state === "working") return;

    // capability checks with clear guidance (so it never silently does nothing)
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      if (isIos() && !isStandalone()) {
        alert("On iPhone, first add GetYourWallpaper to your Home Screen (Share → Add to Home Screen), then open it and tap the bell to turn on new-wallpaper alerts.");
      } else {
        alert("Your browser doesn't support notifications. Try Chrome on Android or desktop.");
      }
      return;
    }
    if (!window.isSecureContext) { alert("Notifications need a secure (https) connection."); return; }
    if (Notification.permission === "denied") {
      setState("denied");
      alert("Notifications are blocked for this site. Enable them in your browser's site settings, then tap the bell again.");
      return;
    }

    setState("working");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setState(perm === "denied" ? "denied" : "idle");
        if (perm === "denied") alert("You blocked notifications. You can re-enable them in your browser's site settings.");
        return;
      }

      let reg = await navigator.serviceWorker.getRegistration();
      if (!reg) reg = await navigator.serviceWorker.register("/sw.js");
      const activeReg = await navigator.serviceWorker.ready;

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
      alert("Done! You'll get a notification whenever a new wallpaper drops. 🎉");
    } catch {
      setState("idle");
      alert("Couldn't turn on notifications just now — please try again.");
    }
  }

  const title =
    state === "on" ? "Notifications on"
    : state === "denied" ? "Notifications blocked — enable in browser settings"
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
