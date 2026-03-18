"use server";

import { revalidatePath } from "next/cache";

import { requireModuleAccess } from "@/services/auth/require-module-access";
import { completeStudyGoal, generateStudyGoalForUser } from "@/services/study-goals/study-goals";

export async function generateInitialStudyGoalAction() {
  const profile = await requireModuleAccess("tracks", { allowedScopes: ["trainee"] });

  const result = await generateStudyGoalForUser({
    traineeUserId: profile.id,
    institutionId: profile.institution_id,
    triggerReason: "scheduled_daily"
  });

  revalidatePath("/dashboard/trainee");
  revalidatePath("/reports");

  return {
    ok: true,
    goalId: result.goal.id,
    refreshSequence: result.goal.refresh_sequence
  };
}

export async function completeStudyGoalAction(_prevState: unknown, formData: FormData) {
  const profile = await requireModuleAccess("tracks", { allowedScopes: ["trainee"] });
  const goalId = String(formData.get("goal_id") ?? "");

  if (!goalId) {
    return { ok: false, message: "Meta inválida." };
  }

  try {
    const result = await completeStudyGoal(profile.id, goalId);

    revalidatePath("/dashboard/trainee");
    revalidatePath("/reports");
    revalidatePath("/trilhas");
    revalidatePath("/emergencies");

    return {
      ok: true,
      message: "Meta concluída e novo pacote gerado imediatamente.",
      completedGoalId: result.completedGoal.id,
      nextGoalId: result.nextGoal.goal.id,
      refreshSequence: result.nextGoal.goal.refresh_sequence
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Falha ao concluir a meta."
    };
  }
}
