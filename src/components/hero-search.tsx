"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = q.trim();
    window.dispatchEvent(new Event("app:navstart"));
    router.push(t ? `/?q=${encodeURIComponent(t)}` : "/");
  }

  return (
    <form onSubmit={submit} className="relative max-w-xl">
      <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-chalk-faint" />
      <input
        type="search"
        inputMode="search"
        enterKeyHint="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search wallpapers, categories, collections…"
        className="focusable h-14 w-full rounded-full border border-white/12 bg-white/[0.04] pl-12 pr-28 text-sm text-chalk placeholder:text-chalk-faint backdrop-blur-xl [&::-webkit-search-cancel-button]:hidden"
      />
      <button
        type="submit"
        className="btn-accent focusable absolute right-2 top-1/2 inline-flex h-10 -translate-y-1/2 items-center gap-1.5 rounded-full px-5 text-sm font-semibold"
      >
        <Search size={15} /> Search
      </button>
    </form>
  );
}
