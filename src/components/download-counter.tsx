"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { formatCount } from "@/lib/utils";

export function DownloadCounter({ initial }: { initial: number }) {
  const [count, setCount] = useState(initial);
  useEffect(() => {
    const bump = () => setCount((c) => c + 1);
    window.addEventListener("wallpaper-downloaded", bump);
    return () => window.removeEventListener("wallpaper-downloaded", bump);
  }, []);
  return (
    <span className="inline-flex items-center gap-1">
      <Download size={14} /> {formatCount(count)} download{count === 1 ? "" : "s"}
    </span>
  );
}
