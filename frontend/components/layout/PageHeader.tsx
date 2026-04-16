import type { ReactNode } from "react";
import { cn } from "../ui/cn";

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  className?: string;
}

/**
 * Top bar for a page, with a title/subtitle on the left and optional
 * actions or status pills on the right. Sits under the AppShell main area.
 */
export function PageHeader({
  title,
  subtitle,
  right,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex items-start justify-between gap-4 border-b border-border bg-background px-10 py-8",
        className
      )}
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {right && <div className="flex items-center gap-3">{right}</div>}
    </header>
  );
}
