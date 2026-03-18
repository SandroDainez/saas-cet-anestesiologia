import { createServerClient } from "@/lib/supabase/server";

import type { Exam } from "@/types/database";

export function describeExamRefreshPolicy(exam: Pick<
  Exam,
  "exam_type" | "refresh_cadence" | "refresh_scope" | "refresh_on_completion" | "next_refresh_at"
>) {
  if (exam.exam_type === "quarterly") {
    return {
      label: "Atualização semanal",
      detail: exam.next_refresh_at
        ? `Prova formal trimestral com refresh global semanal até ${new Date(exam.next_refresh_at).toLocaleDateString("pt-BR")}.`
        : "Prova formal trimestral com refresh global semanal."
    };
  }

  if (exam.exam_type === "annual") {
    return {
      label: "Atualização mensal",
      detail: exam.next_refresh_at
        ? `Prova formal anual com refresh global mensal até ${new Date(exam.next_refresh_at).toLocaleDateString("pt-BR")}.`
        : "Prova formal anual com refresh global mensal."
    };
  }

  if (exam.exam_type === "training_short") {
    return {
      label: "Atualiza ao concluir",
      detail:
        exam.refresh_scope === "per_user" || exam.refresh_on_completion
          ? "Treino livre renovado imediatamente só para o usuário que concluir."
          : "Treino curto com refresh individual por conclusão."
    };
  }

  return {
    label: "Cadência editorial",
    detail: "Atualização controlada pelo calendário editorial."
  };
}

export async function queueTrainingExamRefreshForUser(input: {
  institutionId: string;
  traineeUserId: string;
  examId: string;
  examTitle: string;
  attemptId: string;
}) {
  const supabase = await createServerClient();

  const { error } = await supabase.from("user_content_refresh_jobs").insert({
    institution_id: input.institutionId,
    trainee_user_id: input.traineeUserId,
    trigger_reason: "training_exam_completed",
    status: "completed",
    payload_jsonb: {
      source: "training_exam",
      exam_id: input.examId,
      exam_title: input.examTitle,
      attempt_id: input.attemptId,
      refresh_scope: "per_user",
      refresh_cadence: "on_completion"
    },
    requested_at: new Date().toISOString(),
    completed_at: new Date().toISOString()
  });

  if (error) {
    throw new Error(error.message);
  }
}
