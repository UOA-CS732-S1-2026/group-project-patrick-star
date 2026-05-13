export const ONBOARDING_STEP_KEYS = [
  "body-profile",
  "about-yourself",
  "select-model",
] as const;

export type OnboardingStepKey = (typeof ONBOARDING_STEP_KEYS)[number];

export const STEP_TITLES: Record<OnboardingStepKey, string> = {
  "body-profile": "Body profile",
  "about-yourself": "Style",
  "select-model": "Select model",
};

export const BODY_SHAPES = ["Slim", "Athletic", "Regular", "Curvy"] as const;
export const GENDERS = ["Men", "Women", "Non-binary"] as const;
export const STYLE_OPTIONS = [
  "🤍 Minimal & Clean",
  "🧢 Street wear",
  "👔 Smart casual",
  "🪡 Formal & Tailored",
  "🌿 Bohemian",
] as const;

export const MODEL_OPTIONS = [
  {
    id: "model-1",
    label: "Female Model 1",
    imageSrc: "/models/Female-Model-1.jpg",
    savedImageSrc:
      "https://res.cloudinary.com/dihvixojc/image/upload/v1778662872/profiles/fj2ebufqcmkjoe7emlxp.jpg",
  },
  {
    id: "model-2",
    label: "Female Model 2",
    imageSrc: "/models/Female-Model-2.jpg",
    savedImageSrc:
      "https://res.cloudinary.com/dihvixojc/image/upload/v1778663039/profiles/pjo8nnkxfhv7gacbdai6.jpg",
  },
  {
    id: "model-3",
    label: "Male Model 1",
    imageSrc: "/models/Male-Model-1.jpg",
    savedImageSrc:
      "https://res.cloudinary.com/dihvixojc/image/upload/v1778663188/profiles/rk8a7wymn4sccsu8tt7u.jpg",
  },
  {
    id: "model-4",
    label: "Male Model 2",
    imageSrc: "/models/Male-Model-2.jpg",
    savedImageSrc:
      "https://res.cloudinary.com/dihvixojc/image/upload/v1778663215/profiles/niv8zga6fr63qpo4ezn0.jpg",
  },
] as const;

// Step order is the single source of truth for URL params, titles, and progress count.
export type BodyShape = (typeof BODY_SHAPES)[number];
export type Gender = (typeof GENDERS)[number];
export type StyleOption = (typeof STYLE_OPTIONS)[number];

export const ONBOARDING_STEP_ORDER: OnboardingStepKey[] = [
  "body-profile",
  "about-yourself",
  "select-model",
];

export function getStepIndex(step: string | string[] | undefined): number {
  // Unknown or missing URL step values fall back to the first onboarding step.
  const value = Array.isArray(step) ? step[0] : step;
  const resolved = ONBOARDING_STEP_ORDER.indexOf(value as OnboardingStepKey);

  return resolved >= 0 ? resolved : 0;
}

export function getStepKey(index: number): OnboardingStepKey {
  return ONBOARDING_STEP_ORDER[index] ?? ONBOARDING_STEP_ORDER[0];
}
