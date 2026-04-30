"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { STYLE_OPTIONS, type OnboardingFormValues } from "../onboarding-data";

interface AboutYourselfStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function AboutYourselfStep({ onNext, onBack }: AboutYourselfStepProps) {
  const { control } = useFormContext<OnboardingFormValues>();

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-1.5 text-sm font-medium shadow-sm hover:bg-neutral-50"
      >
        Back
      </button>

      <h1 className="text-3xl font-bold">What&apos;s your style?</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Pick everything that feels like you.
      </p>

      <div className="mt-8 w-full max-w-md space-y-6">
        <Controller
          control={control}
          name="stylePreference"
          render={({ field }) => (
            <div className="flex flex-col gap-3">
              {STYLE_OPTIONS.map((style) => (
                <Chip
                  key={style}
                  type="button"
                  selected={field.value === style}
                  onClick={() => field.onChange(style)}
                  className="w-full justify-start px-5 py-6 text-left text-lg"
                >
                  {style}
                </Chip>
              ))}
            </div>
          )}
        />

        <Button onClick={onNext} size="lg" className="w-full" type="button">
          Continue
        </Button>
      </div>
    </>
  );
}
