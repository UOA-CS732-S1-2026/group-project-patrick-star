"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { OutfitCard, type Outfit } from "@/components/outfits/OutfitCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { type ClothingItem } from "@/components/ui/ItemCard";

const closetItems: ClothingItem[] = [
  { id: "top-1", name: "White linen shirt", category: "Tops", emoji: "👕" },
  { id: "top-2", name: "Black knit tee", category: "Tops", emoji: "⚫" },
  { id: "bottom-1", name: "Navy trousers", category: "Bottoms", emoji: "👖" },
  { id: "bottom-2", name: "Washed denim", category: "Bottoms", emoji: "🔵" },
  { id: "outer-1", name: "Tan trench", category: "Outerwear", emoji: "🧥" },
  { id: "shoe-1", name: "White sneakers", category: "Shoes", emoji: "👟" },
];

const favouriteOutfits: Outfit[] = [
  {
    id: "fav-1",
    name: "Clean Office",
    style: "Minimal",
    favourite: true,
    items: [closetItems[0], closetItems[2], closetItems[5]],
  },
  {
    id: "fav-2",
    name: "Weekend Walk",
    style: "Casual",
    favourite: true,
    items: [closetItems[1], closetItems[3], closetItems[5]],
  },
  {
    id: "fav-3",
    name: "Rainy Commute",
    style: "Smart",
    favourite: true,
    items: [closetItems[0], closetItems[2], closetItems[4]],
  },
];

const styleLabels = ["Minimal", "Smart", "Casual", "Street"] as const;

function pickRandom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function generateRandomOutfit(): Outfit {
  const top = pickRandom(closetItems.filter((item) => item.category === "Tops"));
  const bottom = pickRandom(
    closetItems.filter((item) => item.category === "Bottoms"),
  );
  const shoes = pickRandom(
    closetItems.filter((item) => item.category === "Shoes"),
  );
  const outerwear =
    Math.random() > 0.45
      ? pickRandom(closetItems.filter((item) => item.category === "Outerwear"))
      : null;
  const style = pickRandom([...styleLabels]);
  const items = [top, bottom, shoes, outerwear].filter(Boolean) as ClothingItem[];

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
  outfit: Outfit;
  aiPreview: boolean;
}) {
  const top = outfit.items.find((item) => item.category === "Tops");
  const bottom = outfit.items.find((item) => item.category === "Bottoms");
  const shoes = outfit.items.find((item) => item.category === "Shoes");
  const outerwear = outfit.items.find((item) => item.category === "Outerwear");

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-neutral-100">
      <div className="absolute left-4 top-4 z-10">
        <Badge tone={aiPreview ? "accent" : "neutral"} icon={<span aria-hidden>✦</span>}>
          {aiPreview ? "AI preview" : "Generated outfit"}
        </Badge>
      </div>

      <div className="grid min-h-[420px] grid-cols-[1fr_180px] gap-6 p-6 pt-16">
        <div className="flex items-center justify-center">
          <div className="flex w-52 flex-col overflow-hidden rounded-[28px] border border-border bg-white shadow-lg">
            <div className="flex h-28 items-center justify-center bg-white text-6xl">
              {outerwear?.emoji ?? top?.emoji ?? "👕"}
            </div>
            <div className="flex h-36 items-center justify-center bg-neutral-50 text-7xl">
              {top?.emoji ?? "👕"}
            </div>
            <div className="flex h-36 items-center justify-center bg-[#1f2a44] text-7xl">
              {bottom?.emoji ?? "👖"}
            </div>
            <div className="flex h-20 items-center justify-center bg-white text-5xl">
              {shoes?.emoji ?? "👟"}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-end gap-3">
          {outfit.items.map((item) => (
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
          ))}
        </div>
      </div>

      {aiPreview && (
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
  const [generatedOutfit, setGeneratedOutfit] = useState<Outfit>(
    () => favouriteOutfits[0],
  );
  const [aiPreview, setAiPreview] = useState(false);

  const stats = useMemo(
    () => [
      { label: "Closet items", value: closetItems.length },
      { label: "Favourites", value: favouriteOutfits.length },
      { label: "Outfit ideas", value: 18 },
    ],
    [],
  );

  function handleGenerate() {
    setGeneratedOutfit(generateRandomOutfit());
    setAiPreview(false);
  }

  return (
    <>
      <PageHeader
        title="Home"
        subtitle="Generate, preview, and jump back into your wardrobe."
      />

      <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-10 py-8">
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
                onClick={handleGenerate}
              >
                Generate
              </Button>
              <Button
                type="button"
                variant="secondary"
                leftIcon={<span aria-hidden>✦</span>}
                onClick={() => setAiPreview(true)}
              >
                Preview AI fit
              </Button>
              <Link
                href="/outfits/builder"
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

          <div className="grid gap-5 md:grid-cols-3">
            {favouriteOutfits.map((outfit) => (
              <OutfitCard key={outfit.id} outfit={outfit} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
