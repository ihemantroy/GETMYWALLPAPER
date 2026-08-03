// Extracts the subject (foreground) from a wallpaper as a transparent PNG,
// so the 3D viewer can float it in front of the background — the real
// "subject pops out" effect. Uses @imgly/background-removal (already a project
// dependency). Results are cached in memory AND in the Cache Storage API, so
// each image is only ever processed once per device.

const mem = new Map<string, string>();

// Shrink big wallpapers before segmentation — much faster on phones, and the
// cutout is only the moving layer so full resolution isn't needed.
async function downscale(blob: Blob, max = 1400): Promise<Blob> {
  const bmp = await createImageBitmap(blob);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  if (scale >= 1) {
    bmp.close?.();
    return blob;
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bmp.close?.();
    return blob;
  }
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close?.();
  return await new Promise<Blob>((res) => canvas.toBlob((b) => res(b ?? blob), "image/jpeg", 0.92));
}

export async function getForeground(
  src: string,
  onProgress?: (pct: number) => void,
): Promise<string> {
  if (mem.has(src)) return mem.get(src)!;

  const cacheKey = "fg:" + src;
  try {
    const cache = await caches.open("gyw-cutouts");
    const hit = await cache.match(cacheKey);
    if (hit) {
      const url = URL.createObjectURL(await hit.blob());
      mem.set(src, url);
      return url;
    }
  } catch {
    /* Cache Storage unavailable — fall through and compute */
  }

  const resp = await fetch(src);
  const original = await resp.blob();
  const input = await downscale(original);

  // Heavy lib — load it only when the user actually opens 3D view.
  const { removeBackground } = await import("@imgly/background-removal");
  const cutout = await removeBackground(input, {
    progress: (_key: string, current: number, total: number) => {
      if (total) onProgress?.(Math.round((current / total) * 100));
    },
    output: { format: "image/png", quality: 0.9 },
  });

  try {
    const cache = await caches.open("gyw-cutouts");
    await cache.put(cacheKey, new Response(cutout));
  } catch {
    /* best-effort persistence */
  }

  const url = URL.createObjectURL(cutout);
  mem.set(src, url);
  return url;
}
