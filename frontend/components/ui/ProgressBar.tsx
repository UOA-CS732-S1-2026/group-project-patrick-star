import { cn } from "./cn";

interface ProgressBarProps {
  value: number; // 0..100
  className?: string;
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("h-1.5 w-full rounded-full bg-neutral-200", className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-brand transition-[width]"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
