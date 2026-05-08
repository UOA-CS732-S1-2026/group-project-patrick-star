"use client";

import { useState, useMemo, useEffect, useRef, type DragEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { type ClothingItem } from "@/components/ui/ItemCard";
import { cn } from "@/components/ui/cn";
import { type Outfit } from "@/components/outfits/OutfitCard";

interface ApiClothingItem {
  _id: string;
  name: string;
  category: string;
  colour: string;
  size: string;
  fit: string;
  imageUrls?: { front?: string; back?: string; side?: string };
}

// ---------------------------------------------------------------------------
// Seed data — replace with a real API call to GET /api/clothing
// ---------------------------------------------------------------------------
const SEED_CLOSET: ClothingItem[] = [
  { id: "1", name: "White linen shirt", category: "Tops", emoji: "👕", colour: "White" },
  { id: "2", name: "Navy trousers", category: "Bottoms", emoji: "👖", colour: "Navy" },
  { id: "3", name: "Tan trench", category: "Outerwear", emoji: "🧥", colour: "Tan" },
  { id: "4", name: "White sneakers", category: "Shoes", emoji: "👟", colour: "White" },
  { id: "5", name: "Black turtleneck", category: "Tops", emoji: "🐢", colour: "Black" },
  { id: "6", name: "Olive shorts", category: "Bottoms", emoji: "🩳", colour: "Olive" },
  { id: "7", name: "Brown boots", category: "Shoes", emoji: "🥾", colour: "Brown" },
  { id: "9", name: "Bucket hat", category: "Accessories", emoji: "🧢", colour: "Green" },
  { id: "10", name: "Wool scarf", category: "Accessories", emoji: "🧣", colour: "Red" },
  { id: "12", name: "Oxford shirt", category: "Tops", emoji: "👔", colour: "Blue" },
];

const STYLES = ["Smart", "Casual", "Street", "Minimal", "Fun", "Dresses"] as const;
const OCCASIONS = ["Work", "Weekend", "Going out", "Travel"] as const;
const SEASONS = ["Spring", "Summer", "Autumn", "Winter"] as const;

type Style = (typeof STYLES)[number];
type Occasion = (typeof OCCASIONS)[number];
type Season = (typeof SEASONS)[number];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Left panel: scrollable 2-col closet grid with remove/add toggles */
function ClosetPanel({
  closetItems,
  selectedIds,
  onToggle,
  onGenerateTryOn,
  isGenerating,
  generateError,
  tryOnResultUrl,
}: {
  closetItems: ClothingItem[];
  selectedIds: Set<string>;
  onToggle: (item: ClothingItem) => void;
  onGenerateTryOn: () => void;
  isGenerating: boolean;
  generateError: string | null;
  tryOnResultUrl: string | null;
}) {
  return (
    <div className="flex w-[240px] shrink-0 flex-col border-r border-border bg-white">
      <div className="border-b border-border px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Your Closet
        </p>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-0 overflow-y-auto">
        {closetItems.map((item) => {
          const selected = selectedIds.has(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onToggle(item)}
              className={cn(
                "relative flex items-center justify-center border-b border-r border-border bg-neutral-50 text-4xl transition-colors",
                "aspect-square hover:bg-neutral-100",
                selected && "bg-white ring-2 ring-inset ring-brand"
              )}
            >
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <span aria-hidden>{item.emoji ?? "👕"}</span>
              )}

              {/* Selected indicator */}
              <span
                className={cn(
                  "absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-colors",
                  selected
                    ? "border-brand bg-brand text-white"
                    : "border-neutral-300 bg-white text-transparent"
                )}
              >
                ✕
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col border-t border-border">
        {/* Generate button */}
        <div className="p-4">
          <button
            onClick={onGenerateTryOn}
            disabled={isGenerating}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-colors",
              isGenerating
                ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
                : "border-accent bg-accent-soft text-accent hover:bg-accent/20"
            )}
          >
            {isGenerating ? (
              <>
                <span className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-400"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </span>
                Generating…
              </>
            ) : (
              <><span aria-hidden>↺</span> Generate Try On</>
            )}
          </button>
        </div>

        {/* Generating status */}
        {isGenerating && (
          <p className="px-4 pb-3 text-center text-xs text-muted-foreground">
            Generating your outfit…
          </p>
        )}

        {/* Error */}
        {generateError && (
          <p className="px-4 pb-3 text-xs font-medium text-red-500">{generateError}</p>
        )}

        {/* Result card */}
        {tryOnResultUrl && !isGenerating && (
          <div className="px-4 pb-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Your Generated Outfit
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tryOnResultUrl}
              alt="Generated outfit"
              className="w-full rounded-xl object-cover shadow-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}

/** Centre panel: live try-on preview (split top/bottom body model) */
function TryOnPreview({
  selectedItems,
  isTryOnActive,
}: {
  selectedItems: ClothingItem[];
  isTryOnActive: boolean;
}) {
  const top = selectedItems.find((i) => i.category === "Tops" || i.category === "Outerwear" || i.category === "Dresses");
  const bottom = selectedItems.find((i) => i.category === "Bottoms");

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Live Try-On Preview
        </p>
      </div>

      <div className="relative flex flex-1 items-center justify-center bg-[#D4C5B0] p-6">
        {/* AI styled badge */}
        <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm">
          <span className="text-accent">✦</span> AI styled
        </span>

        {/* Your photo toggle */}
        <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm">
          <span className={cn("h-2 w-2 rounded-full", isTryOnActive ? "bg-brand" : "bg-neutral-300")} />
          Your photo
        </span>

        {/* Body mannequin */}
        <div className="flex flex-col items-center">
          {/* Head */}
          <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-[#C4A882] text-2xl shadow">
            🙂
          </div>

          {/* Body: stacked top + bottom panels */}
          <div className="w-48 overflow-hidden rounded-2xl shadow-lg">
            {/* Top half */}
            <div
              className="flex items-center justify-center bg-neutral-100 text-7xl"
              style={{ height: "180px" }}
            >
              {top ? (
                top.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={top.imageUrl} alt={top.name} className="h-full w-full object-cover" />
                ) : (
                  <span aria-hidden>{top.emoji ?? "👕"}</span>
                )
              ) : (
                <span className="text-4xl text-neutral-300">👕</span>
              )}
            </div>

            {/* Bottom half */}
            <div
              className="flex items-center justify-center bg-[#1a2a4a] text-7xl"
              style={{ height: "180px" }}
            >
              {bottom ? (
                bottom.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={bottom.imageUrl} alt={bottom.name} className="h-full w-full object-cover" />
                ) : (
                  <span aria-hidden>{bottom.emoji ?? "👖"}</span>
                )
              ) : (
                <span className="text-4xl text-neutral-400">👖</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Right panel: outfit name, style/occasion/season chips, notes, save CTA */
function OutfitDetailsPanel({
  name,
  onNameChange,
  style,
  onStyleChange,
  occasion,
  onOccasionChange,
  season,
  onSeasonChange,
  notes,
  onNotesChange,
  onSave,
  onDiscard,
  canSave,
}: {
  name: string;
  onNameChange: (v: string) => void;
  style: Style | "";
  onStyleChange: (v: Style) => void;
  occasion: Occasion | "";
  onOccasionChange: (v: Occasion) => void;
  season: Season | "";
  onSeasonChange: (v: Season) => void;
  notes: string;
  onNotesChange: (v: string) => void;
  onSave: () => void;
  onDiscard: () => void;
  canSave: boolean;
}) {
  const inputClass =
    "w-full rounded-xl border-2 border-border bg-neutral-50 px-4 py-3 text-sm font-medium text-foreground outline-none transition focus:border-accent focus:bg-white placeholder:text-muted-foreground";

  return (
    <div className="flex w-[300px] shrink-0 flex-col border-l border-border bg-white">
      <div className="border-b border-border px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Outfit Details
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. My New Outfit"
            className={inputClass}
          />
        </div>

        {/* Style */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Style
          </label>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <button
                key={s}
                onClick={() => onStyleChange(s)}
                className={cn(
                  "rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition-colors",
                  style === s
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border bg-white text-foreground hover:bg-neutral-50"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Occasion */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Occasion
          </label>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((o) => (
              <button
                key={o}
                onClick={() => onOccasionChange(o)}
                className={cn(
                  "rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition-colors",
                  occasion === o
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border bg-white text-foreground hover:bg-neutral-50"
                )}
              >
                {o}
              </button>
            ))}
          </div>
        </div>

        {/* Season */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Season
          </label>
          <div className="flex flex-wrap gap-2">
            {SEASONS.map((s) => (
              <button
                key={s}
                onClick={() => onSeasonChange(s)}
                className={cn(
                  "rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition-colors",
                  season === s
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border bg-white text-foreground hover:bg-neutral-50"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Add any notes about this outfit..."
            rows={4}
            className={cn(inputClass, "resize-none")}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 border-t border-border px-6 py-5">
        <Button
          variant="primary"
          size="lg"
          className="w-full rounded-xl"
          disabled={!canSave}
          onClick={onSave}
        >
          + Save Outfit
        </Button>
        <button
          onClick={onDiscard}
          className="text-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Discard Changes
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Your Photo upload strip
// ---------------------------------------------------------------------------
function YourPhotoSection({
  preview,
  isUploading,
  onFile,
}: {
  preview: string | null;
  isUploading: boolean;
  onFile: (file: File) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }

  function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  }

  return (
    <div className="flex shrink-0 items-center gap-5 border-b border-border bg-white px-10 py-4">
      <p className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Your Photo
      </p>

      {/* Drop / click zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        className={cn(
          "relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors",
          isDragging
            ? "border-brand bg-brand/5"
            : "border-border bg-neutral-50 hover:bg-neutral-100"
        )}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Your photo preview" className="h-full w-full object-cover" />
        ) : isUploading ? (
          <span className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </span>
        ) : (
          <span className="text-2xl text-neutral-400" aria-hidden>↑</span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
        onChange={handleFileInput}
      />

      <div className="flex flex-col gap-0.5">
        {isUploading ? (
          <p className="text-sm font-medium text-accent">Uploading…</p>
        ) : preview ? (
          <p className="text-sm font-medium text-foreground">Photo ready</p>
        ) : (
          <p className="text-sm font-medium text-foreground">
            Click or drag to upload your photo
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {preview
            ? "Click the thumbnail to replace it"
            : "Used as the human image for virtual try-on"}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Garment selector strip
// ---------------------------------------------------------------------------
function GarmentSelectorSection({
  items,
  loading,
  selectedItem,
  onSelect,
}: {
  items: ApiClothingItem[];
  loading: boolean;
  selectedItem: ApiClothingItem | null;
  onSelect: (item: ApiClothingItem) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-5 border-b border-border bg-white px-10 py-4">
      <p className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Garment
      </p>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No items in your closet yet — add some from the Closet page.
        </p>
      ) : (
        <div className="flex flex-1 gap-3 overflow-x-auto py-1">
          {items.map((item) => {
            const isSelected = selectedItem?._id === item._id;
            return (
              <button
                key={item._id}
                onClick={() => onSelect(item)}
                title={item.name}
                className={cn(
                  "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors",
                  isSelected
                    ? "border-brand ring-2 ring-brand ring-offset-1"
                    : "border-border hover:border-neutral-400"
                )}
              >
                {item.imageUrls?.front ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrls.front}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-xl">
                    👕
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {selectedItem && (
        <p className="whitespace-nowrap text-sm font-medium text-foreground">
          {selectedItem.name}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function OutfitBuilderPage() {
  const router = useRouter();

  // Closet items (replace with API fetch)
  const closetItems = SEED_CLOSET;

  // Builder state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isTryOnActive, setIsTryOnActive] = useState(false);

  // Outfit details state
  const [name, setName] = useState("");
  const [style, setStyle] = useState<Style | "">("");
  const [occasion, setOccasion] = useState<Occasion | "">("");
  const [season, setSeason] = useState<Season | "">("");
  const [notes, setNotes] = useState("");

  // Human photo state — URL returned by the upload endpoint, used later for try-on
  const [humanPhotoPreview, setHumanPhotoPreview] = useState<string | null>(null);
  const [humanImageUrl, setHumanImageUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

  // Garment selector state — fetched from /api/clothingItems/me
  const [garmentItems, setGarmentItems] = useState<ApiClothingItem[]>([]);
  const [garmentItemsLoading, setGarmentItemsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ApiClothingItem | null>(null);

  // Try-on generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [tryOnResultUrl, setTryOnResultUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGarmentItems() {
      try {
        // TODO: replace with proper getAccessToken() helper once auth is fully wired
        const stored = localStorage.getItem("ai-wardrobe.auth-session");
        const token = stored
          ? (JSON.parse(stored) as { accessToken?: string }).accessToken
          : null;
        const headers: HeadersInit = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`${apiUrl}/api/clothingItems/me`, { headers });
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        setGarmentItems((await res.json()) as ApiClothingItem[]);
      } catch (err) {
        console.error("Failed to fetch clothing items:", err);
      } finally {
        setGarmentItemsLoading(false);
      }
    }

    fetchGarmentItems();
  }, [apiUrl]);

  async function handleHumanPhotoFile(file: File) {
    setHumanPhotoPreview(URL.createObjectURL(file));
    setIsUploadingPhoto(true);
    try {
      // TODO: replace with proper getAccessToken() helper once auth is fully wired
      const stored = typeof window !== "undefined"
        ? localStorage.getItem("ai-wardrobe.auth-session")
        : null;
      const token = stored
        ? (JSON.parse(stored) as { accessToken?: string }).accessToken
        : null;

      const formData = new FormData();
      formData.append("image", file);
      const headers: HeadersInit = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}/api/users/me/photo/upload`, {
        method: "POST",
        headers,
        body: formData,
      });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const data = (await res.json()) as { url: string };
      setHumanImageUrl(data.url);
    } catch (err) {
      console.error("Failed to upload photo:", err);
      setHumanImageUrl(null);
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  const selectedItems = useMemo(
    () => closetItems.filter((i) => selectedIds.has(i.id)),
    [closetItems, selectedIds]
  );

  function toggleItem(item: ClothingItem) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(item.id) ? next.delete(item.id) : next.add(item.id);
      return next;
    });
  }

  async function handleGenerateTryOn() {
    if (!humanImageUrl) {
      setGenerateError("Upload your photo first.");
      return;
    }
    if (!selectedItem?.imageUrls?.front) {
      setGenerateError("Select a garment that has a photo.");
      return;
    }

    setGenerateError(null);
    setTryOnResultUrl(null);
    setIsGenerating(true);
    setIsTryOnActive(true);

    try {
      // TODO: replace with proper getAccessToken() helper once auth is fully wired
      const stored = localStorage.getItem("ai-wardrobe.auth-session");
      const token = stored
        ? (JSON.parse(stored) as { accessToken?: string }).accessToken
        : null;
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}/api/tryon`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          humanImageUrl,
          garmentImageUrl: selectedItem.imageUrls.front,
          category: selectedItem.category,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          (body as { error?: string }).error ?? `Request failed (${res.status})`
        );
      }

      const data = (await res.json()) as { success: boolean; imageUrl: string };
      setTryOnResultUrl(data.imageUrl);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleSave() {
    const newOutfit: Outfit = {
      id: String(Date.now()),
      name: name.trim() || "My New Outfit",
      style: style || "Casual",
      season: season || undefined,
      occasion: occasion || undefined,
      notes,
      items: selectedItems,
    };
    // TODO: POST /api/outfits with newOutfit, then navigate on success
    console.log("Saving outfit:", newOutfit);
    router.push("/outfits");
  }

  function handleDiscard() {
    router.push("/outfits");
  }

  const canSave = selectedIds.size > 0;

  return (
    <>
      <PageHeader
        title="Build an outfit"
        right={
          <button
            onClick={handleDiscard}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕ Discard Changes
          </button>
        }
      />

      <YourPhotoSection
        preview={humanPhotoPreview}
        isUploading={isUploadingPhoto}
        onFile={handleHumanPhotoFile}
      />

      <GarmentSelectorSection
        items={garmentItems}
        loading={garmentItemsLoading}
        selectedItem={selectedItem}
        onSelect={setSelectedItem}
      />

      <div className="flex flex-1 overflow-hidden">
        <ClosetPanel
          closetItems={closetItems}
          selectedIds={selectedIds}
          onToggle={toggleItem}
          onGenerateTryOn={handleGenerateTryOn}
          isGenerating={isGenerating}
          generateError={generateError}
          tryOnResultUrl={tryOnResultUrl}
        />

        <TryOnPreview
          selectedItems={selectedItems}
          isTryOnActive={isTryOnActive}
        />

        <OutfitDetailsPanel
          name={name}
          onNameChange={setName}
          style={style}
          onStyleChange={setStyle}
          occasion={occasion}
          onOccasionChange={setOccasion}
          season={season}
          onSeasonChange={setSeason}
          notes={notes}
          onNotesChange={setNotes}
          onSave={handleSave}
          onDiscard={handleDiscard}
          canSave={canSave}
        />
      </div>
    </>
  );
}