"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../ui/cn";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const defaultNav: NavItem[] = [
  { label: "Home", href: "/", icon: "🏠" },
  { label: "Closet", href: "/closet", icon: "👔" },
  { label: "Outfits", href: "/outfits", icon: "✨" },
  { label: "Profile", href: "/profile", icon: "👤" },
];

interface SidebarProps {
  nav?: NavItem[];
  user?: { name: string; itemCount?: number };
}

export function Sidebar({
  nav = defaultNav,
  user = { name: "Alex Johnson", itemCount: 42 },
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-white">
      <div className="px-6 py-6 text-xs font-semibold tracking-[0.2em] text-foreground">
        AI WARDROBE
      </div>
      <nav className="flex-1 px-3 py-2">
        <ul className="flex flex-col gap-1">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-neutral-100 text-foreground"
                      : "text-neutral-600 hover:bg-neutral-50"
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      active ? "bg-brand" : "bg-transparent"
                    )}
                  />
                  <span aria-hidden className="text-lg leading-none">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-3">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-white px-3 py-2.5 shadow-sm">
          <div className="h-9 w-9 shrink-0 rounded-full bg-neutral-200" />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">
              {user.name}
            </div>
            {user.itemCount !== undefined && (
              <div className="text-xs text-muted-foreground">
                {user.itemCount} items
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
