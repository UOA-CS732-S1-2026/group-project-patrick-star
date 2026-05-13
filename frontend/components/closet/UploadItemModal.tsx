"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";

export interface NewClothingItem {
  name: string;
  category: string;
  size?: string;
  fit: string;
  imageFile?: File;
}

interface UploadItemModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (item: NewClothingItem) => void;
}

const SIZES = ["XS", "S", "M", "L", "XL"] as const;
const FITS = ["Relaxed", "Regular", "Slim"] as const;
const CATEGORIES = [
  { label: "Top", value: "Tops" },
  { label: "Bottom", value: "Bottoms" },
  { label: "Shoes", value: "Shoes" },
  { label: "Outerwear", value: "Outerwear" },
] as const;

export function UploadItemModal({ open, onClose, onSubmit }: UploadItemModalProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [size, setSize] = useState("");
  const [fit, setFit] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function handleCategoryChange(nextCategory: string) {
    setCategory(nextCategory);
    if (nextCategory === "Shoes") setSize("");
  }

  function handleSubmit() {
    const resolvedName = name.trim() || category;
    onSubmit({
      name: resolvedName,
      category,
      size: category === "Shoes" ? undefined : size,
      fit,
      imageFile: imageFile ?? undefined,
    });
    handleClose();
  }

  function handleClose() {
    setImageFile(null);
    setImagePreview(null);
    setName("");
    setCategory("");
    setSize("");
    setFit("");
    onClose();
  }

  const isShoes = category === "Shoes";
  const canSubmit = Boolean(category && fit && (isShoes || size));

  const inputClass =
    "w-full rounded-xl border-2 border-border bg-neutral-50 px-4 py-3 text-sm font-medium text-foreground outline-none transition focus:border-accent focus:bg-white placeholder:text-muted-foreground";

  return (
    <Modal open={open} onClose={handleClose} className="max-w-3xl">
      <div className="flex items-center justify-between border-b border-border px-8 pb-6 pt-7">
        <h2 className="text-xl font-bold text-foreground">Upload Clothing Item</h2>
        <button
          onClick={handleClose}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <span aria-hidden>×</span> Cancel
        </button>
      </div>

      <div className="grid grid-cols-2 gap-8 p-8">
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          className={cn(
            "flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors",
            isDragging
              ? "border-brand bg-brand/5"
              : "border-border bg-neutral-50 hover:bg-neutral-100",
          )}
        >
          {imagePreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imagePreview}
              alt="Preview"
              className="h-full max-h-72 w-full rounded-2xl object-contain"
            />
          ) : (
            <>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200 text-xl text-neutral-500">
                ↑
              </div>
              <p className="text-sm font-medium text-foreground">Click to upload or drag &amp; drop</p>
              <p className="mt-1 text-xs text-muted-foreground">JPG, PNG or HEIC</p>
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

        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-foreground">Item setup</h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Linen shirt"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                Select a category
              </option>
              {CATEGORIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {!isShoes && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Size
              </label>
              <div className="flex gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={cn(
                      "flex-1 rounded-xl border-2 py-2.5 text-sm font-semibold transition-colors",
                      size === s
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-border bg-white text-foreground hover:bg-neutral-50",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Fit
            </label>
            <div className="flex gap-2">
              {FITS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFit(f)}
                  className={cn(
                    "flex-1 rounded-xl border-2 py-2.5 text-sm font-semibold transition-colors",
                    fit === f
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-border bg-white text-foreground hover:bg-neutral-50",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="mt-auto w-full rounded-xl"
          >
            Add to Closet
          </Button>
        </div>
      </div>
    </Modal>
  );
}
