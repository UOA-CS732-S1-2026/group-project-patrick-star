import type { AuthSession } from "./session";

function requireApiUrl() {
  const value = process.env.NEXT_PUBLIC_API_URL;
  if (!value) {
    throw new Error("Missing NEXT_PUBLIC_API_URL in the frontend environment");
  }
  return value;
}

export async function syncAuthenticatedUser(
  session: AuthSession,
  profile: { name?: string; email?: string }
) {
  const response = await fetch(`${requireApiUrl()}/api/users/me/sync`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: profile.name ?? session.user.name,
      email: profile.email ?? session.user.email,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(
      errorText || `Failed to sync the authenticated user (${response.status})`
    );
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  return response.json();
}
