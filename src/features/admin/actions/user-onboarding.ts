"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/env";
import { getSessionProfile } from "@/services/auth/get-session-profile";
import type { UserProfile, UserRole } from "@/types/auth";
import type { TraineeYearCode } from "@/types/database";

export interface UserOnboardingState {
  status: "idle" | "success" | "error";
  message: string | null;
}

type AdminContextResult =
  | { profile: UserProfile }
  | { error: UserOnboardingState };

type OnboardingMode = "create" | "invite";
type ManagedRole = "institution_admin" | "coordinator" | "preceptor" | "trainee";
type ManagedAccessAction = "invite" | "reset_password";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function formatAdminAuthError(message: string) {
  if (message === "Database error saving new user") {
    return "Falha ao persistir o usuario no Auth. A trigger de sincronizacao foi protegida; tente novamente.";
  }

  return message;
}

function resolveManagedRole(baseRole: ManagedRole, trainingYear?: string | null): UserRole {
  if (baseRole !== "trainee") {
    return baseRole;
  }

  if (trainingYear === "ME3") {
    return "trainee_me3";
  }

  if (trainingYear === "ME2") {
    return "trainee_me2";
  }

  return "trainee_me1";
}

function resolveTrainingYear(baseRole: ManagedRole, trainingYear?: string | null): TraineeYearCode | undefined {
  if (baseRole !== "trainee") {
    return undefined;
  }

  if (trainingYear === "ME2" || trainingYear === "ME3") {
    return trainingYear;
  }

  return "ME1";
}

function optionalText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

async function enforceRelationalUserState(params: {
  admin: ReturnType<typeof createAdminClient>;
  userId: string;
  institutionId: string;
  role: UserRole;
  fullName: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  crm: string | null;
  addressText: string | null;
  avatarUrl: string | null;
  trainingYear?: TraineeYearCode;
}) {
  const { admin, userId, institutionId, role, fullName, email, phone, cpf, crm, addressText, avatarUrl, trainingYear } = params;

  await admin
    .from("user_profiles")
    .update({
      institution_id: institutionId,
      full_name: fullName,
      email,
      phone,
      cpf,
      crm,
      address_text: addressText,
      avatar_url: avatarUrl
    })
    .eq("id", userId);

  const rolesResult = await admin
    .from("roles")
    .select("id, code")
    .in("code", [
      "institution_admin",
      "coordinator",
      "preceptor",
      "trainee",
      "trainee_me1",
      "trainee_me2",
      "trainee_me3"
    ]);

  if (rolesResult.error) {
    return { error: rolesResult.error.message };
  }

  const roleIdByCode = new Map((rolesResult.data ?? []).map((entry) => [entry.code, entry.id]));
  const targetRoleId = roleIdByCode.get(role);

  if (!targetRoleId) {
    return { error: `Papel ${role} nao encontrado no catalogo.` };
  }

  await admin
    .from("user_roles")
    .delete()
    .eq("user_id", userId)
    .in("role_id", Array.from(roleIdByCode.values()));

  const userRoleInsert = await admin
    .from("user_roles")
    .insert({
      user_id: userId,
      role_id: targetRoleId,
      institution_id: institutionId
    });

  if (userRoleInsert.error) {
    return { error: userRoleInsert.error.message };
  }

  if (role === "trainee_me1" || role === "trainee_me2" || role === "trainee_me3") {
    const traineeUpsert = await admin.from("trainee_profiles").upsert(
      {
        user_id: userId,
        institution_id: institutionId,
        trainee_year: trainingYear,
        current_status: "active"
      },
      { onConflict: "user_id" }
    );

    if (traineeUpsert.error) {
      return { error: traineeUpsert.error.message };
    }
  } else {
    await admin.from("trainee_profiles").delete().eq("user_id", userId);
  }

  if (role === "preceptor") {
    const preceptorUpsert = await admin.from("preceptor_profiles").upsert(
      {
        user_id: userId,
        institution_id: institutionId
      },
      { onConflict: "user_id" }
    );

    if (preceptorUpsert.error) {
      return { error: preceptorUpsert.error.message };
    }
  } else {
    await admin.from("preceptor_profiles").delete().eq("user_id", userId);
  }

  return { error: null };
}

async function requireInstitutionAdminContext(): Promise<AdminContextResult> {
  const profile = await getSessionProfile();

  if (!profile || !["institution_admin", "super_admin"].includes(profile.role)) {
    return {
      error: {
        status: "error" as const,
        message: "Somente admin institucional pode gerenciar usuarios."
      }
    };
  }

  if (!profile.institution_id || profile.institution_id === "pending-institution") {
    return {
      error: {
        status: "error" as const,
        message: "A sessao do admin nao possui institution_id valido."
      }
    };
  }

  if (!isSupabaseAdminConfigured()) {
    return {
      error: {
        status: "error" as const,
        message: "Configure SUPABASE_SERVICE_ROLE_KEY para habilitar o gerenciamento automatico."
      }
    };
  }

  return { profile };
}

export async function onboardInstitutionUser(
  _previousState: UserOnboardingState,
  formData: FormData
): Promise<UserOnboardingState> {
  const context = await requireInstitutionAdminContext();
  if ("error" in context) return context.error;
  const { profile } = context;

  const mode = String(formData.get("onboarding_mode") ?? "invite") as OnboardingMode;
  const email = String(formData.get("user_email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("user_full_name") ?? "").trim();
  const baseRole = String(formData.get("user_role") ?? "trainee") as ManagedRole;
  const requestedTrainingYear = String(formData.get("user_training_year") ?? "").trim() || null;
  const password = String(formData.get("initial_password") ?? "");
  const phone = optionalText(formData, "user_phone");
  const cpf = optionalText(formData, "user_cpf");
  const crm = optionalText(formData, "user_crm");
  const addressText = optionalText(formData, "user_address_text");
  const avatarUrl = optionalText(formData, "user_avatar_url");

  if (!isValidEmail(email)) {
    return { status: "error", message: "Informe um e-mail valido." };
  }

  if (!fullName) {
    return { status: "error", message: "Informe o nome completo do usuario." };
  }
  const role = resolveManagedRole(baseRole, requestedTrainingYear);
  const trainingYear = resolveTrainingYear(baseRole, requestedTrainingYear);

  if (mode === "create" && password.length < 8) {
    return { status: "error", message: "Para criar usuario diretamente, use senha com ao menos 8 caracteres." };
  }

  const admin = createAdminClient();
  const metadata = {
    role,
    institution_id: profile.institution_id,
    institution_name: profile.institution_name,
    full_name: fullName,
    ...(phone ? { phone } : {}),
    ...(cpf ? { cpf } : {}),
    ...(crm ? { crm } : {}),
    ...(addressText ? { address_text: addressText } : {}),
    ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    ...(trainingYear ? { training_year: trainingYear } : {})
  };

  const origin = (await headers()).get("origin") ?? null;
  let userId: string | null = null;

  if (mode === "invite") {
    const inviteResult = await admin.auth.admin.inviteUserByEmail(email, {
      data: metadata,
      ...(origin ? { redirectTo: `${origin}/login` } : {})
    });

    if (inviteResult.error) {
      return {
        status: "error",
        message: formatAdminAuthError(inviteResult.error.message)
      };
    }

    userId = inviteResult.data.user?.id ?? null;

    if (userId) {
      const updateResult = await admin.auth.admin.updateUserById(userId, {
        user_metadata: metadata,
        app_metadata: { role }
      });

      if (updateResult.error) {
        return {
          status: "error",
          message: `Convite criado, mas a sincronizacao de metadata falhou: ${updateResult.error.message}`
        };
      }
    }
  } else {
    const createResult = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata,
      app_metadata: { role }
    });

    if (createResult.error) {
      return {
        status: "error",
        message: formatAdminAuthError(createResult.error.message)
      };
    }

    userId = createResult.data.user.id;
  }

  if (userId) {
    const syncResult = await admin.rpc("sync_auth_user_row", {
      target_user_id: userId
    });

    if (syncResult.error) {
      return {
        status: "error",
        message: `Usuario autenticado, mas o sync relacional falhou: ${syncResult.error.message}`
      };
    }

    const relationalResult = await enforceRelationalUserState({
      admin,
      userId,
      institutionId: profile.institution_id,
      role,
      fullName,
      email,
      phone,
      cpf,
      crm,
      addressText,
      avatarUrl,
      trainingYear
    });

    if (relationalResult.error) {
      return {
        status: "error",
        message: `Usuario autenticado, mas a consolidacao relacional falhou: ${relationalResult.error}`
      };
    }
  }

  revalidatePath("/dashboard/admin");

  return {
    status: "success",
    message:
      mode === "invite"
        ? `Convite enviado para ${email} com papel ${role}.`
        : `Usuario ${email} criado com papel ${role}.`
  };
}

export async function updateInstitutionUser(
  _previousState: UserOnboardingState,
  formData: FormData
): Promise<UserOnboardingState> {
  const context = await requireInstitutionAdminContext();
  if ("error" in context) return context.error;
  const { profile } = context;

  const userId = String(formData.get("managed_user_id") ?? "").trim();
  const email = String(formData.get("managed_email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("managed_full_name") ?? "").trim();
  const baseRole = String(formData.get("managed_role") ?? "trainee") as ManagedRole;
  const requestedTrainingYear = String(formData.get("managed_training_year") ?? "").trim() || null;
  const phone = optionalText(formData, "managed_phone");
  const cpf = optionalText(formData, "managed_cpf");
  const crm = optionalText(formData, "managed_crm");
  const addressText = optionalText(formData, "managed_address_text");
  const avatarUrl = optionalText(formData, "managed_avatar_url");

  if (!userId) {
    return { status: "error", message: "Usuario alvo nao informado." };
  }

  if (!isValidEmail(email)) {
    return { status: "error", message: "Informe um e-mail valido." };
  }

  if (!fullName) {
    return { status: "error", message: "Informe o nome completo do usuario." };
  }

  const role = resolveManagedRole(baseRole, requestedTrainingYear);
  const trainingYear = resolveTrainingYear(baseRole, requestedTrainingYear);
  const admin = createAdminClient();

  const targetUserResult = await admin
    .from("user_profiles")
    .select("id, email, institution_id")
    .eq("id", userId)
    .maybeSingle();

  if (targetUserResult.error || !targetUserResult.data) {
    return { status: "error", message: "Usuario nao encontrado para esta instituicao." };
  }

  if (targetUserResult.data.institution_id !== profile.institution_id) {
    return { status: "error", message: "Nao e permitido editar usuarios de outra instituicao." };
  }

  const authUserResult = await admin.auth.admin.getUserById(userId);
  if (authUserResult.error || !authUserResult.data.user) {
    return {
      status: "error",
      message: authUserResult.error?.message ?? "Nao foi possivel carregar o usuario autenticado."
    };
  }

  const existingMetadata = authUserResult.data.user.user_metadata ?? {};
  const updateResult = await admin.auth.admin.updateUserById(userId, {
    user_metadata: {
      ...existingMetadata,
      role,
      institution_id: profile.institution_id,
      institution_name: profile.institution_name,
      full_name: fullName,
      email,
      phone,
      cpf,
      crm,
      address_text: addressText,
      avatar_url: avatarUrl,
      ...(trainingYear ? { training_year: trainingYear } : { training_year: null })
    },
    email,
    app_metadata: {
      ...(authUserResult.data.user.app_metadata ?? {}),
      role
    }
  });

  if (updateResult.error) {
    return { status: "error", message: updateResult.error.message };
  }

  const syncResult = await admin.rpc("sync_auth_user_row", {
    target_user_id: userId
  });

  if (syncResult.error) {
    return {
      status: "error",
      message: `Usuario atualizado no Auth, mas o sync relacional falhou: ${syncResult.error.message}`
    };
  }

  const relationalResult = await enforceRelationalUserState({
    admin,
    userId,
    institutionId: profile.institution_id,
    role,
    fullName,
    email,
    phone,
    cpf,
    crm,
    addressText,
    avatarUrl,
    trainingYear
  });

  if (relationalResult.error) {
    return {
      status: "error",
      message: `Usuario atualizado no Auth, mas a consolidacao relacional falhou: ${relationalResult.error}`
    };
  }

  revalidatePath("/dashboard/admin");

  return {
    status: "success",
    message: `Usuario ${targetUserResult.data.email} atualizado para ${role}.`
  };
}

export async function deleteInstitutionUser(
  _previousState: UserOnboardingState,
  formData: FormData
): Promise<UserOnboardingState> {
  const context = await requireInstitutionAdminContext();
  if ("error" in context) return context.error;
  const { profile } = context;

  const userId = String(formData.get("managed_user_id") ?? "").trim();
  if (!userId) {
    return { status: "error", message: "Usuario alvo nao informado." };
  }

  if (userId === profile.id) {
    return { status: "error", message: "Nao e permitido excluir o proprio usuario logado." };
  }

  const admin = createAdminClient();
  const targetUserResult = await admin
    .from("user_profiles")
    .select("id, email, institution_id")
    .eq("id", userId)
    .maybeSingle();

  if (targetUserResult.error || !targetUserResult.data) {
    return { status: "error", message: "Usuario nao encontrado para esta instituicao." };
  }

  if (targetUserResult.data.institution_id !== profile.institution_id) {
    return { status: "error", message: "Nao e permitido excluir usuarios de outra instituicao." };
  }

  const deleteResult = await admin.auth.admin.deleteUser(userId);
  if (deleteResult.error) {
    return { status: "error", message: deleteResult.error.message };
  }

  revalidatePath("/dashboard/admin");

  return {
    status: "success",
    message: `Usuario ${targetUserResult.data.email} excluido com sucesso.`
  };
}

export async function toggleInstitutionUserActive(
  _previousState: UserOnboardingState,
  formData: FormData
): Promise<UserOnboardingState> {
  const context = await requireInstitutionAdminContext();
  if ("error" in context) return context.error;
  const { profile } = context;

  const userId = String(formData.get("managed_user_id") ?? "").trim();
  const nextActive = String(formData.get("managed_active") ?? "").trim() === "true";

  if (!userId) {
    return { status: "error", message: "Usuario alvo nao informado." };
  }

  if (userId === profile.id && !nextActive) {
    return { status: "error", message: "Nao e permitido desativar o proprio usuario logado." };
  }

  const admin = createAdminClient();
  const targetUserResult = await admin
    .from("user_profiles")
    .select("id, email, institution_id")
    .eq("id", userId)
    .maybeSingle();

  if (targetUserResult.error || !targetUserResult.data) {
    return { status: "error", message: "Usuario nao encontrado para esta instituicao." };
  }

  if (targetUserResult.data.institution_id !== profile.institution_id) {
    return { status: "error", message: "Nao e permitido alterar usuarios de outra instituicao." };
  }

  const authUserResult = await admin.auth.admin.getUserById(userId);
  if (authUserResult.error || !authUserResult.data.user) {
    return {
      status: "error",
      message: authUserResult.error?.message ?? "Nao foi possivel carregar o usuario autenticado."
    };
  }

  const existingMetadata = authUserResult.data.user.user_metadata ?? {};
  const authUpdateResult = await admin.auth.admin.updateUserById(userId, {
    ban_duration: nextActive ? "none" : "876000h",
    user_metadata: {
      ...existingMetadata,
      active: nextActive
    }
  });

  if (authUpdateResult.error) {
    return { status: "error", message: authUpdateResult.error.message };
  }

  const profileUpdateResult = await admin
    .from("user_profiles")
    .update({ active: nextActive })
    .eq("id", userId)
    .eq("institution_id", profile.institution_id);

  if (profileUpdateResult.error) {
    return { status: "error", message: profileUpdateResult.error.message };
  }

  await admin
    .from("trainee_profiles")
    .update({ current_status: nextActive ? "active" : "inactive" })
    .eq("user_id", userId)
    .eq("institution_id", profile.institution_id);

  revalidatePath("/dashboard/admin");

  return {
    status: "success",
    message: `Usuario ${targetUserResult.data.email} ${nextActive ? "ativado" : "desativado"} com sucesso.`
  };
}

export async function triggerInstitutionUserAccessAction(
  _previousState: UserOnboardingState,
  formData: FormData
): Promise<UserOnboardingState> {
  const context = await requireInstitutionAdminContext();
  if ("error" in context) return context.error;
  const { profile } = context;

  const userId = String(formData.get("managed_user_id") ?? "").trim();
  const actionType = String(formData.get("managed_access_action") ?? "").trim() as ManagedAccessAction;

  if (!userId) {
    return { status: "error", message: "Usuario alvo nao informado." };
  }

  if (actionType !== "invite" && actionType !== "reset_password") {
    return { status: "error", message: "Acao de acesso invalida." };
  }

  const admin = createAdminClient();
  const targetUserResult = await admin
    .from("user_profiles")
    .select("id, email, institution_id, full_name")
    .eq("id", userId)
    .maybeSingle();

  if (targetUserResult.error || !targetUserResult.data) {
    return { status: "error", message: "Usuario nao encontrado para esta instituicao." };
  }

  if (targetUserResult.data.institution_id !== profile.institution_id) {
    return { status: "error", message: "Nao e permitido acionar usuarios de outra instituicao." };
  }

  const authUserResult = await admin.auth.admin.getUserById(userId);
  if (authUserResult.error || !authUserResult.data.user) {
    return {
      status: "error",
      message: authUserResult.error?.message ?? "Nao foi possivel carregar o usuario autenticado."
    };
  }

  const origin = (await headers()).get("origin") ?? null;

  if (actionType === "invite") {
    const inviteResult = await admin.auth.admin.inviteUserByEmail(targetUserResult.data.email, {
      data: authUserResult.data.user.user_metadata ?? {},
      ...(origin ? { redirectTo: `${origin}/login` } : {})
    });

    if (inviteResult.error) {
      return { status: "error", message: formatAdminAuthError(inviteResult.error.message) };
    }

    revalidatePath("/dashboard/admin");
    return {
      status: "success",
      message: `Convite reenviado para ${targetUserResult.data.email}.`
    };
  }

  const resetResult = await admin.auth.resetPasswordForEmail(targetUserResult.data.email, {
    ...(origin ? { redirectTo: `${origin}/login` } : {})
  });

  if (resetResult.error) {
    return { status: "error", message: resetResult.error.message };
  }

  revalidatePath("/dashboard/admin");

  return {
    status: "success",
    message: `Redefinicao de senha iniciada para ${targetUserResult.data.email}.`
  };
}

export async function promoteInstitutionTrainee(
  _previousState: UserOnboardingState,
  formData: FormData
): Promise<UserOnboardingState> {
  const context = await requireInstitutionAdminContext();
  if ("error" in context) return context.error;
  const { profile } = context;

  const userId = String(formData.get("managed_user_id") ?? "").trim();
  if (!userId) {
    return { status: "error", message: "Usuario alvo nao informado." };
  }

  const admin = createAdminClient();
  const targetUserResult = await admin
    .from("user_profiles")
    .select("id, email, institution_id")
    .eq("id", userId)
    .maybeSingle();

  if (targetUserResult.error || !targetUserResult.data) {
    return { status: "error", message: "Usuario nao encontrado para esta instituicao." };
  }

  if (targetUserResult.data.institution_id !== profile.institution_id) {
    return { status: "error", message: "Nao e permitido promover usuarios de outra instituicao." };
  }

  const authUserResult = await admin.auth.admin.getUserById(userId);
  if (authUserResult.error || !authUserResult.data.user) {
    return {
      status: "error",
      message: authUserResult.error?.message ?? "Nao foi possivel carregar o usuario autenticado."
    };
  }

  const existingMetadata = authUserResult.data.user.user_metadata ?? {};
  const currentRole = resolveManagedRole(
    "trainee",
    String(existingMetadata.training_year ?? "").trim() || null
  );

  const nextTrainingYear =
    currentRole === "trainee_me1" ? "ME2" : currentRole === "trainee_me2" ? "ME3" : null;

  if (!nextTrainingYear) {
    return { status: "error", message: "Este trainee ja esta no ultimo ano disponivel." };
  }

  const nextRole = resolveManagedRole("trainee", nextTrainingYear);
  const updateResult = await admin.auth.admin.updateUserById(userId, {
    user_metadata: {
      ...existingMetadata,
      role: nextRole,
      training_year: nextTrainingYear,
      institution_id: profile.institution_id,
      institution_name: profile.institution_name
    },
    app_metadata: {
      ...(authUserResult.data.user.app_metadata ?? {}),
      role: nextRole
    }
  });

  if (updateResult.error) {
    return { status: "error", message: updateResult.error.message };
  }

  const syncResult = await admin.rpc("sync_auth_user_row", {
    target_user_id: userId
  });

  if (syncResult.error) {
    return {
      status: "error",
      message: `Usuario promovido no Auth, mas o sync relacional falhou: ${syncResult.error.message}`
    };
  }

  revalidatePath("/dashboard/admin");

  return {
    status: "success",
    message: `Usuario ${targetUserResult.data.email} promovido para ${nextTrainingYear}.`
  };
}
