"use client";

import type { ChangeEvent, DragEvent } from "react";
import Image from "next/image";
import { Controller, useFormContext } from "react-hook-form";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { MODEL_OPTIONS } from "../onboarding-data";
import { type OnboardingFormValues } from "../onboarding-schema";

interface SelectModelStepProps {
  onBack: () => void;
}

export function SelectModelStep({ onBack }: SelectModelStepProps) {
  const {
    register,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<OnboardingFormValues>();
  const selectedFiles = watch("modelPhoto");
  const modelMode = watch("modelMode");
  const selectedModelId = watch("selectedModelId");
  const fileRegistration = register("modelPhoto");
  const hasPhoto = Boolean(selectedFiles?.[0]);
  const hasModelSelection = Boolean(selectedModelId);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const files = event.dataTransfer.files;
    if (!files?.length) {
      return;
    }

    setValue("modelMode", "upload", { shouldDirty: true });
    setValue("modelPhoto", files, { shouldDirty: true });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    fileRegistration.onChange(event);
    setValue("modelMode", "upload", { shouldDirty: true });
  };

  return (
    <>
      <BackButton onClick={onBack} className="mb-6">
        ← Back
      </BackButton>

      {modelMode !== "select" ? (
        <>
          <h1 className="text-3xl font-bold text-neutral-900">
            Upload an image of yourself
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Upload a full-body photo of yourself, or skip to start browsing. You
            can select a model or upload your photo later in your profile.
          </p>

          <div className="mx-auto w-full max-w-md">
            <div
              onClick={() =>
                document.getElementById("onboarding-photo")?.click()
              }
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              className="my-8 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-transparent py-16 transition-colors hover:bg-neutral-50"
            >
              <input
                {...fileRegistration}
                id="onboarding-photo"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <Image
                src="/upload.svg"
                alt="Upload icon"
                width={64}
                height={64}
                className="mb-4 h-auto w-auto"
              />

              <p className="text-sm font-medium text-neutral-900">
                Drag and Drop file here or{" "}
                <span className="font-bold underline">Choose file</span>
              </p>
              {selectedFiles?.[0] ? (
                <p className="mt-3 text-xs text-neutral-500">
                  Selected: {selectedFiles[0].name}
                </p>
              ) : null}
              {errors.modelPhoto ? (
                <p className="mt-3 text-xs text-red-600">
                  {errors.modelPhoto.message}
                </p>
              ) : null}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-xl bg-[#58CC02] py-6 text-sm font-bold uppercase tracking-wide text-white hover:bg-[#46A302]"
              disabled={!hasPhoto}
            >
              Upload Photo
            </Button>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() =>
                  setValue("modelMode", "select", { shouldDirty: true })
                }
                className="text-sm font-bold text-[#58CC02] hover:text-[#46A302]"
              >
                or select a default model
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <h1 className="mb-8 text-3xl font-bold text-neutral-900">
            Select a model
          </h1>

          <div className="mx-auto w-full max-w-md">
            <Controller
              control={control}
              name="selectedModelId"
              render={({ field }) => (
                <div className="mb-8 grid grid-cols-2 gap-4">
                  {MODEL_OPTIONS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        field.onChange(item.id);
                        setValue("modelMode", "select", { shouldDirty: true });
                      }}
                      className={[
                        "group relative flex aspect-[3/4] overflow-hidden rounded-xl border-2 border-dashed bg-transparent p-0 text-center transition-colors hover:bg-neutral-50",
                        field.value === item.id
                          ? "border-brand bg-brand/5"
                          : "border-neutral-200",
                      ].join(" ")}
                    >
                      <Image
                        src={item.imageSrc}
                        alt={item.label}
                        fill
                        className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[11px] font-bold uppercase tracking-widest text-neutral-900 shadow-sm">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.selectedModelId ? (
              <p className="mb-3 text-xs text-red-600">
                {errors.selectedModelId.message}
              </p>
            ) : null}

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-xl bg-[#58CC02] py-6 text-sm font-bold uppercase tracking-wide text-white hover:bg-[#46A302]"
              disabled={modelMode === "select" ? !hasModelSelection : !hasPhoto}
            >
              Select Model
            </Button>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() =>
                  setValue("modelMode", "upload", { shouldDirty: true })
                }
                className="text-sm font-bold text-[#58CC02] hover:text-[#46A302]"
              >
                or upload your model
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
