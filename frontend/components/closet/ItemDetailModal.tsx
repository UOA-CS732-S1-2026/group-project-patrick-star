"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { type ClothingItem } from "@/components/ui/ItemCard";
import { cn } from "@/components/ui/cn";

interface ItemDetailModalProps {
  item: ClothingItem | null;
  open: boolean;
  onClose: () => void;
  onAddToOutfit?: (item: ClothingItem) => void;
  onRemove?: (item: ClothingItem) => void;
}

const DETAIL_FIELDS = ["Category", "Size", "Colour", "Fit"] as const;

export function ItemDetailModal({
  item,
  open,
  onClose,
  onAddToOutfit,
  onRemove,
}: ItemDetailModalProps) {
  const [confirmRemove, setConfirmRemove] = useState(false);

  if (!item) return null;

  // Derive tags from item fields — extend ClothingItem as your data model grows
  const tags = [
    item.category,
    (item as any).style,
    (item as any).colour,
    (item as any).material,
    (item as any).fit ? `${(item as any).fit} fit` : null,
  ].filter(Boolean) as string[];

  const details: Record<string, string> = {
    Category: item.category,
    Size: (item as any).size ?? "—",
    Colour: (item as any).colour ?? "—",
    Fit: (item as any).fit ?? "—",
  };

  const timesWorn: number = (item as any).timesWorn ?? 0;
  const costPerWear: string | null =
    timesWorn > 0 && (item as any).price
      ? `$${((item as any).price / timesWorn).toFixed(2)}/wear`
      : null;

  function handleRemove() {
    if (!confirmRemove) {
      setConfirmRemove(true);
      return;
    }
    onRemove?.(item!);
    setConfirmRemove(false);
    onClose();
  }

  function handleClose() {
    setConfirmRemove(false);
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} className="max-w-3xl">
      {/* Back button */}
      <div className="px-8 pt-6">
        <button
          onClick={handleClose}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to closet
        </button>
      </div>

      <div className="grid grid-cols-2 gap-8 p-8">
        {/* Left: Image */}
        <div className="flex items-center justify-center rounded-2xl bg-neutral-100 min-h-80">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-full w-full rounded-2xl object-contain max-h-80"
            />
          ) : (
            <span className="text-8xl" aria-hidden>
              {item.emoji ?? "👕"}
            </span>
          )}
        </div>

        {/* Right: Details */}
        <div className="flex flex-col gap-5">
          {/* Name */}
          <h2 className="text-2xl font-bold text-foreground">{item.name}</h2>

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

          {/* Details table */}
          <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Details
            </div>
            {DETAIL_FIELDS.map((field) => (
              <div key={field} className="flex items-center px-4 py-3">
                <span className="w-24 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {field}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {details[field]}
                </span>
              </div>
            ))}
          </div>

          {/* Worn stats */}
          {timesWorn > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-border bg-neutral-50 px-4 py-3">
              <span className="text-base">♻️</span>
              <span className="text-sm text-muted-foreground">Worn</span>
              <span className="text-sm font-bold text-foreground">
                {timesWorn} times
              </span>
              {costPerWear && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {costPerWear}
                  </span>
                </>
              )}
            </div>
          )}

          {/* CTAs */}
          <div className="mt-auto flex flex-col gap-3">
            <Button
              variant="primary"
              size="lg"
              className="w-full rounded-xl"
              onClick={() => { onAddToOutfit?.(item!); handleClose(); }}
            >
              Add to Outfit
            </Button>
            <button
              onClick={handleRemove}
              className={cn(
                "text-sm font-medium text-center transition-colors",
                confirmRemove
                  ? "text-red-500 hover:text-red-600"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {confirmRemove ? "Tap again to confirm removal" : "Remove from closet"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}