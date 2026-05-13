"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { OutfitCard, type Outfit } from "@/components/outfits/OutfitCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { type ClothingItem } from "@/components/ui/ItemCard";
import { getOutfitPreviewItems } from "@/components/outfits/preview";
import { getAuthHeaders } from "@/lib/api/auth";
import { cn } from "@/components/ui/cn";

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
  lastTryOnPreviewUrl?: string | null;
  items: ApiClothingItem[];
}

interface ApiProfile {
  modelImage?: string | null;
}

type StyleLabel = "Minimal" | "Smart" | "Casual" | "Street" | "Fun";

interface StyleProfile {
  label: StyleLabel;
  keywords: readonly string[];
  preferredShoes: readonly string[];
}

const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001")
  .replace(/\/+$/, "");

// Keep enough state in localStorage to recover an in-flight try-on after navigation or refresh.
const pendingTryOnStorageKey = "wardrobe.home.pendingTryOn";
const pendingTryOnMaxAgeMs = 12 * 60 * 1000;

// Lightweight styling profiles let the random generator bias choices without needing backend AI.
const styleProfiles: readonly StyleProfile[] = [
  {
    label: "Minimal",
    keywords: ["linen", "cotton", "white", "black", "cream", "navy", "grey", "gray", "plain"],
    preferredShoes: ["sneaker", "loafer", "flat", "boot"],
  },
  {
    label: "Smart",
    keywords: ["shirt", "blazer", "trouser", "tailored", "coat", "loafer", "heel", "dress"],
    preferredShoes: ["loafer", "heel", "boot", "oxford"],
  },
  {
    label: "Casual",
    keywords: ["tee", "t-shirt", "jean", "denim", "hoodie", "sweater", "short", "sneaker"],
    preferredShoes: ["sneaker", "trainer", "canvas"],
  },
  {
    label: "Street",
    keywords: ["cargo", "hoodie", "oversized", "graphic", "denim", "jacket", "boot", "sneaker"],
    preferredShoes: ["sneaker", "trainer", "boot"],
  },
  {
    label: "Fun",
    keywords: ["print", "pattern", "pink", "green", "red", "yellow", "floral", "bright", "skirt"],
    preferredShoes: ["sneaker", "heel", "boot", "sandal"],
  },
];

// Neutral colors are used as simple compatibility hints when pairing separate closet items.
const neutralColourWords = [
  "black",
  "white",
  "cream",
  "beige",
  "grey",
  "gray",
  "navy",
  "denim",
  "tan",
];

interface PendingTryOn {
  outfitId: string;
  outfitName: string;
  startedAt: number;
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
    lastTryOnPreviewUrl: api.lastTryOnPreviewUrl ?? null,
    items: api.items.map(toClothingItem),
  };
}

async function parseApiError(response: Response, fallback: string) {
  const text = await response.text().catch(() => "");

  if (!text) return fallback;

  try {
    const body = JSON.parse(text) as { error?: string; errors?: string[] };
    return body.error ?? body.errors?.join(", ") ?? fallback;
  } catch {
    return text;
  }
}

// Ignore stale pending try-ons so the home page does not wait forever on an old request.
function readPendingTryOn() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(pendingTryOnStorageKey);
    if (!raw) return null;

    const pending = JSON.parse(raw) as PendingTryOn;
    if (!pending.outfitId || Date.now() - pending.startedAt > pendingTryOnMaxAgeMs) {
      window.localStorage.removeItem(pendingTryOnStorageKey);
      return null;
    }

    return pending;
  } catch {
    window.localStorage.removeItem(pendingTryOnStorageKey);
    return null;
  }
}

function writePendingTryOn(pending: PendingTryOn) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(pendingTryOnStorageKey, JSON.stringify(pending));
}

function clearPendingTryOn() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(pendingTryOnStorageKey);
}

function pickRandom<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function itemText(item: ClothingItem) {
  return `${item.name} ${item.category}`.toLowerCase();
}

function matchingWords(text: string, words: readonly string[]) {
  return words.filter((word) => text.includes(word));
}

// Score items using style keywords, shared neutral colors, shoe preferences, and image availability.
function itemScore(
  item: ClothingItem,
  profile: StyleProfile,
  selectedItems: ClothingItem[],
) {
  const text = itemText(item);
  const profileHits = matchingWords(text, profile.keywords).length;
  const neutralHits = matchingWords(text, neutralColourWords).length;
  const selectedColourHits = selectedItems.reduce((count, selected) => {
    const selectedText = itemText(selected);
    return count + matchingWords(selectedText, neutralColourWords).filter((word) => text.includes(word)).length;
  }, 0);
  const shoeHits =
    item.category === "Shoes"
      ? matchingWords(text, profile.preferredShoes).length
      : 0;

  return (
    profileHits * 3
    + neutralHits
    + selectedColourHits * 1.5
    + shoeHits * 2
    + (item.imageUrl ? 0.75 : 0)
    + Math.random()
  );
}

function pickStyledItem(
  items: ClothingItem[],
  profile: StyleProfile,
  selectedItems: ClothingItem[] = [],
) {
  if (items.length === 0) return null;

  const ranked = items
    .map((item) => ({
      item,
      score: itemScore(item, profile, selectedItems),
    }))
    .sort((a, b) => b.score - a.score);
  const shortlist = ranked.slice(0, Math.min(3, ranked.length));

  // Choose from the top few items so repeated generations feel varied but still intentional.
  return pickRandom(shortlist).item;
}

function getClosetGroups(closetItems: ClothingItem[]) {
  return {
    tops: closetItems.filter((item) => item.category === "Tops"),
    bottoms: closetItems.filter((item) => item.category === "Bottoms"),
    dresses: closetItems.filter((item) => item.category === "Dresses"),
    shoes: closetItems.filter((item) => item.category === "Shoes"),
    outerwear: closetItems.filter((item) => item.category === "Outerwear"),
  };
}

function getGeneratorReadiness(closetItems: ClothingItem[]) {
  const groups = getClosetGroups(closetItems);
  const hasSeparates = groups.tops.length > 0 && groups.bottoms.length > 0;
  const hasDress = groups.dresses.length > 0;

  if (hasSeparates || hasDress) {
    return {
      canGenerate: true,
      message: groups.shoes.length > 0
        ? "Ready to style a complete outfit."
        : "Ready to style. Add shoes anytime for more complete looks.",
    };
  }

  if (closetItems.length === 0) {
    return {
      canGenerate: false,
      message: "Add either a top and a bottom, or a dress, to generate an outfit.",
    };
  }

  if (groups.tops.length > 0) {
    return {
      canGenerate: false,
      message: "Add a bottom, or add a dress, to finish the outfit base.",
    };
  }

  if (groups.bottoms.length > 0) {
    return {
      canGenerate: false,
      message: "Add a top, or add a dress, to finish the outfit base.",
    };
  }

  return {
    canGenerate: false,
    message: "Add a top and bottom, or a dress, before generating.",
  };
}

// Build a complete outfit base from either dress-only or top-and-bottom combinations.
function generateRandomOutfit(closetItems: ClothingItem[]): Outfit | null {
  const groups = getClosetGroups(closetItems);
  const canUseSeparates = groups.tops.length > 0 && groups.bottoms.length > 0;
  const canUseDress = groups.dresses.length > 0;

  if (!canUseSeparates && !canUseDress) return null;

  const profile = pickRandom(styleProfiles);
  const useDress = canUseDress && (!canUseSeparates || Math.random() < 0.25);
  const items: ClothingItem[] = [];

  if (useDress) {
    const dress = pickStyledItem(groups.dresses, profile);
    if (dress) items.push(dress);
  } else {
    const top = pickStyledItem(groups.tops, profile);
    if (top) items.push(top);

    const bottom = pickStyledItem(groups.bottoms, profile, items);
    if (bottom) items.push(bottom);
  }

  const shoes = pickStyledItem(groups.shoes, profile, items);
  if (shoes) items.push(shoes);

  const shouldLayer =
    groups.outerwear.length > 0
    && (profile.label === "Smart" || profile.label === "Street" || Math.random() > 0.55);
  const outerwear = shouldLayer
    ? pickStyledItem(groups.outerwear, profile, items)
    : null;
  if (outerwear) items.push(outerwear);

  return {
    id: `generated-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: `${profile.label} ${useDress ? "Dress Look" : "Closet Mix"}`,
    style: profile.label,
    items,
  };
}

function OutfitPreviewStage({
  outfit,
  aiPreviewUrl,
  isGeneratingAi,
}: {
  outfit: Outfit | null;
  aiPreviewUrl: string | null;
  isGeneratingAi: boolean;
}) {
  // Always render four slots so generated and saved outfits share the same visual frame.
  const previewItems = outfit
    ? getOutfitPreviewItems(outfit.items)
    : [null, null, null, null];

  return (
    <div className="relative min-h-[300px] overflow-hidden rounded-2xl border border-border bg-neutral-100">
      <div className="absolute left-4 top-4 z-20">
        <Badge tone={aiPreviewUrl ? "accent" : "neutral"}>
          {aiPreviewUrl ? "AI preview" : outfit?.style ?? "Outfit idea"}
        </Badge>
      </div>

      {aiPreviewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={aiPreviewUrl}
          alt={`${outfit?.name ?? "Generated outfit"} AI preview`}
          className="h-full min-h-[300px] w-full object-cover"
        />
      ) : (
        <div className="flex min-h-[300px] items-center justify-center p-8 pt-16">
          <div className="grid w-full max-w-[260px] grid-cols-2 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            {previewItems.map((item, index) => (
              <div
                key={item?.id ?? `preview-slot-${index}`}
                className={cn(
                  "flex aspect-square items-center justify-center bg-neutral-50 text-5xl",
                  index % 2 === 0 && "border-r border-border",
                  index < 2 && "border-b border-border",
                )}
              >
                {item?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : item ? (
                  <span aria-hidden>{item.emoji ?? "👕"}</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {isGeneratingAi && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/85 px-6 text-center backdrop-blur-sm">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand"
                style={{ animationDelay: `${index * 160}ms` }}
              />
            ))}
          </div>
          <p className="mt-4 text-sm font-semibold text-foreground">
            Generating AI preview
          </p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            This can take a little while. You can keep this page open while it works.
          </p>
        </div>
      )}
    </div>
  );
}

function StatusNotice({
  tone,
  children,
  action,
}: {
  tone: "neutral" | "info" | "success" | "warning" | "error";
  children: string;
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3",
        tone === "error" && "border-red-200 bg-red-50",
        tone === "success" && "border-green-200 bg-green-50",
        tone === "warning" && "border-yellow-200 bg-yellow-50",
        tone === "info" && "border-accent/20 bg-accent-soft/60",
        tone === "neutral" && "border-border bg-neutral-50",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
            tone === "error" && "bg-red-500",
            tone === "success" && "bg-green-500",
            tone === "warning" && "bg-yellow-500",
            tone === "info" && "bg-accent",
            tone === "neutral" && "bg-neutral-300",
          )}
        />
        <div className="min-w-0">
          <p
            className={cn(
              "text-sm font-medium",
              tone === "error" ? "text-red-700" : "text-foreground",
            )}
          >
            {children}
          </p>
          {action}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [closetItems, setClosetItems] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [generatedOutfit, setGeneratedOutfit] = useState<Outfit | null>(null);
  const [humanImageUrl, setHumanImageUrl] = useState<string | null>(null);
  const [aiPreviewUrl, setAiPreviewUrl] = useState<string | null>(null);
  const [aiStatusMessage, setAiStatusMessage] = useState<string | null>(null);
  const [aiErrorMessage, setAiErrorMessage] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isLoadingProfileImage, setIsLoadingProfileImage] = useState(true);
  const [pendingTryOnId, setPendingTryOnId] = useState<string | null>(null);
  const [isOpeningBuilder, setIsOpeningBuilder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const favouriteOutfits = useMemo(
    () => outfits.filter((outfit) => outfit.favourite).slice(0, 3),
    [outfits],
  );
  const closetGroups = useMemo(() => getClosetGroups(closetItems), [closetItems]);
  const generatorReadiness = useMemo(
    () => getGeneratorReadiness(closetItems),
    [closetItems],
  );
  const outfitIdeaCount = useMemo(() => {
    const baseIdeas =
      closetGroups.tops.length * closetGroups.bottoms.length
      + closetGroups.dresses.length;
    const shoeOptions = Math.max(1, closetGroups.shoes.length);

    return baseIdeas * shoeOptions;
  }, [closetGroups]);
  const hasGarmentPhotos = Boolean(
    generatedOutfit?.items.some((item) => item.imageUrl),
  );
  const isTryOnLocked = isGeneratingAi || Boolean(pendingTryOnId);
  const canGenerate = generatorReadiness.canGenerate;
  const canRequestAiPreview = Boolean(
    generatedOutfit
      && humanImageUrl
      && hasGarmentPhotos
      && !isTryOnLocked
      && !isOpeningBuilder
      && !aiPreviewUrl,
  );
  const stats = useMemo(
    () => [
      { label: "Closet items", value: closetItems.length },
      { label: "Favourites", value: favouriteOutfits.length },
      { label: "Outfit ideas", value: outfitIdeaCount },
    ],
    [closetItems.length, favouriteOutfits.length, outfitIdeaCount],
  );

  // Load all dashboard data together so stats, cards, and preview state stay in sync.
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setIsLoadingProfileImage(true);
    setErrorMessage(null);

    try {
      const headers = await getAuthHeaders();
      const [closetResponse, outfitsResponse, profileResponse] = await Promise.all([
        fetch(`${apiUrl}/api/clothingItems/me`, { headers }),
        fetch(`${apiUrl}/api/outfits/me`, { headers }),
        fetch(`${apiUrl}/api/users/me`, { headers }),
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
      const pendingTryOn = readPendingTryOn();

      // Match local pending state against the latest outfit list returned by the backend.
      const pendingOutfit = pendingTryOn
        ? nextOutfits.find((outfit) => outfit.id === pendingTryOn.outfitId)
        : null;
      const latestPreviewOutfit = [...nextOutfits]
        .reverse()
        .find((outfit) => outfit.lastTryOnPreviewUrl);

      if (profileResponse.ok) {
        const profile = (await profileResponse.json()) as ApiProfile;
        setHumanImageUrl(profile.modelImage ?? null);
      } else {
        setHumanImageUrl(null);
      }

      setClosetItems(nextClosetItems);
      setOutfits(nextOutfits);

      // Prefer showing a completed or still-pending try-on before generating a fresh idea.
      if (pendingOutfit?.lastTryOnPreviewUrl) {
        clearPendingTryOn();
        setPendingTryOnId(null);
        setGeneratedOutfit(pendingOutfit);
        setAiPreviewUrl(pendingOutfit.lastTryOnPreviewUrl);
        setAiStatusMessage("Your AI preview is ready.");
      } else if (pendingOutfit && pendingTryOn) {
        setPendingTryOnId(pendingTryOn.outfitId);
        setGeneratedOutfit(pendingOutfit);
        setAiPreviewUrl(null);
        setAiStatusMessage("Your AI preview is still being created.");
      } else {
        if (pendingTryOn) clearPendingTryOn();
        setPendingTryOnId(null);
        setGeneratedOutfit(latestPreviewOutfit ?? generateRandomOutfit(nextClosetItems));
        setAiPreviewUrl(latestPreviewOutfit?.lastTryOnPreviewUrl ?? null);
        setAiStatusMessage(latestPreviewOutfit ? "Latest AI preview loaded." : null);
      }
      setAiErrorMessage(null);
    } catch (error) {
      setClosetItems([]);
      setOutfits([]);
      setGeneratedOutfit(null);
      setHumanImageUrl(null);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load dashboard",
      );
    } finally {
      setLoading(false);
      setIsLoadingProfileImage(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Poll saved outfits while a try-on is pending because the backend stores the preview on the outfit.
  const refreshPendingTryOn = useCallback(async () => {
    const pending = readPendingTryOn();

    if (!pending || pending.outfitId !== pendingTryOnId) {
      clearPendingTryOn();
      setPendingTryOnId(null);
      setAiStatusMessage(null);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/outfits/me`, {
        headers: await getAuthHeaders(),
      });
      if (!response.ok) return;

      const apiOutfits = (await response.json()) as ApiOutfit[];
      const nextOutfits = apiOutfits.map(toOutfit);
      const pendingOutfit = nextOutfits.find(
        (outfit) => outfit.id === pending.outfitId,
      );

      setOutfits(nextOutfits);

      if (!pendingOutfit) {
        clearPendingTryOn();
        setPendingTryOnId(null);
        setAiStatusMessage(null);
        return;
      }

      setGeneratedOutfit(pendingOutfit);

      if (pendingOutfit.lastTryOnPreviewUrl) {
        clearPendingTryOn();
        setPendingTryOnId(null);
        setAiPreviewUrl(pendingOutfit.lastTryOnPreviewUrl);
        setAiStatusMessage("Your AI preview is ready.");
      } else {
        setAiStatusMessage("Your AI preview is still being created.");
      }
    } catch (error) {
      console.error(error);
    }
  }, [pendingTryOnId]);

  useEffect(() => {
    if (!pendingTryOnId) return;

    void refreshPendingTryOn();
    const interval = window.setInterval(() => {
      void refreshPendingTryOn();
    }, 7000);

    return () => window.clearInterval(interval);
  }, [pendingTryOnId, refreshPendingTryOn]);

  function handleGenerate() {
    setGeneratedOutfit(generateRandomOutfit(closetItems));
    setAiPreviewUrl(null);
    setAiErrorMessage(null);
    setAiStatusMessage(null);
  }

  // Generated home outfits must be saved before the builder or try-on API can reference them.
  async function persistGeneratedOutfit(outfit: Outfit, statusMessage: string) {
    if (!outfit.id.startsWith("generated-")) {
      return outfit.id;
    }

    setAiStatusMessage(statusMessage);

    const response = await fetch(`${apiUrl}/api/outfits/me`, {
      method: "POST",
      headers: await getAuthHeaders(true),
      body: JSON.stringify({
        name: outfit.name,
        items: outfit.items.map((item) => item.id),
        style: outfit.style,
      }),
    });

    if (!response.ok) {
      throw new Error(await parseApiError(response, "Failed to save outfit"));
    }

    const savedOutfit = toOutfit((await response.json()) as ApiOutfit);
    setGeneratedOutfit(savedOutfit);
    setOutfits((current) => [
      savedOutfit,
      ...current.filter((entry) => entry.id !== savedOutfit.id),
    ]);

    return savedOutfit.id;
  }

  // Request a virtual try-on after checking both the model photo and garment image requirements.
  async function handleGenerateAiPreview() {
    if (!generatedOutfit || isGeneratingAi) return;

    setAiErrorMessage(null);

    if (isLoadingProfileImage) {
      setAiErrorMessage("Still loading your profile photo.");
      return;
    }

    if (!humanImageUrl) {
      setAiErrorMessage("Add a try-on photo in your profile first.");
      return;
    }

    if (!hasGarmentPhotos) {
      setAiErrorMessage("Add a photo to at least one item in this outfit first.");
      return;
    }

    setIsGeneratingAi(true);
    setAiPreviewUrl(null);

    try {
      const outfitId = await persistGeneratedOutfit(
        generatedOutfit,
        "Saving this outfit for AI preview.",
      );
      const pendingTryOn = {
        outfitId,
        outfitName: generatedOutfit.name,
        startedAt: Date.now(),
      };

      // Store pending state before the provider call so a refresh can resume status tracking.
      writePendingTryOn(pendingTryOn);
      setPendingTryOnId(outfitId);
      setAiStatusMessage("Creating your AI preview. You can come back shortly.");

      const response = await fetch(`${apiUrl}/api/tryon`, {
        method: "POST",
        headers: await getAuthHeaders(true),
        body: JSON.stringify({
          humanImageUrl,
          outfitId,
        }),
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response, "Failed to generate preview"));
      }

      const data = (await response.json()) as { success: boolean; imageUrl: string };
      clearPendingTryOn();
      setPendingTryOnId(null);
      setAiPreviewUrl(data.imageUrl);
      setGeneratedOutfit((current) =>
        current ? { ...current, lastTryOnPreviewUrl: data.imageUrl } : current,
      );
      setOutfits((current) =>
        current.map((outfit) =>
          outfit.id === outfitId
            ? { ...outfit, lastTryOnPreviewUrl: data.imageUrl }
            : outfit,
        ),
      );
      setAiStatusMessage("AI preview ready.");
    } catch (error) {
      clearPendingTryOn();
      setPendingTryOnId(null);
      setAiStatusMessage(null);
      setAiErrorMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setIsGeneratingAi(false);
    }
  }

  // Saving first gives the builder a stable outfit id instead of passing large state through the URL.
  async function handleOpenBuilder() {
    if (isOpeningBuilder || isTryOnLocked) return;

    if (!generatedOutfit) {
      router.push("/outfits/builder");
      return;
    }

    setIsOpeningBuilder(true);
    setAiErrorMessage(null);

    try {
      const outfitId = await persistGeneratedOutfit(
        generatedOutfit,
        "Saving this outfit for the builder.",
      );
      router.push(`/outfits/builder?id=${encodeURIComponent(outfitId)}`);
    } catch (error) {
      setAiStatusMessage(null);
      setAiErrorMessage(
        error instanceof Error ? error.message : "We couldn't open this outfit in the builder.",
      );
      setIsOpeningBuilder(false);
    }
  }

  // Collapse several backend/profile states into one helper message for the AI preview controls.
  const aiHelperMessage = useMemo(() => {
    if (aiErrorMessage) return aiErrorMessage;
    if (aiStatusMessage) return aiStatusMessage;
    if (!generatedOutfit) return "Generate an outfit before using AI preview.";
    if (isLoadingProfileImage) return "Checking your profile photo.";
    if (!humanImageUrl) return "Upload a try-on photo in Profile to enable AI preview.";
    if (!hasGarmentPhotos) return "Add photos to the items in this outfit to enable AI preview.";
    if (aiPreviewUrl) return "AI preview is ready. You can open this outfit in the builder.";
    if (pendingTryOnId) return "Your AI preview is being created. Come back shortly and it will appear here.";
    return "Create a visual try-on with your saved profile photo.";
  }, [
    aiErrorMessage,
    aiPreviewUrl,
    aiStatusMessage,
    generatedOutfit,
    hasGarmentPhotos,
    humanImageUrl,
    isLoadingProfileImage,
    pendingTryOnId,
  ]);

  const aiButtonLabel = isTryOnLocked
    ? "Generating"
    : aiPreviewUrl
      ? "Preview ready"
      : "Generate AI preview";

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

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold">Random outfit generator</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {loading ? "Loading your closet." : generatorReadiness.message}
                </p>
              </div>
              <Badge tone={canGenerate ? "brand" : "neutral"}>
                {canGenerate ? "Ready" : "Needs items"}
              </Badge>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-[minmax(260px,0.95fr)_minmax(280px,1fr)]">
              <OutfitPreviewStage
                outfit={generatedOutfit}
                aiPreviewUrl={aiPreviewUrl}
                isGeneratingAi={isTryOnLocked}
              />

              <div className="flex min-w-0 flex-col gap-4">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Current idea
                      </p>
                      <h3 className="mt-1 text-xl font-bold text-foreground">
                        {generatedOutfit?.name ?? "Build your first idea"}
                      </h3>
                    </div>
                    {generatedOutfit && (
                      <Badge tone="accent">{generatedOutfit.style || "Style"}</Badge>
                    )}
                  </div>

                  <div className="mt-4 divide-y divide-border rounded-xl border border-border">
                    {generatedOutfit ? (
                      generatedOutfit.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 px-3 py-2.5"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-100 text-xl">
                            {item.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span aria-hidden>{item.emoji ?? "👕"}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              {item.category}
                            </div>
                            <div className="truncate text-sm font-semibold text-foreground">
                              {item.name}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-4 text-sm text-muted-foreground">
                        {generatorReadiness.message}
                      </div>
                    )}
                  </div>
                </div>

                <StatusNotice
                  tone={
                    aiErrorMessage
                      ? "error"
                      : aiPreviewUrl
                        ? "success"
                        : isTryOnLocked
                          ? "info"
                          : humanImageUrl && hasGarmentPhotos
                            ? "neutral"
                            : "warning"
                  }
                  action={
                    !humanImageUrl && !isLoadingProfileImage ? (
                    <Link
                      href="/profile"
                      className="mt-2 inline-flex text-sm font-semibold text-accent hover:underline"
                    >
                      Go to profile
                    </Link>
                    ) : undefined
                  }
                >
                  {aiHelperMessage}
                </StatusNotice>

                <div className="mt-auto flex flex-wrap gap-3">
                  <Button
                    type="button"
                    leftIcon={<span aria-hidden>+</span>}
                    disabled={!canGenerate || loading || isTryOnLocked || isOpeningBuilder}
                    onClick={handleGenerate}
                  >
                    {loading ? "Loading" : "Generate outfit"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={!canRequestAiPreview}
                    onClick={handleGenerateAiPreview}
                  >
                    {aiButtonLabel}
                  </Button>
                  <button
                    type="button"
                    onClick={handleOpenBuilder}
                    disabled={isOpeningBuilder || isTryOnLocked || !generatedOutfit}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-white px-4 text-sm font-semibold uppercase transition-colors hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-50"
                  >
                    {isOpeningBuilder ? "Opening" : "Edit in builder"}
                  </button>
                </div>
              </div>
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
                  Add item <span aria-hidden>+</span>
                </Link>
                <Link
                  href="/outfits/builder"
                  className="flex h-12 items-center justify-between rounded-xl border border-border bg-white px-4 text-sm font-bold uppercase text-foreground transition-colors hover:bg-neutral-50"
                >
                  Create outfit <span aria-hidden>+</span>
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
