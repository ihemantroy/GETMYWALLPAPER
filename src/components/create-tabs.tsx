"use client";

import { useState } from "react";
import { Palette, Sparkles, Moon } from "lucide-react";
import { GradientStudio } from "@/components/gradient-studio";
import { AuraStudio } from "@/components/aura-studio";
import { AmoledStudio } from "@/components/amoled-studio";

type Tab = "aura" | "amoled" | "gradient";

export function CreateTabs() {
  const [tab, setTab] = useState<Tab>("aura");
  const btn = (t: Tab, active: boolean) =>
    `focusable inline-flex items-center gap-2 rounded-pill px-5 py-2.5 text-sm font-medium transition ${active ? "btn-accent" : "text-chalk-muted hover:text-chalk"}`;
  return (
    <div>
      <div className="surface mb-8 inline-flex flex-wrap gap-1 rounded-pill p-1">
        <button onClick={() => setTab("aura")} className={btn("aura", tab === "aura")}><Sparkles size={15} /> Aura (photo)</button>
        <button onClick={() => setTab("amoled")} className={btn("amoled", tab === "amoled")}><Moon size={15} /> AMOLED</button>
        <button onClick={() => setTab("gradient")} className={btn("gradient", tab === "gradient")}><Palette size={15} /> Gradient</button>
      </div>
      {tab === "aura" ? <AuraStudio /> : tab === "amoled" ? <AmoledStudio /> : <GradientStudio />}
    </div>
  );
}
