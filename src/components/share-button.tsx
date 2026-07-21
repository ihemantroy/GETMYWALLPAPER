"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";

export function ShareButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    const url = `${window.location.origin}/wallpaper/${slug}`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }
  return (
    <button
      onClick={copy}
      className="surface focusable inline-flex h-11 items-center gap-2 rounded-pill px-5 text-sm font-medium text-chalk transition hover:bg-white/10"
    >
      {copied ? <Check size={16} className="text-accent" /> : <Link2 size={16} />}
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
