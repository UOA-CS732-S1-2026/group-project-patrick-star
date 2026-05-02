"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { ItemCard, type ClothingItem } from "@/components/ui/ItemCard";
import { SearchInput } from "@/components/ui/SearchInput";
import { UploadItemModal, type NewClothingItem } from "@/components/closet/UploadItemModal";
import { ItemDetailPanel } from "@/components/closet/ItemDetailPanel";
import { EditItemPanel } from "@/components/closet/EditItemPanel";

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

interface ApiClothingItem {
  _id: string;
  name: string;
  category: string;
  colour: string;
  size: string;
  fit: string;
  fabric?: string;
  imageUrls?: {
    front?: string;
  };
}

const SEED_ITEMS: ClothingItem[] = [
  { id: "1", name: "White linen shirt", category: "Tops", emoji: "👕", colour: "White", size: "M", fit: "Regular", fabric: "Linen" },
  { id: "2", name: "Navy trousers", category: "Bottoms", emoji: "👖", colour: "Navy", size: "M", fit: "Slim", fabric: "Cotton" },
  { id: "3", name: "Tan trench", category: "Outerwear", emoji: "🧥", colour: "Tan", size: "M", fit: "Regular", fabric: "Polyester" },
  { id: "4", name: "White sneakers", category: "Shoes", emoji: "👟", colour: "White", size: "M" },
  { id: "5", name: "Black turtleneck", category: "Tops", emoji: "🐢", colour: "Black", size: "S", fit: "Regular", fabric: "Wool" },
  { id: "6", name: "Olive shorts", category: "Bottoms", emoji: "🩳", colour: "Olive", size: "M", fit: "Relaxed", fabric: "Cotton" },
  { id: "7", name: "Brown boots", category: "Shoes", emoji: "🥾", colour: "Brown", size: "L" },
  { id: "8", name: "Canvas tote", category: "Accessories", emoji: "👜", colour: "Beige" },
  { id: "9", name: "Bucket hat", category: "Accessories", emoji: "🧢", colour: "Green" },
  { id: "10", name: "Wool scarf", category: "Accessories", emoji: "🧣", colour: "Red", fabric: "Wool" },
  { id: "11", name: "Sunglasses", category: "Accessories", emoji: "🕶️", colour: "Black" },
  { id: "12", name: "Oxford shirt", category: "Tops", emoji: "👔", colour: "Blue", size: "M", fit: "Regular", fabric: "Cotton" },
  { id: "13", name: "Striped scarf", category: "Accessories", emoji: "🧣", colour: "Red" },
  { id: "14", name: "Leather bag", category: "Accessories", emoji: "👜", colour: "Brown" },
];

export default function ClosetPage() {
  const [items, setItems] = useState<ClothingItem[]>(SEED_ITEMS);
  const [category, setCategory] = useState<Category>("All");
  const [query, setQuery] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [editing, setEditing] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchCategory = category === "All" || item.category === category;
      const matchQuery = !query || item.name.toLowerCase().includes(query.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [items, category, query]);

  function toApiCategory(category: string) {
    if (category === "Bottoms") return "lower_body";
    if (category === "Dresses") return "dresses";
    return "upper_body";
  }

  function toDisplayCategory(category: string) {
    if (category === "lower_body") return "Bottoms";
    if (category === "dresses") return "Dresses";
    return "Tops";
  }

  function toApiFit(fit: string) {
    if (fit === "Slim") return "tight";
    if (fit === "Relaxed") return "loose";
    return "regular";
  }

  function toDisplayFit(fit: string) {
    if (fit === "tight") return "Slim";
    if (fit === "loose") return "Relaxed";
    return "Regular";
  }

  function toClothingItem(item: ApiClothingItem): ClothingItem {
    return {
      id: item._id,
      name: item.name,
      category: toDisplayCategory(item.category),
      colour: item.colour,
      size: item.size,
      fit: toDisplayFit(item.fit),
      fabric: item.fabric,
      emoji: "👕",
      imageUrl: item.imageUrls?.front,
    };
  }

  async function handleAddItem(newItem: NewClothingItem) {
    const token = localStorage.getItem("access_token");
    const headers: HeadersInit = { "Content-Type": "application/json" };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const createResponse = await fetch(`${apiUrl}/api/clothingItems/me`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: newItem.name,
        category: toApiCategory(newItem.category),
        colour: newItem.colour,
        size: newItem.size,
        fit: toApiFit(newItem.fit),
        fabric: newItem.fabric,
      }),
    });

    if (!createResponse.ok) {
      throw new Error("Failed to create clothing item");
    }

    let item = (await createResponse.json()) as ApiClothingItem;

    if (newItem.imageFile) {
      const imageData = new FormData();
      imageData.append("image", newItem.imageFile);
      imageData.append("slot", "front");

      const uploadHeaders: HeadersInit = {};

      if (token) {
        uploadHeaders.Authorization = `Bearer ${token}`;
      }

      const uploadResponse = await fetch(`${apiUrl}/api/clothingItems/me/${item._id}/image`, {
        method: "POST",
        headers: uploadHeaders,
        body: imageData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload clothing image");
      }

      const uploaded = (await uploadResponse.json()) as { item: ApiClothingItem };
      item = uploaded.item;
    }

    setItems((prev) => [...prev, toClothingItem(item)]);
  }

  function handleSaveItem(updated: ClothingItem) {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    setSelectedItem(updated);
    setEditing(false);
  }

  function handleRemoveItem(item: ClothingItem) {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setSelectedItem(null);
    setEditing(false);
  }

  function handleSelectItem(item: ClothingItem) {
    setSelectedItem(item);
    setEditing(false);
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
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              {items.length} items
            </div>
            <Button leftIcon={<span aria-hidden>+</span>} onClick={() => setUploadOpen(true)}>
              Add item
            </Button>
          </>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Closet grid */}
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-10 py-8">
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
              <ItemCard
                key={item.id}
                item={item}
                onClick={() => handleSelectItem(item)}
              />
            ))}
          </div>
        </div>

        {/* Side panels */}
        {selectedItem && !editing && (
          <ItemDetailPanel
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onEdit={() => setEditing(true)}
          />
        )}
        {selectedItem && editing && (
          <EditItemPanel
            item={selectedItem}
            onCancel={() => setEditing(false)}
            onSave={handleSaveItem}
            onRemove={handleRemoveItem}
          />
        )}
      </div>

      <UploadItemModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSubmit={handleAddItem}
      />
    </>
  );
}