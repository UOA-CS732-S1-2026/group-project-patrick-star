"use client";

import { type ClothingItem } from "@/components/ui/ItemCard";
import { cn } from "@/components/ui/cn";

export interface Outfit {
  id: string;
  name: string;
  style: string;
  season?: string;
  occasion?: string;
  notes?: string;
  items: ClothingItem[];
  favourite?: boolean;
}

interface OutfitCardProps {
  outfit: Outfit;
  onClick?: () => void;
}

/**
 * Shows a 2×2 grid of item thumbnails, the style tag, outfit name,
 * item count, and a favourite star — matching the "My Outfits" screen design.
 */
export function OutfitCard({ outfit, onClick }: OutfitCardProps) {
  // Take first 4 items for the preview grid; pad with nulls so grid is always 2×2
  const preview: (ClothingItem | null)[] = [
    ...outfit.items.slice(0, 4),
    ...Array(Math.max(0, 4 - outfit.items.length)).fill(null),
  ];

  return (
    <div
      onClick={onClick}
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-white shadow-sm",
        onClick && "cursor-pointer hover:shadow-md transition-shadow"
      )}
    >
      {/* 2×2 item grid */}
      <div className="grid grid-cols-2">
        {preview.map((item, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center justify-center bg-neutral-100 text-4xl",
              "aspect-square",
              // fine inner borders between cells
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              // TODO: toggle favourite via PATCH /api/outfits/:id { favourite: !outfit.favourite }
            }}
            className={cn(
              "mt-0.5 shrink-0 text-lg transition-colors",
              outfit.favourite ? "text-yellow-400" : "text-neutral-300 hover:text-yellow-300"
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