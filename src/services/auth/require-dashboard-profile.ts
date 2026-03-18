import { redirect } from "next/navigation";

import { getScopeFromRole } from "@/lib/auth/profile";
import { getSessionProfile } from "@/services/auth/get-session-profile";
import type { DashboardScope } from "@/types/auth";

export async function requireDashboardProfile(scope: DashboardScope) {
  const profile = await getSessionProfile();

  if (!profile) {
    redirect("/login");
  }

  if (getScopeFromRole(profile.role) !== scope) {
    redirect("/dashboard");
  }

  return profile;
}
