"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";

const STYLES = [
  "🤍 Minimal & Clean",
  "🧢 Street wear",
  "👔 Smart casual",
  "🪡 Former & Tailored",
  "🌿 Bohemian",
] as const;

export default function BodyProfilePage() {
  const router = useRouter();
  const [shape, setShape] = useState<(typeof STYLES)[number]>("🧢 Street wear");

  const handleBack = () => {
    router.push("/onboarding/body-profile");
  };
  const handleNext = () => {
    router.push("/onboarding/select-model");
  };

  return (
    <OnboardingShell
      step={2}
      totalSteps={3}
      stepLabel="Style"
      left={
        <div className="flex aspect-[3/4] w-60 items-center justify-center rounded-3xl bg-neutral-100 text-6xl">
          <span aria-hidden>🧍</span>
          <div className="absolute bottom-6 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Your model
          </div>
        </div>
      }
    >
      <button
        onClick={handleBack}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-1.5 text-sm font-medium shadow-sm hover:bg-neutral-50"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold">What's your style?</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Pick everything that feels like you.
      </p>

      <div className="mt-8 w-full max-w-md space-y-6">
        <div>
          <div className="flex flex-col flex-wrap gap-3 ">
            {STYLES.map((s) => (
              <Chip
                key={s}
                selected={s === shape}
                onClick={() => setShape(s)}
                className="justify-start text-left w-full py-6 px-5 text-lg"
              >
                {s}
              </Chip>
            ))}
          </div>
        </div>

        <Button onClick={handleNext} size="lg" className="w-full">
          Continue
        </Button>
      </div>
    </OnboardingShell>
  );
}
