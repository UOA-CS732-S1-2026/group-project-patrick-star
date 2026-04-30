"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { SearchInput } from "@/components/ui/SearchInput";
import { OutfitCard, type Outfit } from "@/components/outfits/OutfitCard";
import { OutfitDetailPanel } from "@/components/outfits/OutfitDetailPanel";

const STYLE_FILTERS = ["All", "Smart", "Street", "Casual", "Fun", "Minimal", "Dresses"] as const;
type StyleFilter = (typeof STYLE_FILTERS)[number];

const SEED_OUTFITS: Outfit[] = [
  {
    id: "1",
    name: "Friday Meeting Look",
    style: "Smart",
    season: "Autumn",
    occasion: "Work",
    favourite: true,
    items: [
      { id: "1", name: "White linen shirt", category: "Tops", emoji: "👕", colour: "White" },
      { id: "2", name: "Navy trousers", category: "Bottoms", emoji: "👖", colour: "Navy" },
      { id: "3", name: "Tan trench", category: "Outerwear", emoji: "🧥", colour: "Tan" },
      { id: "4", name: "White sneakers", category: "Shoes", emoji: "👟", colour: "White" },
    ],
  },
  {
    id: "2",
    name: "Weekend Errand Run",
    style: "Casual",
    season: "Summer",
    occasion: "Weekend",
    favourite: false,
    items: [
      { id: "5", name: "Black turtleneck", category: "Tops", emoji: "🐢", colour: "Black" },
      { id: "6", name: "Olive shorts", category: "Bottoms", emoji: "🩳", colour: "Olive" },
      { id: "4", name: "White sneakers", category: "Shoes", emoji: "👟", colour: "White" },
    ],
  },
  {
    id: "3",
    name: "City Stroll",
    style: "Street",
    season: "Spring",
    occasion: "Going out",
    favourite: false,
    items: [
      { id: "12", name: "Oxford shirt", category: "Tops", emoji: "👔", colour: "Blue" },
      { id: "2", name: "Navy trousers", category: "Bottoms", emoji: "👖", colour: "Navy" },
      { id: "7", name: "Brown boots", category: "Shoes", emoji: "🥾", colour: "Brown" },
      { id: "9", name: "Bucket hat", category: "Accessories", emoji: "🧢", colour: "Green" },
    ],
  },
  {
    id: "4",
    name: "Layered Winter Look",
    style: "Minimal",
    season: "Winter",
    occasion: "Weekend",
    favourite: false,
    items: [
      { id: "5", name: "Black turtleneck", category: "Tops", emoji: "🐢", colour: "Black" },
      { id: "3", name: "Tan trench", category: "Outerwear", emoji: "🧥", colour: "Tan" },
      { id: "2", name: "Navy trousers", category: "Bottoms", emoji: "👖", colour: "Navy" },
      { id: "7", name: "Brown boots", category: "Shoes", emoji: "🥾", colour: "Brown" },
    ],
  },
];

export default function OutfitsPage() {
  const [outfits, setOutfits] = useState<Outfit[]>(SEED_OUTFITS);
  const [styleFilter, setStyleFilter] = useState<StyleFilter>("All");
  const [query, setQuery] = useState("");
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);

  const filtered = useMemo(() => {
    return outfits.filter((outfit) => {
      const matchStyle = styleFilter === "All" || outfit.style === styleFilter;
      const matchQuery = !query || outfit.name.toLowerCase().includes(query.toLowerCase());
      return matchStyle && matchQuery;
    });
  }, [outfits, styleFilter, query]);

  function handleSelectOutfit(outfit: Outfit) {
    // Clicking the same card again closes the panel
    setSelectedOutfit((prev) => (prev?.id === outfit.id ? null : outfit));
  }

  function handleToggleFavourite(id: string) {
    // TODO: PATCH /api/outfits/:id { favourite: !current }
    setOutfits((prev) =>
      prev.map((o) => (o.id === id ? { ...o, favourite: !o.favourite } : o))
    );
    // Keep the open panel in sync
    setSelectedOutfit((prev) =>
      prev?.id === id ? { ...prev, favourite: !prev.favourite } : prev
    );
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
        {/* Outfit grid */}
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

        {/* Right-hand detail panel — mirrors the closet ItemDetailPanel pattern */}
        {selectedOutfit && (
          <OutfitDetailPanel
            outfit={selectedOutfit}
            onClose={() => setSelectedOutfit(null)}
            onToggleFavourite={() => handleToggleFavourite(selectedOutfit.id)}
          />
        )}
      </div>
    </>
  );
}