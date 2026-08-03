"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { celebrate } from "@/lib/confetti";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type InstallContextValue = {
  canInstall: boolean;    // a native prompt is ready OR iOS manual-install applies
  isIosSafari: boolean;   // iOS can't auto-prompt; UI shows a manual hint instead
  installed: boolean;
  promptInstall: () => Promise<void>;
  iosGuideOpen: boolean;
  openIosGuide: () => void;
  closeIosGuide: () => void;
};

const InstallContext = createContext<InstallContextValue>({
  canInstall: false,
  isIosSafari: false,
  installed: false,
  promptInstall: async () => {},
  iosGuideOpen: false,
  openIosGuide: () => {},
  closeIosGuide: () => {},
});

export function useInstall() {
  return useContext(InstallContext);
}

export function InstallProvider({ children }: { children: React.ReactNode }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIosSafari, setIsIosSafari] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [iosGuideOpen, setIosGuideOpen] = useState(false);
  const celebrated = useRef(false);

  const openIosGuide = useCallback(() => setIosGuideOpen(true), []);
  const closeIosGuide = useCallback(() => setIosGuideOpen(false), []);

  const celebrateOnce = useCallback(() => {
    if (celebrated.current) return;
    celebrated.current = true;
    celebrate();
  }, []);

  useEffect(() => {
    // Already running as an installed app? Nothing to prompt.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) { setInstalled(true); return; }

    const ua = window.navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua);
    const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);
    if (isIos && isSafari) setIsIosSafari(true);

    const onPrompt = (e: Event) => {
      e.preventDefault(); // suppress Chrome's default mini-infobar; we drive our own UI
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
      celebrateOnce(); // covers the address-bar install path too
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [celebrateOnce]);

  const promptInstall = useCallback(async () => {
    if (!deferred) return; // iOS or not-yet-ready: no native prompt to show
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null); // the prompt can only be used once
    if (outcome === "accepted") {
      setInstalled(true);
      celebrateOnce(); // instant celebration on accept (don't wait for appinstalled)
    }
  }, [deferred, celebrateOnce]);

  const canInstall = (!!deferred || isIosSafari) && !installed;

  return (
    <InstallContext.Provider value={{ canInstall, isIosSafari, installed, promptInstall, iosGuideOpen, openIosGuide, closeIosGuide }}>
      {children}
    </InstallContext.Provider>
  );
}
