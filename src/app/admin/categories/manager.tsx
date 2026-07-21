"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { createCategory, deleteCategory } from "@/app/admin/actions";
import type { Category } from "@/lib/types";

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [name, setName] = useState("");
  const [pending, start] = useTransition();

  return (
    <div className="mt-8">
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && name.trim()) {
              start(async () => { await createCategory(name); setName(""); });
            }
          }}
          placeholder="New category name…"
          className="focusable surface h-11 flex-1 rounded-pill px-4 text-sm text-chalk placeholder:text-chalk-faint"
        />
        <button
          onClick={() => name.trim() && start(async () => { await createCategory(name); setName(""); })}
          disabled={pending || !name.trim()}
          className="btn-accent focusable inline-flex h-11 items-center gap-2 rounded-pill px-5 text-sm font-semibold disabled:opacity-50"
        >
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Add
        </button>
      </div>

      <div className="mt-5 space-y-2">
        {categories.length === 0 ? (
          <p className="text-sm text-chalk-faint">No categories yet. Add your first above.</p>
        ) : (
          categories.map((c) => (
            <div key={c.id} className="surface flex items-center justify-between rounded-card px-4 py-3">
              <div>
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs text-chalk-faint">{c.count ?? 0} wallpaper{(c.count ?? 0) === 1 ? "" : "s"}</p>
              </div>
              <button
                onClick={() => {
                  if (confirm(`Delete "${c.name}"? Wallpapers stay, but lose this category.`)) {
                    start(() => deleteCategory(c.id));
                  }
                }}
                disabled={pending}
                aria-label="Delete category"
                className="focusable grid h-9 w-9 place-items-center rounded-pill text-chalk-muted transition hover:text-accent-2"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
