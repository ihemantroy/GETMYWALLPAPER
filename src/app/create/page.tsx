import type { Metadata } from "next";
import { GradientStudio } from "@/components/gradient-studio";

export const metadata: Metadata = {
  title: "Create a wallpaper",
  description: "Design your own gradient or mesh wallpaper and download it sized to your exact screen.",
};

export default function CreatePage() {
  return (
    <main className="mx-auto max-w-6xl px-5 pb-24 pt-28 sm:px-8">
      <div className="mb-8 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-2">Studio · world-first</p>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Make your own <span className="text-accent">wallpaper.</span>
        </h1>
        <p className="mt-3 text-chalk-muted">
          Design a gradient or mesh in seconds and download it rendered to your exact screen resolution. No app, no crop, no watermark.
        </p>
      </div>
      <GradientStudio />
    </main>
  );
}
