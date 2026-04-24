"use client";

import { Button } from "@/components/ui/Button";
import { type ClothingItem } from "@/components/ui/ItemCard";

interface ItemDetailPanelProps {
  item: ClothingItem;
  onClose: () => void;
  onEdit: () => void;
  onAddToOutfit?: (item: ClothingItem) => void;
}

const DETAIL_FIELDS: { key: keyof ClothingItem; label: string }[] = [
  { key: "category", label: "CATEGORY" },
  { key: "size", label: "SIZE" },
  { key: "colour", label: "COLOUR" },
  { key: "fit", label: "FIT" },
  { key: "fabric", label: "FABRIC" },
];

export function ItemDetailPanel({ item, onClose, onEdit, onAddToOutfit }: ItemDetailPanelProps) {
  const tags = [
    item.category,
    item.colour,
    item.fabric,
    item.fit ? `${item.fit} fit` : null,
  ].filter(Boolean) as string[];

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
            onClick={() => {
              // TODO: toggle favourite via PATCH /api/clothing/:id { favourite: !item.favourite }
            }}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${item.favourite
                ? "bg-yellow-400 text-white hover:bg-yellow-500"
                : "bg-neutral-100 text-neutral-400 hover:bg-yellow-100 hover:text-yellow-500"
              }`}
          >
            ★
          </button>
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-hover transition-colors"
          >
            ✎ Edit
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
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

        {/* Item image / emoji */}
        <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-neutral-100 text-8xl">
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

        {/* Details table */}
        <div className="flex flex-col rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
            Details
          </div>
          {DETAIL_FIELDS.map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center gap-4 border-b border-border last:border-0 px-4 py-3"
            >
              <span className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
              </span>
              <span className="text-sm font-medium text-foreground">
                {(item[key] as string | undefined) ?? "—"}
              </span>
            </div>
          ))}
        </div>

        {/* Wear stats */}
        {(item.timesWorn !== undefined || item.price !== undefined) && (
          <div className="flex items-center gap-2 rounded-xl border border-border bg-neutral-50 px-4 py-3">
            <span>♻️</span>
            <span className="text-sm text-muted-foreground">Worn</span>
            <span className="text-sm font-bold text-foreground">{item.timesWorn ?? 0} times</span>
            {item.price && item.timesWorn ? (
              <>
                <span className="text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">
                  ${(item.price / item.timesWorn).toFixed(2)}/wear
                </span>
              </>
            ) : null}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-6 py-5">
        <Button
          variant="primary"
          size="lg"
          className="w-full rounded-xl"
          onClick={() => { onAddToOutfit?.(item); onClose(); }}
        >
          Add to Existing Outfit
        </Button>
      </div>
    </div>
  );
}