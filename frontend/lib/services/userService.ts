import { getAuthHeaders } from "@/lib/api/auth";
import { UserProfilePayload } from "@/lib/services/onboardingService";

const apiUrl = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001"
).replace(/\/+$/, "");

export async function getCurrentUserProfile(
  headers?: Record<string, string>,
): Promise<UserProfilePayload | null> {
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

  return (await response.json()) as UserProfilePayload;
}
