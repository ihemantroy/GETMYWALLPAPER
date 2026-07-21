const BUCKET = "wallpapers";

/** Public URL for a stored wallpaper. Supabase Storage serves these from the CDN. */
export function publicUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

/** Transformed URL (resize/format) via Supabase image transformation. */
export function renderUrl(
  storagePath: string,
  opts: { width?: number; height?: number; quality?: number; resize?: "cover" | "contain" | "fill" } = {},
): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const params = new URLSearchParams();
  if (opts.width) params.set("width", String(opts.width));
  if (opts.height) params.set("height", String(opts.height));
  params.set("quality", String(opts.quality ?? 75));

  // only pass resize when BOTH dimensions are known — otherwise Supabase
  // defaults to "cover" and distorts/crops images with a missing dimension
  if (opts.width && opts.height) {
    params.set("resize", opts.resize ?? "contain");
  }

  return `${base}/storage/v1/render/image/public/${BUCKET}/${storagePath}?${params}`;
}

export { BUCKET };