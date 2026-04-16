"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  /** Dark filled style, used for category tabs in the closet screen. */
  variant?: "outline" | "solid";
}

export function Chip({
  selected = false,
  variant = "outline",
  className,
  children,
  ...props
}: ChipProps) {
  const base =
    "inline-flex items-center justify-center rounded-full px-4 h-9 text-sm font-medium transition-colors whitespace-nowrap";

  const styles =
    variant === "solid"
      ? selected
        ? "bg-neutral-900 text-white border border-neutral-900"
        : "bg-white text-neutral-700 border border-border hover:bg-neutral-50"
      : selected
      ? "bg-accent-soft text-accent border border-accent"
      : "bg-white text-neutral-700 border border-border hover:bg-neutral-50";

  return (
    <button {...props} className={cn(base, styles, className)}>
      {children}
    </button>
  );
}
