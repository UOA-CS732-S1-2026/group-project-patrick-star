"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";

const BODY_SHAPES = ["Slim", "Athletic", "Regular", "Curvy"] as const;
const GENDERS = ["Men", "Women", "Non-binary"] as const;

export default function BodyProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [shape, setShape] = useState<(typeof BODY_SHAPES)[number]>("Athletic");
  const [gender, setGender] = useState<(typeof GENDERS)[number]>("Men");

  const handleBack = () => {
    router.push("/onboarding/body-profile");
  };
  const handleNext = () => {
    router.push("/onboarding/about-yourself");
  };

  return (
    <OnboardingShell
      step={1}
      totalSteps={3}
      stepLabel="Body profile"
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

      <h1 className="text-3xl font-bold">Tell us about yourself</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        This helps us visualise clothes on your body.
      </p>

      <div className="mt-8 w-full max-w-md space-y-5">
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Name & Age
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              inputMode="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 rounded-xl border border-border bg-white px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <input
              type="number"
              inputMode="numeric"
              placeholder="Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="h-11 rounded-xl border border-border bg-white px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
        </div>

        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Measurements
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              inputMode="numeric"
              placeholder="Height (cm)"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="h-11 rounded-xl border border-border bg-white px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <input
              type="number"
              inputMode="numeric"
              placeholder="Weight (kg)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="h-11 rounded-xl border border-border bg-white px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
        </div>

        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Body shape
          </div>
          <div className="flex flex-wrap gap-3">
            {BODY_SHAPES.map((s) => (
              <Chip key={s} selected={s === shape} onClick={() => setShape(s)}>
                {s}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Gender
          </div>
          <div className="flex flex-wrap gap-3">
            {GENDERS.map((g) => (
              <Chip
                key={g}
                selected={g === gender}
                onClick={() => setGender(g)}
              >
                {g}
              </Chip>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">All fields are optional</p>

        <Button onClick={handleNext} size="lg" className="w-full">
          Continue
        </Button>
      </div>
    </OnboardingShell>
  );
}
