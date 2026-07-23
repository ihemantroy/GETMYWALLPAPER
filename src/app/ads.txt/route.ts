// Serves /ads.txt dynamically so AdSense authorisation can never be lost
// by an accidental file deletion. Static public/ads.txt takes precedence.
export const dynamic = "force-static";

export function GET() {
  return new Response("google.com, pub-5874521028667938, DIRECT, f08c47fec0942fa0\n", {
    headers: { "Content-Type": "text/plain" },
  });
}
