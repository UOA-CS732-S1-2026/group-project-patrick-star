"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthHeaders } from "@/lib/api/auth";
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
  user?: { name: string; itemCount?: number; avatarEmoji?: string };
}

interface ApiUserProfile {
  name?: string;
}

const apiUrl = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001"
).replace(/\/+$/, "");

export function Sidebar({ nav = defaultNav, user }: SidebarProps) {
  const pathname = usePathname();
  const [sidebarUser, setSidebarUser] = useState(
    user ?? { name: "Profile", itemCount: undefined, avatarEmoji: "👤" },
  );

  useEffect(() => {
    let cancelled = false;

    async function loadSidebarUser() {
      try {
        const headers = await getAuthHeaders();
        const [profileResponse, clothingResponse] = await Promise.all([
          fetch(`${apiUrl}/api/users/me`, { headers }),
          fetch(`${apiUrl}/api/clothingItems/me`, { headers }),
        ]);

        if (!profileResponse.ok || cancelled) {
          return;
        }

        const profile = (await profileResponse.json()) as ApiUserProfile;
        const clothingItems = clothingResponse.ok
          ? ((await clothingResponse.json()) as unknown[])
          : [];

        if (!cancelled) {
          setSidebarUser({
            name: profile.name ?? "Profile",
            itemCount: clothingItems.length,
            avatarEmoji: "👤",
          });
        }
      } catch {
        // Keep the fallback user details if the sidebar profile request fails.
      }
    }

    function handleProfileUpdated(event: Event) {
      const detail = (
        event as CustomEvent<{
          name?: string;
        }>
      ).detail;

      if (detail?.name) {
        setSidebarUser((current) => ({ ...current, name: detail.name }));
      }
    }

    loadSidebarUser();
    window.addEventListener("user-profile-updated", handleProfileUpdated);

    return () => {
      cancelled = true;
      window.removeEventListener("user-profile-updated", handleProfileUpdated);
    };
  }, []);

  function handleSignOut() {
    localStorage.removeItem("access_token");
    sessionStorage.removeItem("access_token");
    window.location.assign(
      `/auth/logout?returnTo=${encodeURIComponent(window.location.origin)}`,
    );
  }

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
                      : "text-neutral-600 hover:bg-neutral-50",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      active ? "bg-brand" : "bg-transparent",
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
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-2xl border border-border bg-white px-3 py-2.5 shadow-sm transition-colors hover:border-brand/30 hover:bg-brand/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          aria-label={`Open profile for ${sidebarUser.name}`}
        >
          <div
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-lg"
          >
            {sidebarUser.avatarEmoji}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-foreground">
              {sidebarUser.name}
            </div>
            {sidebarUser.itemCount !== undefined && (
              <div className="text-xs text-muted-foreground">
                {sidebarUser.itemCount} items
              </div>
            )}
          </div>
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-black bg-black px-4 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-neutral-900 hover:border-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
