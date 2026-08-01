export const SITE = {
  name: "GetYourWallpaper",
  domain: "getyourwallpaper.com",
  tagline: "Wallpapers with taste.",
  description:
    "A hand-picked home for the internet’s most beautiful wallpapers. Every screen, every vibe — no clutter.",
};

// Device filters (the pill row + per-device download sizes).
export const DEVICES = [
  { slug: "desktop", label: "Desktop / Laptop", ratio: "16 / 9" },
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

export const VIBES = [
  { slug: "minimal", label: "Minimal" },
  { slug: "dark", label: "Dark" },
  { slug: "nature", label: "Nature" },
  { slug: "abstract", label: "Abstract" },
  { slug: "space", label: "Space" },
  { slug: "aesthetic", label: "Aesthetic" },
  { slug: "neon", label: "Neon" },
  { slug: "anime", label: "Anime" },
] as const;

// Colour families for colour search + /wallpapers/<colour> landing pages.
export const COLOR_BUCKETS = [
  { slug: "red", label: "Red", swatch: "#e2404f" },
  { slug: "orange", label: "Orange", swatch: "#f0862f" },
  { slug: "yellow", label: "Yellow", swatch: "#f2c73a" },
  { slug: "green", label: "Green", swatch: "#46b46a" },
  { slug: "teal", label: "Teal", swatch: "#2fc7c7" },
  { slug: "blue", label: "Blue", swatch: "#3d7cff" },
  { slug: "purple", label: "Purple", swatch: "#8a5cff" },
  { slug: "pink", label: "Pink", swatch: "#e85cc0" },
  { slug: "mono", label: "Black & White", swatch: "#9aa0aa" },
] as const;

// Extra keyword topics that get their own SEO landing page + sitemap entry.
export const KEYWORD_TOPICS = [
  { slug: "4k", label: "4K" },
  { slug: "hd", label: "HD" },
  { slug: "amoled", label: "AMOLED" },
  { slug: "gradient", label: "Gradient" },
] as const;

// iOS Shortcuts integration ("Set as wallpaper" without manual download).
// After building the shortcuts in the Shortcuts app (see SHORTCUTS-SETUP.md),
// paste their iCloud share links below.
export const SHORTCUTS = {
  setWallpaperName: "Set GetYourWallpaper", // must EXACTLY match the shortcut's name
  setWallpaperInstallUrl: "", // https://www.icloud.com/shortcuts/xxxxxxxx
  dailyInstallUrl: "", // https://www.icloud.com/shortcuts/yyyyyyyy (auto-daily)
};

// public VAPID key for web-push (safe to ship to the browser)
export const VAPID_PUBLIC_KEY =
  "BPT0vn_-UEZqJZ4FCuid03fL-30avQQVBDviZGNHSBnwpkgT-JTzERtommpv7zbj6T59Kl9F81Y6VjId8o67MVg";

// Full "Download in different resolutions" grid (like the big wallpaper sites)
export const RESOLUTION_GRID: { group: string; sizes: [number, number][] }[] = [
  { group: "Popular Desktop", sizes: [[1366, 768], [1920, 1080], [2560, 1440], [3840, 2160], [1600, 900], [1920, 1200]] },
  { group: "Popular Mobile", sizes: [[720, 1280], [1080, 1920], [1080, 2340], [1170, 2532], [1440, 3200]] },
  { group: "Ultra 4K / 8K", sizes: [[3840, 2160], [3840, 2400], [5120, 2880], [7680, 4320]] },
  { group: "Apple", sizes: [[1179, 2556], [1290, 2796], [1668, 2388], [2048, 2732], [2560, 1600], [5120, 2880]] },
  { group: "Android", sizes: [[1080, 2400], [1440, 2960], [1440, 3200], [1080, 2280]] },
];
