"use client";

import { Controller, useFormContext } from "react-hook-form";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { STYLE_OPTIONS } from "../onboarding-data";
import { type OnboardingFormValues } from "../onboarding-schema";

interface AboutYourselfStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function AboutYourselfStep({ onNext, onBack }: AboutYourselfStepProps) {
  const { control } = useFormContext<OnboardingFormValues>();

  return (
    <>
      <BackButton onClick={onBack} className="mb-6">
        ← Back
      </BackButton>

      <h1 className="text-3xl font-bold">What&apos;s your style?</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Pick everything that feels like you.
      </p>

      <div className="mt-8 w-full max-w-md space-y-6">
        <Controller
          control={control}
          name="stylePreference"
          render={({ field }) => (
            <>
              <div className="flex flex-col gap-3">
                {STYLE_OPTIONS.map((style) => (
                  <Chip
                    key={style}
                    type="button"
                    selected={field.value.includes(style)}
                    onClick={() => {
                      const next = field.value.includes(style)
                        ? field.value.filter((item) => item !== style)
                        : [...field.value, style];

                      field.onChange(next);
                    }}
                    className="w-full justify-start px-5 py-6 text-left text-lg"
                  >
                    {style}
                  </Chip>
                ))}
              </div>
              <Button
                onClick={onNext}
                size="lg"
                className="w-full"
                type="button"
                disabled={field.value.length === 0}
              >
                Continue
              </Button>
            </>
          )}
        />
      </div>
    </>
  );
}
