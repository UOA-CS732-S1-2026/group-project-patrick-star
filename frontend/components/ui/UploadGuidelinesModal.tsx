"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface UploadGuidelinesModalProps {
  type: "profile" | "garment";
  onClose: () => void;
}

const GUIDELINES = {
  profile: {
    imageSrc: "/guidelines/profile-guidelines.png",
    imageAlt: "Profile photo guidelines",
    rules: [
      "Stand facing forward, full body visible",
      "Plain or neutral background",
      "Good, even lighting",
      "One person only",
      "No nudity or sexually suggestive content",
      "No offensive text or graphics on clothing",
    ],
  },
  garment: {
    imageSrc: "/guidelines/clothing-guidelines.png",
    imageAlt: "Clothing photo guidelines",
    rules: [
      "Lay flat or hang item on plain background",
      "Full item visible, no cropping",
      "Good lighting, no harsh shadows",
      "No copyrighted or trademarked logos",
      "No offensive, sexually suggestive, or inappropriate graphics",
      "Do not photograph someone wearing the item",
    ],
  },
} as const;

export function UploadGuidelinesModal({
  type,
  onClose,
}: UploadGuidelinesModalProps) {
  const guidelines = GUIDELINES[type];

  return (
    <Modal open onClose={onClose} className="mx-4 max-w-lg">
      <div className="flex items-center justify-between border-b border-border px-6 py-5">
        <h2 className="text-xl font-bold text-foreground">Photo Guidelines</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close photo guidelines"
          className="flex h-9 w-9 items-center justify-center rounded-full text-2xl leading-none text-muted-foreground transition-colors hover:bg-neutral-100 hover:text-foreground"
        >
          <span aria-hidden>×</span>
        </button>
      </div>

      <div className="space-y-6 p-6">
        <div className="overflow-hidden rounded-2xl border border-border bg-neutral-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={guidelines.imageSrc}
            alt={guidelines.imageAlt}
            className="h-auto max-h-80 w-full object-contain"
          />
        </div>

        <ul className="space-y-3 pl-5 text-sm font-medium leading-6 text-foreground">
          {guidelines.rules.map((rule) => (
            <li key={rule} className="list-disc pl-1">
              {rule}
            </li>
          ))}
        </ul>

        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={onClose}
          className="w-full rounded-xl"
        >
          Got it
        </Button>
      </div>
    </Modal>
  );
}
