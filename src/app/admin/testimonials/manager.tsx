"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Loader2, Star } from "lucide-react";
import { createTestimonial, deleteTestimonial } from "@/app/admin/actions";
import type { Testimonial } from "@/lib/types";

export function TestimonialManager({ items }: { items: Testimonial[] }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [pending, start] = useTransition();

  const canAdd = name.trim().length > 0 && text.trim().length > 0;

  const add = () => {
    if (!canAdd) return;
    start(async () => {
      await createTestimonial({ name, text, role, rating });
      setName(""); setRole(""); setText(""); setRating(5);
    });
  };

  return (
    <div className="mt-8">
      {/* add form */}
      <div className="surface rounded-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (e.g. Pritam)"
            className="focusable surface h-11 flex-1 rounded-pill px-4 text-sm text-chalk placeholder:text-chalk-faint"
          />
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Label (optional, e.g. Phone)"
            className="focusable surface h-11 flex-1 rounded-pill px-4 text-sm text-chalk placeholder:text-chalk-faint"
          />
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What they said…"
          rows={3}
          className="focusable surface mt-3 w-full resize-none rounded-card px-4 py-3 text-sm text-chalk placeholder:text-chalk-faint"
        />

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-chalk-muted">Rating</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  aria-label={`${n} star${n === 1 ? "" : "s"}`}
                  className="focusable rounded p-0.5"
                >
                  <Star
                    size={18}
                    className={n <= rating ? "fill-accent-2 text-accent-2" : "text-chalk-faint"}
                  />
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={add}
            disabled={pending || !canAdd}
            className="btn-accent focusable inline-flex h-11 items-center gap-2 rounded-pill px-5 text-sm font-semibold disabled:opacity-50"
          >
            {pending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Add testimonial
          </button>
        </div>
      </div>

      {/* list */}
      <div className="mt-6 space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-chalk-faint">
            No testimonials added yet — the default set shows on the homepage until you add your own.
          </p>
        ) : (
          items.map((t) => (
            <div key={t.id} className="surface flex items-start justify-between gap-4 rounded-card px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{t.name}</p>
                  {t.role && <span className="text-xs text-chalk-faint">· {t.role}</span>}
                  <span className="flex gap-0.5">
                    {Array.from({ length: Math.min(5, Math.max(1, t.rating ?? 5)) }).map((_, i) => (
                      <Star key={i} size={11} className="fill-accent-2 text-accent-2" />
                    ))}
                  </span>
                </div>
                <p className="mt-1 text-sm text-chalk-muted">{t.text}</p>
              </div>
              <button
                onClick={() => {
                  if (confirm(`Delete ${t.name}'s testimonial?`)) start(() => deleteTestimonial(t.id!));
                }}
                disabled={pending}
                aria-label="Delete testimonial"
                className="focusable grid h-9 w-9 shrink-0 place-items-center rounded-pill text-chalk-muted transition hover:text-accent-2"
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
