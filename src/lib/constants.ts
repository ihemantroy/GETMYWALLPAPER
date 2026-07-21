export const SITE = {
  name: "GetYourWallpaper",
  domain: "getyourwallpaper.com",
  tagline: "Wallpapers with taste.",
  description:
    "A hand-picked home for the internet's most beautiful wallpapers. Every screen, every vibe — no clutter.",
};

// Device filters (the pill row + per-device download sizes).
export const DEVICES = [
  { slug: "desktop", label: "Desktop", ratio: "16 / 9" },
  { slug: "tablet", label: "Tablet", ratio: "3 / 4" },
  { slug: "phone", label: "Phone", ratio: "9 / 19.5" },
] as const;

export const SORTS = [
  { slug: "latest", label: "Newest" },
  { slug: "popular", label: "Popular" },
] as const;

export const RESOLUTIONS: Record<string, { label: string; w: number; h: number }[]> = {
  phone: [
    { label: "iPhone", w: 1179, h: 2556 },
    { label: "Android FHD+", w: 1080, h: 2400 },
    { label: "4K", w: 1644, h: 3840 },
  ],
  desktop: [
    { label: "1080p", w: 1920, h: 1080 },
    { label: "1440p", w: 2560, h: 1440 },
    { label: "4K", w: 3840, h: 2160 },
  ],
  tablet: [
    { label: 'iPad', w: 1668, h: 2388 },
    { label: 'iPad Pro', w: 2048, h: 2732 },
  ],
};

export const NAV_LINKS = [
  { href: "/", label: "Browse" },
  { href: "/create", label: "Create" },
  { href: "/contribute", label: "Submit" },
];
