import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { AppShell } from "@/components/layout/AppShell";

const apiUrl = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001"
).replace(/\/+$/, "");

export default async function AppSectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth0.getSession();

  // Protected route group: unauthenticated users must start at Auth0 login.
  if (!session) {
    redirect("/login");
  }

  const { token } = await auth0.getAccessToken();

  // Without an API access token, client pages cannot call the backend safely.
  if (!token) {
    redirect("/login");
  }

  const response = await fetch(`${apiUrl}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const user = (await response.json()) as {
    isCompleteOnboarding?: boolean;
  };

  // Completed onboarding gates the main app so profile/body/model data exists first.
  if (!user.isCompleteOnboarding) {
    redirect("/onboarding");
  }

  return <AppShell>{children}</AppShell>;
}
