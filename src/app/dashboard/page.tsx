import { redirect } from "next/navigation";

import { getDefaultDashboardPath } from "@/lib/auth/profile";
import { getSessionProfile } from "@/services/auth/get-session-profile";

export default async function DashboardIndexPage() {
  const profile = await getSessionProfile();

  if (!profile) {
    redirect("/login");
  }

  redirect(getDefaultDashboardPath(profile.role));
}
