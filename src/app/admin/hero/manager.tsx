"use client";

import { useState } from "react";
import { setHero } from "@/app/admin/actions";
import { renderUrl } from "@/lib/supabase/storage";

type W = { id: string; title: string; storage_path: string };
const DEVICES: [string, string][] = [
  ["desktop", "Desktop / Laptop"],
  ["tablet", "Tablet"],
  ["phone", "Phone"],
];
const FOCI = ["top", "center", "bottom"] as const;

export function HeroManager({
  wallpapers,
  current,
}: {
  wallpapers: W[];
  current: Record<string, { wallpaper_id: string | null; focus: string; fit: string }>;
}) {
  return (
    <div className="mt-6 space-y-5">
      {DEVICES.map(([dev, label]) => (
        <DeviceHero key={dev} device={dev} label={label} wallpapers={wallpapers} initial={current[dev]} />
      ))}
    </div>
  );
}

function DeviceHero({
  device,
  label,
  wallpapers,
  initial,
}: {
  device: string;
  label: string;
  wallpapers: W[];
  initial?: { wallpaper_id: string | null; focus: string; fit: string };
}) {
  const [wid, setWid] = useState(initial?.wallpaper_id ?? "");
  const [focus, setFocus] = useState(initial?.focus ?? "center");
  const [fit, setFit] = useState(initial?.fit ?? "cover");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const selected = wallpapers.find((w) => w.id === wid);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      await setHero(device, wid, focus, fit);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="surface rounded-card p-5">
      <p className="font-display text-lg font-semibold">{label}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_260px]">
        <div className="space-y-3">
          <label className="block text-xs uppercase tracking-widest text-chalk-faint">Wallpaper</label>
          <select
            value={wid}
            onChange={(e) => { setWid(e.target.value); setSaved(false); }}
            className="focusable surface w-full rounded-xl px-3 py-2.5 text-sm"
          >
            <option value="">— None (use default) —</option>
            {wallpapers.map((w) => (
              <option key={w.id} value={w.id}>{w.title}</option>
            ))}
          </select>

          <label className="block pt-1 text-xs uppercase tracking-widest text-chalk-faint">Crop focus</label>
          <div className="flex gap-2">
            {FOCI.map((f) => (
              <button
                key={f}
                onClick={() => { setFocus(f); setSaved(false); }}
                className={`focusable rounded-pill px-4 py-1.5 text-xs font-medium capitalize transition ${
                  focus === f ? "btn-accent" : "surface text-chalk-muted hover:text-chalk"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <label className="block pt-1 text-xs uppercase tracking-widest text-chalk-faint">Fit</label>
          <div className="flex gap-2">
            {(["cover", "contain"] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setFit(f); setSaved(false); }}
                className={`focusable rounded-pill px-4 py-1.5 text-xs font-medium transition ${
                  fit === f ? "btn-accent" : "surface text-chalk-muted hover:text-chalk"
                }`}
              >
                {f === "cover" ? "Fill (crop to edges)" : "Whole image (no crop)"}
              </button>
            ))}
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="btn-accent focusable mt-1 rounded-pill px-5 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
          </button>
        </div>

        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
          {selected ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={renderUrl(selected.storage_path, { width: 520, quality: 82 })}
              alt=""
              className={fit === "contain" ? "h-full w-full object-contain" : "h-full w-full object-cover"}
              style={{ objectPosition: `center ${focus}` }}
            />
          ) : (
            <div className="grid h-full place-items-center text-xs text-chalk-faint">Live preview</div>
          )}
        </div>
      </div>
    </div>
  );
}
