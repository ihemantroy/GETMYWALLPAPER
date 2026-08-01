/**
 * All AI integrations for the site live here, kept to free-tier services:
 *
 *  - Pollinations.ai  → text→image generation (feature 1). Free, no API key.
 *  - Google Gemini    → vision model that writes title/description/alt/tags
 *                        for an uploaded wallpaper (feature 2). Free tier.
 *  - Jina AI           → jina-clip-v2 multimodal embeddings. Embeds BOTH text
 *                        and images into the same vector space, so one model
 *                        powers semantic search AND find-similar (features 3+4).
 *                        Free tier (no self-hosted model — keeps Vercel Hobby
 *                        function size/time small).
 */

const GEMINI_MODEL = "gemini-1.5-flash";
const JINA_EMBED_URL = "https://api.jina.ai/v1/embeddings";
const JINA_MODEL = "jina-clip-v2";

// ---------- Feature 1: text → image ----------------------------------------

/** Build a direct Pollinations.ai image URL. No key required, fully free.
 *  Pass sourceImageUrl to use the free "kontext" model for prompt-based
 *  image EDITING instead of generating from scratch. */
export function pollinationsUrl(
  prompt: string,
  width: number,
  height: number,
  opts: { seed?: number; sourceImageUrl?: string } = {},
): string {
  const encoded = encodeURIComponent(prompt.trim().slice(0, 500));
  const params = new URLSearchParams({
    width: String(Math.round(width)),
    height: String(Math.round(height)),
    nologo: "true",
    ...(opts.seed !== undefined ? { seed: String(opts.seed) } : {}),
    ...(opts.sourceImageUrl ? { model: "kontext", image: opts.sourceImageUrl } : {}),
  });
  return `https://image.pollinations.ai/prompt/${encoded}?${params.toString()}`;
}

// ---------- Feature 2: AI title / description / alt / tags -----------------

export type WallpaperMeta = {
  title: string;
  description: string;
  altText: string;
  tags: string[];
};

/** Fetch an image URL and return base64 + mime type, for sending to Gemini. */
async function imageUrlToInlineData(imageUrl: string): Promise<{ data: string; mimeType: string }> {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Could not fetch image (${res.status})`);
  const mimeType = res.headers.get("content-type") || "image/jpeg";
  const buf = Buffer.from(await res.arrayBuffer());
  return { data: buf.toString("base64"), mimeType };
}

/** Ask Gemini to look at a wallpaper (by URL) and write original title/description/alt/tags. */
export async function describeWallpaper(imageUrl: string): Promise<WallpaperMeta> {
  const { data, mimeType } = await imageUrlToInlineData(imageUrl);
  return describeWallpaperFromBase64(data, mimeType);
}

/** Same as describeWallpaper, but takes raw base64 bytes — used when the file hasn't been uploaded to storage yet. */
export async function describeWallpaperFromBase64(data: string, mimeType: string): Promise<WallpaperMeta> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const prompt =
    "You are writing metadata for a wallpaper website. Look at this image and respond with ONLY raw JSON " +
    '(no markdown fences) in this exact shape: {"title": string, "description": string, "altText": string, "tags": string[]}. ' +
    "Rules: title is 3-6 words, punchy, no quotes. description is 2-3 original sentences describing the mood, subject and colours " +
    "(never mention it's AI-written, never say 'wallpaper' repeatedly). altText is one concise accessibility-friendly sentence " +
    "describing what's visually in the image. tags is 6-10 lowercase single-or-two-word tags (colours, mood, subject) with no '#'.";

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data } }],
          },
        ],
        generationConfig: { temperature: 0.6, responseMimeType: "application/json" },
      }),
    },
  );
  if (!res.ok) throw new Error(`Gemini error (${res.status}): ${await res.text()}`);
  const json = await res.json();
  const text: string = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const cleaned = text.replace(/^```json\s*|\s*```$/g, "").trim();

  let parsed: Partial<WallpaperMeta>;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Gemini returned unparseable output");
  }

  return {
    title: (parsed.title || "").toString().slice(0, 80),
    description: (parsed.description || "").toString().slice(0, 500),
    altText: (parsed.altText || "").toString().slice(0, 200),
    tags: Array.isArray(parsed.tags) ? parsed.tags.map((t) => String(t).toLowerCase().slice(0, 30)).slice(0, 10) : [],
  };
}

// ---------- Features 3 + 4: embeddings --------------------------------------

async function jinaEmbed(input: Record<string, unknown>[]): Promise<number[]> {
  const apiKey = process.env.JINA_API_KEY;
  if (!apiKey) throw new Error("JINA_API_KEY is not set");
  const res = await fetch(JINA_EMBED_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: JINA_MODEL, input }),
  });
  if (!res.ok) throw new Error(`Jina embeddings error (${res.status}): ${await res.text()}`);
  const json = await res.json();
  const vec = json?.data?.[0]?.embedding;
  if (!Array.isArray(vec)) throw new Error("Jina returned no embedding");
  return vec as number[];
}

/** Embed free-text (used for semantic search queries). */
export async function embedText(text: string): Promise<number[]> {
  return jinaEmbed([{ text: text.slice(0, 2000) }]);
}

/** Embed an image by URL (used to index wallpapers for search + find-similar). */
export async function embedImageUrl(imageUrl: string): Promise<number[]> {
  return jinaEmbed([{ image: imageUrl }]);
}
