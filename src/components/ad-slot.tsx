"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * AdSense slot that renders ONLY when NEXT_PUBLIC_ADSENSE_CLIENT is set.
 * Lazy, isolated, and styled to belong to the dark glass UI rather than
 * break it. Never blocks rendering — the script loads afterInteractive.
 */
export function AdSlot({
  slot,
  className,
  label = "Sponsored",
}: {
  slot?: string;
  className?: string;
  label?: string;
}) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const ref = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!client || !ref.current) return;
    try {
      // @ts-expect-error adsbygoogle is injected by the AdSense script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, [client]);

  if (!client) return null;

  return (
    <div className={cn("surface rounded-card p-3", className)}>
      <p className="mb-2 text-[10px] uppercase tracking-widest text-chalk-faint">{label}</p>
      <ins
        ref={ref}
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
