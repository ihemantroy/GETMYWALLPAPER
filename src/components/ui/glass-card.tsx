import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Minimal raised surface. (Name kept for import stability.) */
export function GlassCard({
  children,
  className,
  interactive = true,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  as?: "div" | "article" | "section";
}) {
  return (
    <Tag
      className={cn(
        "surface rounded-card",
        interactive && "transition-colors duration-200 hover:bg-white/[0.05]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
