"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { ItemCard, type ClothingItem } from "@/components/ui/ItemCard";
import { SearchInput } from "@/components/ui/SearchInput";
import {
  UploadItemModal,
  type NewClothingItem,
} from "@/components/closet/UploadItemModal";
import { ItemDetailPanel } from "@/components/closet/ItemDetailPanel";
import { EditItemPanel } from "@/components/closet/EditItemPanel";

const CATEGORIES = [
  "All",
  "Tops",
  "Bottoms",
  "Outerwear",
  "Shoes",
] as const;
type Category = (typeof CATEGORIES)[number];

interface ApiClothingItem {
  _id: string;
  name: string;
  category: string;
  size: string;
  fit: string;
  favourite?: boolean;
  imageUrls?: {
    front?: string;
  };
}

async function getAuthHeaders(
  includeJson = false,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  // const token = localStorage.getItem("access_token");

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch("/api/auth/token");
  if (res.ok) {
    const { token } = await res.json();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export default function ClosetPage() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [category, setCategory] = useState<Category>("All");
  const [query, setQuery] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [editing, setEditing] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchCategory = category === "All" || item.category === category;
      const matchQuery =
        !query || item.name.toLowerCase().includes(query.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [items, category, query]);

  function toApiCategory(category: string) {
    switch (category) {
      case "Bottoms":
        return "lower_body";
      case "Outerwear":
        return "outerwear";
      case "Shoes":
        return "shoes";
      case "Accessories":
        return "accessories";
      case "Dresses":
        return "dresses";
      default:
        return "upper_body"; // Tops
    }
  }

  function toDisplayCategory(category: string) {
    switch (category) {
      case "lower_body":
        return "Bottoms";
      case "outerwear":
        return "Outerwear";
      case "shoes":
        return "Shoes";
      case "accessories":
        return "Accessories";
      case "dresses":
        return "Dresses";
      default:
        return "Tops"; // upper_body
    }
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

  const toClothingItem = useCallback((item: ApiClothingItem): ClothingItem => {
    return {
      id: item._id,
      name: item.name,
      category: toDisplayCategory(item.category),
      size: item.size,
      fit: toDisplayFit(item.fit),
      favourite: item.favourite ?? false,
      emoji: "👕",
      imageUrl: item.imageUrls?.front,
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      try {
        const response = await fetch(`${apiUrl}/api/clothingItems/me`, {
          headers: await getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error("Failed to load clothing items");
        }

        const apiItems = (await response.json()) as ApiClothingItem[];

        if (!cancelled) {
          setItems(apiItems.map(toClothingItem));
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setItems([]);
        }
      }
    }

    loadItems();

    return () => {
      cancelled = true;
    };
  }, [apiUrl, toClothingItem]);

  useEffect(() => {
    if (searchParams.get("addItem") === "1") {
      setUploadOpen(true);
    }
  }, [searchParams]);

  async function handleAddItem(newItem: NewClothingItem) {
    const createResponse = await fetch(`${apiUrl}/api/clothingItems/me`, {
      method: "POST",
      headers: await getAuthHeaders(true),
      body: JSON.stringify({
        name: newItem.name,
        category: toApiCategory(newItem.category),
        size: newItem.size,
        fit: toApiFit(newItem.fit),
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

      const uploadResponse = await fetch(
        `${apiUrl}/api/clothingItems/me/${item._id}/image`,
        {
          method: "POST",
          headers: await getAuthHeaders(),
          body: imageData,
        },
      );

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload clothing image");
      }

      const uploaded = (await uploadResponse.json()) as {
        item: ApiClothingItem;
      };
      item = uploaded.item;
    }

    setItems((prev) => [...prev, toClothingItem(item)]);
  }

  async function handleSaveItem(updated: ClothingItem, imageFile?: File) {
    const updateResponse = await fetch(
      `${apiUrl}/api/clothingItems/me/${updated.id}`,
      {
        method: "PUT",
        headers: await getAuthHeaders(true),
        body: JSON.stringify({
          name: updated.name,
          category: toApiCategory(updated.category),
          size: updated.size,
          fit: toApiFit(updated.fit ?? ""),
        }),
      },
    );

    if (!updateResponse.ok) {
      throw new Error("Failed to update clothing item");
    }

    let item = (await updateResponse.json()) as ApiClothingItem;

    if (imageFile) {
      const imageData = new FormData();
      imageData.append("image", imageFile);
      imageData.append("slot", "front");

      const uploadResponse = await fetch(
        `${apiUrl}/api/clothingItems/me/${item._id}/image`,
        {
          method: "POST",
          headers: await getAuthHeaders(),
          body: imageData,
        },
      );

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload clothing image");
      }

      const uploaded = (await uploadResponse.json()) as {
        item: ApiClothingItem;
      };
      item = uploaded.item;
    }

    const savedItem = toClothingItem(item);

    setItems((prev) =>
      prev.map((i) => (i.id === savedItem.id ? savedItem : i)),
    );
    setSelectedItem(savedItem);
    setEditing(false);
  }

  async function handleRemoveItem(item: ClothingItem) {
    const deleteResponse = await fetch(
      `${apiUrl}/api/clothingItems/me/${item.id}`,
      {
        method: "DELETE",
        headers: await getAuthHeaders(),
      },
    );

    if (!deleteResponse.ok) {
      throw new Error("Failed to delete clothing item");
    }

    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setSelectedItem(null);
    setEditing(false);
  }

  async function handleToggleFavourite(id: string) {
    const current = items.find((item) => item.id === id);
    if (!current) return;

    const newFavourite = !current.favourite;

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, favourite: newFavourite } : item,
      ),
    );
    setSelectedItem((prev) =>
      prev?.id === id ? { ...prev, favourite: newFavourite } : prev,
    );

    try {
      const response = await fetch(`${apiUrl}/api/clothingItems/me/${id}`, {
        method: "PUT",
        headers: await getAuthHeaders(true),
        body: JSON.stringify({ favourite: newFavourite }),
      });

      if (!response.ok) throw new Error("Failed to update favourite");
    } catch (error) {
      console.error(error);
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, favourite: current.favourite } : item,
        ),
      );
      setSelectedItem((prev) =>
        prev?.id === id ? { ...prev, favourite: current.favourite } : prev,
      );
    }
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
            <Button
              leftIcon={<span aria-hidden>+</span>}
              onClick={() => setUploadOpen(true)}
            >
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
                onToggleFavourite={() => handleToggleFavourite(item.id)}
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
            onToggleFavourite={() => handleToggleFavourite(selectedItem.id)}
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
