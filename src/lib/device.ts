export type DeviceKind = "phone" | "tablet" | "desktop" | "ultrawide";

/** Best-effort client device guess from viewport — used to pre-select downloads. */
export function detectDevice(): DeviceKind {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  const ratio = window.innerWidth / window.innerHeight;
  if (w < 768) return "phone";
  if (w < 1180 && ratio < 1.2) return "tablet";
  if (ratio >= 2.1) return "ultrawide";
  return "desktop";
}

export function detectScreen(): { w: number; h: number; dpr: number } {
  if (typeof window === "undefined") return { w: 1920, h: 1080, dpr: 1 };
  const dpr = window.devicePixelRatio || 1;
  return {
    w: Math.round(window.screen.width * dpr),
    h: Math.round(window.screen.height * dpr),
    dpr,
  };
}

/** Auto-pick suitable devices from a wallpaper's aspect ratio. */
export function suggestDevices(width: number, height: number): string[] {
  if (!width || !height) return ["desktop"];
  const r = width / height;
  if (r >= 1.25) return ["desktop"];            // landscape → desktop / laptop
  if (r <= 0.62) return ["phone"];              // tall portrait → phone
  if (r < 0.9) return ["phone", "tablet"];      // moderate portrait → phone + tablet
  return ["tablet", "desktop"];                 // near-square → tablet + desktop
}
