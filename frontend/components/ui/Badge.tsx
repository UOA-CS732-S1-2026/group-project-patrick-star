import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type Tone = "accent" | "neutral" | "brand";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  icon?: ReactNode;
}

const toneClasses: Record<Tone, string> = {
  accent: "bg-accent-soft text-accent",
  neutral: "bg-neutral-100 text-neutral-600",
  brand: "bg-brand/15 text-brand",
};

export function Badge({
  tone = "accent",
  icon,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      {...props}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
        toneClasses[tone],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
