import { redirect } from "next/navigation";

import { getScopeFromRole } from "@/lib/auth/profile";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getSessionProfile } from "@/services/auth/get-session-profile";

export default async function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getSessionProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <DashboardShell profile={profile} scope={getScopeFromRole(profile.role)}>
      {children}
    </DashboardShell>
  );
}
