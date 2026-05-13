"use client";

import { type ClothingItem } from "@/components/ui/ItemCard";
import { cn } from "@/components/ui/cn";
import { getOutfitPreviewItems } from "@/components/outfits/preview";

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
  /** Whether this card's detail panel is currently open */
  selected?: boolean;
  onClick?: () => void;
  /** Called when the star button is tapped — separate from card click */
  onToggleFavourite?: () => void;
}

export function OutfitCard({ outfit, selected, onClick, onToggleFavourite }: OutfitCardProps) {
  const preview: (ClothingItem | null)[] = getOutfitPreviewItems(outfit.items);

  return (
    <div
      onClick={onClick}
      className={cn(
        "overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow",
        onClick && "cursor-pointer hover:shadow-md",
        selected ? "border-accent ring-2 ring-accent" : "border-border"
      )}
    >
      {/* 2×2 item grid */}
      <div className="grid grid-cols-2">
        {preview.map((item, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center justify-center bg-neutral-100 text-4xl aspect-square",
              i % 2 === 0 ? "border-r border-border" : "",
              i < 2 ? "border-b border-border" : ""
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

      {/* Footer */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {outfit.style}
            </span>
            <div className="mt-1 truncate text-sm font-semibold text-foreground">
              {outfit.name}
            </div>
          </div>

          {/* Star — stopPropagation so it doesn't also open the panel */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavourite?.();
            }}
            className={cn(
              "mt-0.5 shrink-0 text-lg transition-colors",
              outfit.favourite
                ? "text-yellow-400"
                : "text-neutral-300 hover:text-yellow-300"
            )}
            aria-label={outfit.favourite ? "Remove from favourites" : "Add to favourites"}
          >
            ★
          </button>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{outfit.items.length} items</p>
      </div>
    </div>
  );
}
