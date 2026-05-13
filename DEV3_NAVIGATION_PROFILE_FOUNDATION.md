# Developer 3: Navigation & Profile Foundation

## Summary

This branch focuses on the sidebar/profile foundation and the onboarding model selection flow.

## What was changed

### 1. Left-bottom profile button is clickable

- The profile block in the left sidebar now links directly to `/profile`.
- It includes hover and focus states so it reads like a real navigation target.
- The sidebar avatar was kept as the simple `👤` icon for consistency.

### 2. Sign-out button style updated

- The sign-out action was restyled to match the site's rounded button language.
- It now uses a black background with white text, which fits better with the app's overall look.
- The hover state stays subtle so it feels like part of the same design system.

### 3. Default model images updated

- Onboarding model previews now use the local `/models/...` images for faster rendering in the carousel.
- The saved onboarding payload now stores the matching Cloudinary URL in `modelImage`.
- This keeps onboarding fast while ensuring the stored user data points to the Cloudinary asset.

## Notes on model submit flow

- `imageSrc` is used only for preview rendering in onboarding.
- `savedImageSrc` is the value written into the user profile when the user selects a model.
- The onboarding form now registers the model fields cleanly through the parent form, without hidden inputs in the step component.

## Verification

- TypeScript check passes with:
  - `npx tsc --noEmit -p tsconfig.json`

## Files touched

- `frontend/components/layout/Sidebar.tsx`
- `frontend/components/onboarding/onboarding-data.ts`
- `frontend/components/onboarding/OnboardingFlow.tsx`
- `frontend/components/onboarding/steps/SelectModelStep.tsx`
- `frontend/lib/services/onboardingService.ts`
- `frontend/next.config.ts`
- `frontend/stories/onboarding/ModelScroller.stories.tsx`

