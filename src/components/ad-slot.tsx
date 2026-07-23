"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * AdSense display unit.
 *
 * Renders ONLY when both NEXT_PUBLIC_ADSENSE_CLIENT and a slot id are set —
 * otherwise nothing is drawn, so the page never shows an empty grey box while
 * the account is still pending review (Auto Ads covers placement meanwhile).
 *
 * Policy notes:
 *  - Always labelled, with generous margin so it is never mistaken for site UI
 *    or clicked accidentally next to a download button.
 *  - Space is reserved up-front to avoid layout shift when the ad fills.
 */
export function AdSlot({
  slot,
  className,
  label = "Advertisement",
  minHeight = 100,
}: {
  slot?: string;
  className?: string;
  label?: string;
  minHeight?: number;
}) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const adSlot = slot ?? process.env.NEXT_PUBLIC_ADSENSE_SLOT;
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!client || !adSlot || !ref.current) return;
    // Guard: React can run effects twice (strict mode / re-render). Pushing the
    // same <ins> twice throws "All ins elements already have ads in them".
    if (pushed.current || ref.current.getAttribute("data-adsbygoogle-status")) return;
    try {
      // @ts-expect-error adsbygoogle is injected by the AdSense script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      /* script blocked or not loaded yet — fail silently */
    }
  }, [client, adSlot]);

  if (!client || !adSlot) return null;

  return (
    <aside
      aria-label="Advertisement"
      className={cn("surface my-8 overflow-hidden rounded-card p-3", className)}
    >
      <p className="mb-2 text-[10px] uppercase tracking-widest text-chalk-faint">{label}</p>
      <ins
        ref={ref}
        className="adsbygoogle block"
        style={{ display: "block", minHeight, textAlign: "center" }}
        data-ad-client={client}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
