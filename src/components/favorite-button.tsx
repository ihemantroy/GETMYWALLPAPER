"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function FavoriteButton({ id, className }: { id: string; className?: string }) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    try {
      const set = JSON.parse(localStorage.getItem("favorites") || "[]");
      setFav(set.includes(id));
    } catch {}
  }, [id]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      const set: string[] = JSON.parse(localStorage.getItem("favorites") || "[]");
      const next = set.includes(id) ? set.filter((x) => x !== id) : [...set, id];
      localStorage.setItem("favorites", JSON.stringify(next));
      setFav(next.includes(id));
      window.dispatchEvent(new Event("favorites-changed"));
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      aria-label={fav ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={fav}
      className={cn(
        "focusable grid h-9 w-9 place-items-center rounded-pill backdrop-blur-md transition active:scale-90",
        "bg-black/30 hover:bg-black/50",
        fav ? "text-accent-2" : "text-white/90 hover:text-accent-2",
        className,
      )}
    >
      <Heart size={16} fill={fav ? "currentColor" : "none"} />
    </button>
  );
}
