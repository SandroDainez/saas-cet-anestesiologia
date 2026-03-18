import type { User } from "@supabase/supabase-js";

import type { DashboardScope, UserProfile, UserRole } from "@/types/auth";

const roleToScope: Record<UserRole, DashboardScope> = {
  super_admin: "admin",
  institution_admin: "admin",
  coordinator: "admin",
  preceptor: "preceptor",
  trainee_me1: "trainee",
  trainee_me2: "trainee",
  trainee_me3: "trainee"
};

const rolePriority: UserRole[] = [
  "super_admin",
  "institution_admin",
  "coordinator",
  "preceptor",
  "trainee_me3",
  "trainee_me2",
  "trainee_me1"
];

export function getProfileFromUser(user: User): UserProfile {
  const metadata = {
    ...user.user_metadata,
    ...user.app_metadata
  };

  const role = parseUserRole(metadata.role) ?? "trainee_me1";
  const institutionId = (metadata.institution_id as string | undefined) ?? "pending-institution";
  const institutionName = (metadata.institution_name as string | undefined) ?? "Instituicao nao vinculada";
  const fullName = (metadata.full_name as string | undefined) ?? user.email?.split("@")[0] ?? "Usuario";
  const trainingYear = (metadata.training_year as UserProfile["training_year"] | undefined) ?? inferTrainingYear(role);

  return {
    id: user.id,
    full_name: fullName,
    email: user.email ?? "",
    role,
    institution_id: institutionId,
    institution_name: institutionName,
    training_year: trainingYear
  };
}

export function getScopeFromRole(role: UserRole): DashboardScope {
  return roleToScope[role];
}

export function getDefaultDashboardPath(role: UserRole) {
  const scope = getScopeFromRole(role);

  if (scope === "trainee") {
    return "/dashboard/trainee";
  }

  if (scope === "preceptor") {
    return "/dashboard/preceptor";
  }

  return "/dashboard/admin";
}

export function inferTrainingYear(role: UserRole): UserProfile["training_year"] | undefined {
  if (role === "trainee_me1") {
    return "ME1";
  }

  if (role === "trainee_me2") {
    return "ME2";
  }

  if (role === "trainee_me3") {
    return "ME3";
  }

  return undefined;
}

export function parseUserRole(value: unknown): UserRole | null {
  if (typeof value !== "string") {
    return null;
  }

  return rolePriority.find((role) => role === value) ?? null;
}

export function pickPrimaryRole(roles: UserRole[]): UserRole {
  for (const role of rolePriority) {
    if (roles.includes(role)) {
      return role;
    }
  }

  return "trainee_me1";
}
