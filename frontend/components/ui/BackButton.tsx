import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

type BackButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function BackButton({ className, children = "Back", ...props }: BackButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-full border border-border bg-white px-4 py-1.5 text-sm font-medium shadow-sm hover:bg-neutral-50",
        className,
      )}
    >
      {children}
    </button>
  );
}
