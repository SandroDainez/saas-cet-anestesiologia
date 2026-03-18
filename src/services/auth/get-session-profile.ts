import { cache } from "react";

import { createServerClient } from "@/lib/supabase/server";
import { getProfileFromUser, parseUserRole } from "@/lib/auth/profile";
import { getSessionUser } from "@/services/auth/get-session-user";
import type { UserProfile } from "@/types/auth";

function resolveRoleFromSessionRow(roleCode: unknown, trainingYear: UserProfile["training_year"] | null | undefined) {
  const parsedRole = parseUserRole(roleCode);
  if (parsedRole) {
    return parsedRole;
  }

  if (roleCode === "trainee") {
    if (trainingYear === "ME3") {
      return "trainee_me3";
    }

    if (trainingYear === "ME2") {
      return "trainee_me2";
    }

    return "trainee_me1";
  }

  return null;
}

export const getSessionProfile = cache(async () => {
  const user = await getSessionUser();

  if (!user) {
    return null;
  }

  const supabase = await createServerClient();
  let rpcResult = await supabase.rpc("get_session_profile", {
    _user_id: user.id
  });

  if (rpcResult.error?.code === "PGRST202") {
    rpcResult = await supabase.rpc("get_session_profile");
  }

  const { data, error } = rpcResult;

  if (error) {
    console.error(
      `[auth] session profile rpc error code=${error.code ?? "unknown"} message=${error.message ?? "unknown"} details=${error.details ?? "none"} hint=${error.hint ?? "none"}`
    );
    return getProfileFromUser(user);
  }

  const profileRow = Array.isArray(data) ? data[0] : data;
  const role = resolveRoleFromSessionRow(profileRow?.role_code, profileRow?.training_year);

  if (profileRow?.id && role && profileRow.institution_id) {
    const trainingYear =
      profileRow.training_year ??
      (user.user_metadata?.training_year as UserProfile["training_year"] | undefined);

    return {
      id: user.id,
      full_name: profileRow.full_name,
      email: profileRow.email,
      role,
      institution_id: profileRow.institution_id,
      institution_name:
        profileRow.institution_name ??
        (user.user_metadata?.institution_name as string | undefined) ??
        "Instituicao nao vinculada",
      training_year: trainingYear
    };
  }

  console.error(
    `[auth] session profile fallback userId=${user.id} email=${user.email ?? "unknown"} roleCode=${profileRow?.role_code ?? "none"} institutionId=${profileRow?.institution_id ?? "none"}`
  );

  return getProfileFromUser(user);
});
