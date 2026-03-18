"use server";

import { revalidatePath } from "next/cache";

import { createServerClient } from "@/lib/supabase/server";
import { isAdminRole } from "@/services/auth/require-module-access";
import { requireModuleAccess } from "@/services/auth/require-module-access";
import { fetchInstitutionReviewers, fetchProcedureLogById } from "@/services/db/modules";
import type { ProcedurePerformanceLevel, ValidationStatus } from "@/types/database";

type LogbookActionState = {
  ok: boolean;
  message: string;
  logId?: string;
  validationId?: string;
};

async function getSupabaseOrThrow() {
  return createServerClient();
}

export async function createProcedureLogAction(
  _prevState: LogbookActionState,
  formData: FormData
): Promise<LogbookActionState> {
  const profile = await requireModuleAccess("logbook", { allowedScopes: ["trainee"] });
  const supabase = await getSupabaseOrThrow();

  const performedOn = String(formData.get("performed_on") ?? "");
  const unitId = String(formData.get("unit_id") ?? "");
  const surgeryId = String(formData.get("surgery_catalog_id") ?? "");
  const procedureId = String(formData.get("procedure_catalog_id") ?? "");
  const reviewerId = String(formData.get("reviewer_user_id") ?? "");
  const technique = String(formData.get("anesthesia_technique_summary") ?? "").trim();
  const patientSummary = String(formData.get("patient_profile_summary") ?? "").trim();
  const traineeRole = String(formData.get("trainee_role") ?? "");
  const difficulty = String(formData.get("difficulty_perceived") ?? "");
  const successStatus = String(formData.get("success_status") ?? "");
  const complications = String(formData.get("complications_summary") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const confidenceLevel = Number(formData.get("confidence_level") ?? 0);
  const readinessLevel = String(formData.get("readiness_level") ?? "");
  const reflectionText = String(formData.get("reflection_text") ?? "").trim();

  if (!profile.institution_id || !profile.training_year) {
    return { ok: false, message: "Perfil do trainee sem instituição ou ano configurados." };
  }

  if (!performedOn || !unitId || !surgeryId || !procedureId || !traineeRole || !successStatus) {
    return { ok: false, message: "Preencha os campos obrigatórios do registro." };
  }

  const validReviewers = await fetchInstitutionReviewers(profile.institution_id);
  const selectedReviewer = reviewerId ? validReviewers.find((reviewer) => reviewer.id === reviewerId) : null;
  if (reviewerId && !selectedReviewer) {
    return { ok: false, message: "Preceptor avaliador inválido para esta instituição." };
  }

  const insertedLog = await supabase
    .from("procedure_logs")
    .insert({
      institution_id: profile.institution_id,
      trainee_user_id: profile.id,
      preceptor_user_id: selectedReviewer?.id ?? null,
      unit_id: unitId,
      surgery_catalog_id: surgeryId,
      procedure_catalog_id: procedureId,
      performed_on: performedOn,
      trainee_year_snapshot: profile.training_year,
      trainee_role: traineeRole,
      anesthesia_technique_summary: technique || null,
      patient_profile_summary: patientSummary || null,
      difficulty_perceived: difficulty || null,
      success_status: successStatus,
      complications_summary: complications || null,
      notes: notes || null
    })
    .select("*")
    .single();

  if (insertedLog.error || !insertedLog.data) {
    return { ok: false, message: insertedLog.error?.message ?? "Falha ao registrar o procedimento." };
  }

  const log = insertedLog.data;

  const itemInsert = await supabase.from("procedure_log_items").insert({
    procedure_log_id: log.id,
    procedure_catalog_id: procedureId,
    quantity: 1,
    success_status: successStatus,
    notes: technique || notes || null
  });

  if (itemInsert.error) {
    return { ok: false, message: itemInsert.error.message, logId: log.id };
  }

  const selfAssessmentInsert = await supabase.from("procedure_self_assessments").upsert(
    {
      procedure_log_id: log.id,
      confidence_level: confidenceLevel || 3,
      readiness_level: readinessLevel || "ready_with_close_supervision",
      reflection_text: reflectionText || null
    },
    { onConflict: "procedure_log_id" }
  );

  if (selfAssessmentInsert.error) {
    return { ok: false, message: selfAssessmentInsert.error.message, logId: log.id };
  }

  if (selectedReviewer) {
    const validationInsert = await supabase.from("procedure_validations").insert({
      procedure_log_id: log.id,
      validator_user_id: selectedReviewer.id,
      validation_status: "pending"
    });

    if (validationInsert.error) {
      return { ok: false, message: validationInsert.error.message, logId: log.id };
    }
  }

  revalidatePath("/logbook");
  revalidatePath("/logbook/new");
  revalidatePath(`/logbook/${log.id}`);
  revalidatePath("/dashboard/trainee");
  revalidatePath("/dashboard/preceptor");

  return {
    ok: true,
    message: "Procedimento registrado e enviado para acompanhamento.",
    logId: log.id
  };
}

export async function reviewProcedureValidationAction(
  _prevState: LogbookActionState,
  formData: FormData
): Promise<LogbookActionState> {
  const profile = await requireModuleAccess("logbook-review");
  const supabase = await getSupabaseOrThrow();

  const validationId = String(formData.get("validation_id") ?? "");
  const nextStatus = String(formData.get("validation_status") ?? "") as ValidationStatus;
  const feedback = String(formData.get("feedback") ?? "").trim();
  const performanceLevel = String(formData.get("performance_level") ?? "") as ProcedurePerformanceLevel;

  if (!validationId || !nextStatus) {
    return { ok: false, message: "Validação inválida." };
  }

  const validationQuery = await supabase
    .from("procedure_validations")
    .select("*")
    .eq("id", validationId)
    .maybeSingle();
  const validation = validationQuery.data;
  if (validationQuery.error || !validation) {
    return { ok: false, message: "Validação não encontrada." };
  }

  const log = await fetchProcedureLogById(validation.procedure_log_id, { institutionId: profile.institution_id });
  if (!log) {
    return { ok: false, message: "Registro relacionado não encontrado." };
  }

  if (!isAdminRole(profile.role) && validation.validator_user_id !== profile.id) {
    return { ok: false, message: "Você não pode revisar esta validação." };
  }

  const updatePayload = {
    validation_status: nextStatus,
    feedback: feedback || null,
    performance_level: performanceLevel || null,
    validated_at: new Date().toISOString()
  };

  const update = await supabase.from("procedure_validations").update(updatePayload).eq("id", validationId);
  if (update.error) {
    return { ok: false, message: update.error.message };
  }

  if (!log.preceptor_user_id || log.preceptor_user_id !== validation.validator_user_id) {
    await supabase
      .from("procedure_logs")
      .update({ preceptor_user_id: validation.validator_user_id })
      .eq("id", log.id);
  }

  revalidatePath("/logbook");
  revalidatePath("/logbook/validations");
  revalidatePath("/logbook/stats");
  revalidatePath(`/logbook/${log.id}`);
  revalidatePath("/dashboard/preceptor");

  return {
    ok: true,
    message: nextStatus === "approved" ? "Procedimento validado." : "Validação atualizada.",
    validationId,
    logId: log.id
  };
}
