"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import {
  BODY_SHAPES,
  GENDERS,
  STYLE_OPTIONS,
  type BodyShape,
  type Gender,
  type StyleOption,
} from "@/components/onboarding/onboarding-data";

const accountSummary = {
  name: "Alex Johnson",
  wardrobeItems: 42,
  savedOutfits: 12,
};

interface BodyProfileState {
  age: string;
  height: string;
  weight: string;
  bodyShape: BodyShape | null;
  gender: Gender | null;
}

const initialBodyProfile: BodyProfileState = {
  age: "28",
  height: "172",
  weight: "68",
  bodyShape: "Regular",
  gender: "Non-binary",
};

const initialStyles: StyleOption[] = ["🤍 Minimal & Clean", "👔 Smart casual"];

export default function ProfilePage() {
  const [bodyProfile, setBodyProfile] =
    useState<BodyProfileState>(initialBodyProfile);
  const [preferredStyles, setPreferredStyles] =
    useState<StyleOption[]>(initialStyles);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string>("");

  const styleSummary = useMemo(() => {
    if (preferredStyles.length === 0) {
      return "No styles selected";
    }

    return preferredStyles
      .map((style) => style.replace(/^[^\w]+ /, ""))
      .join(", ");
  }, [preferredStyles]);

  function updateBodyProfile<Field extends keyof BodyProfileState>(
    field: Field,
    value: BodyProfileState[Field]
  ) {
    setBodyProfile((current) => ({ ...current, [field]: value }));
  }

  function toggleStyle(style: StyleOption) {
    setPreferredStyles((current) =>
      current.includes(style)
        ? current.filter((item) => item !== style)
        : [...current, style]
    );
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setPhotoName(file.name);
    setPhotoPreview(URL.createObjectURL(file));
  }

  return (
    <>
      <PageHeader
        title="Profile"
        subtitle="View your account details and update styling preferences."
      />

      <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-10 py-8">
        <section className="grid gap-6 lg:grid-cols-[minmax(260px,340px)_minmax(0,1fr)]">
          <Card className="p-6">
            <div className="flex flex-col items-center text-center">
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoPreview}
                  alt=""
                  className="h-32 w-32 rounded-full border border-border object-cover"
                />
              ) : (
                <div
                  aria-hidden
                  className="flex h-32 w-32 items-center justify-center rounded-full border border-border bg-neutral-100 text-5xl"
                >
                  👤
                </div>
              )}

              <h2 className="mt-4 text-xl font-bold text-foreground">
                {accountSummary.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {styleSummary}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-neutral-50 p-4">
                <div className="text-2xl font-bold">
                  {accountSummary.wardrobeItems}
                </div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Wardrobe items
                </div>
              </div>
              <div className="rounded-xl border border-border bg-neutral-50 p-4">
                <div className="text-2xl font-bold">
                  {accountSummary.savedOutfits}
                </div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Saved outfits
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Body profile</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  These details help personalise fit and outfit suggestions.
                </p>
              </div>
              <Button type="button" variant="secondary" size="sm">
                Save
              </Button>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <ProfileField label="Age">
                <input
                  type="number"
                  inputMode="numeric"
                  value={bodyProfile.age}
                  onChange={(event) =>
                    updateBodyProfile("age", event.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </ProfileField>
              <ProfileField label="Height (cm)">
                <input
                  type="number"
                  inputMode="numeric"
                  value={bodyProfile.height}
                  onChange={(event) =>
                    updateBodyProfile("height", event.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </ProfileField>
              <ProfileField label="Weight (kg)">
                <input
                  type="number"
                  inputMode="numeric"
                  value={bodyProfile.weight}
                  onChange={(event) =>
                    updateBodyProfile("weight", event.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </ProfileField>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <ProfileField label="Body shape">
                <div className="flex flex-wrap gap-3">
                  {BODY_SHAPES.map((shape) => (
                    <Chip
                      key={shape}
                      type="button"
                      selected={bodyProfile.bodyShape === shape}
                      onClick={() => updateBodyProfile("bodyShape", shape)}
                    >
                      {shape}
                    </Chip>
                  ))}
                </div>
              </ProfileField>

              <ProfileField label="Gender">
                <div className="flex flex-wrap gap-3">
                  {GENDERS.map((gender) => (
                    <Chip
                      key={gender}
                      type="button"
                      selected={bodyProfile.gender === gender}
                      onClick={() => updateBodyProfile("gender", gender)}
                    >
                      {gender}
                    </Chip>
                  ))}
                </div>
              </ProfileField>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Preferred style</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose the style directions you want outfits to lean toward.
                </p>
              </div>
              <Button type="button" variant="secondary" size="sm">
                Save
              </Button>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {STYLE_OPTIONS.map((style) => (
                <Chip
                  key={style}
                  type="button"
                  selected={preferredStyles.includes(style)}
                  onClick={() => toggleStyle(style)}
                  className="h-auto w-full justify-start px-5 py-4 text-left"
                >
                  {style}
                </Chip>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div>
              <h2 className="text-lg font-semibold">Profile photo</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Update the uploaded photo used for your personal model.
              </p>
            </div>

            <label
              htmlFor="profile-photo"
              className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-neutral-50 px-6 py-12 text-center transition-colors hover:bg-neutral-100"
            >
              <input
                id="profile-photo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <span className="text-3xl" aria-hidden>
                ↑
              </span>
              <span className="mt-3 text-sm font-semibold text-foreground">
                Choose a new photo
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                {photoName || "PNG, JPG, or WEBP"}
              </span>
            </label>
          </Card>
        </section>
      </div>
    </>
  );
}

function ProfileField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="block">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}
