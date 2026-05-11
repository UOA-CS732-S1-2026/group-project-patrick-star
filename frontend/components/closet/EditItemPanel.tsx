"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { Button } from "@/components/ui/Button";
import { type ClothingItem } from "@/components/ui/ItemCard";
import { cn } from "@/components/ui/cn";

interface EditItemPanelProps {
  item: ClothingItem;
  onCancel: () => void;
  onSave: (updated: ClothingItem, imageFile?: File) => void;
  onRemove: (item: ClothingItem) => void;
}

const SIZES = ["XS", "S", "M", "L", "XL"] as const;
const FITS = ["Relaxed", "Regular", "Slim"] as const;

export function EditItemPanel({ item, onCancel, onSave, onRemove }: EditItemPanelProps) {
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState(item.category);
  const [size, setSize] = useState(item.size ?? "");
  const [fit, setFit] = useState(item.fit ?? "");

  // Image state — start from the existing imageUrl if present
  const [imagePreview, setImagePreview] = useState<string | null>(item.imageUrl ?? null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);

  function handleFile(file: File) {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleSave() {
    const newImageUrl = imageFile
      ? URL.createObjectURL(imageFile)
      : item.imageUrl;

    onSave({ ...item, name, category, size, fit, imageUrl: newImageUrl }, imageFile ?? undefined);
  }

  function handleRemove() {
    if (!confirmRemove) { setConfirmRemove(true); return; }
    onRemove(item);
  }

  const inputClass =
    "w-full rounded-xl border-2 border-border bg-neutral-50 px-4 py-2.5 text-sm font-medium text-foreground outline-none transition focus:border-accent focus:bg-white placeholder:text-muted-foreground";

  return (
    <div className="flex h-full w-[340px] shrink-0 flex-col border-l border-border bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          ✕ Cancel
        </button>
        <span className="text-sm font-bold text-foreground">Edit item</span>
        {/* Spacer to keep title centred */}
        <div className="w-14" />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
        {/* Image upload zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          className={cn(
            "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer transition-colors",
            imagePreview ? "min-h-40" : "min-h-36",
            isDragging
              ? "border-brand bg-brand/5"
              : "border-border bg-neutral-50 hover:bg-neutral-100"
          )}
        >
          {imagePreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imagePreview}
              alt={name}
              className="h-full w-full max-h-40 rounded-2xl object-contain"
            />
          ) : (
            <>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-neutral-500 text-lg">
                ↑
              </div>
              <p className="text-sm font-medium text-foreground">Click to upload or drag &amp; drop</p>
              <p className="mt-0.5 text-xs text-muted-foreground">JPG, PNG or HEIC</p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/heic"
          className="hidden"
          onChange={handleFileInput}
        />

        {/* Text fields */}
        {([
          { label: "Name", value: name, setter: setName },
          { label: "Category", value: category, setter: setCategory },
        ] as const).map(({ label, value, setter }) => (
          <div key={label} className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => (setter as (v: string) => void)(e.target.value)}
              className={inputClass}
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
          Save
        </Button>
        <button
          onClick={handleRemove}
          className={cn(
            "flex items-center justify-center gap-1.5 text-center text-sm font-medium transition-colors",
            confirmRemove
              ? "text-red-500 hover:text-red-600"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span aria-hidden>🗑</span>
          {confirmRemove ? "Tap again to confirm removal" : "Remove"}
        </button>
      </div>
    </div>
  );
}
