import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ItemCard, type ClothingItem } from "@/components/ui/ItemCard";

const recentlyWorn: ClothingItem[] = [
  { id: "1", name: "White linen shirt", category: "Tops", emoji: "👕" },
  { id: "2", name: "Navy trousers", category: "Bottoms", emoji: "👖" },
  { id: "3", name: "Tan trench", category: "Outerwear", emoji: "🧥" },
  { id: "4", name: "White sneakers", category: "Shoes", emoji: "👟" },
];

export default function HomePage() {
  return (
    <>
      <PageHeader
        title="Good morning, Alex"
        subtitle="Saturday, 11 April 2026"
        right={
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium shadow-sm">
            <span aria-hidden>⛅</span>
            <span>18° Auckland</span>
          </div>
        }
      />

      <div className="grid flex-1 grid-cols-[minmax(0,380px)_minmax(0,1fr)] gap-8 px-10 py-8">
        {/* Today's look */}
        <section>
          <h2 className="mb-3 text-lg font-semibold">Today&apos;s look</h2>
          <Card className="flex flex-col overflow-hidden">
            <div className="relative flex-1 bg-neutral-100 p-5">
              <Badge tone="accent" icon={<span aria-hidden>✦</span>}>
                AI styled
              </Badge>
              <div className="min-h-[360px]" />
            </div>
            <div className="border-t border-border p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-accent">
                AI recommendation
              </div>
              <p className="mt-1 text-sm text-foreground">
                Smart casual for your 2pm meeting.
              </p>
              <div className="mt-4 flex gap-3">
                <Button leftIcon={<span aria-hidden>↻</span>}>Regen</Button>
                <Button
                  variant="secondary"
                  leftIcon={<span aria-hidden>♡</span>}
                >
                  Save
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* Right column */}
        <section className="flex flex-col gap-8">
          <div>
            <h2 className="mb-3 text-lg font-semibold">Wardrobe insights</h2>
            <Card className="p-6">
              <Badge tone="accent" icon={<span aria-hidden>✦</span>}>
                Gap analysis
              </Badge>
              <h3 className="mt-3 text-xl font-bold">Add a tan blazer</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Unlocks 6 new outfit combos from your existing closet.
              </p>
              <div className="mt-4 flex gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-14 w-14 rounded-xl bg-neutral-100"
                  />
                ))}
              </div>
            </Card>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold">Recently worn</h2>
            <div className="grid grid-cols-4 gap-4">
              {recentlyWorn.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}