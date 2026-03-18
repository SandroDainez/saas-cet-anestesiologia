import { createServerClient } from "@/lib/supabase/server";
import type {
  EmergencyScenario,
  LearningLesson,
  QuestionBankEntry,
  StudyGoal,
  StudyGoalItem,
  TraineeYearCode,
  UserContentRefreshJob
} from "@/types/database";

interface GoalGenerationInput {
  traineeUserId: string;
  institutionId: string;
  triggerReason: StudyGoal["source_reason"];
}

interface GoalPackage {
  goal: StudyGoal;
  items: StudyGoalItem[];
  refreshJob: UserContentRefreshJob;
}

async function fetchTraineeYear(supabase: Awaited<ReturnType<typeof createServerClient>>, traineeUserId: string) {
  const { data } = await supabase
    .from("trainee_profiles")
    .select("trainee_year")
    .eq("user_id", traineeUserId)
    .maybeSingle();

  return (data?.trainee_year ?? "ME1") as TraineeYearCode;
}

async function fetchCurriculumYearId(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  year: TraineeYearCode
) {
  const { data } = await supabase.from("curriculum_years").select("id").eq("code", year).maybeSingle();
  return data?.id ?? null;
}

async function selectNextLesson(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  traineeUserId: string,
  institutionId: string,
  trainingYear: TraineeYearCode
) {
  const yearId = await fetchCurriculumYearId(supabase, trainingYear);
  const { data: tracks } = await supabase
    .from("learning_tracks")
    .select("id")
    .or(`institution_id.is.null,institution_id.eq.${institutionId}`)
    .eq("curriculum_year_id", yearId)
    .eq("active", true);

  const trackIds = (tracks ?? []).map((track) => track.id);
  if (!trackIds.length) {
    return null;
  }

  const { data: modules } = await supabase
    .from("learning_modules")
    .select("id, learning_track_id")
    .in("learning_track_id", trackIds)
    .eq("active", true)
    .order("display_order", { ascending: true });

  const moduleIds = (modules ?? []).map((module) => module.id);
  if (!moduleIds.length) {
    return null;
  }

  const { data: lessons } = await supabase
    .from("learning_lessons")
    .select("*")
    .in("learning_module_id", moduleIds)
    .eq("active", true)
    .order("display_order", { ascending: true });

  const { data: lessonProgress } = await supabase
    .from("trainee_lesson_progress")
    .select("lesson_id, status, updated_at")
    .eq("trainee_user_id", traineeUserId)
    .in("lesson_id", (lessons ?? []).map((lesson) => lesson.id));

  const progressMap = new Map((lessonProgress ?? []).map((row) => [row.lesson_id, row]));
  const sortedLessons = ((lessons ?? []) as LearningLesson[]).slice().sort((left, right) => {
    const leftProgress = progressMap.get(left.id);
    const rightProgress = progressMap.get(right.id);

    if (!leftProgress && rightProgress) return -1;
    if (leftProgress && !rightProgress) return 1;
    if (!leftProgress && !rightProgress) return left.display_order - right.display_order;

    const leftWeight = leftProgress?.status === "completed" ? 2 : leftProgress?.status === "in_progress" ? 1 : 0;
    const rightWeight = rightProgress?.status === "completed" ? 2 : rightProgress?.status === "in_progress" ? 1 : 0;
    if (leftWeight !== rightWeight) {
      return leftWeight - rightWeight;
    }

    return new Date(leftProgress?.updated_at ?? 0).getTime() - new Date(rightProgress?.updated_at ?? 0).getTime();
  });

  const lesson = sortedLessons[0];
  if (!lesson) {
    return null;
  }

  return {
    lesson,
    moduleId: lesson.learning_module_id
  };
}

async function selectQuestionSet(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  traineeUserId: string,
  institutionId: string,
  trainingYear: TraineeYearCode
) {
  const yearId = await fetchCurriculumYearId(supabase, trainingYear);
  const { data: attempted } = await supabase
    .from("trainee_question_attempts")
    .select("question_id, attempted_at")
    .eq("trainee_user_id", traineeUserId)
    .order("attempted_at", { ascending: false })
    .limit(100);

  const attemptedIds = new Set((attempted ?? []).map((row) => row.question_id));

  const { data } = await supabase
    .from("question_bank")
    .select("*")
    .or(`institution_id.is.null,institution_id.eq.${institutionId}`)
    .eq("curriculum_year_id", yearId)
    .eq("active", true)
    .in("status", ["approved", "published"])
    .order("created_at", { ascending: false })
    .limit(20);

  const ordered = ((data ?? []) as QuestionBankEntry[]).sort((left, right) => {
    const leftSeen = attemptedIds.has(left.id) ? 1 : 0;
    const rightSeen = attemptedIds.has(right.id) ? 1 : 0;
    return leftSeen - rightSeen;
  });

  return ordered.slice(0, 4);
}

async function selectEmergencyScenario(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  traineeUserId: string,
  institutionId: string
) {
  const { data: attempts } = await supabase
    .from("emergency_attempts")
    .select("scenario_id, completed_at, created_at")
    .eq("trainee_user_id", traineeUserId)
    .order("created_at", { ascending: false })
    .limit(50);

  const lastAttemptByScenario = new Map<string, string>();
  (attempts ?? []).forEach((attempt) => {
    const current = lastAttemptByScenario.get(attempt.scenario_id);
    const candidate = attempt.completed_at ?? attempt.created_at;
    if (!current || new Date(candidate).getTime() > new Date(current).getTime()) {
      lastAttemptByScenario.set(attempt.scenario_id, candidate);
    }
  });

  const { data } = await supabase
    .from("emergency_scenarios")
    .select("*")
    .or(`institution_id.is.null,institution_id.eq.${institutionId}`)
    .eq("active", true)
    .order("created_at", { ascending: true });

  const scenarios = (data ?? []) as EmergencyScenario[];
  scenarios.sort((left, right) => {
    const leftLast = lastAttemptByScenario.get(left.id);
    const rightLast = lastAttemptByScenario.get(right.id);
    if (!leftLast && rightLast) return -1;
    if (leftLast && !rightLast) return 1;
    return new Date(leftLast ?? 0).getTime() - new Date(rightLast ?? 0).getTime();
  });

  return scenarios[0] ?? null;
}

export async function fetchActiveStudyGoal(traineeUserId: string): Promise<GoalPackage | null> {
  const supabase = await createServerClient();
  const { data: goal } = await supabase
    .from("study_goals")
    .select("*")
    .eq("trainee_user_id", traineeUserId)
    .eq("status", "active")
    .order("generated_at", { ascending: false })
    .maybeSingle();

  if (!goal) {
    return null;
  }

  const [itemsResult, refreshJobResult] = await Promise.all([
    supabase
      .from("study_goal_items")
      .select("*")
      .eq("study_goal_id", goal.id)
      .order("display_order", { ascending: true }),
    supabase
      .from("user_content_refresh_jobs")
      .select("*")
      .eq("study_goal_id", goal.id)
      .order("requested_at", { ascending: false })
      .maybeSingle()
  ]);

  return {
    goal: goal as StudyGoal,
    items: (itemsResult.data ?? []) as StudyGoalItem[],
    refreshJob: (refreshJobResult.data ?? {
      id: "",
      institution_id: goal.institution_id,
      trainee_user_id: goal.trainee_user_id,
      study_goal_id: goal.id,
      trigger_reason: goal.source_reason,
      status: "completed",
      payload_jsonb: {},
      requested_at: goal.generated_at
    }) as UserContentRefreshJob
  };
}

export async function generateStudyGoalForUser(input: GoalGenerationInput): Promise<GoalPackage> {
  const supabase = await createServerClient();

  const existing = await fetchActiveStudyGoal(input.traineeUserId);
  if (existing) {
    return existing;
  }

  const trainingYear = await fetchTraineeYear(supabase, input.traineeUserId);
  const [lessonSelection, questions, emergencyScenario] = await Promise.all([
    selectNextLesson(supabase, input.traineeUserId, input.institutionId, trainingYear),
    selectQuestionSet(supabase, input.traineeUserId, input.institutionId, trainingYear),
    selectEmergencyScenario(supabase, input.traineeUserId, input.institutionId)
  ]);

  if (!lessonSelection && questions.length === 0) {
    throw new Error("Não há conteúdo SBA suficiente para gerar a meta.");
  }

  if (!emergencyScenario) {
    throw new Error("Não há cenário de emergência disponível para compor a meta.");
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data: sameDayGoals } = await supabase
    .from("study_goals")
    .select("refresh_sequence")
    .eq("trainee_user_id", input.traineeUserId)
    .eq("goal_date", today)
    .order("refresh_sequence", { ascending: false })
    .limit(1);

  const refreshSequence = (sameDayGoals?.[0]?.refresh_sequence ?? 0) + 1;

  const goalInsert = await supabase
    .from("study_goals")
    .insert({
      institution_id: input.institutionId,
      trainee_user_id: input.traineeUserId,
      goal_date: today,
      refresh_sequence: refreshSequence,
      target_minutes: 12,
      status: "active",
      source_reason: input.triggerReason,
      generated_at: new Date().toISOString()
    })
    .select("*")
    .single();

  if (goalInsert.error || !goalInsert.data) {
    throw new Error(goalInsert.error?.message ?? "Falha ao gerar a meta de estudo.");
  }

  const goal = goalInsert.data as StudyGoal;
  const itemsPayload = [
    lessonSelection
      ? {
          study_goal_id: goal.id,
          item_type: "lesson",
          display_order: 1,
          estimated_minutes: 6,
          title: lessonSelection.lesson.title,
          lesson_id: lessonSelection.lesson.id,
          metadata_jsonb: {
            package: "sba",
            module_id: lessonSelection.moduleId,
            training_year: trainingYear
          }
        }
      : null,
    questions.length
      ? {
          study_goal_id: goal.id,
          item_type: "question_set",
          display_order: 2,
          estimated_minutes: 3,
          title: "Bloco SBA de revisão rápida",
          question_ids: questions.map((question) => question.id),
          metadata_jsonb: {
            package: "sba",
            training_year: trainingYear,
            question_count: questions.length
          }
        }
      : null,
    {
      study_goal_id: goal.id,
      item_type: "emergency",
      display_order: 3,
      estimated_minutes: 3,
      title: emergencyScenario.title,
      emergency_scenario_id: emergencyScenario.id,
      metadata_jsonb: {
        package: "emergency",
        category: emergencyScenario.category
      }
    }
  ].filter(Boolean);

  const itemsInsert = await supabase.from("study_goal_items").insert(itemsPayload).select("*");
  if (itemsInsert.error) {
    throw new Error(itemsInsert.error.message);
  }

  const refreshJobInsert = await supabase
    .from("user_content_refresh_jobs")
    .insert({
      institution_id: input.institutionId,
      trainee_user_id: input.traineeUserId,
      study_goal_id: goal.id,
      trigger_reason: input.triggerReason,
      status: "completed",
      payload_jsonb: {
        training_year: trainingYear,
        refresh_sequence: refreshSequence,
        sba_question_count: questions.length,
        has_emergency: Boolean(emergencyScenario)
      },
      requested_at: goal.generated_at,
      completed_at: new Date().toISOString()
    })
    .select("*")
    .single();

  if (refreshJobInsert.error || !refreshJobInsert.data) {
    throw new Error(refreshJobInsert.error?.message ?? "Falha ao registrar o refresh do pacote.");
  }

  return {
    goal,
    items: (itemsInsert.data ?? []) as StudyGoalItem[],
    refreshJob: refreshJobInsert.data as UserContentRefreshJob
  };
}

export async function completeStudyGoal(userId: string, goalId: string): Promise<{
  completedGoal: StudyGoal;
  nextGoal: GoalPackage;
}> {
  const supabase = await createServerClient();
  const { data: goal } = await supabase
    .from("study_goals")
    .select("*")
    .eq("id", goalId)
    .eq("trainee_user_id", userId)
    .maybeSingle();

  if (!goal) {
    throw new Error("Meta de estudo não encontrada.");
  }

  if (goal.status === "completed") {
    const nextExisting = await fetchActiveStudyGoal(userId);
    if (!nextExisting) {
      throw new Error("A meta já foi concluída, mas não existe pacote ativo.");
    }

    return {
      completedGoal: goal as StudyGoal,
      nextGoal: nextExisting
    };
  }

  const goalUpdate = await supabase
    .from("study_goals")
    .update({
      status: "completed",
      completed_at: new Date().toISOString()
    })
    .eq("id", goal.id)
    .eq("trainee_user_id", userId)
    .select("*")
    .single();

  if (goalUpdate.error || !goalUpdate.data) {
    throw new Error(goalUpdate.error?.message ?? "Falha ao concluir a meta.");
  }

  const nextGoal = await generateStudyGoalForUser({
    traineeUserId: userId,
    institutionId: goal.institution_id,
    triggerReason: "goal_completed"
  });

  return {
    completedGoal: goalUpdate.data as StudyGoal,
    nextGoal
  };
}
