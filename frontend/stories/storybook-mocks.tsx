import type { NavItem } from "@/components/layout/Sidebar";
import type { ClothingItem } from "@/components/ui/ItemCard";
import type { Outfit } from "@/components/outfits/OutfitCard";

export const defaultItem: ClothingItem = {
  id: "item-1",
  name: "Linen Shirt",
  category: "Tops",
  emoji: "👕",
  colour: "White",
  size: "M",
  fit: "Regular",
  fabric: "Linen",
  favourite: false,
  timesWorn: 8,
  price: 64,
};

export const defaultOutfit: Outfit = {
  id: "outfit-1",
  name: "Weekend Neutrals",
  style: "Minimal",
  season: "Spring",
  occasion: "Casual",
  notes: "Easy to wear and simple to layer.",
  items: [
    { ...defaultItem, id: "item-1", name: "Linen Shirt", emoji: "👕" },
    { ...defaultItem, id: "item-2", name: "Tailored Trousers", emoji: "👖" },
    { ...defaultItem, id: "item-3", name: "Leather Belt", emoji: "🧵" },
    { ...defaultItem, id: "item-4", name: "White Sneakers", emoji: "👟" },
  ],
  favourite: true,
};

export const defaultNav: NavItem[] = [
  { label: "Home", href: "/", icon: "🏠" },
  { label: "Closet", href: "/closet", icon: "👚" },
  { label: "Outfits", href: "/outfits", icon: "🧥" },
  { label: "Profile", href: "/profile", icon: "👤" },
];
