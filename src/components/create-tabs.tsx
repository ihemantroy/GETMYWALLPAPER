"use client";

import { useState } from "react";
import { Palette, Sparkles } from "lucide-react";
import { GradientStudio } from "@/components/gradient-studio";
import { AuraStudio } from "@/components/aura-studio";

export function CreateTabs() {
  const [tab, setTab] = useState<"aura" | "gradient">("aura");
  return (
    <div>
      <div className="surface mb-8 inline-flex gap-1 rounded-pill p-1">
        <button
          onClick={() => setTab("aura")}
          className={`focusable inline-flex items-center gap-2 rounded-pill px-5 py-2.5 text-sm font-medium transition ${tab === "aura" ? "btn-accent" : "text-chalk-muted hover:text-chalk"}`}
        >
          <Sparkles size={15} /> Aura (photo)
        </button>
        <button
          onClick={() => setTab("gradient")}
          className={`focusable inline-flex items-center gap-2 rounded-pill px-5 py-2.5 text-sm font-medium transition ${tab === "gradient" ? "btn-accent" : "text-chalk-muted hover:text-chalk"}`}
        >
          <Palette size={15} /> Gradient
        </button>
      </div>
      {tab === "aura" ? <AuraStudio /> : <GradientStudio />}
    </div>
  );
}
