"use client";

import { Button } from "@/components/ui/Button";
import { type ClothingItem } from "@/components/ui/ItemCard";

interface ItemDetailPanelProps {
  item: ClothingItem;
  onClose: () => void;
  onEdit: () => void;
  onAddToOutfit?: (item: ClothingItem) => void;
}

const DETAIL_FIELDS = [
  { key: "category", label: "CATEGORY" },
  { key: "size", label: "SIZE" },
  { key: "colour", label: "COLOUR" },
  { key: "fit", label: "FIT" },
  { key: "fabric", label: "FABRIC" },
] as const;

export function ItemDetailPanel({ item, onClose, onEdit, onAddToOutfit }: ItemDetailPanelProps) {
  const tags = [
    item.category,
    (item as any).style,
    (item as any).colour,
    (item as any).fit ? `${(item as any).fit} fit` : null,
  ].filter(Boolean) as string[];

  const detailValues: Record<string, string> = {
    category: item.category,
    size: (item as any).size ?? "—",
    colour: (item as any).colour ?? "—",
    fit: (item as any).fit ?? "—",
    fabric: (item as any).fabric ?? "—",
  };

  const timesWorn: number = (item as any).timesWorn ?? 14;
  const costPerWear = (item as any).price
    ? `$${((item as any).price / timesWorn).toFixed(2)}/wear`
    : "$2.80/wear";

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
          <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400 text-white hover:bg-yellow-500 transition-colors">
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
                {detailValues[key]}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-border bg-neutral-50 px-4 py-3">
          <span>♻️</span>
          <span className="text-sm text-muted-foreground">Worn</span>
          <span className="text-sm font-bold text-foreground">{timesWorn} times</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-sm text-muted-foreground">{costPerWear}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border px-6 py-5">
        <Button
          variant="primary"
          size="lg"
          className="w-full rounded-xl"
          onClick={() => { onAddToOutfit?.(item); onClose(); }}
        >
          Add to Outfit
        </Button>
      </div>
    </div>
  );
}