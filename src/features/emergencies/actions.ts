"use server";

import { revalidatePath } from "next/cache";

import { createServerClient } from "@/lib/supabase/server";
import { requireModuleAccess } from "@/services/auth/require-module-access";
import { fetchEmergencyAttemptActions, fetchEmergencyAttemptById, fetchEmergencyScenarioById, fetchEmergencyScenarioSteps } from "@/services/db/modules";

async function getSupabaseOrThrow() {
  return createServerClient();
}

function buildScenarioFeedback(
  stepPrompt: string,
  isExpectedAction: boolean,
  optionLabel?: string
) {
  if (isExpectedAction) {
    return `Conduta alinhada ao cenário. A ação “${optionLabel ?? "selecionada"}” respeita a prioridade desta etapa: ${stepPrompt}`;
  }

  return `Conduta registrada, mas fora da opção esperada para esta etapa. Reavalie a prioridade clínica em: ${stepPrompt}`;
}

export async function startEmergencyAttemptAction(input: {
  scenarioId: string;
  confidenceBefore: number;
}) {
  const profile = await requireModuleAccess("emergencies-run", { allowedScopes: ["trainee"] });
  const supabase = await getSupabaseOrThrow();

  const scenario = await fetchEmergencyScenarioById(input.scenarioId, profile.institution_id);
  if (!scenario) {
    return { ok: false, message: "Cenário não encontrado." };
  }

  const inserted = await supabase
    .from("emergency_attempts")
    .insert({
      trainee_user_id: profile.id,
      scenario_id: scenario.id,
      started_at: new Date().toISOString(),
      completion_status: "in_progress"
    })
    .select("*")
    .single();

  if (inserted.error || !inserted.data) {
    return { ok: false, message: inserted.error?.message ?? "Falha ao iniciar cenário." };
  }

  const attempt = inserted.data;
  const assessmentInsert = await supabase.from("emergency_self_assessments").insert({
    trainee_user_id: profile.id,
    scenario_id: scenario.id,
    emergency_attempt_id: attempt.id,
    confidence_before: input.confidenceBefore
  });

  if (assessmentInsert.error) {
    return { ok: false, message: assessmentInsert.error.message };
  }

  revalidatePath("/emergencies");

  return {
    ok: true,
    attemptId: attempt.id,
    message: "Simulação iniciada."
  };
}

export async function submitEmergencyStepAction(input: {
  attemptId: string;
  scenarioId: string;
  stepId: string;
  selectedKey: string;
  optionLabel?: string;
}) {
  const profile = await requireModuleAccess("emergencies-run", { allowedScopes: ["trainee"] });
  const supabase = await getSupabaseOrThrow();

  const [attempt, steps] = await Promise.all([
    fetchEmergencyAttemptById(input.attemptId, profile.id, "trainee"),
    fetchEmergencyScenarioSteps(input.scenarioId)
  ]);

  if (!attempt) {
    return { ok: false, message: "Tentativa não encontrada." };
  }

  const step = steps.find((item) => item.id === input.stepId);
  if (!step) {
    return { ok: false, message: "Etapa inválida." };
  }

  const existingActions = await fetchEmergencyAttemptActions(attempt.id);
  if (existingActions.some((action) => action.scenario_step_id === step.id)) {
    return {
      ok: true,
      isExpectedAction: existingActions.find((action) => action.scenario_step_id === step.id)?.is_expected_action ?? false,
      feedback: "Esta etapa já foi registrada.",
      recordedCount: existingActions.length
    };
  }

  const isExpectedAction = step.correct_branch_key === input.selectedKey;
  const inserted = await supabase.from("emergency_attempt_actions").insert({
    emergency_attempt_id: attempt.id,
    scenario_step_id: step.id,
    action_payload: {
      selected_key: input.selectedKey,
      selected_label: input.optionLabel ?? null
    },
    is_expected_action: isExpectedAction
  });

  if (inserted.error) {
    return { ok: false, message: inserted.error.message };
  }

  return {
    ok: true,
    isExpectedAction,
    feedback: buildScenarioFeedback(step.prompt_text, isExpectedAction, input.optionLabel),
    recordedCount: existingActions.length + 1
  };
}

export async function finalizeEmergencyAttemptAction(input: {
  attemptId: string;
  scenarioId: string;
  confidenceAfter: number;
  perceivedReadiness: string;
  reflectionText?: string;
}) {
  const profile = await requireModuleAccess("emergencies-run", { allowedScopes: ["trainee"] });
  const supabase = await getSupabaseOrThrow();

  const [attempt, scenario, steps, actions] = await Promise.all([
    fetchEmergencyAttemptById(input.attemptId, profile.id, "trainee"),
    fetchEmergencyScenarioById(input.scenarioId, profile.institution_id),
    fetchEmergencyScenarioSteps(input.scenarioId),
    fetchEmergencyAttemptActions(input.attemptId)
  ]);

  if (!attempt || !scenario) {
    return { ok: false, message: "Tentativa inválida." };
  }

  const totalSteps = steps.length || 1;
  const expectedHits = actions.filter((action) => action.is_expected_action).length;
  const scorePercent = Math.round((expectedHits / totalSteps) * 100);
  const missedPrompts = steps
    .filter((step) => !actions.some((action) => action.scenario_step_id === step.id && action.is_expected_action))
    .slice(0, 2)
    .map((step) => step.prompt_text);

  const debriefSummary =
    scorePercent >= 80
      ? `Boa condução do cenário ${scenario.title}. Mantenha a mesma lógica de priorização e documentação.`
      : `Cenário ${scenario.title} concluído com pontos de atenção em ${missedPrompts.join(" e ") || "etapas críticas"}.`;

  const attemptUpdate = await supabase
    .from("emergency_attempts")
    .update({
      completed_at: new Date().toISOString(),
      score_percent: scorePercent,
      completion_status: "completed",
      debrief_summary: debriefSummary
    })
    .eq("id", attempt.id);

  if (attemptUpdate.error) {
    return { ok: false, message: attemptUpdate.error.message };
  }

  const selfAssessmentUpdate = await supabase
    .from("emergency_self_assessments")
    .update({
      confidence_after: input.confidenceAfter,
      perceived_readiness: input.perceivedReadiness,
      reflection_text: input.reflectionText?.trim() || null
    })
    .eq("emergency_attempt_id", attempt.id);

  if (selfAssessmentUpdate.error) {
    return { ok: false, message: selfAssessmentUpdate.error.message };
  }

  revalidatePath("/emergencies");
  revalidatePath(`/emergencies/${scenario.id}`);
  revalidatePath(`/emergencies/result/${attempt.id}`);
  revalidatePath("/emergencies/self-assessment");
  revalidatePath("/dashboard/trainee");

  return {
    ok: true,
    attemptId: attempt.id,
    scorePercent,
    debriefSummary
  };
}
