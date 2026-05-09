"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { BODY_SHAPES, GENDERS } from "../onboarding-data";
import { type OnboardingFormValues } from "../onboarding-schema";

interface BodyProfileStepProps {
  onNext: () => void;
}

export function BodyProfileStep({ onNext }: BodyProfileStepProps) {
  const { register, control } = useFormContext<OnboardingFormValues>();

  return (
    <>
      <div className="mb-6 h-11" aria-hidden />

      <h1 className="text-3xl font-bold">Tell us about yourself</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        This helps us visualise clothes on your body.
      </p>

      <div className="mt-8 w-full max-w-md space-y-5">
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Name
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="First name"
              className="h-11 rounded-xl border border-border bg-white px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
              {...register("firstName")}
            />
            <input
              type="text"
              placeholder="Last name"
              className="h-11 rounded-xl border border-border bg-white px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
              {...register("lastName")}
            />
          </div>
        </div>

        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Age
          </div>
          <div className="grid grid-cols-1 gap-3">
            <input
              type="number"
              inputMode="numeric"
              placeholder="Age"
              className="h-11 rounded-xl border border-border bg-white px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
              {...register("age")}
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
              className="h-11 rounded-xl border border-border bg-white px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
              {...register("height")}
            />
            <input
              type="number"
              inputMode="numeric"
              placeholder="Weight (kg)"
              className="h-11 rounded-xl border border-border bg-white px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
              {...register("weight")}
            />
          </div>
        </div>

        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Body shape
          </div>
          <Controller
            control={control}
            name="bodyShape"
            render={({ field }) => (
              <div className="flex flex-wrap gap-3">
                {BODY_SHAPES.map((shape) => (
                  <Chip
                    key={shape}
                    type="button"
                    selected={field.value === shape}
                    onClick={() => field.onChange(shape)}
                  >
                    {shape}
                  </Chip>
                ))}
              </div>
            )}
          />
        </div>

        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Gender
          </div>
          <Controller
            control={control}
            name="gender"
            render={({ field }) => (
              <div className="flex flex-wrap gap-3">
                {GENDERS.map((gender) => (
                  <Chip
                    key={gender}
                    type="button"
                    selected={field.value === gender}
                    onClick={() => field.onChange(gender)}
                  >
                    {gender}
                  </Chip>
                ))}
              </div>
            )}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          All details are optional.
        </p>

        <Button onClick={onNext} size="lg" className="w-full" type="button">
          Continue
        </Button>
      </div>
    </>
  );
}
