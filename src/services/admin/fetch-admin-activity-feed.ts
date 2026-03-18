import { createServerClient } from "@/lib/supabase/server";

export interface AdminActivityItem {
  id: string;
  occurredAt: string;
  actorName: string;
  actorId: string;
  category: "study" | "question" | "exam" | "logbook" | "validation" | "emergency";
  title: string;
  detail: string;
  tone: "neutral" | "positive" | "warning";
}

function formatQuestionLabel(title?: string | null, stem?: string | null) {
  if (title?.trim()) {
    return title.trim();
  }

  if (stem?.trim()) {
    return `${stem.trim().slice(0, 72)}${stem.trim().length > 72 ? "..." : ""}`;
  }

  return "Questão";
}

export async function fetchAdminActivityFeed(institutionId: string, limit = 24): Promise<AdminActivityItem[]> {
  const supabase = await createServerClient();

  const { data: profileRows } = await supabase
    .from("user_profiles")
    .select("id, full_name")
    .eq("institution_id", institutionId);

  const actorNameById = new Map((profileRows ?? []).map((profile) => [profile.id, profile.full_name ?? "Usuário"]));
  const institutionUserIds = Array.from(actorNameById.keys());

  if (!institutionUserIds.length) {
    return [];
  }

  const [
    lessonProgressResult,
    questionAttemptsResult,
    examAttemptsResult,
    procedureLogsResult,
    emergencyAttemptsResult
  ] = await Promise.all([
    supabase
      .from("trainee_lesson_progress")
      .select("id, trainee_user_id, lesson_id, status, updated_at")
      .in("trainee_user_id", institutionUserIds)
      .order("updated_at", { ascending: false })
      .limit(limit),
    supabase
      .from("trainee_question_attempts")
      .select("id, trainee_user_id, question_id, is_correct, attempted_at")
      .in("trainee_user_id", institutionUserIds)
      .order("attempted_at", { ascending: false })
      .limit(limit),
    supabase
      .from("exam_attempts")
      .select("id, exam_id, trainee_user_id, status, percent_score, started_at, submitted_at")
      .in("trainee_user_id", institutionUserIds)
      .order("started_at", { ascending: false })
      .limit(limit),
    supabase
      .from("procedure_logs")
      .select("id, trainee_user_id, procedure_catalog_id, performed_on")
      .eq("institution_id", institutionId)
      .order("performed_on", { ascending: false })
      .limit(limit),
    supabase
      .from("emergency_attempts")
      .select("id, trainee_user_id, scenario_id, completion_status, score_percent, completed_at, created_at")
      .in("trainee_user_id", institutionUserIds)
      .order("created_at", { ascending: false })
      .limit(limit)
  ]);

  const lessonRows = lessonProgressResult.data ?? [];
  const questionRows = questionAttemptsResult.data ?? [];
  const examRows = examAttemptsResult.data ?? [];
  const procedureRows = procedureLogsResult.data ?? [];
  const emergencyRows = emergencyAttemptsResult.data ?? [];

  const [lessonMapRows, questionMapRows, examMapRows, procedureMapRows, emergencyMapRows, validationRows] = await Promise.all([
    lessonRows.length
      ? supabase.from("learning_lessons").select("id, title").in("id", lessonRows.map((row) => row.lesson_id))
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
    questionRows.length
      ? supabase.from("question_bank").select("id, title, stem").in("id", questionRows.map((row) => row.question_id))
      : Promise.resolve({ data: [] as { id: string; title?: string | null; stem: string }[] }),
    examRows.length
      ? supabase.from("exams").select("id, title").in("id", examRows.map((row) => row.exam_id))
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
    procedureRows.length
      ? supabase.from("procedure_catalog").select("id, name").in("id", procedureRows.map((row) => row.procedure_catalog_id).filter(Boolean))
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    emergencyRows.length
      ? supabase.from("emergency_scenarios").select("id, title").in("id", emergencyRows.map((row) => row.scenario_id))
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
    procedureRows.length
      ? supabase
          .from("procedure_validations")
          .select("id, procedure_log_id, validation_status, validated_at")
          .in("procedure_log_id", procedureRows.map((row) => row.id))
          .order("validated_at", { ascending: false })
          .limit(limit)
      : Promise.resolve({ data: [] as { id: string; procedure_log_id: string; validation_status: string; validated_at?: string | null }[] })
  ]);

  const lessonTitleById = new Map((lessonMapRows.data ?? []).map((row) => [row.id, row.title]));
  const questionLabelById = new Map(
    (questionMapRows.data ?? []).map((row) => [row.id, formatQuestionLabel(row.title, row.stem)])
  );
  const examTitleById = new Map((examMapRows.data ?? []).map((row) => [row.id, row.title]));
  const procedureNameById = new Map((procedureMapRows.data ?? []).map((row) => [row.id, row.name]));
  const emergencyTitleById = new Map((emergencyMapRows.data ?? []).map((row) => [row.id, row.title]));
  const procedureById = new Map(procedureRows.map((row) => [row.id, row]));

  const activities: AdminActivityItem[] = [
    ...lessonRows.map((row) => ({
      id: `lesson-${row.id}`,
      occurredAt: row.updated_at,
      actorId: row.trainee_user_id,
      actorName: actorNameById.get(row.trainee_user_id) ?? "Usuário",
      category: "study" as const,
      title: lessonTitleById.get(row.lesson_id) ?? "Lição",
      detail: `Atualizou o progresso da lição para ${row.status}.`,
      tone: row.status === "completed" ? ("positive" as const) : ("neutral" as const)
    })),
    ...questionRows.map((row) => ({
      id: `question-${row.id}`,
      occurredAt: row.attempted_at,
      actorId: row.trainee_user_id,
      actorName: actorNameById.get(row.trainee_user_id) ?? "Usuário",
      category: "question" as const,
      title: questionLabelById.get(row.question_id) ?? "Questão",
      detail: row.is_correct ? "Resolveu corretamente uma questão." : "Errou uma questão e alimentou a trilha de revisão.",
      tone: row.is_correct ? ("positive" as const) : ("warning" as const)
    })),
    ...examRows.map((row) => ({
      id: `exam-${row.id}`,
      occurredAt: row.submitted_at ?? row.started_at ?? new Date().toISOString(),
      actorId: row.trainee_user_id,
      actorName: actorNameById.get(row.trainee_user_id) ?? "Usuário",
      category: "exam" as const,
      title: examTitleById.get(row.exam_id) ?? "Prova",
      detail:
        typeof row.percent_score === "number"
          ? `Finalizou a prova com ${Math.round(row.percent_score)}%.`
          : `Atualizou a tentativa para ${row.status}.`,
      tone:
        typeof row.percent_score === "number" && row.percent_score >= 70
          ? ("positive" as const)
          : ("neutral" as const)
    })),
    ...procedureRows.map((row) => ({
      id: `procedure-${row.id}`,
      occurredAt: row.performed_on,
      actorId: row.trainee_user_id,
      actorName: actorNameById.get(row.trainee_user_id) ?? "Usuário",
      category: "logbook" as const,
      title: procedureNameById.get(row.procedure_catalog_id ?? "") ?? "Procedimento",
      detail: "Registrou um procedimento no logbook.",
      tone: "neutral" as const
    })),
    ...emergencyRows.map((row) => ({
      id: `emergency-${row.id}`,
      occurredAt: row.completed_at ?? row.created_at,
      actorId: row.trainee_user_id,
      actorName: actorNameById.get(row.trainee_user_id) ?? "Usuário",
      category: "emergency" as const,
      title: emergencyTitleById.get(row.scenario_id) ?? "Emergência",
      detail:
        typeof row.score_percent === "number"
          ? `Concluiu o cenário com ${Math.round(row.score_percent)}%.`
          : `Atualizou a tentativa para ${row.completion_status}.`,
      tone: row.completion_status === "completed" ? ("positive" as const) : ("neutral" as const)
    })),
    ...(validationRows.data ?? []).flatMap((row) => {
      const procedure = procedureById.get(row.procedure_log_id);
      if (!procedure) {
        return [];
      }

      return [
        {
          id: `validation-${row.id}`,
          occurredAt: row.validated_at ?? procedure.performed_on,
          actorId: procedure.trainee_user_id,
          actorName: actorNameById.get(procedure.trainee_user_id) ?? "Usuário",
          category: "validation" as const,
          title: procedureNameById.get(procedure.procedure_catalog_id ?? "") ?? "Validação clínica",
          detail: `Recebeu uma validação com status ${row.validation_status}.`,
          tone:
            row.validation_status === "approved"
              ? ("positive" as const)
              : row.validation_status === "rejected"
              ? ("warning" as const)
              : ("neutral" as const)
        }
      ];
    })
  ];

  return activities
    .sort((left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime())
    .slice(0, limit);
}
