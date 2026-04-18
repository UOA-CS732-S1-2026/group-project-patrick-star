"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { type ClothingItem } from "@/components/ui/ItemCard";
import { cn } from "@/components/ui/cn";

interface EditItemPanelProps {
  item: ClothingItem;
  onCancel: () => void;
  onSave: (updated: ClothingItem) => void;
  onRemove: (item: ClothingItem) => void;
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const FITS = ["Relaxed", "Regular", "Slim"] as const;

export function EditItemPanel({ item, onCancel, onSave, onRemove }: EditItemPanelProps) {
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState(item.category);
  const [colour, setColour] = useState((item as any).colour ?? "");
  const [size, setSize] = useState((item as any).size ?? "");
  const [fit, setFit] = useState((item as any).fit ?? "");
  const [fabric, setFabric] = useState((item as any).fabric ?? "");
  const [confirmRemove, setConfirmRemove] = useState(false);

  function handleSave() {
    onSave({ ...item, name, category, colour, size, fit, fabric } as ClothingItem);
  }

  function handleRemove() {
    if (!confirmRemove) { setConfirmRemove(true); return; }
    onRemove(item);
  }

  return (
    <div className="flex h-full w-[340px] shrink-0 flex-col border-l border-border bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <button
          onClick={onCancel}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <span className="text-sm font-semibold text-foreground">Edit item</span>
        <button
          onClick={handleSave}
          className="text-sm font-semibold text-brand hover:opacity-75 transition-opacity"
        >
          Save
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
        {/* Item image thumbnail */}
        <div className="flex items-center gap-4 rounded-2xl bg-neutral-100 px-4 py-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white text-3xl shadow-sm">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="h-full w-full rounded-xl object-cover" />
            ) : (
              <span aria-hidden>{item.emoji ?? "👕"}</span>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {item.category}
            </p>
            <p className="text-sm font-semibold text-foreground">{item.name}</p>
          </div>
        </div>

        {/* Text fields */}
        {[
          { label: "Name", value: name, setter: setName },
          { label: "Category", value: category, setter: setCategory },
          { label: "Colour", value: colour, setter: setColour },
          { label: "Fabric", value: fabric, setter: setFabric },
        ].map(({ label, value, setter }) => (
          <div key={label} className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setter(e.target.value)}
              className="w-full rounded-xl border-2 border-border bg-neutral-50 px-4 py-2.5 text-sm font-medium text-foreground outline-none transition focus:border-accent focus:bg-white placeholder:text-muted-foreground"
            />
          </div>
        ))}

        {/* Size toggle */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Size
          </label>
          <div className="flex gap-1.5">
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={cn(
                  "flex-1 rounded-xl border-2 py-2 text-xs font-semibold transition-colors",
                  size === s
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border bg-white text-foreground hover:bg-neutral-50"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Fit toggle */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Fit
          </label>
          <div className="flex gap-1.5">
            {FITS.map((f) => (
              <button
                key={f}
                onClick={() => setFit(f)}
                className={cn(
                  "flex-1 rounded-xl border-2 py-2 text-xs font-semibold transition-colors",
                  fit === f
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border bg-white text-foreground hover:bg-neutral-50"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 border-t border-border px-6 py-5">
        <Button variant="primary" size="lg" className="w-full rounded-xl" onClick={handleSave}>
          Save Changes
        </Button>
        <button
          onClick={handleRemove}
          className={cn(
            "text-center text-sm font-medium transition-colors",
            confirmRemove
              ? "text-red-500 hover:text-red-600"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {confirmRemove ? "Tap again to confirm removal" : "Remove from closet"}
        </button>
      </div>
    </div>
  );
}