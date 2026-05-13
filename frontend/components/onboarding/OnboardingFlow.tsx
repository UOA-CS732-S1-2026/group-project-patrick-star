"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  FormProvider,
  useForm,
  useController,
  useWatch,
  type FieldPath,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OnboardingShell } from "./OnboardingShell";
import {
  getStepKey,
  ONBOARDING_STEP_ORDER,
  MODEL_OPTIONS,
  STEP_TITLES,
} from "./onboarding-data";
import {
  DEFAULT_ONBOARDING_VALUES,
  onboardingFormSchema,
  type OnboardingFormValues,
} from "./onboarding-schema";
import { BodyProfileStep } from "./steps/BodyProfileStep";
import { AboutYourselfStep } from "./steps/AboutYourselfStep";
import { SelectModelStep } from "./steps/SelectModelStep";
import { onboardingService } from "@/lib/services/onboardingService";

interface OnboardingFlowProps {
  initialStepIndex?: number;
  session?: {
    user?: {
      name?: string | null;
      email?: string | null;
    };
  };
}

const STEP_FIELDS = {
  "body-profile": [
    "firstName",
    "lastName",
    "age",
    "height",
    "weight",
    "bodyShape",
    "gender",
  ],
  "about-yourself": ["stylePreference"],
  "select-model": ["modelMode", "modelPhoto", "selectedModelId"],
} as const satisfies Record<
  keyof typeof STEP_TITLES,
  readonly FieldPath<OnboardingFormValues>[]
>;

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

function StepPreview({
  file,
  modelImageSrc,
}: {
  file: File | null;
  modelImageSrc: string | null;
}) {
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );
  const imageSrc = previewUrl ?? modelImageSrc;

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="relative flex aspect-[3/4] w-60 items-center justify-center overflow-hidden rounded-3xl bg-neutral-100 text-6xl md:w-80">
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={previewUrl ? "Uploaded preview" : "Selected model"}
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

type LoggedValidationError = {
  field: string;
  message: string;
  type?: string;
};

function collectLoggedValidationErrors(
  errors: Record<string, unknown>,
  prefix = "",
): LoggedValidationError[] {
  return Object.entries(errors).flatMap(([key, value]) => {
    const fieldPath = prefix ? `${prefix}.${key}` : key;

    if (
      value &&
      typeof value === "object" &&
      "message" in value &&
      typeof (value as { message?: unknown }).message === "string"
    ) {
      const error = value as { message?: string; type?: string };

      return [
        {
          field: fieldPath,
          message: error.message ?? "Validation error",
          type: error.type,
        },
      ];
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
      return collectLoggedValidationErrors(
        value as Record<string, unknown>,
        fieldPath,
      );
    }

    return [];
  });
}

export function OnboardingFlow({
  initialStepIndex = 0,
  session,
}: OnboardingFlowProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [stepIndex, setStepIndex] = useState(initialStepIndex);

  const methods = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: DEFAULT_ONBOARDING_VALUES,
    shouldUnregister: false,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  useController({
    name: "modelMode",
    control: methods.control,
  });
  useController({
    name: "selectedModelId",
    control: methods.control,
  });

  // if you wonder the difference between the useWatch and watch
  // useWatch : Isolates the re-render to the specific component where the hook is use
  const watchedFiles = useWatch({
    control: methods.control,
    name: "modelPhoto",
  });
  const watchedModelMode = useWatch({
    control: methods.control,
    name: "modelMode",
  });
  const watchedSelectedModelId = useWatch({
    control: methods.control,
    name: "selectedModelId",
  });

  const currentStep = getStepKey(stepIndex);
  const currentFile = watchedFiles?.[0] ?? null;
  const selectedModel =
    MODEL_OPTIONS.find((item) => item.id === watchedSelectedModelId) ?? null;
  const previewFile =
    watchedModelMode === "upload" && currentFile ? currentFile : null;
  const previewModelImageSrc = selectedModel?.imageSrc ?? null;

  useEffect(() => {
    router.replace(`${pathname}?step=${currentStep}`, { scroll: false });
  }, [currentStep, pathname, router]);

  const handleNext = async () => {
    const isValid = await methods.trigger(STEP_FIELDS[currentStep], {
      shouldFocus: true,
    });
    if (!isValid) return;

    setStepIndex((value) =>
      Math.min(value + 1, ONBOARDING_STEP_ORDER.length - 1),
    );
  };

  const handleBack = () => {
    setStepIndex((value) => Math.max(value - 1, 0));
  };

  const onSubmit = methods.handleSubmit(
    async (values) => {
      await onboardingService.save(values, session);
      router.push("/");
    },
    async (errors) => {
      console.error(errors);
    },
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="block">
        <OnboardingShell
          step={stepIndex + 1}
          totalSteps={ONBOARDING_STEP_ORDER.length}
          stepLabel={STEP_TITLES[currentStep]}
          left={
            // here we add some more photos later
            currentStep === "select-model" ? (
              <StepPreview
                file={previewFile}
                modelImageSrc={previewModelImageSrc}
              />
            ) : (
              <DefaultPreview />
            )
          }
        >
          {currentStep === "body-profile" ? (
            <BodyProfileStep onNext={handleNext} />
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
