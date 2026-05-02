"use client";

import Image from "next/image";
import { cn } from "@/components/ui/cn";

export interface ModelScrollerItem {
  id: string;
  label: string;
  imageSrc: string;
}

interface ModelScrollerProps {
  items: readonly ModelScrollerItem[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
}

export function ModelScroller({
  items,
  selectedId,
  onSelect,
  className,
}: ModelScrollerProps) {
  if (items.length === 0) {
    return null;
  }

  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === selectedId),
  );
  const selectedIndex = activeIndex === -1 ? 0 : activeIndex;
  const previousIndex = (selectedIndex - 1 + items.length) % items.length;
  const nextIndex = (selectedIndex + 1) % items.length;
  const selectedItem = items[selectedIndex];
  const previousItem = items[previousIndex];
  const nextItem = items[nextIndex];

  return (
    <section className={cn("w-full", className)}>
      <div className="grid grid-cols-[14vw_minmax(0,1fr)_14vw] md:grid-cols-2 items-center gap-3 lg:grid-cols-[clamp(24px,10vw,132px)_minmax(0,1fr)_clamp(24px,10vw,132px)] lg:gap-6">
        {/*left*/}
        <button
          type="button"
          onClick={() => onSelect?.(previousItem.id)}
          className="group relative aspect-[3/4] w-full justify-self-end overflow-hidden rounded-[2rem] border border-border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
          aria-label={`Select ${previousItem.label}`}
        >
          <Image
            src={previousItem.imageSrc}
            alt={previousItem.label}
            fill
            sizes="(max-width: 768px) 18vw, 132px"
            className="object-cover opacity-90 transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-black/10" />
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground">
            {previousItem.label}
          </span>
        </button>
        {/*middle*/}
        <div className="flex md:hidden justify-center lg:flex">
          <div className="relative aspect-[3/4] w-full max-w-[220px] overflow-hidden rounded-[2.5rem] border-2 border-brand bg-white shadow-xl shadow-brand/15 ">
            <Image
              src={selectedItem.imageSrc}
              alt={selectedItem.label}
              fill
              priority
              sizes="(max-width: 1023px) 0px, (max-width: 1280px) 32vw, 420px"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent px-5 py-6 md:px-7">
              <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
                Current model
              </span>
              <div className="mt-3 text-xl font-bold text-white md:text-2xl">
                {selectedItem.label}
              </div>
            </div>
          </div>
        </div>
        {/*right*/}
        <button
          type="button"
          onClick={() => onSelect?.(nextItem.id)}
          className="group relative aspect-[3/4] w-full justify-self-start overflow-hidden rounded-[2rem] border border-border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
          aria-label={`Select ${nextItem.label}`}
        >
          <Image
            src={nextItem.imageSrc}
            alt={nextItem.label}
            fill
            sizes="(max-width: 768px) 18vw, 132px"
            className="object-cover opacity-90 transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-black/10" />
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground">
            {nextItem.label}
          </span>
        </button>
      </div>
    </section>
  );
}
