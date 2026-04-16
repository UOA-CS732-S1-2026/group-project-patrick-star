"use client";

import { useState, type ReactNode } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Badge,
  Button,
  Card,
  CardBody,
  Chip,
  ItemCard,
  ProgressBar,
  SearchInput,
} from "@/components";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-border pt-8 first:border-t-0 first:pt-0">
      <h2 className="text-xl font-bold">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Row({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start gap-4 rounded-2xl border border-border bg-white p-6">
      {children}
    </div>
  );
}

export default function ComponentsPage() {
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState("Athletic");
  const [tab, setTab] = useState("All");
  const [progress, setProgress] = useState(60);

  return (
    <>
      <PageHeader
        title="Components"
        subtitle="Live showcase of every reusable UI primitive in @/components"
      />

      <div className="flex flex-1 flex-col gap-10 px-10 py-8">
        <Section
          title="Button"
          description="Variants: primary, secondary, ghost. Sizes: sm, md, lg. Optional leftIcon / rightIcon."
        >
          <Row>
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button disabled>Disabled</Button>
            <Button leftIcon={<span aria-hidden>↻</span>}>With icon</Button>
          </Row>
          <div className="h-3" />
          <Row>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </Row>
        </Section>

        <Section
          title="Badge"
          description="Compact pill label. Tones: accent (default), neutral, brand."
        >
          <Row>
            <Badge icon={<span aria-hidden>✦</span>}>AI styled</Badge>
            <Badge tone="neutral">Neutral</Badge>
            <Badge tone="brand">Brand</Badge>
          </Row>
        </Section>

        <Section
          title="Chip"
          description="Selectable pill. Outline variant for forms, solid variant for tabs."
        >
          <Row>
            {["Slim", "Athletic", "Regular", "Curvy"].map((s) => (
              <Chip
                key={s}
                selected={chip === s}
                onClick={() => setChip(s)}
              >
                {s}
              </Chip>
            ))}
          </Row>
          <div className="h-3" />
          <Row>
            {["All", "Tops", "Bottoms", "Shoes"].map((t) => (
              <Chip
                key={t}
                variant="solid"
                selected={tab === t}
                onClick={() => setTab(t)}
              >
                {t}
              </Chip>
            ))}
          </Row>
        </Section>

        <Section title="Card" description="Base surface with optional CardBody.">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardBody>
                <div className="text-sm font-semibold">Card + CardBody</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Padded content using the CardBody helper.
                </p>
              </CardBody>
            </Card>
            <Card className="p-6">
              <div className="text-sm font-semibold">Card (custom padding)</div>
              <p className="mt-1 text-sm text-muted-foreground">
                You can pass className to tweak layout directly.
              </p>
            </Card>
          </div>
        </Section>

        <Section title="SearchInput" description="Pill-shaped input with a search icon.">
          <div className="max-w-sm">
            <SearchInput
              placeholder="Search your wardrobe..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <p className="mt-2 text-xs text-muted-foreground">
                Typing: {query}
              </p>
            )}
          </div>
        </Section>

        <Section
          title="ProgressBar"
          description="0–100 value. Used in the onboarding flow."
        >
          <div className="max-w-sm space-y-3">
            <ProgressBar value={progress} />
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">{progress}%</p>
          </div>
        </Section>

        <Section
          title="ItemCard"
          description="Clothing-item tile with category label and name."
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <ItemCard
              item={{
                id: "1",
                name: "White linen shirt",
                category: "Tops",
                emoji: "👕",
              }}
            />
            <ItemCard
              item={{
                id: "2",
                name: "Navy trousers",
                category: "Bottoms",
                emoji: "👖",
              }}
            />
            <ItemCard
              item={{
                id: "3",
                name: "Tan trench",
                category: "Outerwear",
                emoji: "🧥",
              }}
            />
            <ItemCard
              item={{
                id: "4",
                name: "White sneakers",
                category: "Shoes",
                emoji: "👟",
              }}
            />
          </div>
        </Section>

        <Section
          title="Layout primitives"
          description="Sidebar + AppShell + PageHeader are visible on this very page. PageHeader renders the top bar with the title and subtitle above."
        >
          <Card>
            <CardBody>
              <p className="text-sm text-muted-foreground">
                The sidebar you see on the left is{" "}
                <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs">
                  &lt;Sidebar /&gt;
                </code>
                , wrapped by{" "}
                <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs">
                  &lt;AppShell /&gt;
                </code>
                . The header at the top of this page is{" "}
                <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs">
                  &lt;PageHeader /&gt;
                </code>
                .
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                The onboarding two-pane layout{" "}
                <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs">
                  &lt;OnboardingShell /&gt;
                </code>{" "}
                is visible at{" "}
                <a
                  href="/onboarding/body-profile"
                  className="font-medium text-accent underline"
                >
                  /onboarding/body-profile
                </a>
                .
              </p>
            </CardBody>
          </Card>
        </Section>
      </div>
    </>
  );
}
