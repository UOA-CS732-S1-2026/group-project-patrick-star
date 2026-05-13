import type { ReactNode } from "react";
import { cn } from "./cn";

export interface ClothingItem {
  id: string;
  name: string;
  category: string;
  emoji?: string;
  imageUrl?: string;
  size?: string;
  fit?: string;
  favourite?: boolean;
  timesWorn?: number;
  price?: number;
}

interface ItemCardProps {
  item: ClothingItem;
  className?: string;
  footer?: ReactNode;
  onClick?: () => void;
  onToggleFavourite?: () => void;
}

export function ItemCard({
  item,
  className,
  footer,
  onClick,
  onToggleFavourite,
}: ItemCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group overflow-hidden rounded-2xl bg-white border border-border shadow-sm",
        onClick && "cursor-pointer hover:shadow-md transition-shadow",
        className
      )}
    >
      <div className="flex aspect-[4/5] items-center justify-center bg-neutral-100 text-5xl">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span aria-hidden>{item.emoji ?? "👕"}</span>
        )}
      </div>
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {item.category}
            </div>
            <div className="truncate text-sm font-semibold text-foreground">
              {item.name}
            </div>
          </div>

          {onToggleFavourite ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavourite();
              }}
              className={cn(
                "mt-0.5 shrink-0 text-lg transition-colors",
                item.favourite
                  ? "text-yellow-400"
                  : "text-neutral-300 hover:text-yellow-300",
              )}
              aria-label={
                item.favourite ? "Remove from favourites" : "Add to favourites"
              }
            >
              ★
            </button>
          ) : null}
        </div>
        {footer}
      </div>
    </div>
  );
}
