import type { Metadata } from "next";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { getStepIndex } from "@/components/onboarding/onboarding-data";

export const metadata: Metadata = {
  title: "Onboarding | AI Wardrobe",
};

interface OnboardingPageProps {
  searchParams?: Promise<{ step?: string | string[] }>;
}

export default async function OnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const initialStepIndex = getStepIndex(params?.step);

  return <OnboardingFlow initialStepIndex={initialStepIndex} />;
}
