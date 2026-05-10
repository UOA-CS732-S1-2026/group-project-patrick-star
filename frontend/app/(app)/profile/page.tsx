"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { getAuthHeaders } from "@/lib/api/auth";
import {
  BODY_SHAPES,
  GENDERS,
  STYLE_OPTIONS,
  type BodyShape,
  type Gender,
  type StyleOption,
} from "@/components/onboarding/onboarding-data";

const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001")
  .replace(/\/+$/, "");

interface BodyProfileState {
  age: string;
  height: string;
  weight: string;
  bodyShape: BodyShape | null;
  gender: Gender | null;
}

const initialBodyProfile: BodyProfileState = {
  age: "",
  height: "",
  weight: "",
  bodyShape: null,
  gender: null,
};

interface ApiUserProfile {
  name?: string;
  bodyProfile?: {
    age?: number | null;
    height?: number | null;
    weight?: number | null;
    bodyType?: string | null;
    gender?: string | null;
  };
  stylePreferences?: string[];
  profilePhoto?: string | null;
  modelImage?: string | null;
}

function isBodyShape(value: string | null | undefined): value is BodyShape {
  return BODY_SHAPES.includes(value as BodyShape);
}

function isGender(value: string | null | undefined): value is Gender {
  return GENDERS.includes(value as Gender);
}

function isStyleOption(value: string): value is StyleOption {
  return STYLE_OPTIONS.includes(value as StyleOption);
}

function toInputValue(value: number | null | undefined) {
  return value === null || value === undefined ? "" : String(value);
}

function toNullableNumber(value: string) {
  return value.trim() === "" ? null : Number(value);
}

async function parseError(response: Response, fallback: string) {
  const text = await response.text().catch(() => "");

  if (!text) {
    return fallback;
  }

  try {
    const body = JSON.parse(text) as { error?: string; errors?: string[] };
    return body.error ?? body.errors?.join(", ") ?? fallback;
  } catch {
    return text;
  }
}

export default function ProfilePage() {
  const [accountName, setAccountName] = useState("Profile");
  const [wardrobeItems, setWardrobeItems] = useState(0);
  const [savedOutfits, setSavedOutfits] = useState(0);
  const [bodyProfile, setBodyProfile] =
    useState<BodyProfileState>(initialBodyProfile);
  const [preferredStyles, setPreferredStyles] =
    useState<StyleOption[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [accountSaving, setAccountSaving] = useState(false);
  const [bodySaving, setBodySaving] = useState(false);
  const [stylesSaving, setStylesSaving] = useState(false);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const styleSummary = useMemo(() => {
    if (preferredStyles.length === 0) {
      return "No styles selected";
    }

    return preferredStyles
      .map((style) => style.replace(/^[^\w]+ /, ""))
      .join(", ");
  }, [preferredStyles]);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setErrorMessage(null);

      try {
        const headers = await getAuthHeaders();
        const [profileResponse, clothingResponse, outfitsResponse] =
          await Promise.all([
            fetch(`${apiUrl}/api/users/me`, { headers }),
            fetch(`${apiUrl}/api/clothingItems/me`, { headers }),
            fetch(`${apiUrl}/api/outfits/me`, { headers }),
          ]);

        if (!profileResponse.ok) {
          throw new Error(
            await parseError(profileResponse, "Failed to load profile"),
          );
        }

        const profile = (await profileResponse.json()) as ApiUserProfile;
        const clothingItems = clothingResponse.ok
          ? ((await clothingResponse.json()) as unknown[])
          : [];
        const outfits = outfitsResponse.ok
          ? ((await outfitsResponse.json()) as unknown[])
          : [];

        if (cancelled) {
          return;
        }

        setAccountName(profile.name ?? "Profile");
        setWardrobeItems(clothingItems.length);
        setSavedOutfits(outfits.length);
        setPhotoPreview(profile.profilePhoto ?? profile.modelImage ?? null);
        setBodyProfile({
          age: toInputValue(profile.bodyProfile?.age),
          height: toInputValue(profile.bodyProfile?.height),
          weight: toInputValue(profile.bodyProfile?.weight),
          bodyShape: isBodyShape(profile.bodyProfile?.bodyType)
            ? profile.bodyProfile.bodyType
            : null,
          gender: isGender(profile.bodyProfile?.gender)
            ? profile.bodyProfile.gender
            : null,
        });
        setPreferredStyles(
          (profile.stylePreferences ?? []).filter(isStyleOption),
        );
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error ? error.message : "Failed to load profile",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

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

  async function handleSaveAccount() {
    setAccountSaving(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch(`${apiUrl}/api/users/me/profile`, {
        method: "PATCH",
        headers: await getAuthHeaders(true),
        body: JSON.stringify({ name: accountName }),
      });

      if (!response.ok) {
        throw new Error(
          await parseError(response, "Failed to save profile details"),
        );
      }

      setStatusMessage("Profile details saved.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to save profile details",
      );
    } finally {
      setAccountSaving(false);
    }
  }

  async function handleSaveBodyProfile() {
    setBodySaving(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch(`${apiUrl}/api/users/me/body-profile`, {
        method: "PATCH",
        headers: await getAuthHeaders(true),
        body: JSON.stringify({
          age: toNullableNumber(bodyProfile.age),
          height: toNullableNumber(bodyProfile.height),
          weight: toNullableNumber(bodyProfile.weight),
          bodyShape: bodyProfile.bodyShape,
          gender: bodyProfile.gender,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await parseError(response, "Failed to save body profile"),
        );
      }

      setStatusMessage("Body profile saved.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to save body profile",
      );
    } finally {
      setBodySaving(false);
    }
  }

  async function handleSaveStyles() {
    setStylesSaving(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch(`${apiUrl}/api/users/me/style-preferences`, {
        method: "PATCH",
        headers: await getAuthHeaders(true),
        body: JSON.stringify({ stylePreferences: preferredStyles }),
      });

      if (!response.ok) {
        throw new Error(
          await parseError(response, "Failed to save style preferences"),
        );
      }

      setStatusMessage("Style preferences saved.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to save style preferences",
      );
    } finally {
      setStylesSaving(false);
    }
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setPhotoName(file.name);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoSaving(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${apiUrl}/api/users/me/photo/upload`, {
        method: "POST",
        headers: await getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await parseError(response, "Failed to upload photo"));
      }

      const result = (await response.json()) as { modelImage?: string };

      if (result.modelImage) {
        setPhotoPreview(result.modelImage);
      }

      setStatusMessage("Profile photo uploaded.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to upload photo",
      );
    } finally {
      setPhotoSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Profile"
        subtitle="View your account details and update styling preferences."
      />

      <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-10 py-8">
        {(statusMessage || errorMessage) && (
          <div
            className={
              errorMessage
                ? "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                : "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
            }
          >
            {errorMessage ?? statusMessage}
          </div>
        )}

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
                {loading ? "Loading..." : accountName}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {styleSummary}
              </p>
            </div>

            <div className="mt-6">
              <ProfileField label="Display name">
                <input
                  type="text"
                  maxLength={20}
                  value={accountName}
                  disabled={loading}
                  onChange={(event) => setAccountName(event.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:bg-neutral-50"
                />
              </ProfileField>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-3 w-full"
                disabled={accountSaving || loading}
                onClick={handleSaveAccount}
              >
                {accountSaving ? "Saving" : "Save details"}
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-neutral-50 p-4">
                <div className="text-2xl font-bold">
                  {wardrobeItems}
                </div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Wardrobe items
                </div>
              </div>
              <div className="rounded-xl border border-border bg-neutral-50 p-4">
                <div className="text-2xl font-bold">
                  {savedOutfits}
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
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={bodySaving || loading}
                onClick={handleSaveBodyProfile}
              >
                {bodySaving ? "Saving" : "Save"}
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
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={stylesSaving || loading}
                onClick={handleSaveStyles}
              >
                {stylesSaving ? "Saving" : "Save"}
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
                {photoSaving ? "Uploading..." : photoName || "PNG, JPG, or WEBP"}
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
