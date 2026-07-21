import Link from "next/link";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "glass" | "iris" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  ariaLabel?: string;
};

const sizes = { sm: "h-9 px-4 text-sm", md: "h-11 px-6 text-sm", lg: "h-13 px-7 text-[15px]" };

export function GlassButton({
  children, href, onClick, variant = "glass", size = "md",
  className, type = "button", disabled, ariaLabel,
}: Props) {
  const base = cn(
    "focusable inline-flex items-center justify-center gap-2 rounded-pill font-medium",
    "transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none",
    sizes[size],
    variant === "glass" && "surface text-chalk hover:bg-white/[0.06]",
    variant === "iris" && "btn-accent font-semibold shadow-glow hover:brightness-110",
    variant === "ghost" && "text-chalk-muted hover:text-chalk hover:bg-white/5",
    className,
  );
  return href ? (
    <Link href={href} className={base} aria-label={ariaLabel}>{children}</Link>
  ) : (
    <button type={type} onClick={onClick} disabled={disabled} className={base} aria-label={ariaLabel}>
      {children}
    </button>
  );
}
