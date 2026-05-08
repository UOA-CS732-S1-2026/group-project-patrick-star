import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
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
  const session = await auth0.getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <OnboardingFlow
      initialStepIndex={initialStepIndex}
      session={session}
    />
  );
}
