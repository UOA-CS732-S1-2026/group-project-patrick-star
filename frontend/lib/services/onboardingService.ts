import { MODEL_OPTIONS } from "@/components/onboarding/onboarding-data";
import type { OnboardingFormValues } from "@/components/onboarding/onboarding-schema";
import { getAuthHeaders } from "@/lib/api/auth";

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

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Unable to read uploaded image"));
    };

    reader.onerror = () => {
      reject(new Error("Unable to read uploaded image"));
    };

    reader.readAsDataURL(file);
  });
}

export class OnboardingService {
  private readonly apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

  async save(values: OnboardingFormValues): Promise<void> {
    const payload = await this.buildPayload(values);
    const response = await fetch(`${this.apiUrl}/api/users/me`, {
      method: "PUT",
      headers: await getAuthHeaders(true),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to save onboarding profile");
    }
  }

  private async buildPayload(
    values: OnboardingFormValues,
  ): Promise<UserProfilePayload> {
    const uploadedPhoto = values.modelPhoto?.[0] ?? null;
    const selectedModel =
      MODEL_OPTIONS.find((item) => item.id === values.selectedModelId) ?? null;
    const modelImage =
      values.modelMode === "upload" && uploadedPhoto
        ? await fileToDataUrl(uploadedPhoto)
        : selectedModel?.imageSrc ?? null;

    return {
      bodyProfile: {
        age: values.age ? Number(values.age) : null,
        height: values.height ? Number(values.height) : null,
        weight: values.weight ? Number(values.weight) : null,
        bodyType: values.bodyShape ?? null,
        gender: values.gender ?? null,
      },
      stylePreferences: values.stylePreference,
      modelImage,
    };
  }
}

export const onboardingService = new OnboardingService();
