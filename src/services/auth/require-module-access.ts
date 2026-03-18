import { notFound, redirect } from "next/navigation";

import { getDefaultDashboardPath, getScopeFromRole } from "@/lib/auth/profile";
import { getSessionProfile } from "@/services/auth/get-session-profile";
import type { DashboardScope, UserProfile, UserRole } from "@/types/auth";

export type ModuleAccessKey =
  | "curriculum"
  | "tracks"
  | "question-bank"
  | "exams"
  | "exam-take"
  | "logbook"
  | "logbook-review"
  | "emergencies"
  | "emergencies-run"
  | "preanesthetic"
  | "surgery-guides"
  | "reports";

interface ModulePolicy {
  scopes?: DashboardScope[];
  roles?: UserRole[];
}

const modulePolicies: Record<ModuleAccessKey, ModulePolicy> = {
  curriculum: { scopes: ["trainee", "preceptor", "admin"] },
  tracks: { scopes: ["trainee", "preceptor", "admin"] },
  "question-bank": { scopes: ["trainee", "preceptor", "admin"] },
  exams: { scopes: ["trainee", "preceptor", "admin"] },
  "exam-take": { scopes: ["trainee"] },
  logbook: { scopes: ["trainee", "preceptor", "admin"] },
  "logbook-review": { scopes: ["preceptor", "admin"] },
  emergencies: { scopes: ["trainee", "preceptor", "admin"] },
  "emergencies-run": { scopes: ["trainee"] },
  preanesthetic: { scopes: ["trainee", "preceptor", "admin"] },
  "surgery-guides": { scopes: ["trainee", "preceptor", "admin"] },
  reports: { scopes: ["trainee", "preceptor", "admin"] }
};

interface RequireModuleAccessOptions {
  onDenied?: "redirect" | "notFound";
  allowedScopes?: DashboardScope[];
  allowedRoles?: UserRole[];
}

export async function requireModuleAccess(
  moduleKey: ModuleAccessKey,
  options: RequireModuleAccessOptions = {}
): Promise<UserProfile> {
  const profile = await getSessionProfile();

  if (!profile) {
    redirect("/login");
  }

  const policy = modulePolicies[moduleKey];
  const scope = getScopeFromRole(profile.role);

  const allowedScopes = options.allowedScopes ?? policy.scopes;
  const allowedRoles = options.allowedRoles ?? policy.roles;

  const deniedByScope = allowedScopes && !allowedScopes.includes(scope);
  const deniedByRole = allowedRoles && !allowedRoles.includes(profile.role);

  if (deniedByScope || deniedByRole) {
    if (options.onDenied === "notFound") {
      notFound();
    }

    redirect(getDefaultDashboardPath(profile.role));
  }

  return profile;
}

export function isAdminRole(role: UserRole) {
  return role === "super_admin" || role === "institution_admin" || role === "coordinator";
}

export function isPrivilegedReviewerRole(role: UserRole) {
  return role === "preceptor" || isAdminRole(role);
}

export function isTraineeRole(role: UserRole) {
  return role === "trainee_me1" || role === "trainee_me2" || role === "trainee_me3";
}
