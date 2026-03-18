"use server";

import { revalidatePath } from "next/cache";

import { createServerClient } from "@/lib/supabase/server";
import { requireModuleAccess } from "@/services/auth/require-module-access";
import {
  fetchExamById,
  fetchExamQuestionLinks,
  fetchQuestionById,
  fetchQuestionOptions
} from "@/services/db/modules";

async function getSupabaseOrThrow() {
  const supabase = await createServerClient();
  return supabase;
}

export async function completeLessonProgressAction(_prevState: unknown, formData: FormData) {
  const profile = await requireModuleAccess("tracks", { allowedScopes: ["trainee"] });
  const lessonId = String(formData.get("lesson_id") ?? "");
  const moduleId = String(formData.get("module_id") ?? "");
  const nextPath = String(formData.get("next_path") ?? "");

  if (!lessonId || !moduleId) {
    return { ok: false, message: "Lição inválida." };
  }

  const supabase = await getSupabaseOrThrow();

  const { data: lessonProgress, error: lessonError } = await supabase
    .from("trainee_lesson_progress")
    .upsert(
      {
        trainee_user_id: profile.id,
        lesson_id: lessonId,
        status: "completed",
        completed_at: new Date().toISOString(),
        attempts_count: 1
      },
      { onConflict: "trainee_user_id,lesson_id" }
    )
    .select("*")
    .maybeSingle();

  if (lessonError) {
    return { ok: false, message: lessonError.message };
  }

  const { count: totalLessons } = await supabase
    .from("learning_lessons")
    .select("id", { count: "exact", head: true })
    .eq("learning_module_id", moduleId);

  const { count: completedLessons } = await supabase
    .from("trainee_lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("trainee_user_id", profile.id)
    .eq("status", "completed")
    .in(
      "lesson_id",
      (
        (
          await supabase
            .from("learning_lessons")
            .select("id")
            .eq("learning_module_id", moduleId)
        ).data ?? []
      ).map((item) => item.id)
    );

  const percent =
    totalLessons && totalLessons > 0 ? Math.min(100, Math.round(((completedLessons ?? 0) / totalLessons) * 100)) : 0;

  const { error: moduleError } = await supabase.from("trainee_module_progress").upsert(
    {
      trainee_user_id: profile.id,
      module_id: moduleId,
      status: percent >= 100 ? "completed" : "in_progress",
      completion_percent: percent,
      mastery_level: lessonProgress?.score_percent ?? null
    },
    { onConflict: "trainee_user_id,module_id" }
  );

  if (moduleError) {
    return { ok: false, message: moduleError.message };
  }

  revalidatePath("/trilhas");
  revalidatePath(nextPath || "/trilhas");

  return {
    ok: true,
    message: percent >= 100 ? "Lição concluída e módulo atualizado." : "Progresso registrado.",
    nextPath
  };
}

export async function submitQuestionPracticeAction(_prevState: unknown, formData: FormData) {
  const profile = await requireModuleAccess("question-bank", { allowedScopes: ["trainee"] });
  const questionId = String(formData.get("question_id") ?? "");
  const selectedOptionId = String(formData.get("selected_option_id") ?? "");
  const responseTimeSeconds = Number(formData.get("response_time_seconds") ?? 0) || null;

  if (!questionId || !selectedOptionId) {
    return { ok: false, message: "Selecione uma alternativa antes de enviar." };
  }

  const [question, options] = await Promise.all([
    fetchQuestionById(questionId, profile.institution_id),
    fetchQuestionOptions(questionId)
  ]);

  if (!question) {
    return { ok: false, message: "Questão não encontrada." };
  }

  const correctOptionIds = options.filter((option) => option.is_correct).map((option) => option.id);
  const isCorrect = correctOptionIds.includes(selectedOptionId) && correctOptionIds.length === 1;
  const selectedOption = options.find((option) => option.id === selectedOptionId);

  const supabase = await getSupabaseOrThrow();

  const { error: attemptError } = await supabase.from("trainee_question_attempts").insert({
    trainee_user_id: profile.id,
    question_id: questionId,
    selected_option_ids: [selectedOptionId],
    is_correct: isCorrect,
    response_time_seconds: responseTimeSeconds,
    mode: "practice"
  });

  if (attemptError) {
    return { ok: false, message: attemptError.message };
  }

  if (!isCorrect) {
    const now = new Date().toISOString();
    const { data: existing } = await supabase
      .from("trainee_error_notebook")
      .select("*")
      .eq("trainee_user_id", profile.id)
      .eq("question_id", questionId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("trainee_error_notebook")
        .update({
          last_wrong_at: now,
          times_wrong: (existing.times_wrong ?? 0) + 1,
          resolved: false
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("trainee_error_notebook").insert({
        trainee_user_id: profile.id,
        question_id: questionId,
        first_wrong_at: now,
        last_wrong_at: now,
        times_wrong: 1,
        resolved: false
      });
    }
  } else {
    await supabase
      .from("trainee_error_notebook")
      .update({ resolved: true })
      .eq("trainee_user_id", profile.id)
      .eq("question_id", questionId);
  }

  revalidatePath("/question-bank");
  revalidatePath("/question-bank/errors");
  revalidatePath(`/question-bank/question/${questionId}`);

  return {
    ok: true,
    isCorrect,
    selectedOptionId,
    correctOptionIds,
    feedback:
      selectedOption?.explanation ??
      (isCorrect
        ? "Resposta correta. Continue para consolidar o raciocínio."
        : "Resposta incorreta. Revise a explicação e o racional clínico."),
    rationale: question.rationale ?? null
  };
}

export async function submitExamAttemptAction(_prevState: unknown, formData: FormData) {
  const profile = await requireModuleAccess("exam-take", { allowedScopes: ["trainee"] });
  const examId = String(formData.get("exam_id") ?? "");
  const answersPayload = String(formData.get("answers_json") ?? "{}");

  if (!examId) {
    return { ok: false, message: "Prova inválida." };
  }

  let answersByQuestion: Record<string, string> = {};
  try {
    answersByQuestion = JSON.parse(answersPayload) as Record<string, string>;
  } catch {
    return { ok: false, message: "Respostas inválidas." };
  }

  const exam = await fetchExamById(examId, profile.institution_id);
  if (!exam) {
    return { ok: false, message: "Prova não encontrada." };
  }

  const links = await fetchExamQuestionLinks(exam.id);
  if (!links.length) {
    return { ok: false, message: "Esta prova ainda não possui questões vinculadas." };
  }

  const supabase = await getSupabaseOrThrow();
  const attemptInsert = await supabase
    .from("exam_attempts")
    .insert({
      exam_id: exam.id,
      trainee_user_id: profile.id,
      started_at: new Date().toISOString(),
      submitted_at: new Date().toISOString(),
      status: "graded"
    })
    .select("*")
    .single();

  if (attemptInsert.error || !attemptInsert.data) {
    return { ok: false, message: attemptInsert.error?.message ?? "Falha ao criar tentativa." };
  }

  const attempt = attemptInsert.data;
  const answersToInsert: Array<{
    exam_attempt_id: string;
    question_id: string;
    selected_option_ids: string[];
    is_correct: boolean;
    points_awarded: number;
  }> = [];

  const topicAccumulator = new Map<string, { correct: number; total: number }>();

  for (const link of links) {
    const [question, options] = await Promise.all([
      fetchQuestionById(link.question_id, profile.institution_id),
      fetchQuestionOptions(link.question_id)
    ]);

    const selectedOptionId = answersByQuestion[link.question_id];
    const correctOptionIds = options.filter((option) => option.is_correct).map((option) => option.id);
    const isCorrect = Boolean(
      selectedOptionId &&
        correctOptionIds.length === 1 &&
        correctOptionIds[0] === selectedOptionId
    );

    answersToInsert.push({
      exam_attempt_id: attempt.id,
      question_id: link.question_id,
      selected_option_ids: selectedOptionId ? [selectedOptionId] : [],
      is_correct: isCorrect,
      points_awarded: isCorrect ? Number(link.points ?? 1) : 0
    });

    if (question?.curriculum_topic_id) {
      const current = topicAccumulator.get(question.curriculum_topic_id) ?? { correct: 0, total: 0 };
      current.total += 1;
      if (isCorrect) {
        current.correct += 1;
      }
      topicAccumulator.set(question.curriculum_topic_id, current);
    }
  }

  const rawScore = answersToInsert.reduce((sum, item) => sum + Number(item.points_awarded ?? 0), 0);
  const percentScore = Number(((answersToInsert.filter((item) => item.is_correct).length / links.length) * 100).toFixed(2));

  const { error: answerError } = await supabase.from("exam_answers").insert(
    answersToInsert.map((answer) => ({
      ...answer,
      answered_at: new Date().toISOString()
    }))
  );

  if (answerError) {
    return { ok: false, message: answerError.message };
  }

  const domains = Array.from(topicAccumulator.entries()).map(([topicId, summary]) => ({
    exam_attempt_id: attempt.id,
    curriculum_topic_id: topicId,
    score_percent: summary.total > 0 ? Number(((summary.correct / summary.total) * 100).toFixed(2)) : 0,
    correct_count: summary.correct,
    total_count: summary.total
  }));

  if (domains.length) {
    const { error: domainError } = await supabase.from("exam_result_domains").insert(domains);
    if (domainError) {
      return { ok: false, message: domainError.message };
    }
  }

  const { error: updateError } = await supabase
    .from("exam_attempts")
    .update({
      raw_score: rawScore,
      percent_score: percentScore,
      submitted_at: new Date().toISOString(),
      status: "graded"
    })
    .eq("id", attempt.id);

  if (updateError) {
    return { ok: false, message: updateError.message };
  }

  revalidatePath("/exams");
  revalidatePath(`/exams/${exam.id}`);
  revalidatePath(`/exams/result/${attempt.id}`);

  return {
    ok: true,
    attemptId: attempt.id,
    scorePercent: percentScore
  };
}
