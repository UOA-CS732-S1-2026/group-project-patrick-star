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

| URL                | Page                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| `/`                | Home dashboard with random outfit generator, AI preview toggle, stats, actions |
| `/closet`          | My Closet, searchable item grid, item details, add/edit item flows             |
| `/closet?addItem=1` | Opens My Closet with the add clothing item modal already open                 |
| `/outfits`         | Saved outfit library with favourite outfit support                             |
| `/outfits/builder` | Create or edit outfits from closet items                                       |
| `/profile`         | Profile details, body profile, style preferences, and photo upload             |
| `/components`      | Component showcase                                                             |
| `/onboarding`      | Onboarding flow after Auth0 sign-in                                            |
| `/login`           | Auth0 sign-in entry point                                                      |
| `/signup`          | Auth0 sign-up entry point                                                      |

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
│   ├── api/
│   │   └── auth.ts
│   ├── auth0.ts
│   ├── profile/
│   │   └── avatar.ts
│   ├── services/
│   │   └── onboardingService.ts
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

- Pages that fetch authenticated browser-side data are client components, including home, closet, outfits, outfit builder, profile, onboarding, and the component showcase.
- `Sidebar` is a client component because it reads user profile data, shows the style-based avatar emoji, and handles sign out.
- Reusable primitives such as `Button`, `Card`, `Badge`, `ItemCard`, `PageHeader`, and `AppShell` stay server-compatible unless they need browser APIs.

## Conventions

- `@/` imports: use the alias (`@/components`, `@/app/...`), not relative `../../`.
- Class merging: use the `cn(...)` helper from `@/components/ui/cn` rather than string concatenation.
- Icons: currently placeholder emojis to stay dependency-free. Swap in `lucide-react` or SVGs when ready, and change them in one place per component.
- Authenticated API calls use `getAuthHeaders()` from `@/lib/api/auth`.
- API URLs come from `NEXT_PUBLIC_API_URL`; client pages normalize the base URL before joining route paths.
- Closet category input is fixed to Top, Bottom, Shoes, and Outerwear, then mapped to backend category values before submit.
- Outfit builder surfaces backend validation errors, including attempts to save multiple selected items from the same category.

## Backend integration

The backend lives in `../backend/` (Express + Jest). Wire it up by:

1. Adding `NEXT_PUBLIC_API_URL=http://localhost:5001` to the frontend environment.
2. Signing in with Auth0 so the app can request a backend access token through `app/api/auth/token/route.ts`.
3. Sending `Authorization: Bearer <access_token>` via `getAuthHeaders()` for authenticated backend calls.

Current backend-backed flows:

- Home fetches `/api/clothingItems/me` and `/api/outfits/me` to power quick stats, favourite outfits, and random outfit generation.
- My Closet fetches and mutates `/api/clothingItems/me`; `?addItem=1` opens the add item modal from quick actions.
- Outfit builder creates and updates `/api/outfits/me`, and can be prefilled from the home generator using query parameters.
- Profile fetches `/api/users/me`, updates profile/body/style fields with PATCH routes, and uploads images through `/api/users/me/photo/upload`.
- Auth0 login routes users through onboarding; sign out clears browser tokens and returns to the sign-in page.

## Notes for contributors

This project is on Next.js 16, which has breaking changes from older tutorials. Before writing routing or data-fetching code, skim the docs in `node_modules/next/dist/docs/` after `npm install`; some patterns differ from Next 13/14.
