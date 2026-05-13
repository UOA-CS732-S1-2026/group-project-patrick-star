"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { OutfitCard, type Outfit } from "@/components/outfits/OutfitCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { type ClothingItem } from "@/components/ui/ItemCard";
import { getOutfitPreviewItems } from "@/components/outfits/preview";
import { getAuthHeaders } from "@/lib/api/auth";

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

const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001")
  .replace(/\/+$/, "");
const styleLabels = ["Minimal", "Smart", "Casual", "Street"] as const;

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
      return "Tops";
  }
}

function toFallbackEmoji(category: string) {
  switch (category) {
    case "Bottoms":
      return "👖";
    case "Outerwear":
      return "🧥";
    case "Shoes":
      return "👟";
    case "Dresses":
      return "👗";
    default:
      return "👕";
  }
}

function toClothingItem(item: ApiClothingItem): ClothingItem {
  const category = toDisplayCategory(item.category);

  return {
    id: item._id,
    name: item.name,
    category,
    emoji: toFallbackEmoji(category),
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

function pickRandom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function generateRandomOutfit(closetItems: ClothingItem[]): Outfit | null {
  const tops = closetItems.filter((item) => item.category === "Tops");
  const bottoms = closetItems.filter((item) => item.category === "Bottoms");
  const shoes = closetItems.filter((item) => item.category === "Shoes");
  const outerwear = closetItems.filter((item) => item.category === "Outerwear");

  if (tops.length === 0 || bottoms.length === 0) {
    return null;
  }

  const top = pickRandom(tops);
  const bottom = pickRandom(bottoms);
  const shoe = shoes.length > 0 ? pickRandom(shoes) : null;
  const outer =
    outerwear.length > 0 && Math.random() > 0.45 ? pickRandom(outerwear) : null;
  const style = pickRandom([...styleLabels]);
  const items = [top, bottom, shoe, outer].filter(Boolean) as ClothingItem[];

  return {
    id: `generated-${Date.now()}`,
    name: `${style} Mix`,
    style,
    items,
  };
}

function OutfitPreview({
  outfit,
  aiPreview,
}: {
  outfit: Outfit | null;
  aiPreview: boolean;
}) {
  const previewItems = outfit
    ? getOutfitPreviewItems(outfit.items)
    : [null, null, null, null];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-neutral-100">
      <div className="absolute left-4 top-4 z-10">
        <Badge
          tone={aiPreview ? "accent" : "neutral"}
          icon={<span aria-hidden>✦</span>}
        >
          {aiPreview ? "AI preview" : "Generated outfit"}
        </Badge>
      </div>

      <div className="grid min-h-[420px] grid-cols-[minmax(0,1fr)_180px] gap-6 p-6 pt-16">
        <div className="flex items-center justify-center">
          <div className="grid w-full max-w-[320px] grid-cols-2 overflow-hidden rounded-[28px] border border-border bg-white shadow-lg">
            {previewItems.map((item, index) => (
              <div
                key={item?.id ?? `preview-slot-${index}`}
                className={[
                  "flex aspect-square items-center justify-center bg-neutral-50 text-6xl",
                  index % 2 === 0 ? "border-r border-border" : "",
                  index < 2 ? "border-b border-border" : "",
                  item?.category === "Bottoms" ? "bg-[#f5f5f5]" : "",
                ].join(" ")}
              >
                {item?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                ) : item ? (
                  <span aria-hidden>{item.emoji ?? "👕"}</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-end gap-3">
          {outfit ? (
            outfit.items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-white px-3 py-2 shadow-sm"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {item.category}
                </div>
                <div className="mt-0.5 truncate text-sm font-semibold text-foreground">
                  {item.emoji} {item.name}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-border bg-white px-3 py-3 text-sm text-muted-foreground shadow-sm">
              Add at least one top and one bottom to generate outfits.
            </div>
          )}
        </div>
      </div>

      {aiPreview && outfit && (
        <div className="border-t border-border bg-white px-5 py-4">
          <div className="text-sm font-semibold text-foreground">
            Instant try-on concept
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Previewing how this combination could look before you save it.
          </p>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const [closetItems, setClosetItems] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [generatedOutfit, setGeneratedOutfit] = useState<Outfit | null>(null);
  const [aiPreview, setAiPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const favouriteOutfits = useMemo(
    () => outfits.filter((outfit) => outfit.favourite).slice(0, 3),
    [outfits],
  );
  const outfitIdeaCount = useMemo(() => {
    const tops = closetItems.filter((item) => item.category === "Tops").length;
    const bottoms = closetItems.filter(
      (item) => item.category === "Bottoms",
    ).length;
    const shoes = Math.max(
      1,
      closetItems.filter((item) => item.category === "Shoes").length,
    );

    return tops * bottoms * shoes;
  }, [closetItems]);
  const canGenerate = closetItems.some((item) => item.category === "Tops")
    && closetItems.some((item) => item.category === "Bottoms");
  const stats = useMemo(
    () => [
      { label: "Closet items", value: closetItems.length },
      { label: "Favourites", value: favouriteOutfits.length },
      { label: "Outfit ideas", value: outfitIdeaCount },
    ],
    [closetItems.length, favouriteOutfits.length, outfitIdeaCount],
  );

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const headers = await getAuthHeaders();
      const [closetResponse, outfitsResponse] = await Promise.all([
        fetch(`${apiUrl}/api/clothingItems/me`, { headers }),
        fetch(`${apiUrl}/api/outfits/me`, { headers }),
      ]);

      if (!closetResponse.ok) {
        throw new Error("Failed to load closet items");
      }

      if (!outfitsResponse.ok) {
        throw new Error("Failed to load outfits");
      }

      const apiClosetItems = (await closetResponse.json()) as ApiClothingItem[];
      const apiOutfits = (await outfitsResponse.json()) as ApiOutfit[];
      const nextClosetItems = apiClosetItems.map(toClothingItem);
      const nextOutfits = apiOutfits.map(toOutfit);

      setClosetItems(nextClosetItems);
      setOutfits(nextOutfits);
      setGeneratedOutfit(
        nextOutfits.find((outfit) => outfit.favourite)
          ?? generateRandomOutfit(nextClosetItems),
      );
    } catch (error) {
      setClosetItems([]);
      setOutfits([]);
      setGeneratedOutfit(null);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load dashboard",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  function handleGenerate() {
    setGeneratedOutfit(generateRandomOutfit(closetItems));
    setAiPreview(false);
  }

  const builderHref = generatedOutfit
    ? `/outfits/builder?items=${encodeURIComponent(
        generatedOutfit.items.map((item) => item.id).join(","),
      )}&name=${encodeURIComponent(generatedOutfit.name)}&style=${encodeURIComponent(generatedOutfit.style)}`
    : "/outfits/builder";

  return (
    <>
      <PageHeader
        title="Home"
        subtitle="Generate, preview, and jump back into your wardrobe."
      />

      <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-10 py-8">
        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Random outfit generator</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Generate a balanced outfit from your existing closet.
                </p>
              </div>
            </div>

            <OutfitPreview outfit={generatedOutfit} aiPreview={aiPreview} />

            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                type="button"
                leftIcon={<span aria-hidden>↻</span>}
                disabled={!canGenerate || loading}
                onClick={handleGenerate}
              >
                {loading ? "Loading" : "Generate"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                leftIcon={<span aria-hidden>✦</span>}
                disabled={!generatedOutfit}
                onClick={() => setAiPreview(true)}
              >
                Preview AI fit
              </Button>
              <Link
                href={builderHref}
                className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-white px-4 text-sm font-semibold uppercase transition-colors hover:bg-neutral-50"
              >
                Edit in builder
              </Link>
            </div>
          </div>

          <aside className="flex flex-col gap-5">
            <Card className="p-5">
              <h2 className="text-lg font-semibold">Quick stats</h2>
              <div className="mt-4 grid gap-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between rounded-xl border border-border bg-neutral-50 px-4 py-3"
                  >
                    <span className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </span>
                    <span className="text-xl font-bold text-foreground">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="text-lg font-semibold">Quick actions</h2>
              <div className="mt-4 flex flex-col gap-3">
                <Link
                  href="/closet?addItem=1"
                  className="flex h-12 items-center justify-between rounded-xl bg-brand px-4 text-sm font-bold uppercase text-white transition-colors hover:bg-brand-hover"
                >
                  Add item <span aria-hidden>＋</span>
                </Link>
                <Link
                  href="/outfits/builder"
                  className="flex h-12 items-center justify-between rounded-xl border border-border bg-white px-4 text-sm font-bold uppercase text-foreground transition-colors hover:bg-neutral-50"
                >
                  Create outfit <span aria-hidden>→</span>
                </Link>
              </div>
            </Card>
          </aside>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Favourite outfits</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your saved combinations, ready to reuse or tweak.
              </p>
            </div>
            <Link
              href="/outfits"
              className="text-sm font-semibold text-accent hover:underline"
            >
              View all
            </Link>
          </div>

          {favouriteOutfits.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-3">
              {favouriteOutfits.map((outfit) => (
                <OutfitCard key={outfit.id} outfit={outfit} />
              ))}
            </div>
          ) : (
            <Card className="p-6 text-sm text-muted-foreground">
              Favourite outfits will appear here once you star them from the
              outfits page.
            </Card>
          )}
        </section>
      </div>
    </>
  );
}
