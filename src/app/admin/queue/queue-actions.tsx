"use client";

import { useTransition } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { approveWallpaper, rejectWallpaper } from "@/app/admin/actions";

export function QueueActions({ id }: { id: string }) {
  const [pending, start] = useTransition();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => start(() => approveWallpaper(id))}
        disabled={pending}
        className="focusable inline-flex h-10 items-center gap-2 rounded-pill px-5 text-sm font-semibold btn-accent disabled:opacity-50"
      >
        {pending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Approve & publish
      </button>
      <button
        onClick={() => start(() => rejectWallpaper(id))}
        disabled={pending}
        className="focusable surface inline-flex h-10 items-center gap-2 rounded-pill px-5 text-sm text-chalk-muted hover:text-chalk disabled:opacity-50"
      >
        <X size={15} /> Reject
      </button>
    </div>
  );
}
