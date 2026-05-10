"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { type ClothingItem } from "@/components/ui/ItemCard";
import { cn } from "@/components/ui/cn";

const STYLES = ["Smart", "Casual", "Street", "Minimal", "Fun", "Dresses"] as const;
type Style = (typeof STYLES)[number];

interface ApiClothingItem {
  _id: string;
  name: string;
  category: string;
  colour: string;
  imageUrls?: { front?: string };
}

async function getAuthHeaders(includeJson = false): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  if (includeJson) headers["Content-Type"] = "application/json";
  const res = await fetch("/api/auth/token");
  if (res.ok) {
    const { token } = await res.json();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function toDisplayCategory(category: string) {
  switch (category) {
    case "lower_body": return "Bottoms";
    case "outerwear": return "Outerwear";
    case "shoes": return "Shoes";
    case "accessories": return "Accessories";
    case "dresses": return "Dresses";
    default: return "Tops";
  }
}

function toClothingItem(item: ApiClothingItem): ClothingItem {
  return {
    id: item._id,
    name: item.name,
    category: toDisplayCategory(item.category),
    colour: item.colour,
    emoji: "👕",
    imageUrl: item.imageUrls?.front,
  };
}

async function parseApiError(response: Response, fallback: string) {
  const text = await response.text().catch(() => "");

  if (!text) {
    return fallback;
  }

  try {
    const body = JSON.parse(text) as { error?: string; errors?: string[] };
    return body.error ?? body.errors?.join(", ") ?? fallback;
  } catch {
    return text;
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ClosetPanel({
  closetItems,
  selectedIds,
  onToggle,
  onGenerateTryOn,
}: {
  closetItems: ClothingItem[];
  selectedIds: Set<string>;
  onToggle: (item: ClothingItem) => void;
  onGenerateTryOn: () => void;
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

      <div className="border-t border-border p-4">
        <button
          onClick={onGenerateTryOn}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-accent bg-accent-soft px-4 py-3 text-sm font-semibold text-accent transition-colors hover:bg-accent/20"
        >
          <span aria-hidden>↺</span> Generate Try On
        </button>
      </div>
    </div>
  );
}

function TryOnPreview({
  selectedItems,
  isTryOnActive,
}: {
  selectedItems: ClothingItem[];
  isTryOnActive: boolean;
}) {
  const top = selectedItems.find(
    (i) => i.category === "Tops" || i.category === "Outerwear" || i.category === "Dresses"
  );
  const bottom = selectedItems.find((i) => i.category === "Bottoms");

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Live Try-On Preview
        </p>
      </div>

      <div className="relative flex flex-1 items-center justify-center bg-[#D4C5B0] p-6">
        <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm">
          <span className="text-accent">✦</span> AI styled
        </span>

        <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm">
          <span className={cn("h-2 w-2 rounded-full", isTryOnActive ? "bg-brand" : "bg-neutral-300")} />
          Your photo
        </span>

        <div className="flex flex-col items-center">
          <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-[#C4A882] text-2xl shadow">
            🙂
          </div>

          <div className="w-48 overflow-hidden rounded-2xl shadow-lg">
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

function OutfitDetailsPanel({
  name,
  onNameChange,
  style,
  onStyleChange,
  onSave,
  onDiscard,
  canSave,
  isEditing,
  errorMessage,
}: {
  name: string;
  onNameChange: (v: string) => void;
  style: Style | "";
  onStyleChange: (v: Style) => void;
  onSave: () => void;
  onDiscard: () => void;
  canSave: boolean;
  isEditing: boolean;
  errorMessage?: string | null;
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
      </div>

      <div className="flex flex-col gap-3 border-t border-border px-6 py-5">
        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </div>
        )}
        <Button
          variant="primary"
          size="lg"
          className="w-full rounded-xl"
          disabled={!canSave}
          onClick={onSave}
        >
          {isEditing ? "Save Changes" : "+ Save Outfit"}
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
// Main page
// ---------------------------------------------------------------------------

export default function OutfitBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const outfitId = searchParams.get("id");
  const isEditing = Boolean(outfitId);
  const starterItems = searchParams.get("items");
  const starterName = searchParams.get("name");
  const starterStyle = searchParams.get("style");
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001")
    .replace(/\/+$/, "");

  const [closetItems, setClosetItems] = useState<ClothingItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isTryOnActive, setIsTryOnActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [style, setStyle] = useState<Style | "">("");

  const loadCloset = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/clothingItems/me`, {
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to load closet");
      const apiItems = (await response.json()) as ApiClothingItem[];
      setClosetItems(apiItems.map(toClothingItem));
    } catch (error) {
      console.error(error);
    }
  }, [apiUrl]);

  useEffect(() => {
    loadCloset();
  }, [loadCloset]);

  useEffect(() => {
    if (isEditing) return;

    if (starterItems) {
      const itemIds = starterItems
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
      setSelectedIds(new Set(itemIds));
    }

    if (starterName) {
      setName(starterName);
    }

    if (starterStyle && STYLES.includes(starterStyle as Style)) {
      setStyle(starterStyle as Style);
    }
  }, [isEditing, starterItems, starterName, starterStyle]);

  useEffect(() => {
    if (!outfitId) return;

    async function loadExistingOutfit() {
      try {
        const response = await fetch(`${apiUrl}/api/outfits/me`, {
          headers: await getAuthHeaders(),
        });
        if (!response.ok) throw new Error("Failed to load outfits");
        const outfits = await response.json();
        const outfit = outfits.find((o: { _id: string }) => o._id === outfitId);
        if (!outfit) return;

        setName(outfit.name);
        setStyle(outfit.style ?? "");
        setSelectedIds(new Set(outfit.items.map((i: { _id: string }) => i._id)));
      } catch (err) {
        console.error(err);
      }
    }

    loadExistingOutfit();
  }, [outfitId, apiUrl]);

  const selectedItems = useMemo(
    () => closetItems.filter((i) => selectedIds.has(i.id)),
    [closetItems, selectedIds]
  );

  const selectionError = useMemo(() => {
    const categories = selectedItems.map((item) => item.category);
    const duplicateCategory = categories.find(
      (category, index) => categories.indexOf(category) !== index,
    );

    if (!duplicateCategory) {
      return null;
    }

    return `Choose items from different categories. You selected multiple ${duplicateCategory}.`;
  }, [selectedItems]);

  function toggleItem(item: ClothingItem) {
    setSaveError(null);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.add(item.id);
      }
      return next;
    });
  }

  function handleGenerateTryOn() {
    // TODO: call POST /api/tryon with selected item IDs and display returned image
    setIsTryOnActive(true);
  }

  async function handleSave() {
    if (isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const url = isEditing
        ? `${apiUrl}/api/outfits/me/${outfitId}`
        : `${apiUrl}/api/outfits/me`;
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: await getAuthHeaders(true),
        body: JSON.stringify({
          name: name.trim() || "My New Outfit",
          items: [...selectedIds],
          style: style || "",
        }),
      });

      if (!response.ok) {
        setSaveError(
          await parseApiError(response, "Failed to save outfit"),
        );
        return;
      }

      router.push("/outfits");
    } catch (err) {
      setSaveError("Failed to save outfit. Please try again.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  function handleDiscard() {
    router.push("/outfits");
  }

  const canSave = selectedIds.size > 0 && !isSaving;

  return (
    <>
      <PageHeader
        title={isEditing ? "Edit outfit" : "Build an outfit"}
        right={
          <button
            onClick={handleDiscard}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕ Discard Changes
          </button>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        <ClosetPanel
          closetItems={closetItems}
          selectedIds={selectedIds}
          onToggle={toggleItem}
          onGenerateTryOn={handleGenerateTryOn}
        />

        <TryOnPreview
          selectedItems={selectedItems}
          isTryOnActive={isTryOnActive}
        />

        <OutfitDetailsPanel
          name={name}
          onNameChange={(value) => {
            setSaveError(null);
            setName(value);
          }}
          style={style}
          onStyleChange={(value) => {
            setSaveError(null);
            setStyle(value);
          }}
          onSave={handleSave}
          onDiscard={handleDiscard}
          canSave={canSave}
          isEditing={isEditing}
          errorMessage={saveError ?? selectionError}
        />
      </div>
    </>
  );
}
