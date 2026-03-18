import { createServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/auth";
import type { TraineeYearCode } from "@/types/database";

export interface InstitutionUserSummary {
  id: string;
  fullName: string;
  email: string;
  role: UserRole | "unknown";
  trainingYear?: TraineeYearCode;
  active: boolean;
  phone?: string | null;
  cpf?: string | null;
  crm?: string | null;
  addressText?: string | null;
  avatarUrl?: string | null;
}

export async function fetchInstitutionUsers(institutionId: string): Promise<InstitutionUserSummary[]> {
  const supabase = await createServerClient();

  const [profilesResult, rolesResult, rolesCatalogResult, traineeProfilesResult] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("id, full_name, email, active, phone, cpf, crm, address_text, avatar_url")
      .eq("institution_id", institutionId)
      .order("full_name", { ascending: true }),
    supabase
      .from("user_roles")
      .select("user_id, role_id")
      .eq("institution_id", institutionId),
    supabase
      .from("roles")
      .select("id, code")
      .in("code", ["institution_admin", "coordinator", "preceptor", "trainee_me1", "trainee_me2", "trainee_me3"]),
    supabase
      .from("trainee_profiles")
      .select("user_id, trainee_year")
      .eq("institution_id", institutionId)
  ]);

  const profiles = profilesResult.data ?? [];
  const roleIdToCode = new Map((rolesCatalogResult.data ?? []).map((role) => [role.id, role.code]));
  const userToRole = new Map(
    (rolesResult.data ?? []).map((entry) => [entry.user_id, (roleIdToCode.get(entry.role_id) ?? "unknown") as InstitutionUserSummary["role"]])
  );
  const userToTrainingYear = new Map((traineeProfilesResult.data ?? []).map((entry) => [entry.user_id, entry.trainee_year]));

  return profiles.map((profile) => ({
    role: (() => {
      const resolvedRole = userToRole.get(profile.id) ?? "unknown";
      if (resolvedRole !== "unknown") {
        return resolvedRole;
      }

      const inferredYear = userToTrainingYear.get(profile.id);
      if (inferredYear === "ME1") return "trainee_me1";
      if (inferredYear === "ME2") return "trainee_me2";
      if (inferredYear === "ME3") return "trainee_me3";

      return "unknown";
    })(),
    id: profile.id,
    fullName: profile.full_name,
    email: profile.email,
    trainingYear: (() => {
      const resolvedRole = userToRole.get(profile.id) ?? "unknown";
      if (resolvedRole === "trainee_me1" || resolvedRole === "trainee_me2" || resolvedRole === "trainee_me3") {
        return userToTrainingYear.get(profile.id);
      }

      return undefined;
    })(),
    active: profile.active,
    phone: profile.phone,
    cpf: profile.cpf,
    crm: profile.crm,
    addressText: profile.address_text,
    avatarUrl: profile.avatar_url
  }));
}
