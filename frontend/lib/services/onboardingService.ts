import { MODEL_OPTIONS } from "@/components/onboarding/onboarding-data";
import type { OnboardingFormValues } from "@/components/onboarding/onboarding-schema";
import { getAuthHeaders } from "@/lib/api/auth";

type AuthSession = {
  user?: {
    name?: string | null;
    email?: string | null;
  };
};

type UserProfilePayload = {
  bodyProfile: {
    age: number | null;
    height: number | null;
    weight: number | null;
    bodyType: string | null;
    gender: string | null;
  };
  stylePreferences: string[];
  modelImage: string | null;
};

export class OnboardingService {
  private readonly apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

  async save(
    values: OnboardingFormValues,
    session?: AuthSession,
  ): Promise<void> {
    await this.ensureUserSynced(session);

    const payload = this.buildProfilePayload(values);
    const response = await fetch(`${this.apiUrl}/api/users/me`, {
      method: "PUT",
      headers: await getAuthHeaders(true),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      throw new Error(
        `Failed to save onboarding profile (${response.status} ${response.statusText})${details ? `: ${details}` : ""}`,
      );
    }

    const uploadedPhoto = values.modelPhoto?.[0] ?? null;
    if (values.modelMode === "upload" && uploadedPhoto) {
      await this.uploadModelImage(uploadedPhoto);
    }
  }

  private async ensureUserSynced(session?: AuthSession): Promise<void> {
    const name = session?.user?.name;
    const email = session?.user?.email;

    if (!name || !email) {
      return;
    }

    const response = await fetch(`${this.apiUrl}/api/users/me/sync`, {
      method: "POST",
      headers: await getAuthHeaders(true),
      body: JSON.stringify({ name, email }),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      throw new Error(
        `Failed to sync user profile (${response.status} ${response.statusText})${details ? `: ${details}` : ""}`,
      );
    }
  }

  private buildProfilePayload(values: OnboardingFormValues): UserProfilePayload {
    const selectedModel =
      MODEL_OPTIONS.find((item) => item.id === values.selectedModelId) ?? null;

    return {
      bodyProfile: {
        age: values.age ? Number(values.age) : null,
        height: values.height ? Number(values.height) : null,
        weight: values.weight ? Number(values.weight) : null,
        bodyType: values.bodyShape ?? null,
        gender: values.gender ?? null,
      },
      stylePreferences: values.stylePreference,
      modelImage:
        values.modelMode === "select" ? selectedModel?.imageSrc ?? null : null,
    };
  }

  private async uploadModelImage(image: File): Promise<void> {
    const formData = new FormData();
    formData.append("image", image);

    const response = await fetch(`${this.apiUrl}/api/users/me/model-image`, {
      method: "PUT",
      headers: await getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload model image");
    }
  }
}

export const onboardingService = new OnboardingService();
