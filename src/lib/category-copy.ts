/**
 * Hand-written intro copy for individual /wallpapers/[topic] pages.
 *
 * The generic templates in wallpapers/[topic]/page.tsx (topicCopy) are fine
 * as a fallback, but they read as one template with the label swapped in.
 * Anything listed here overrides that template with bespoke copy so the
 * page reads like it was written for that specific category — which is
 * also what keeps Google from treating collection pages as near-duplicates
 * of each other.
 *
 * Keyed by slug (lowercase, matches DEVICES / COLOR_BUCKETS / VIBES /
 * KEYWORD_TOPICS / category.slug in constants.ts + the categories table).
 * `intro` is the short line shown right under the H1. `body` is optional —
 * omit it to keep the kind-based generic body from topicCopy().
 */
export const CATEGORY_COPY: Record<string, { intro: string; body?: string }> = {
  dark: {
    intro:
      "Deep blacks, moody shadows, and just enough light to keep things readable — dark wallpapers that look intentional, not just dimmed.",
    body:
      "This isn't 'brightness turned down' dark — every wallpaper here is composed for a dark palette from the start, so contrast and detail hold up rather than washing out. Works especially well paired with dark mode icons and widgets.",
  },
  minimal: {
    intro:
      "Negative space, restrained color, and nothing fighting for attention — wallpapers built to sit quietly behind your icons instead of competing with them.",
    body:
      "Minimal doesn't mean empty. Each of these earns its simplicity: a single subject, a clean gradient, or one deliberate line — chosen because it still looks considered at a glance, not just blank.",
  },
  nature: {
    intro:
      "Mountains, coastlines, forests, and skies — nature wallpapers shot with real depth and color, not oversaturated stock filler.",
    body:
      "From misty peaks to golden-hour shorelines, this collection favors images with genuine texture and light over flat, editable-preset landscapes. Good pick if you want your screen to feel like a window rather than a photo.",
  },
  abstract: {
    intro:
      "Shapes, gradients, and generative art that don't try to represent anything — just color and form doing interesting things on your screen.",
    body:
      "Abstract wallpapers age well precisely because there's no literal subject to get tired of. This set leans toward pieces with real depth and movement rather than flat vector fills.",
  },
  space: {
    intro:
      "Nebulae, galaxies, and deep-field shots — space wallpapers with the kind of scale that makes a phone screen feel bigger than it is.",
    body:
      "Sourced and processed for genuine color depth rather than an oversharpened, neon-everything look. Several are sized specifically for AMOLED phones, where the black of space costs you nothing in battery.",
  },
  aesthetic: {
    intro:
      "Curated for mood over subject — soft tones, film-like grain, and compositions that feel personal rather than generic stock photography.",
    body:
      "\"Aesthetic\" is subjective, so this collection is manually reviewed rather than tag-generated — everything here was picked because it actually holds together visually, not because it matched a keyword.",
  },
  neon: {
    intro:
      "Saturated pinks, cyans, and purples against near-black backgrounds — neon wallpapers built for screens that reward high contrast.",
    body:
      "Especially strong on OLED and AMOLED displays, where the dark backgrounds behind the neon go true black instead of dark gray. Cyberpunk, synthwave, and city-at-night styles all live here.",
  },
  anime: {
    intro:
      "Fan art and official-style illustrations across a range of series and art styles, picked for clean linework and resolution that actually holds up at full screen.",
    body:
      "Sorted by newest first since this category moves fast — check back often for new character and scene wallpapers as they're added.",
  },
  cars: {
    intro:
      "Supercars, classics, and street shots — automotive wallpapers with real detail in the paint, chrome, and reflections, not just a car silhouette on a gradient.",
    body:
      "Picked for image quality first: sharp enough that body lines and reflections hold up even at 4K, not just a thumbnail-sized shot stretched to fit.",
  },
  gradient: {
    intro:
      "Smooth, distraction-free color transitions — the safest pick if you want your home screen icons and widgets to stay easy to read.",
    body:
      "Every gradient here is rendered at full resolution with no visible banding. If none of these match what you're picturing, the free gradient studio lets you build and download your own in seconds.",
  },
  amoled: {
    intro:
      "True-black wallpapers built for OLED and AMOLED screens, where pure black pixels switch off entirely and cost you nothing in battery.",
    body:
      "Every wallpaper in this collection is checked for genuinely deep blacks (#000000), not just a dark-looking image that's actually dark gray once it's on your screen.",
  },
  "4k": {
    intro:
      "Real 4K source files, not upscaled HD — checked against actual resolution before publishing so what you see in the preview is what you get at full size.",
  },
  hd: {
    intro:
      "Full HD wallpapers that load fast and look sharp on standard displays — the reliable, no-fuss option when you don't need 4K file sizes.",
  },
};
