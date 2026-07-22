import type { Metadata } from "next";
import { CreateTabs } from "@/components/create-tabs";

export const metadata: Metadata = {
  title: "Create a wallpaper",
  description: "Turn your selfie into an aura lock screen, or design a gradient — sized to your exact screen.",
};

export default function CreatePage() {
  return (
    <main className="mx-auto max-w-6xl px-5 pb-24 pt-28 sm:px-8">
      <div className="mb-8 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-2">Studio</p>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Make your own <span className="text-accent">wallpaper.</span>
        </h1>
        <p className="mt-3 text-chalk-muted">
          Turn a selfie into a glowing aura lock screen, or design a gradient — downloaded at your exact resolution. No app, no watermark.
        </p>
      </div>
      <CreateTabs />
    </main>
  );
}
