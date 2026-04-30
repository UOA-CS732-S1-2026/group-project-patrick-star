"use client";

import type { ChangeEvent, DragEvent } from "react";
import Image from "next/image";
import { Controller, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { MODEL_OPTIONS, type OnboardingFormValues } from "../onboarding-data";

interface SelectModelStepProps {
  onBack: () => void;
}

export function SelectModelStep({ onBack }: SelectModelStepProps) {
  const { register, watch, setValue, control } =
    useFormContext<OnboardingFormValues>();
  const selectedFiles = watch("modelPhoto");
  const modelMode = watch("modelMode");
  const fileRegistration = register("modelPhoto");

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
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-1.5 text-sm font-medium shadow-sm hover:bg-neutral-50"
      >
        Back
      </button>

      {modelMode === "upload" ? (
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
              onClick={() => document.getElementById("onboarding-photo")?.click()}
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
                className="mb-4 h-16 w-auto"
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
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-xl bg-[#58CC02] py-6 text-sm font-bold uppercase tracking-wide text-white hover:bg-[#46A302]"
            >
              Upload my photo
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
                      onClick={() => field.onChange(item.id)}
                      className={[
                        "flex aspect-[3/4] items-center justify-center rounded-xl border-2 border-dashed bg-transparent p-4 text-center transition-colors hover:bg-neutral-50",
                        field.value === item.id
                          ? "border-brand bg-brand/5"
                          : "border-neutral-200",
                      ].join(" ")}
                    >
                      <span className="text-sm font-bold text-neutral-900">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-xl bg-[#58CC02] py-6 text-sm font-bold uppercase tracking-wide text-white hover:bg-[#46A302]"
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
