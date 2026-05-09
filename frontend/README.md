# AI Wardrobe Frontend

Next.js (App Router) + Tailwind CSS v4 + TypeScript. Desktop-first UI for an AI-powered wardrobe/outfit app.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Scripts

| Command         | What it does                      |
| --------------- | --------------------------------- |
| `npm run dev`   | Start the dev server on port 3000 |
| `npm run build` | Production build                  |
| `npm run start` | Serve the production build        |
| `npm run lint`  | Run ESLint                        |

## Routes

| URL                    | Page                                          |
| ---------------------- | --------------------------------------------- |
| `/`                    | Home, today's look, insights, recently worn   |
| `/closet`              | My Closet, searchable item grid               |
| `/components`          | Component showcase                            |
| `/onboarding`          | Onboarding flow                             |

Stubs for `/outfits`, `/calendar`, and `/profile` are not yet built, so sidebar links pointing at them will 404 until you add the matching pages under `app/(app)/`.

## Project structure

```
frontend/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── providers.tsx
│   ├── onboarding/
│   │   └── page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── closet/page.tsx
│   │   ├── components/page.tsx
│   │   ├── outfits/page.tsx
│   │   ├── outfits/builder/page.tsx
│   │   └── profile/page.tsx
│   └── api/
│       └── auth/
│           └── token/route.ts
│
├── components/
│   ├── index.ts
│   ├── auth/
│   │   └── AuthSplitLayout.tsx
│   ├── closet/
│   │   ├── EditItemPanel.tsx
│   │   ├── ItemDetailPanel.tsx
│   │   └── UploadItemModal.tsx
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── PageHeader.tsx
│   │   └── Sidebar.tsx
│   ├── onboarding/
│   │   ├── OnboardingFlow.tsx
│   │   ├── OnboardingShell.tsx
│   │   ├── ModelScroller.tsx
│   │   ├── onboarding-data.ts
│   │   ├── onboarding-schema.ts
│   │   └── steps/
│   │       ├── AboutYourselfStep.tsx
│   │       ├── BodyProfileStep.tsx
│   │       └── SelectModelStep.tsx
│   ├── outfits/
│   │   ├── OutfitCard.tsx
│   │   └── OutfitDetailPanel.tsx
│   └── ui/
│       ├── AuthField.tsx
│       ├── BackButton.tsx
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Chip.tsx
│       ├── ItemCard.tsx
│       ├── Modal.tsx
│       ├── ProgressBar.tsx
│       ├── SearchInput.tsx
│       └── cn.ts
│
├── lib/
│   ├── auth0.ts
│   └── auth/
│       ├── callback.ts
│       ├── logging.ts
│       └── messages.ts
│
├── public/
├── next.config.ts
├── tsconfig.json
└── package.json
```

## Routing conventions (App Router)

- `folder/` adds a URL segment (`app/closet/page.tsx` -> `/closet`).
- `(folder)/` is a route group. It shares a layout but does not add a URL segment. `app/(app)/closet/page.tsx` still renders at `/closet`.
- `layout.tsx` wraps every `page.tsx` in its folder and below. The logged-in pages live inside `(app)/` so they inherit the `AppShell` sidebar. The onboarding flow lives outside `(app)/` so it gets a blank canvas.

To add a new logged-in page, drop a `page.tsx` into `app/(app)/<route>/` and it will automatically inherit the sidebar.

## Styling

- Tailwind v4 via `@tailwindcss/postcss`. No `tailwind.config.js` file. Tokens are declared in [app/globals.css](app/globals.css) inside `@theme inline`, which exposes them as utility classes like `bg-brand`, `text-muted-foreground`, and `border-border`.
- Design tokens defined: `background`, `surface`, `foreground`, `muted`, `muted-foreground`, `border`, `brand`, `brand-hover`, `brand-foreground`, `accent`, `accent-soft`.
- To add a new token, edit `@theme inline` in `globals.css`; no rebuild config is needed.

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

See `/components` in the running app for a live showcase of every variant.

### Client vs server components

By default, pages and components are React Server Components. Add `"use client"` at the top of a file only when it needs state, effects, or browser APIs. In this project:

- `Sidebar`, `Chip`, and pages with `useState` (closet, onboarding, component showcase) are client components.
- Everything else (`Button`, `Card`, `Badge`, `ItemCard`, `PageHeader`, `AppShell`, home page) is a server component.

## Conventions

- `@/` imports: use the alias (`@/components`, `@/app/...`), not relative `../../`.
- Class merging: use the `cn(...)` helper from `@/components/ui/cn` rather than string concatenation.
- Icons: currently placeholder emojis to stay dependency-free. Swap in `lucide-react` or SVGs when ready, and change them in one place per component.
- Data: pages currently use hard-coded arrays. Replace with `fetch(...)` or server actions once backend endpoints exist.

## Backend integration

The backend lives in `../backend/` (Express + Jest). Wire it up by:

1. Adding a `NEXT_PUBLIC_API_URL` env var.
2. Fetching from server components (`async function Page()`) or route handlers under `app/api/`.
3. Replacing the hard-coded arrays in [app/(app)/page.tsx](app/(app)/page.tsx) and [app/(app)/closet/page.tsx](app/(app)/closet/page.tsx).

## Notes for contributors

This project is on Next.js 16, which has breaking changes from older tutorials. Before writing routing or data-fetching code, skim the docs in `node_modules/next/dist/docs/` after `npm install`; some patterns differ from Next 13/14.
