"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";

export interface NewClothingItem {
  name: string;
  category: string;
  colour: string;
  size: string;
  fit: string;
  fabric: string;
  imageFile?: File;
}

interface UploadItemModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (item: NewClothingItem) => void;
}

const SIZES = ["XS", "S", "M", "L", "XL"] as const;
const FITS = ["Relaxed", "Regular", "Slim"] as const;

export function UploadItemModal({ open, onClose, onSubmit }: UploadItemModalProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [colour, setColour] = useState("");
  const [fabric, setFabric] = useState("");
  const [size, setSize] = useState("");
  const [fit, setFit] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    // TODO: Replace with real AI image analysis via the OpenAI API
    setAiProcessing(true);
    setTimeout(() => {
      setCategory("Tops");
      setColour("White");
      setFabric("Cotton");
      setAiProcessing(false);
    }, 1800);
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

  function handleSubmit() {
    // Fall back to "Colour Category" if the user left the name blank
    const resolvedName = name.trim() || `${colour} ${category}`.trim();
    onSubmit({ name: resolvedName, category, colour, fabric, size, fit, imageFile: imageFile ?? undefined });
    handleClose();
  }

  function handleClose() {
    setImageFile(null);
    setImagePreview(null);
    setName("");
    setCategory("");
    setColour("");
    setFabric("");
    setSize("");
    setFit("");
    setAiProcessing(false);
    onClose();
  }

  const canSubmit = category && colour && size && fit;

  const inputClass =
    "w-full rounded-xl border-2 border-border bg-neutral-50 px-4 py-3 text-sm font-medium text-foreground outline-none transition focus:border-accent focus:bg-white placeholder:text-muted-foreground";

  const aiTag = aiProcessing ? (
    <span className="rounded bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
      AI ✦
    </span>
  ) : null;

  return (
    <Modal open={open} onClose={handleClose} className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-7 pb-6 border-b border-border">
        <h2 className="text-xl font-bold text-foreground">Upload Clothing Item</h2>
        <button
          onClick={handleClose}
          className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
        >
          <span aria-hidden>✕</span> Cancel
        </button>
      </div>

      <div className="grid grid-cols-2 gap-8 p-8">
        {/* Left: Image upload */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          className={cn(
            "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer transition-colors min-h-72",
            isDragging
              ? "border-brand bg-brand/5"
              : "border-border bg-neutral-50 hover:bg-neutral-100"
          )}
        >
          {imagePreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imagePreview}
              alt="Preview"
              className="h-full w-full rounded-2xl object-contain max-h-72"
            />
          ) : (
            <>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200 text-neutral-500 text-xl">
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

        {/* Right: Item details */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">Item details</h3>
            {/* AI status badge — only shown once a file is selected */}
            {imageFile && (
              <div className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                aiProcessing ? "bg-accent-soft text-accent" : "bg-neutral-100 text-muted-foreground"
              )}>
                <span>✦</span>
                {aiProcessing ? (
                  <>
                    AI PROCESSING
                    <span className="flex gap-1 ml-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse"
                          style={{ animationDelay: `${i * 150}ms` }}
                        />
                      ))}
                    </span>
                  </>
                ) : "AI READY"}
              </div>
            )}
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. White linen shirt"
              className={inputClass}
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Categories
              </label>
              {aiTag}
            </div>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Tops"
              className={inputClass}
            />
          </div>

          {/* Colour */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Colour
              </label>
              {aiTag}
            </div>
            <input
              type="text"
              value={colour}
              onChange={(e) => setColour(e.target.value)}
              placeholder="e.g. White"
              className={inputClass}
            />
          </div>

          {/* Fabric */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Fabric
              </label>
              {aiTag}
            </div>
            <input
              type="text"
              value={fabric}
              onChange={(e) => setFabric(e.target.value)}
              placeholder="e.g. Linen"
              className={inputClass}
            />
          </div>

          {/* Size */}
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
                      : "border-border bg-white text-foreground hover:bg-neutral-50"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Fit */}
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
                      : "border-border bg-white text-foreground hover:bg-neutral-50"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Button
            variant="primary"
            size="lg"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="w-full mt-auto rounded-xl"
          >
            Add to Closet
          </Button>
        </div>
      </div>
    </Modal>
  );
}