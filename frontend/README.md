# AI Wardrobe — Frontend

Next.js (App Router) + Tailwind CSS v4 + TypeScript. Desktop-first UI for an AI-powered wardrobe/outfit app.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Scripts

| Command         | What it does                         |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the dev server on port 3000    |
| `npm run build` | Production build                     |
| `npm run start` | Serve the production build           |
| `npm run lint`  | Run ESLint                           |

## Routes

| URL                          | Page                                             |
| ---------------------------- | ------------------------------------------------ |
| `/`                          | Home — Today's look, insights, recently worn     |
| `/closet`                    | My Closet — searchable, filterable item grid     |
| `/components`                | Component showcase (all reusable UI primitives)  |
| `/onboarding/body-profile`   | Onboarding step 2 — body profile form            |

Stubs for `/outfits`, `/calendar`, `/profile` are not yet built — sidebar links pointing at them will 404 until you add `app/(app)/outfits/page.tsx`, etc.

## Project structure

```
frontend/
├── app/
│   ├── layout.tsx                 # Root HTML shell + fonts + metadata
│   ├── globals.css                # Tailwind import + design tokens (@theme)
│   ├── (app)/                     # Route group — shares the sidebar layout
│   │   ├── layout.tsx             #   Wraps children in <AppShell/>
│   │   ├── page.tsx               #   /           (home)
│   │   ├── closet/page.tsx        #   /closet
│   │   └── components/page.tsx    #   /components (showcase)
│   └── onboarding/
│       └── body-profile/page.tsx  # /onboarding/body-profile (no sidebar)
│
├── components/
│   ├── index.ts                   # Barrel — import { Button } from "@/components"
│   ├── ui/                        # Presentational primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Chip.tsx
│   │   ├── ItemCard.tsx
│   │   ├── SearchInput.tsx
│   │   ├── ProgressBar.tsx
│   │   └── cn.ts                  # Tiny className joiner
│   ├── layout/
│   │   ├── AppShell.tsx           # Sidebar + main two-column shell
│   │   ├── Sidebar.tsx            # Persistent nav with active-state
│   │   └── PageHeader.tsx         # Title/subtitle + right-side actions
│   └── onboarding/
│       └── OnboardingShell.tsx    # Two-pane onboarding layout + progress
│
├── public/                        # Static assets
├── next.config.ts
├── tsconfig.json                  # "@/*" path alias → frontend root
└── package.json
```

## Routing conventions (App Router)

- **`folder/`** adds a URL segment (`app/closet/page.tsx` → `/closet`).
- **`(folder)/`** is a **route group** — it shares a layout but does *not* add a URL segment. `app/(app)/closet/page.tsx` still renders at `/closet`.
- **`layout.tsx`** wraps every `page.tsx` in its folder and below. The logged-in pages live inside `(app)/` so they all inherit the `AppShell` sidebar. The onboarding flow lives *outside* `(app)/` so it gets a blank canvas.

To add a new logged-in page, drop a `page.tsx` into `app/(app)/<route>/` — it will automatically inherit the sidebar.

## Styling

- **Tailwind v4** via `@tailwindcss/postcss`. No `tailwind.config.js` — tokens are declared in [app/globals.css](app/globals.css) inside `@theme inline { … }`, which exposes them as utility classes like `bg-brand`, `text-muted-foreground`, `border-border`.
- Design tokens defined: `background`, `surface`, `foreground`, `muted`, `muted-foreground`, `border`, `brand`, `brand-hover`, `brand-foreground`, `accent`, `accent-soft`.
- To add a new token, edit `@theme inline` in `globals.css` — no rebuild config needed.

## Component library

All reusable primitives are exported from `@/components`:

```tsx
import {
  Button,
  Card,
  CardBody,
  Badge,
  Chip,
  ItemCard,
  SearchInput,
  ProgressBar,
  AppShell,
  Sidebar,
  PageHeader,
  OnboardingShell,
} from "@/components";
```

See **`/components`** in the running app for a live showcase of every variant.

### Client vs server components

By default, pages and components are React Server Components. Add `"use client"` at the top of a file only when it needs state, effects, or browser APIs. In this project:

- `Sidebar`, `Chip`, and pages with `useState` (closet, onboarding, component showcase) are client components.
- Everything else (`Button`, `Card`, `Badge`, `ItemCard`, `PageHeader`, `AppShell`, home page) is a server component.

## Conventions

- **Imports**: use the `@/` alias (`@/components`, `@/app/...`), not relative `../../`.
- **Class merging**: use the `cn(...)` helper from `@/components/ui/cn` rather than string concatenation.
- **Icons**: currently placeholder emojis to stay dependency-free. Swap in `lucide-react` or SVGs when ready — change them in one place per component.
- **Data**: pages currently use hard-coded arrays. Replace with `fetch(...)` / server actions once backend endpoints exist.

## Backend integration

The backend lives in `../backend/` (Express + Jest). Wire it up by:

1. Adding a `NEXT_PUBLIC_API_URL` env var.
2. Fetching from server components (`async function Page()`) or route handlers under `app/api/`.
3. Replacing the hard-coded arrays in [app/(app)/page.tsx](app/(app)/page.tsx) and [app/(app)/closet/page.tsx](app/(app)/closet/page.tsx).

## Notes for contributors

This project is on **Next.js 16**, which has breaking changes from older tutorials. Before writing routing or data-fetching code, skim the docs in `node_modules/next/dist/docs/` after `npm install` — some patterns (e.g. `params`, `searchParams`, caching) differ from Next 13/14.
