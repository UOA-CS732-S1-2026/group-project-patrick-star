"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { OnboardingShell } from "./OnboardingShell";
import {
  getStepKey,
  ONBOARDING_STEP_ORDER,
  STEP_TITLES,
  type OnboardingFormValues,
} from "./onboarding-data";
import { BodyProfileStep } from "./steps/BodyProfileStep";
import { AboutYourselfStep } from "./steps/AboutYourselfStep";
import { SelectModelStep } from "./steps/SelectModelStep";

interface OnboardingFlowProps {
  initialStepIndex?: number;
}

const DEFAULT_VALUES: OnboardingFormValues = {
  name: "",
  age: "",
  height: "",
  weight: "",
  bodyShape: "Athletic",
  gender: "Men",
  stylePreference: "Street wear",
  modelMode: "upload",
  modelPhoto: null,
  selectedModelId: "",
};

function DefaultPreview() {
  return (
    <div className="relative flex aspect-[3/4] w-60 items-center justify-center rounded-3xl bg-neutral-100 text-6xl">
      <span aria-hidden> </span>
      <div className="absolute bottom-6 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Your model
      </div>
    </div>
  );
}

function StepPreview({ file }: { file: File | null }) {
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="relative flex aspect-[3/4] w-60 items-center justify-center overflow-hidden rounded-3xl bg-neutral-100 text-6xl md:w-80">
      {previewUrl ? (
        <Image
          src={previewUrl}
          alt="Preview"
          fill
          unoptimized
          className="object-contain"
        />
      ) : (
        <span aria-hidden> </span>
      )}
      <div className="absolute bottom-6 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Your model
      </div>
    </div>
  );
}

export function OnboardingFlow({ initialStepIndex = 0 }: OnboardingFlowProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [stepIndex, setStepIndex] = useState(initialStepIndex);

  const methods = useForm<OnboardingFormValues>({
    defaultValues: DEFAULT_VALUES,
    shouldUnregister: false,
    mode: "onSubmit",
  });

  const watchedFiles = useWatch({
    control: methods.control,
    name: "modelPhoto",
  });

  const currentStep = getStepKey(stepIndex);
  const currentFile = watchedFiles?.[0] ?? null;

  useEffect(() => {
    router.replace(`${pathname}?step=${currentStep}`, { scroll: false });
  }, [currentStep, pathname, router]);

  const handleNext = () => {
    setStepIndex((value) =>
      Math.min(value + 1, ONBOARDING_STEP_ORDER.length - 1)
    );
  };

  const handleBack = () => {
    setStepIndex((value) => Math.max(value - 1, 0));
  };

  const onSubmit = methods.handleSubmit(async (values) => {
    const payload = {
      ...values,
      modelPhoto: values.modelPhoto?.[0]
        ? {
            name: values.modelPhoto[0].name,
            type: values.modelPhoto[0].type,
            size: values.modelPhoto[0].size,
          }
        : null,
    };

    const formData = new FormData();
    formData.append("payload", JSON.stringify(payload));

    const file = values.modelPhoto?.[0];
    if (file) {
      formData.append("modelPhoto", file);
    }

    const response = await fetch("/api/onboarding", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to submit onboarding payload");
    }

    router.push("/");
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="block">
        <OnboardingShell
          step={stepIndex + 1}
          totalSteps={ONBOARDING_STEP_ORDER.length}
          stepLabel={STEP_TITLES[currentStep]}
          left={currentStep === "select-model" ? <StepPreview file={currentFile} /> : <DefaultPreview />}
        >
          {currentStep === "body-profile" ? (
            <BodyProfileStep onBack={handleBack} onNext={handleNext} />
          ) : null}
          {currentStep === "about-yourself" ? (
            <AboutYourselfStep onBack={handleBack} onNext={handleNext} />
          ) : null}
          {currentStep === "select-model" ? (
            <SelectModelStep onBack={handleBack} />
          ) : null}
        </OnboardingShell>
      </form>
    </FormProvider>
  );
}
