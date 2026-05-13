"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { SearchInput } from "@/components/ui/SearchInput";
import { OutfitCard, type Outfit } from "@/components/outfits/OutfitCard";
import { OutfitDetailPanel } from "@/components/outfits/OutfitDetailPanel";
import { type ClothingItem } from "@/components/ui/ItemCard";

const STYLE_FILTERS = ["All", "Smart", "Street", "Casual", "Fun", "Minimal", "Dresses"] as const;
type StyleFilter = (typeof STYLE_FILTERS)[number];

interface ApiClothingItem {
  _id: string;
  name: string;
  category: string;
  imageUrls?: { front?: string };
}

interface ApiOutfit {
  _id: string;
  name: string;
  style?: string;
  favourite?: boolean;
  items: ApiClothingItem[];
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
  if (category === "lower_body") return "Bottoms";
  if (category === "dresses") return "Dresses";
  return "Tops";
}

function toClothingItem(item: ApiClothingItem): ClothingItem {
  return {
    id: item._id,
    name: item.name,
    category: toDisplayCategory(item.category),
    emoji: "👕",
    imageUrl: item.imageUrls?.front,
  };
}

function toOutfit(api: ApiOutfit): Outfit {
  return {
    id: api._id,
    name: api.name,
    style: api.style ?? "",
    favourite: api.favourite ?? false,
    items: api.items.map(toClothingItem),
  };
}

export default function OutfitsPage() {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [styleFilter, setStyleFilter] = useState<StyleFilter>("All");
  const [query, setQuery] = useState("");
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

  const filtered = useMemo(() => {
    return outfits.filter((outfit) => {
      const matchStyle = styleFilter === "All" || outfit.style === styleFilter;
      const matchQuery = !query || outfit.name.toLowerCase().includes(query.toLowerCase());
      return matchStyle && matchQuery;
    });
  }, [outfits, styleFilter, query]);

  const loadOutfits = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/outfits/me`, {
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to load outfits");
      const apiOutfits = (await response.json()) as ApiOutfit[];
      setOutfits(apiOutfits.map(toOutfit));
    } catch (error) {
      console.error(error);
      setOutfits([]);
    }
  }, [apiUrl]);

  useEffect(() => {
    loadOutfits();
  }, [loadOutfits]);

  function handleSelectOutfit(outfit: Outfit) {
    setSelectedOutfit((prev) => (prev?.id === outfit.id ? null : outfit));
  }

  async function handleToggleFavourite(id: string) {
    const current = outfits.find((o) => o.id === id);
    if (!current) return;

    const newFavourite = !current.favourite;

    setOutfits((prev) =>
      prev.map((o) => (o.id === id ? { ...o, favourite: newFavourite } : o))
    );
    setSelectedOutfit((prev) =>
      prev?.id === id ? { ...prev, favourite: newFavourite } : prev
    );

    try {
      const response = await fetch(`${apiUrl}/api/outfits/me/${id}`, {
        method: "PUT",
        headers: await getAuthHeaders(true),
        body: JSON.stringify({ favourite: newFavourite }),
      });
      if (!response.ok) throw new Error("Failed to update favourite");
    } catch (error) {
      console.error(error);
      setOutfits((prev) =>
        prev.map((o) => (o.id === id ? { ...o, favourite: current.favourite } : o))
      );
      setSelectedOutfit((prev) =>
        prev?.id === id ? { ...prev, favourite: current.favourite } : prev
      );
    }
  }

  async function handleDeleteOutfit(id: string) {
    try {
      const response = await fetch(`${apiUrl}/api/outfits/me/${id}`, {
        method: "DELETE",
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to delete outfit");
      setOutfits((prev) => prev.filter((o) => o.id !== id));
      setSelectedOutfit(null);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <PageHeader
        title="My Outfits"
        right={
          <>
            <div className="w-72">
              <SearchInput
                placeholder="Search your outfits..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              {outfits.length} outfits
            </div>
            <Link href="/outfits/builder">
              <Button leftIcon={<span aria-hidden>+</span>}>Create Outfit</Button>
            </Link>
          </>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-10 py-8">
          <div className="flex flex-wrap gap-2">
            {STYLE_FILTERS.map((s) => (
              <Chip
                key={s}
                variant="solid"
                selected={s === styleFilter}
                onClick={() => setStyleFilter(s)}
              >
                {s}
              </Chip>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
              <span className="text-5xl">✨</span>
              <p className="text-lg font-semibold text-foreground">No outfits yet</p>
              <p className="text-sm text-muted-foreground">
                Build your first outfit to see it here.
              </p>
              <Link href="/outfits/builder">
                <Button>Create your first outfit</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {filtered.map((outfit) => (
                <OutfitCard
                  key={outfit.id}
                  outfit={outfit}
                  selected={selectedOutfit?.id === outfit.id}
                  onClick={() => handleSelectOutfit(outfit)}
                  onToggleFavourite={() => handleToggleFavourite(outfit.id)}
                />
              ))}
            </div>
          )}
        </div>

        {selectedOutfit && (
          <OutfitDetailPanel
            outfit={selectedOutfit}
            onClose={() => setSelectedOutfit(null)}
            onToggleFavourite={() => handleToggleFavourite(selectedOutfit.id)}
            onDelete={() => handleDeleteOutfit(selectedOutfit.id)}
          />
        )}
      </div>
    </>
  );
}
