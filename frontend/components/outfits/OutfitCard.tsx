"use client";

import { getOutfitPreviewItems } from "@/components/outfits/preview";
import { cn } from "@/components/ui/cn";
import { type ClothingItem } from "@/components/ui/ItemCard";

export interface Outfit {
  id: string;
  name: string;
  style: string;
  season?: string;
  occasion?: string;
  notes?: string;
  items: ClothingItem[];
  favourite?: boolean;
  lastTryOnPreviewUrl?: string | null;
}

interface OutfitCardProps {
  outfit: Outfit;
  selected?: boolean;
  compact?: boolean;
  className?: string;
  onClick?: () => void;
  onToggleFavourite?: () => void;
}

export function OutfitCard({
  outfit,
  selected,
  compact = false,
  className,
  onClick,
  onToggleFavourite,
}: OutfitCardProps) {
  const preview: (ClothingItem | null)[] = getOutfitPreviewItems(outfit.items);

  return (
    <div
      onClick={onClick}
      className={cn(
        "overflow-hidden border bg-white shadow-sm transition-shadow",
        compact ? "rounded-xl" : "rounded-2xl",
        onClick && "cursor-pointer hover:shadow-md",
        selected ? "border-accent ring-2 ring-accent" : "border-border",
        className,
      )}
    >
      <div className="grid grid-cols-2">
        {preview.map((item, index) => (
          <div
            key={index}
            className={cn(
              "aspect-square flex items-center justify-center bg-neutral-100",
              compact ? "text-3xl" : "text-4xl",
              index % 2 === 0 ? "border-r border-border" : "",
              index < 2 ? "border-b border-border" : "",
            )}
          >
            {item ? (
              item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span aria-hidden>{item.emoji ?? "👕"}</span>
              )
            ) : null}
          </div>
        ))}
      </div>

      <div className={cn("border-t border-border", compact ? "px-3 py-2.5" : "px-4 py-3")}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span
              className={cn(
                "inline-block rounded-full bg-neutral-100 font-semibold uppercase tracking-wider text-muted-foreground",
                compact ? "px-2 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]",
              )}
            >
              {outfit.style}
            </span>
            <div
              className={cn(
                "mt-1 truncate font-semibold text-foreground",
                compact ? "text-xs" : "text-sm",
              )}
            >
              {outfit.name}
            </div>
          </div>

          <button
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavourite?.();
            }}
            className={cn(
              "mt-0.5 shrink-0 transition-colors",
              compact ? "text-base" : "text-lg",
              outfit.favourite
                ? "text-yellow-400"
                : "text-neutral-300 hover:text-yellow-300",
            )}
            aria-label={outfit.favourite ? "Remove from favourites" : "Add to favourites"}
          >
            ★
          </button>
        </div>
        <p className={cn("mt-0.5 text-muted-foreground", compact ? "text-[11px]" : "text-xs")}>
          {outfit.items.length} items
        </p>
      </div>
    </div>
  );
}
