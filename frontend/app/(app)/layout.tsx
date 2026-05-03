import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { AppShell } from "@/components/layout/AppShell";

export default async function AppSectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth0.getSession();

  if (!session) {
    redirect("/login");
  }

  return <AppShell>{children}</AppShell>;
}
