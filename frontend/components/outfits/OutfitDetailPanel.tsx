"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { type Outfit } from "@/components/outfits/OutfitCard";
import { cn } from "@/components/ui/cn";

interface OutfitDetailPanelProps {
  outfit: Outfit;
  onClose: () => void;
  onToggleFavourite: () => void;
  onDelete: () => void;
}

export function OutfitDetailPanel({
  outfit,
  onClose,
  onToggleFavourite,
  onDelete,
}: OutfitDetailPanelProps) {
  const tags = [
    outfit.style,
    outfit.occasion,
    outfit.season,
  ].filter(Boolean) as string[];

  // 2×2 preview grid — pad to 4 slots
  const preview = [
    ...outfit.items.slice(0, 4),
    ...Array(Math.max(0, 4 - outfit.items.length)).fill(null),
  ];

  return (
    <div className="flex h-full w-[340px] shrink-0 flex-col border-l border-border bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          ✕ Close
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFavourite}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
              outfit.favourite
                ? "bg-yellow-400 text-white hover:bg-yellow-500"
                : "bg-neutral-100 text-neutral-400 hover:bg-yellow-100 hover:text-yellow-500"
            )}
            aria-label={outfit.favourite ? "Remove from favourites" : "Add to favourites"}
          >
            ★
          </button>
          <Link
            href="/outfits/builder"
            className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-hover transition-colors"
          >
            ✎ Edit
          </Link>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
        <h2 className="text-2xl font-bold text-foreground">{outfit.name}</h2>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 2×2 outfit preview */}
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="grid grid-cols-2">
            {preview.map((item, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center justify-center bg-neutral-100 text-4xl",
                  "aspect-square",
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
        </div>

        {/* Items list */}
        <div className="flex flex-col rounded-xl border border-border overflow-hidden">
          <div className="border-b border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Items ({outfit.items.length})
          </div>
          {outfit.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 border-b border-border last:border-0 px-4 py-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-xl">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full rounded-lg object-cover"
                  />
                ) : (
                  <span aria-hidden>{item.emoji ?? "👕"}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {item.category}
                </p>
                <p className="truncate text-sm font-medium text-foreground">
                  {item.name}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        {outfit.notes && (
          <div className="rounded-xl border border-border bg-neutral-50 px-4 py-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Notes
            </p>
            <p className="text-sm text-foreground">{outfit.notes}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 border-t border-border px-6 py-5">
        <Link href="/outfits/builder">
          <Button variant="primary" size="lg" className="w-full rounded-xl">
            Build / Edit Outfit
          </Button>
        </Link>
        <button
          onClick={onDelete}
          className="text-center text-sm font-medium text-red-400 hover:text-red-600 transition-colors"
        >
          Delete Outfit
        </button>
      </div>
    </div>
  );
}