import { getAuthHeaders } from "@/lib/api/auth";

const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001").replace(
  /\/+$/,
  "",
);

export interface CurrentUserProfile {
  isCompleteOnboarding?: boolean;
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

export async function getCurrentUserProfile(
  headers?: Record<string, string>,
): Promise<CurrentUserProfile | null> {
  const authHeaders = headers ?? (await getAuthHeaders());
  const response = await fetch(`${apiUrl}/api/users/me`, {
    headers: authHeaders,
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to load user profile");
  }

  return (await response.json()) as CurrentUserProfile;
}
