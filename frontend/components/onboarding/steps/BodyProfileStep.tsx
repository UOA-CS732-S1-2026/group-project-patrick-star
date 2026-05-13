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
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<OnboardingFormValues>();

  const inputClassName =
    "h-11 rounded-xl border border-border bg-white px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30";
  const errorClassName = "mt-2 text-xs font-medium text-red-600";

  return (
    <>
      <h1 className="text-3xl font-bold">Tell us about yourself</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        This helps us visualise clothes on your body.
      </p>

      <div className="mt-8 w-full space-y-5">
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Name *
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="First name"
              aria-invalid={Boolean(errors.firstName)}
              className={inputClassName}
              {...register("firstName")}
            />
            <input
              type="text"
              placeholder="Last name"
              aria-invalid={Boolean(errors.lastName)}
              className={inputClassName}
              {...register("lastName")}
            />
          </div>
          {(errors.firstName || errors.lastName) && (
            <div className="grid grid-cols-2 gap-3">
              <p className={errorClassName}>{errors.firstName?.message}</p>
              <p className={errorClassName}>{errors.lastName?.message}</p>
            </div>
          )}
        </div>

        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Age *
          </div>
          <div className="grid grid-cols-1 gap-3">
            <input
              type="number"
              inputMode="numeric"
              placeholder="Age"
              aria-invalid={Boolean(errors.age)}
              className={inputClassName}
              {...register("age")}
            />
          </div>
          {errors.age?.message && (
            <p className={errorClassName}>{errors.age.message}</p>
          )}
        </div>

        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Measurements <span className="font-normal normal-case tracking-normal">(optional)</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              inputMode="numeric"
              placeholder="Height (cm)"
              aria-invalid={Boolean(errors.height)}
              className={inputClassName}
              {...register("height")}
            />
            <input
              type="number"
              inputMode="numeric"
              placeholder="Weight (kg)"
              aria-invalid={Boolean(errors.weight)}
              className={inputClassName}
              {...register("weight")}
            />
          </div>
          {(errors.height || errors.weight) && (
            <div className="grid grid-cols-2 gap-3">
              <p className={errorClassName}>{errors.height?.message}</p>
              <p className={errorClassName}>{errors.weight?.message}</p>
            </div>
          )}
        </div>

        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Body shape <span className="font-normal normal-case tracking-normal">(optional)</span>
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
            Gender *
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
          {errors.gender?.message && (
            <p className={errorClassName}>{errors.gender.message}</p>
          )}
        </div>

        <Button onClick={onNext} size="lg" className="w-full" type="button">
          Continue
        </Button>
      </div>
    </>
  );
}
