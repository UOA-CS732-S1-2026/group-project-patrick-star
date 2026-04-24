"use client";

import { useState } from "react";
import { useRef } from "react";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { Button } from "@/components/ui/Button";

export default function BodyProfilePage() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File | undefined) => {
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    processFile(event.target.files?.[0]);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  return (
    <OnboardingShell
      step={3}
      totalSteps={3}
      stepLabel="BODY PROFILE"
      left={
        <div className="relative flex aspect-[3/4] w-80 items-center justify-center overflow-hidden">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="h-full w-full object-contain"
            />
          ) : (
            <span aria-hidden>🧍</span>
          )}
          <div className="absolute bottom-6 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            Your model
          </div>
        </div>
      }
    >
      <button className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-1.5 text-sm font-medium shadow-sm hover:bg-neutral-50">
        ← Back
      </button>
      <h1 className="text-3xl font-bold text-neutral-900">
        Upload an image of yourself
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        Upload a full-body photo of yourself, or skip to start browsing. You can
        select a model or upload your photo later in your profile.
      </p>

      <div className="mx-auto w-full max-w-md">
        <div
          onClick={handleUploadClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="my-8 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-transparent py-16 transition-colors hover:bg-neutral-50"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden" // Keep it hidden from the UI
            accept="image/*" // Optional: restrict to images
          />
          <img
            src="/upload.svg"
            alt="Upload icon"
            className="mb-4 h-16 w-auto"
          />

          <p className="text-sm font-medium text-neutral-900">
            Drag and Drop file here or{" "}
            <span className="font-bold underline">Choose file</span>
          </p>
        </div>

        {/* Actions */}
        <Button
          size="lg"
          className="w-full rounded-xl bg-[#58CC02] py-6 text-sm font-bold uppercase tracking-wide text-white hover:bg-[#46A302]"
        >
          Upload my photo
        </Button>

        <div className="mt-4 text-center">
          <button className="text-sm font-bold text-[#58CC02] hover:text-[#46A302]">
            or select a default model
          </button>
        </div>
      </div>
    </OnboardingShell>
  );
}
