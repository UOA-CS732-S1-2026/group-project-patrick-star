import type { InputHTMLAttributes } from "react";
import { cn } from "./cn";

export function SearchInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 h-11 w-full rounded-full bg-white border border-border px-4 shadow-sm",
        className
      )}
    >
      <span aria-hidden className="text-muted-foreground">
        🔍
      </span>
      <input
        {...props}
        className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
      />
    </div>
  );
}
