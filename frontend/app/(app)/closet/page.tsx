"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { ItemCard, type ClothingItem } from "@/components/ui/ItemCard";
import { SearchInput } from "@/components/ui/SearchInput";
import { UploadItemModal, type NewClothingItem } from "@/components/closet/UploadItemModal";
import { ItemDetailModal } from "@/components/closet/ItemDetailModal";

const CATEGORIES = [
  "All",
  "Tops",
  "Bottoms",
  "Outerwear",
  "Shoes",
  "Accessories",
  "Dresses",
] as const;
type Category = (typeof CATEGORIES)[number];

const SEED_ITEMS: ClothingItem[] = [
  { id: "1", name: "White linen shirt", category: "Tops", emoji: "👕" },
  { id: "2", name: "Navy slim trousers", category: "Bottoms", emoji: "👖" },
  { id: "3", name: "Tan trench coat", category: "Outerwear", emoji: "🧥" },
  { id: "4", name: "White leather sneakers", category: "Shoes", emoji: "👟" },
  { id: "5", name: "Black turtleneck", category: "Tops", emoji: "👗" },
  { id: "6", name: "Olive cargo shorts", category: "Bottoms", emoji: "🩳" },
  { id: "7", name: "Brown leather boots", category: "Shoes", emoji: "🥾" },
  { id: "8", name: "Wool scarf", category: "Accessories", emoji: "🧣" },
  { id: "9", name: "Bucket hat", category: "Accessories", emoji: "🧢" },
  { id: "10", name: "Ribbed crew socks", category: "Accessories", emoji: "🧦" },
];

export default function ClosetPage() {
  const [items, setItems] = useState<ClothingItem[]>(SEED_ITEMS);
  const [category, setCategory] = useState<Category>("All");
  const [query, setQuery] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchCategory =
        category === "All" || item.category === category;
      const matchQuery =
        !query || item.name.toLowerCase().includes(query.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [items, category, query]);

  function handleAddItem(newItem: NewClothingItem) {
    setItems((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: newItem.name,
        category: newItem.category,
        emoji: "👕",
        imageUrl: newItem.imageFile ? URL.createObjectURL(newItem.imageFile) : undefined,
      },
    ]);
  }

  function handleRemoveItem(item: ClothingItem) {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  }

  return (
    <>
      <PageHeader
        title="My Closet"
        right={
          <>
            <div className="w-80">
              <SearchInput
                placeholder="Search your wardrobe..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {items.length} items
            </div>
            <Button leftIcon={<span aria-hidden>+</span>} onClick={() => setUploadOpen(true)}>Add item</Button>
          </>
        }
      />

      <div className="flex flex-1 flex-col gap-6 px-10 py-8">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Chip
              key={c}
              variant="solid"
              selected={c === category}
              onClick={() => setCategory(c)}
            >
              {c}
            </Chip>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
          {filtered.map((item) => (
            <ItemCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
          ))}
        </div>
      </div>

      <UploadItemModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSubmit={handleAddItem}
      />

      <ItemDetailModal
        item={selectedItem}
        open={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        onRemove={handleRemoveItem}
      />
    </>
  );
}