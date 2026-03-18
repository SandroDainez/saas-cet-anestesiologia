import type { SupabaseClient } from "@supabase/supabase-js";

import { createServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type {
  CurriculumSubtopic,
  CurriculumTopic,
  CurriculumYear,
  EmergencyAttempt,
  EmergencyAttemptAction,
  EmergencyScenario,
  EmergencyScenarioStep,
  EmergencyCategory,
  EmergencySelfAssessment,
  Exam,
  ExamAnswer,
  ExamAttempt,
  ExamBlueprint,
  ExamQuestionLink,
  ExamResultDomain,
  LessonStep,
  LearningLesson,
  LearningModule,
  LearningTrack,
  TraineeLessonProgress,
  TraineeModuleProgress,
  ModuleCounts,
  ProcedureLog,
  ProcedureCatalog,
  ProcedureLogItem,
  ProcedureSelfAssessment,
  ProcedureValidation,
  ProcedureCategory,
  PerceivedDifficulty,
  ProcedureSuccessStatus,
  ProcedurePerformanceLevel,
  ValidationStatus,
  ReadinessLevel,
  SurgeryCatalog,
  SurgeryAnesthesiaGuide,
  SurgerySpecialty,
  SurgeryGuideChecklist,
  SurgeryGuideDetail,
  SurgeryGuideFilters,
  SurgeryGuideSummary,
  SurgeryGuideVariant,
  SurgeryGuideChecklistMetadata,
  InstitutionUnit,
  LogbookStats,
  QuestionBankEntry,
  QuestionOption,
  QuestionReference,
  QuestionTag,
  QuestionTypeEnum,
  QuestionDifficulty,
  TraineeErrorNotebookEntry,
  TraineeQuestionAttempt,
  TraineeYearCode,
  PreanestheticTopic,
  PreanestheticTopicLink,
  PreanestheticCategory,
  ContentSource,
  ContentSourceSection,
  ContentItem,
  ContentVersion,
  ContentReference,
  EditorialReview,
  ContentSummary,
  ContentQueueEntry,
  ContentVersionTimelineEntry,
  AIPromptTemplate,
  AIGenerationJob,
  AIJobSourceLink,
  AIValidationCheck,
  AIGenerationJobTrace,
  JobType,
  JobStatus,
  CheckType,
  CheckResult,
  ReportScope,
  ReportViewData,
  MetricCardData,
  DomainPerformance,
  ProgressSummary,
  ProcedureStat,
  ValidationAlert,
  EmergencyPerformance,
  EmergencySummary,
  EditorialCoverage
} from "@/types/database";

export interface InstitutionReviewerSummary {
  id: string;
  full_name: string;
  email: string;
  role: "preceptor" | "coordinator" | "institution_admin";
}
import { getSessionProfile } from "@/services/auth/get-session-profile";

type CountBuilder = (builder: any) => any;

function isUuid(value: string | null | undefined): value is string {
  if (typeof value !== "string") {
    return false;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function sanitizeInstitutionId(value?: string | null) {
  return isUuid(value ?? null) ? value : null;
}

async function countTable(client: SupabaseClient, table: string, institutionId?: string, build?: CountBuilder) {
  let builder = client.from(table).select("id", { count: "exact", head: true });

  if (typeof institutionId !== "undefined") {
    builder = applyTenantFilter(builder, institutionId);
  }

  if (build) {
    builder = build(builder);
  }

  const { count, error } = await builder;

  if (error) {
    console.error(
      `[db/modules] count error table=${table} code=${error.code ?? "unknown"} message=${error.message ?? "unknown"} details=${error.details ?? "none"} hint=${error.hint ?? "none"}`
    );
    return 0;
  }

  return count ?? 0;
}

function applyInstitutionFilter(query: any, institutionId?: string) {
  return institutionId ? query.eq("institution_id", institutionId) : query;
}

async function resolveInstitutionId(override?: string | null) {
  const sanitizedOverride = sanitizeInstitutionId(override);
  if (sanitizedOverride) {
    return sanitizedOverride;
  }

  const profile = await getSessionProfile();
  return sanitizeInstitutionId(profile?.institution_id);
}

function applyTenantFilter(
  builder: any,
  institutionId?: string | null,
  options?: { includeGlobal?: boolean }
) {
  const tenantId = sanitizeInstitutionId(institutionId ?? undefined);

  if (tenantId) {
    if (options?.includeGlobal) {
      return builder.or(`institution_id.is.null,institution_id.eq.${tenantId}`);
    }

    return builder.eq("institution_id", tenantId);
  }

  return builder;
}

async function fetchClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return createServerClient();
}

export async function fetchModuleCounts(institutionId?: string): Promise<ModuleCounts | null> {
  const supabase = await fetchClient();
  if (!supabase) {
    return null;
  }

  const sanitizedInstitutionId = sanitizeInstitutionId(institutionId);

  const { data, error } = await supabase.rpc("get_dashboard_module_counts", {
    _institution_id: sanitizedInstitutionId
  });

  if (error) {
    console.error(
      `[db/modules] dashboard counts rpc error code=${error.code ?? "unknown"} message=${error.message ?? "unknown"} details=${error.details ?? "none"} hint=${error.hint ?? "none"} institutionId=${sanitizedInstitutionId ?? "none"} rawInstitutionId=${institutionId ?? "none"}`
    );

    const [
      curriculumTopics,
      learningTracks,
      questionBankEntries,
      exams,
      procedureLogs,
      emergencyScenarios
    ] = await Promise.all([
      countTable(supabase, "curriculum_topics"),
      countTable(supabase, "learning_tracks", sanitizedInstitutionId ?? undefined),
      countTable(supabase, "question_bank", sanitizedInstitutionId ?? undefined),
      countTable(supabase, "exams", sanitizedInstitutionId ?? undefined),
      countTable(supabase, "procedure_logs", sanitizedInstitutionId ?? undefined),
      countTable(supabase, "emergency_scenarios", sanitizedInstitutionId ?? undefined)
    ]);

    return {
      curriculumTopics,
      learningTracks,
      questionBankEntries,
      exams,
      procedureLogs,
      emergencyScenarios
    };
  }

  const counts = Array.isArray(data) ? data[0] : data;
  if (!counts) {
    return null;
  }

  return {
    curriculumTopics: Number(counts.curriculum_topics ?? 0),
    learningTracks: Number(counts.learning_tracks ?? 0),
    questionBankEntries: Number(counts.question_bank_entries ?? 0),
    exams: Number(counts.exams ?? 0),
    procedureLogs: Number(counts.procedure_logs ?? 0),
    emergencyScenarios: Number(counts.emergency_scenarios ?? 0)
  };
}

export async function fetchCurriculumTopicsByYear(year: TraineeYearCode): Promise<CurriculumTopic[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return [];
  }

  const { data: yearRecord } = await supabase
    .from("curriculum_years")
    .select("id")
    .eq("code", year)
    .maybeSingle();

  if (!yearRecord?.id) {
    return [];
  }

  const { data } = await supabase
    .from("curriculum_topics")
    .select("*")
    .eq("curriculum_year_id", yearRecord.id)
    .order("display_order", { ascending: true });

  return data ?? [];
}

export async function fetchLearningTracks(institutionId?: string): Promise<LearningTrack[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return [];
  }

  const builder = supabase.from("learning_tracks").select("*").order("title", { ascending: true });
  const filtered = applyTenantFilter(builder, institutionId, { includeGlobal: true });

  const { data } = await filtered;

  return data ?? [];
}

export async function fetchQuestionBankSamples(institutionId?: string, limit = 6): Promise<QuestionBankEntry[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return [];
  }

  const builder = supabase
    .from("question_bank")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(limit);
  const filtered = applyTenantFilter(builder, institutionId, { includeGlobal: true });

  const { data } = await filtered;
  return data ?? [];
}

export async function fetchExamSummaries(institutionId?: string): Promise<Exam[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return [];
  }

  const builder = supabase
    .from("exams")
    .select("*")
    .order("available_from", { ascending: false })
    .limit(8);
  const filtered = applyTenantFilter(builder, institutionId);

  const { data } = await filtered;
  return data ?? [];
}

export async function fetchRecentProcedureLogs(institutionId?: string): Promise<ProcedureLog[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return [];
  }

  const builder = supabase
    .from("procedure_logs")
    .select("*")
    .order("performed_on", { ascending: false })
    .limit(6);
  const filtered = applyTenantFilter(builder, institutionId);

  const { data } = await filtered;
  return data ?? [];
}

export async function fetchEmergencyScenarios(institutionId?: string): Promise<EmergencyScenario[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return [];
  }

  const builder = supabase
    .from("emergency_scenarios")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(8);
  const filtered = applyTenantFilter(builder, institutionId, { includeGlobal: true });

  const { data } = await filtered;
  return data ?? [];
}

export async function fetchEmergencyScenarioById(
  scenarioId: string,
  institutionId?: string
): Promise<EmergencyScenario | null> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockEmergencyScenarios.find((scenario) => scenario.id === scenarioId) ?? null;
  }

  const builder = supabase.from("emergency_scenarios").select("*").eq("id", scenarioId);
  const filtered = applyTenantFilter(builder, institutionId, { includeGlobal: true });
  const { data } = await filtered.maybeSingle();
  return data ?? null;
}

export async function fetchEmergencyScenarioSteps(scenarioId: string): Promise<EmergencyScenarioStep[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockScenarioSteps[scenarioId] ?? [];
  }

  const { data } = await supabase
    .from("emergency_scenario_steps")
    .select("*")
    .eq("scenario_id", scenarioId)
    .order("step_order", { ascending: true });

  return data ?? mockScenarioSteps[scenarioId] ?? [];
}

export async function fetchEmergencyAttemptById(
  attemptId: string,
  viewerUserId?: string,
  viewerRole?: "trainee" | "preceptor" | "admin",
  institutionId?: string
): Promise<EmergencyAttempt | null> {
  const supabase = await fetchClient();
  if (!supabase) {
    const mockAttempt = mockEmergencyAttempts.find((attempt) => attempt.id === attemptId) ?? null;
    if (viewerRole === "trainee" && viewerUserId && mockAttempt?.trainee_user_id !== viewerUserId) {
      return null;
    }
    return mockAttempt;
  }

  let builder = supabase.from("emergency_attempts").select("*").eq("id", attemptId);

  if (viewerRole === "trainee" && viewerUserId) {
    builder = builder.eq("trainee_user_id", viewerUserId);
  }

  const { data } = await builder.maybeSingle();
  if (!data) {
    return null;
  }

  if ((viewerRole === "preceptor" || viewerRole === "admin") && institutionId) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("id", data.trainee_user_id)
      .eq("institution_id", institutionId)
      .maybeSingle();

    if (!profile) {
      return null;
    }
  }

  return data;
}

export async function fetchEmergencyAttemptActions(attemptId: string): Promise<EmergencyAttemptAction[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockEmergencyAttemptActions[attemptId] ?? [];
  }

  const { data } = await supabase
    .from("emergency_attempt_actions")
    .select("*")
    .eq("emergency_attempt_id", attemptId)
    .order("action_timestamp", { ascending: true });
  return data ?? mockEmergencyAttemptActions[attemptId] ?? [];
}

export async function fetchEmergencySelfAssessments(
  userId: string,
  viewerUserId?: string,
  viewerRole?: "trainee" | "preceptor" | "admin"
): Promise<EmergencySelfAssessment[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockEmergencySelfAssessments.filter((assessment) => {
      if (assessment.trainee_user_id !== userId) {
        return false;
      }

      if (viewerRole === "trainee" && viewerUserId) {
        return assessment.trainee_user_id === viewerUserId;
      }

      return true;
    });
  }

  let builder = supabase.from("emergency_self_assessments").select("*").eq("trainee_user_id", userId);

  if (viewerRole === "trainee" && viewerUserId) {
    builder = builder.eq("trainee_user_id", viewerUserId);
  }

  const { data } = await builder;
  return data ?? [];
}

export async function fetchEmergencySummary(options?: {
  traineeUserId?: string;
  institutionId?: string;
}): Promise<EmergencySummary> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockEmergencySummary;
  }

  const institutionUserIds =
    options?.institutionId && !options?.traineeUserId
      ? (
          (
            await supabase
              .from("user_profiles")
              .select("id")
              .eq("institution_id", options.institutionId)
          ).data ?? []
        ).map((profile) => profile.id)
      : [];

  const [scenarios, attemptsResponse, assessmentsResponse] = await Promise.all([
    fetchEmergencyScenarios(options?.institutionId),
    options?.traineeUserId
      ? supabase.from("emergency_attempts").select("*").eq("trainee_user_id", options.traineeUserId)
      : institutionUserIds.length
      ? supabase.from("emergency_attempts").select("*").in("trainee_user_id", institutionUserIds)
      : supabase.from("emergency_attempts").select("*"),
    options?.traineeUserId
      ? supabase.from("emergency_self_assessments").select("*").eq("trainee_user_id", options.traineeUserId)
      : institutionUserIds.length
      ? supabase.from("emergency_self_assessments").select("*").in("trainee_user_id", institutionUserIds)
      : supabase.from("emergency_self_assessments").select("*")
  ]);

  const categoryBreakdown: Record<EmergencyCategory, number> = {
    airway: 0,
    hemodynamic: 0,
    respiratory: 0,
    allergic: 0,
    regional: 0,
    obstetric: 0,
    pediatric: 0,
    other: 0
  };

  const attempts = attemptsResponse.data ?? [];
  const hasAttemptData = !attemptsResponse.error;
  if (hasAttemptData) {
    attempts.forEach((attempt) => {
      const scenario = scenarios.find((item) => item.id === attempt.scenario_id);
      if (scenario) {
        categoryBreakdown[scenario.category] = (categoryBreakdown[scenario.category] ?? 0) + 1;
      }
    });
  }

  const readinessLevels: Record<string, number> = {};
  const assessments = assessmentsResponse.data ?? mockEmergencySelfAssessments;
  assessments.forEach((assessment) => {
    if (assessment.perceived_readiness) {
      readinessLevels[assessment.perceived_readiness] = (readinessLevels[assessment.perceived_readiness] ?? 0) + 1;
    }
  });

  const pendingDebriefs = hasAttemptData
    ? attempts.filter((attempt) => !attempt.debrief_summary).length
    : mockEmergencySummary.pendingDebriefs;

  return {
    totalAttempts: hasAttemptData ? attempts.length : mockEmergencySummary.totalAttempts,
    categoryBreakdown,
    readinessLevels,
    pendingDebriefs
  };
}

async function fetchCurriculumYearId(supabase: SupabaseClient, year: TraineeYearCode) {
  const { data } = await supabase.from("curriculum_years").select("id").eq("code", year).maybeSingle();
  return data?.id ?? null;
}

export async function fetchCurriculumYears(): Promise<CurriculumYear[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockCurriculumYears;
  }

  const { data } = await supabase.from("curriculum_years").select("*").order("display_order", { ascending: true });

  if (!data) {
    return mockCurriculumYears;
  }

  return data;
}

export async function fetchCurriculumSubtopics(topicId: string): Promise<CurriculumSubtopic[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockSubtopics[topicId] ?? [];
  }

  const { data } = await supabase
    .from("curriculum_subtopics")
    .select("*")
    .eq("topic_id", topicId)
    .order("display_order", { ascending: true });

  return data ?? mockSubtopics[topicId] ?? [];
}

export async function fetchCurriculumTopicById(topicId: string): Promise<CurriculumTopic | null> {
  const supabase = await fetchClient();
  if (!supabase) {
    for (const topics of Object.values(mockCurriculumTopics)) {
      const topic = topics.find((t) => t.id === topicId);
      if (topic) return topic;
    }

    return null;
  }

  const { data } = await supabase
    .from("curriculum_topics")
    .select("*")
    .eq("id", topicId)
    .maybeSingle();

  return data ?? null;
}

export async function fetchLearningTracksByYear(year: TraineeYearCode, institutionId?: string): Promise<LearningTrack[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockTracks[year] ?? [];
  }

  const yearId = await fetchCurriculumYearId(supabase, year);
  if (!yearId) {
    return [];
  }

  const builder = supabase
    .from("learning_tracks")
    .select("*")
    .eq("curriculum_year_id", yearId)
    .order("display_order", { ascending: true });
  const filtered = applyTenantFilter(builder, institutionId, { includeGlobal: true });

  const { data } = await filtered;
  return data ?? mockTracks[year] ?? [];
}

export async function fetchTrackById(trackId: string): Promise<LearningTrack | null> {
  const supabase = await fetchClient();
  if (!supabase) {
    for (const tracks of Object.values(mockTracks)) {
      const track = tracks.find((item) => item.id === trackId);
      if (track) {
        return track;
      }
    }

    return null;
  }

  const builder = supabase
    .from("learning_tracks")
    .select("*")
    .eq("id", trackId);
  const filtered = applyTenantFilter(builder, await resolveInstitutionId(), { includeGlobal: true });
  const { data } = await filtered.maybeSingle();

  return data ?? null;
}

export async function fetchLearningModuleById(moduleId: string): Promise<LearningModule | null> {
  const supabase = await fetchClient();
  if (!supabase) {
    for (const modules of Object.values(mockModules)) {
      const foundModule = modules.find((item) => item.id === moduleId);
      if (foundModule) {
        return foundModule;
      }
    }

    return null;
  }

  const { data } = await supabase
    .from("learning_modules")
    .select("*")
    .eq("id", moduleId)
    .maybeSingle();

  return data ?? null;
}

export async function fetchLearningModulesForTrack(trackId: string): Promise<LearningModule[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockModules[trackId] ?? [];
  }

  const { data } = await supabase
    .from("learning_modules")
    .select("*")
    .eq("learning_track_id", trackId)
    .order("display_order", { ascending: true });

  return data ?? mockModules[trackId] ?? [];
}

export async function fetchLessonsForModule(moduleId: string): Promise<LearningLesson[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockLessons[moduleId] ?? [];
  }

  const { data } = await supabase
    .from("learning_lessons")
    .select("*")
    .eq("learning_module_id", moduleId)
    .order("display_order", { ascending: true });

  return data ?? mockLessons[moduleId] ?? [];
}

export async function fetchLessonById(lessonId: string): Promise<LearningLesson | null> {
  const supabase = await fetchClient();
  if (!supabase) {
    for (const lessons of Object.values(mockLessons)) {
      const lesson = lessons.find((item) => item.id === lessonId);
      if (lesson) {
        return lesson;
      }
    }

    return null;
  }

  const { data } = await supabase
    .from("learning_lessons")
    .select("*")
    .eq("id", lessonId)
    .maybeSingle();

  return data ?? null;
}

export async function fetchLessonSteps(lessonId: string): Promise<LessonStep[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockLessonSteps[lessonId] ?? [];
  }

  const { data } = await supabase
    .from("lesson_steps")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("display_order", { ascending: true });

  return data ?? mockLessonSteps[lessonId] ?? [];
}

export async function fetchTraineeLessonProgress(
  traineeId: string,
  lessonIds?: string[]
): Promise<TraineeLessonProgress[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return [];
  }

  let builder = supabase
    .from("trainee_lesson_progress")
    .select("*")
    .eq("trainee_user_id", traineeId);

  if (lessonIds?.length) {
    builder = builder.in("lesson_id", lessonIds);
  }

  const { data } = await builder;
  return data ?? [];
}

export async function fetchTraineeModuleProgress(
  traineeId: string,
  moduleIds?: string[]
): Promise<TraineeModuleProgress[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return [];
  }

  let builder = supabase
    .from("trainee_module_progress")
    .select("*")
    .eq("trainee_user_id", traineeId);

  if (moduleIds?.length) {
    builder = builder.in("module_id", moduleIds);
  }

  const { data } = await builder;
  return data ?? [];
}

export interface QuestionFilters {
  curriculum_year_code?: TraineeYearCode;
  topicId?: string;
  subtopicId?: string;
  difficulty?: QuestionDifficulty;
  questionType?: QuestionTypeEnum;
}

export async function fetchQuestionBankEntries(filters: QuestionFilters = {}, institutionId?: string): Promise<QuestionBankEntry[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return filterMockQuestions(filters);
  }

  let builder = supabase.from("question_bank").select("*").order("created_at", { ascending: false });

  if (filters.curriculum_year_code) {
    const yearId = await fetchCurriculumYearId(supabase, filters.curriculum_year_code);
    if (yearId) {
      builder = builder.eq("curriculum_year_id", yearId);
    }
  }

  if (filters.topicId) builder = builder.eq("curriculum_topic_id", filters.topicId);
  if (filters.subtopicId) builder = builder.eq("curriculum_subtopic_id", filters.subtopicId);
  if (filters.difficulty) builder = builder.eq("difficulty", filters.difficulty);
  if (filters.questionType) builder = builder.eq("question_type", filters.questionType);

  builder = applyTenantFilter(builder, institutionId, { includeGlobal: true });

  const { data } = await builder;
  if (!data) {
    return filterMockQuestions(filters);
  }

  return data;
}

export async function fetchQuestionById(questionId: string, institutionId?: string): Promise<QuestionBankEntry | null> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockQuestionBank.find((question) => question.id === questionId) ?? null;
  }

  const builder = supabase.from("question_bank").select("*").eq("id", questionId);
  const filtered = applyTenantFilter(builder, institutionId, { includeGlobal: true });
  const { data } = await filtered.maybeSingle();
  return data ?? null;
}

function filterMockQuestions(filters: QuestionFilters): QuestionBankEntry[] {
  return mockQuestionBank.filter((question) => {
    if (filters.curriculum_year_code && question.curriculum_year_id) {
      const yearId = mockYearByCode[filters.curriculum_year_code];
      if (yearId && question.curriculum_year_id !== yearId) return false;
    }

    if (filters.topicId && question.curriculum_topic_id !== filters.topicId) return false;
    if (filters.subtopicId && question.curriculum_subtopic_id !== filters.subtopicId) return false;
    if (filters.difficulty && question.difficulty !== filters.difficulty) return false;
    if (filters.questionType && question.question_type !== filters.questionType) return false;

    return true;
  });
}

export async function fetchQuestionOptions(questionId: string): Promise<QuestionOption[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockQuestionOptions[questionId] ?? [];
  }

  const { data } = await supabase
    .from("question_options")
    .select("*")
    .eq("question_id", questionId)
    .order("display_order", { ascending: true });

  return data ?? mockQuestionOptions[questionId] ?? [];
}

export async function fetchQuestionTags(questionId: string): Promise<QuestionTag[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    const related = mockQuestionTagLinks.filter((link) => link.question_id === questionId);
    return related.map((link) => mockQuestionTags.find((tag) => tag.id === link.tag_id)).filter(Boolean) as QuestionTag[];
  }

  const { data } = await supabase
    .from("question_tag_links")
    .select("question_tags(*)")
    .eq("question_id", questionId);

  const rows = (data ?? []) as { question_tags?: QuestionTag[] }[];
  return rows.flatMap((row) => row.question_tags ?? []);
}

export async function fetchQuestionReferences(questionId: string): Promise<QuestionReference[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockQuestionReferences[questionId] ?? [];
  }

  const { data } = await supabase
    .from("question_references")
    .select("*")
    .eq("question_id", questionId);

  return data ?? mockQuestionReferences[questionId] ?? [];
}

export async function fetchTraineeQuestionAttempts(traineeId?: string): Promise<TraineeQuestionAttempt[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockAttempts;
  }

  if (!traineeId) {
    return mockAttempts;
  }

  const { data } = await supabase
    .from("trainee_question_attempts")
    .select("*")
    .eq("trainee_user_id", traineeId)
    .order("attempted_at", { ascending: false });

  return data ?? mockAttempts;
}

export async function fetchErrorNotebookEntries(traineeId?: string): Promise<TraineeErrorNotebookEntry[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockErrorNotebook;
  }

  if (!traineeId) {
    return mockErrorNotebook;
  }

  const { data } = await supabase
    .from("trainee_error_notebook")
    .select("*")
    .eq("trainee_user_id", traineeId)
    .order("last_wrong_at", { ascending: false });

  return data ?? mockErrorNotebook;
}

export async function fetchFavoriteQuestions(favoriteIds?: string[], institutionId?: string): Promise<QuestionBankEntry[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockQuestionBank.filter((question) => mockFavorites.includes(question.id));
  }

  if (!favoriteIds?.length) {
    return [];
  }

  const builder = supabase.from("question_bank").select("*").in("id", favoriteIds).order("created_at", { ascending: false });
  const filtered = applyTenantFilter(builder, institutionId, { includeGlobal: true });
  const { data } = await filtered;
  return data ?? mockQuestionBank.filter((question) => favoriteIds.includes(question.id));
}

export async function fetchQuestionPracticeSummary(traineeId: string) {
  const [attempts, notebook] = await Promise.all([
    fetchTraineeQuestionAttempts(traineeId),
    fetchErrorNotebookEntries(traineeId)
  ]);

  const totalAttempts = attempts.length;
  const correctAttempts = attempts.filter((attempt) => attempt.is_correct).length;
  const accuracyPercent = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;
  const unresolvedErrors = notebook.filter((entry) => !entry.resolved).length;

  return {
    totalAttempts,
    correctAttempts,
    accuracyPercent,
    unresolvedErrors
  };
}

const mockYearByCode: Record<TraineeYearCode, string> = {
  ME1: "year-me1",
  ME2: "year-me2",
  ME3: "year-me3"
};

const mockCurriculumYears: CurriculumYear[] = [
  { id: "year-me1", code: "ME1", name: "ME1", display_order: 1 },
  { id: "year-me2", code: "ME2", name: "ME2", display_order: 2 },
  { id: "year-me3", code: "ME3", name: "ME3", display_order: 3 }
];

const mockCurriculumTopics: Record<TraineeYearCode, CurriculumTopic[]> = {
  ME1: [
    {
      id: "topic-me1-ethics",
      curriculum_year_id: "year-me1",
      point_number: 1,
      title: "Ética médica e bioética",
      description: "Responsabilidade profissional e código de conduta",
      display_order: 1,
      source_label: "SBA",
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "topic-me1-airway",
      curriculum_year_id: "year-me1",
      point_number: 5,
      title: "Vias aéreas e equipamentos",
      description: "Anatomia, avaliação e instrumentos",
      display_order: 5,
      source_label: "SBA",
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "topic-me1-pharm",
      curriculum_year_id: "year-me1",
      point_number: 11,
      title: "Farmacologia anestésica",
      description: "Anestésicos venosos, inalatórios e bloqueadores",
      display_order: 11,
      source_label: "SBA",
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  ME2: [
    {
      id: "topic-me2-monitoring",
      curriculum_year_id: "year-me2",
      point_number: 21,
      title: "Monitorização perioperatória",
      description: "Monitores invasivos e não invasivos",
      display_order: 21,
      source_label: "SBA",
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "topic-me2-obstetric",
      curriculum_year_id: "year-me2",
      point_number: 31,
      title: "Anestesia obstétrica",
      description: "Anestesia regional, analgesia e urgências",
      display_order: 31,
      source_label: "SBA",
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "topic-me2-peripherals",
      curriculum_year_id: "year-me2",
      point_number: 25,
      title: "Bloqueios periféricos",
      description: "Guias de anatomia e complicações",
      display_order: 25,
      source_label: "SBA",
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  ME3: [
    {
      id: "topic-me3-trauma",
      curriculum_year_id: "year-me3",
      point_number: 38,
      title: "Urgências e trauma",
      description: "Complicações, ressuscitação e protocolos",
      display_order: 38,
      source_label: "SBA",
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "topic-me3-cardiac",
      curriculum_year_id: "year-me3",
      point_number: 42,
      title: "Cirurgia cardiovascular",
      description: "Ventilação, CPB e complicações",
      display_order: 42,
      source_label: "SBA",
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "topic-me3-plastic",
      curriculum_year_id: "year-me3",
      point_number: 39,
      title: "Cirurgia plástica e bucomaxilofacial",
      description: "Anestesia em centros de alta complexidade",
      display_order: 39,
      source_label: "SBA",
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
};

const mockSubtopics: Record<string, CurriculumSubtopic[]> = {
  "topic-me1-ethics": [
    { id: "sub-me1-ethics-1", topic_id: "topic-me1-ethics", title: "Bioética e consentimento", display_order: 1, active: true },
    { id: "sub-me1-ethics-2", topic_id: "topic-me1-ethics", title: "Responsabilidade profissional", display_order: 2, active: true }
  ],
  "topic-me1-airway": [
    { id: "sub-me1-airway-1", topic_id: "topic-me1-airway", title: "Avaliação pré-anestésica das vias aéreas", display_order: 1, active: true },
    { id: "sub-me1-airway-2", topic_id: "topic-me1-airway", title: "Equipamentos e planos B/C", display_order: 2, active: true }
  ],
  "topic-me2-monitoring": [
    { id: "sub-me2-monitoring-1", topic_id: "topic-me2-monitoring", title: "Monitorização hemodinâmica básica", display_order: 1, active: true },
    { id: "sub-me2-monitoring-2", topic_id: "topic-me2-monitoring", title: "Monitorização invasiva", display_order: 2, active: true }
  ]
};

const mockTracks: Record<TraineeYearCode, LearningTrack[]> = {
  ME1: [
    {
      id: "track-me1-basics",
      institution_id: null,
      curriculum_year_id: "year-me1",
      title: "Fundamentos do ME1",
      description: "Trilha básica com foco nos fundamentos da anestesiologia",
      track_type: "year_based",
      active: true,
      estimated_minutes: 120,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "track-me1-airway",
      institution_id: null,
      curriculum_year_id: "year-me1",
      title: "Vias aéreas essenciais",
      description: "Simulações e lições sobre vias aéreas difíceis",
      track_type: "year_based",
      active: true,
      estimated_minutes: 90,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  ME2: [
    {
      id: "track-me2-obstetric",
      institution_id: null,
      curriculum_year_id: "year-me2",
      title: "Obstetrícia e urgências",
      description: "Trilha para anestesia obstétrica e monitorização crítica",
      track_type: "year_based",
      active: true,
      estimated_minutes: 150,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  ME3: [
    {
      id: "track-me3-complex",
      institution_id: null,
      curriculum_year_id: "year-me3",
      title: "Casos complexos",
      description: "Simulações de trauma, cardiovascular e neurocirurgia",
      track_type: "year_based",
      active: true,
      estimated_minutes: 200,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
};

const mockModules: Record<string, LearningModule[]> = {
  "track-me1-basics": [
    {
      id: "module-airway",
      learning_track_id: "track-me1-basics",
      curriculum_topic_id: "topic-me1-airway",
      title: "Plano de vias aéreas",
      description: "Lição sobre avaliação e algoritmos",
      module_type: "lesson",
      difficulty_level: "basic",
      display_order: 1,
      estimated_minutes: 45,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  "track-me1-airway": [
    {
      id: "module-kit",
      learning_track_id: "track-me1-airway",
      curriculum_topic_id: "topic-me1-airway",
      title: "Kits e equipamentos",
      description: "Revisão de equipamentos e checklists",
      module_type: "lesson",
      difficulty_level: "intermediate",
      display_order: 1,
      estimated_minutes: 60,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
};

const mockLessons: Record<string, LearningLesson[]> = {
  "module-airway": [
    {
      id: "lesson-airway-1",
      learning_module_id: "module-airway",
      title: "Avaliação das vias aéreas",
      objective: "Identificar classificações de Mallampati",
      summary: "Checklist rápido para inspeção",
      lesson_format: "interactive",
      display_order: 1,
      active: true
    },
    {
      id: "lesson-airway-2",
      learning_module_id: "module-airway",
      title: "Estratégia inicial de intubação",
      objective: "Definir plano A, plano B e material de resgate",
      summary: "Sequência curta para decisão segura antes da indução",
      lesson_format: "case_based",
      display_order: 2,
      active: true
    }
  ],
  "module-kit": [
    {
      id: "lesson-kit-1",
      learning_module_id: "module-kit",
      title: "Equipamentos essenciais",
      objective: "Revisar kits de vias aéreas",
      summary: "Verificar integridade e backups",
      lesson_format: "flashcards",
      display_order: 1,
      active: true
    },
    {
      id: "lesson-kit-2",
      learning_module_id: "module-kit",
      title: "Checklist pré-plantão",
      objective: "Conferir material crítico antes do primeiro caso",
      summary: "Checklist operacional de cinco pontos para o trainee",
      lesson_format: "microlearning",
      display_order: 2,
      active: true
    }
  ]
};

const mockLessonSteps: Record<string, LessonStep[]> = {
  "lesson-airway-1": [
    {
      id: "step-airway-1",
      lesson_id: "lesson-airway-1",
      step_type: "text",
      title: "Introdução",
      body_markdown: "Reforce a importância da avaliação pré-anestésica.",
      structured_payload: {},
      display_order: 1
    },
    {
      id: "step-airway-2",
      lesson_id: "lesson-airway-1",
      step_type: "question",
      title: "Caso rápido",
      body_markdown: "Paciente com Mallampati 4, qual o plano?",
      structured_payload: { options: ["Videolaringoscópio", "Intubação nasal", "Máscara laríngea"] },
      display_order: 2
    }
  ],
  "lesson-airway-2": [
    {
      id: "step-airway-3",
      lesson_id: "lesson-airway-2",
      step_type: "text",
      title: "Preparação do plano A",
      body_markdown: "Defina dispositivo principal, estratégia de oxigenação e limite de tentativas antes da indução.",
      structured_payload: {},
      display_order: 1
    },
    {
      id: "step-airway-4",
      lesson_id: "lesson-airway-2",
      step_type: "checkpoint",
      title: "Checklist de segurança",
      body_markdown: "Antes de começar: sucção pronta, capnógrafo funcionando e plano de resgate verbalizado.",
      structured_payload: { checklist: ["Pré-oxigenação", "Capnógrafo", "Dispositivo alternativo"] },
      display_order: 2
    }
  ],
  "lesson-kit-1": [
    {
      id: "step-kit-1",
      lesson_id: "lesson-kit-1",
      step_type: "flashcard",
      title: "Kits básicos",
      body_markdown: "Laringoscópio blade 3, tubos 7.0 e 8.0",
      structured_payload: {},
      display_order: 1
    }
  ],
  "lesson-kit-2": [
    {
      id: "step-kit-2",
      lesson_id: "lesson-kit-2",
      step_type: "text",
      title: "Cinco itens críticos",
      body_markdown: "Confirme fonte de O2, aspiração, material de intubação, dispositivos alternativos e drogas de indução.",
      structured_payload: {},
      display_order: 1
    }
  ]
};

const mockQuestionBank: QuestionBankEntry[] = [
  {
    id: "question-ethics-1",
    institution_id: null,
    curriculum_year_id: mockYearByCode.ME1,
    curriculum_topic_id: "topic-me1-ethics",
    curriculum_subtopic_id: "sub-me1-ethics-1",
    title: "Consentimento informado",
    stem: "Paciente adulto precisa de consentimento informado para anestesia geral. Qual princípio bioético deve guiar a conversa?",
    rationale: "A autonomia e o consentimento informado são fundamentais antes de qualquer procedimento invasivo.",
    difficulty: "easy",
    question_type: "single_choice",
    clinical_context_jsonb: { scenario: "Paciente candidato a cirurgia eletiva" },
    educational_goal: "Reafirmar o princípio da autonomia no contexto de anestesia.",
    status: "published",
    source_generation_type: "human",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "question-airway-1",
    institution_id: null,
    curriculum_year_id: mockYearByCode.ME1,
    curriculum_topic_id: "topic-me1-airway",
    curriculum_subtopic_id: "sub-me1-airway-2",
    title: "Plano B difícil",
    stem: "Durante indução, o paciente apresenta Mallampati 4 e falha na intubação com máscara. Qual o próximo passo mais seguro?",
    rationale: "O uso do videolaringoscópio e a manutenção da ventilação com máscara facial são apropriados antes de alternativas invasivas.",
    difficulty: "medium",
    question_type: "single_choice",
    clinical_context_jsonb: { scenario: "Paciente obeso com vias aéreas difíceis" },
    educational_goal: "Selecionar o plano B adequado em vias aéreas desafiadoras.",
    status: "published",
    source_generation_type: "human",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "question-obstetric-1",
    institution_id: null,
    curriculum_year_id: mockYearByCode.ME2,
    curriculum_topic_id: "topic-me2-obstetric",
    curriculum_subtopic_id: "sub-me2-monitoring-1",
    title: "Anestesia obstétrica e monitorização",
    stem: "Em gestante com pré-eclâmpsia grave, qual monitorização invasiva é essencial antes da cesárea?",
    rationale: "Monitorização invasiva da pressão arterial permite ajustes rápidos em pacientes hemodinamicamente instáveis.",
    difficulty: "hard",
    question_type: "single_choice",
    clinical_context_jsonb: { scenario: "Pré-eclâmpsia grave com edema pulmonar" },
    educational_goal: "Reforçar a indicação de monitorização invasiva em pacientes obstétricos críticos.",
    status: "published",
    source_generation_type: "human",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockQuestionOptions: Record<string, QuestionOption[]> = {
  "question-ethics-1": [
    {
      id: "opt-ethics-1",
      question_id: "question-ethics-1",
      option_label: "A",
      option_text: "Beneficência sobre autonomia",
      is_correct: false,
      explanation: "Beneficência não substitui o direito do paciente de decidir.",
      display_order: 1
    },
    {
      id: "opt-ethics-2",
      question_id: "question-ethics-1",
      option_label: "B",
      option_text: "Autonomia e consentimento informado",
      is_correct: true,
      explanation: "Autonomia é o princípio que garante o consentimento voluntário.",
      display_order: 2
    },
    {
      id: "opt-ethics-3",
      question_id: "question-ethics-1",
      option_label: "C",
      option_text: "Justiça distributiva prioritária",
      is_correct: false,
      explanation: "Justiça não responde diretamente ao consentimento.",
      display_order: 3
    }
  ],
  "question-airway-1": [
    {
      id: "opt-airway-1",
      question_id: "question-airway-1",
      option_label: "A",
      option_text: "Manter ventilação com máscara e preparar videolaringoscópio",
      is_correct: true,
      explanation: "Manter oxigenação e usar videolaringoscópio é mais seguro antes de vias invasivas.",
      display_order: 1
    },
    {
      id: "opt-airway-2",
      question_id: "question-airway-1",
      option_label: "B",
      option_text: "Realizar cricotireoidostomia imediata",
      is_correct: false,
      explanation: "Cricotireoidostomia é uma medida extrema e não inicial.",
      display_order: 2
    }
  ],
  "question-obstetric-1": [
    {
      id: "opt-obstetric-1",
      question_id: "question-obstetric-1",
      option_label: "A",
      option_text: "Monitorização invasiva da pressão arterial",
      is_correct: true,
      explanation: "PCE invasivo permite controle rápido das variações pressóricas na pré-eclâmpsia.",
      display_order: 1
    },
    {
      id: "opt-obstetric-2",
      question_id: "question-obstetric-1",
      option_label: "B",
      option_text: "Monitorização arterial não invasiva apenas",
      is_correct: false,
      explanation: "A monitorização não invasiva pode ser insuficiente em pré-eclâmpsia grave.",
      display_order: 2
    }
  ]
};

const mockQuestionTags: QuestionTag[] = [
  { id: "tag-airway", name: "Vias aéreas", tag_type: "topic" },
  { id: "tag-ethics", name: "Ética médica", tag_type: "topic" },
  { id: "tag-obstetric", name: "Obstetrícia", tag_type: "topic" }
];

const mockQuestionTagLinks: { id: string; question_id: string; tag_id: string }[] = [
  { id: "link-1", question_id: "question-ethics-1", tag_id: "tag-ethics" },
  { id: "link-2", question_id: "question-airway-1", tag_id: "tag-airway" },
  { id: "link-3", question_id: "question-obstetric-1", tag_id: "tag-obstetric" }
];

const mockQuestionReferences: Record<string, QuestionReference[]> = {
  "question-ethics-1": [
    {
      id: "ref-ethics-1",
      question_id: "question-ethics-1",
      content_reference_id: null,
      citation_label: "SBA Ética 2024",
      cited_excerpt: "Consentimento informado é um direito do paciente antes de procedimentos anestésicos.",
      page_or_section: "Capítulo 3, página 45",
      created_at: new Date().toISOString()
    }
  ],
  "question-airway-1": [
    {
      id: "ref-airway-1",
      question_id: "question-airway-1",
      content_reference_id: null,
      citation_label: "Manual SBA Vias Aéreas",
      cited_excerpt: "Videolaringoscópio é indicada na falha do acesso convencional.",
      page_or_section: "Seção 2.3",
      created_at: new Date().toISOString()
    }
  ],
  "question-obstetric-1": [
    {
      id: "ref-obstetric-1",
      question_id: "question-obstetric-1",
      content_reference_id: null,
      citation_label: "Guideline Obstétrica 2023",
      cited_excerpt: "Monitorização invasiva é mandatório na pré-eclâmpsia grave.",
      page_or_section: "Capítulo 5",
      created_at: new Date().toISOString()
    }
  ]
};

const mockAttempts: TraineeQuestionAttempt[] = [
  {
    id: "attempt-1",
    trainee_user_id: "trainee-001",
    question_id: "question-airway-1",
    selected_option_ids: ["opt-airway-2"],
    is_correct: false,
    response_time_seconds: 32,
    mode: "practice",
    attempted_at: new Date().toISOString()
  }
];

const mockErrorNotebook: TraineeErrorNotebookEntry[] = [
  {
    id: "error-1",
    trainee_user_id: "trainee-001",
    question_id: "question-airway-1",
    first_wrong_at: new Date().toISOString(),
    last_wrong_at: new Date().toISOString(),
    times_wrong: 2,
    resolved: false,
    notes: "Revisar as alternativas rápidas de ventilação."
  }
];

const mockFavorites = ["question-ethics-1", "question-obstetric-1"];

const mockExams: Exam[] = [
  {
    id: "exam-trimestral-me1",
    institution_id: "institution-global",
    curriculum_year_id: "year-me1",
    title: "Prova Trimestral ME1",
    description: "Avalia temas de ética, vias aéreas e farmacologia no programa ME1.",
    exam_type: "quarterly",
    status: "open",
    duration_minutes: 30,
    total_questions: 3,
    passing_score: 70,
    available_from: new Date().toISOString(),
    available_until: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: "exam-anual-me3",
    institution_id: "institution-global",
    curriculum_year_id: "year-me3",
    title: "Prova Anual ME3",
    description: "Cobertura de trauma, cirurgia cardiovascular e neurocirurgia.",
    exam_type: "annual",
    status: "scheduled",
    duration_minutes: 60,
    total_questions: 5,
    passing_score: 75,
    available_from: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    available_until: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString()
  },
  {
    id: "exam-simulado-cet",
    institution_id: "institution-global",
    curriculum_year_id: "year-me2",
    title: "Simulado FEBR",
    description: "Prova simulada com questões representativas para revisão rápida.",
    exam_type: "mock",
    status: "open",
    duration_minutes: 25,
    total_questions: 3,
    passing_score: 65,
    available_from: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    available_until: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString()
  }
];

const mockExamBlueprints: Record<string, ExamBlueprint[]> = {
  "exam-trimestral-me1": [
    {
      id: "blueprint-1",
      exam_id: "exam-trimestral-me1",
      curriculum_topic_id: "topic-me1-ethics",
      target_question_count: 1,
      difficulty_distribution_jsonb: { easy: 1 },
      weight_percent: 30
    },
    {
      id: "blueprint-2",
      exam_id: "exam-trimestral-me1",
      curriculum_topic_id: "topic-me1-airway",
      target_question_count: 1,
      difficulty_distribution_jsonb: { medium: 1 },
      weight_percent: 40
    },
    {
      id: "blueprint-3",
      exam_id: "exam-trimestral-me1",
      curriculum_topic_id: "topic-me1-pharm",
      target_question_count: 1,
      difficulty_distribution_jsonb: { medium: 1 },
      weight_percent: 30
    }
  ],
  "exam-simulado-cet": [
    {
      id: "blueprint-4",
      exam_id: "exam-simulado-cet",
      curriculum_topic_id: "topic-me2-monitoring",
      target_question_count: 2,
      difficulty_distribution_jsonb: { medium: 2 },
      weight_percent: 50
    },
    {
      id: "blueprint-5",
      exam_id: "exam-simulado-cet",
      curriculum_topic_id: "topic-me2-obstetric",
      target_question_count: 1,
      difficulty_distribution_jsonb: { hard: 1 },
      weight_percent: 50
    }
  ]
};

const mockExamQuestionLinks: Record<string, ExamQuestionLink[]> = {
  "exam-trimestral-me1": [
    {
      id: "link-trim-1",
      exam_id: "exam-trimestral-me1",
      question_id: "question-ethics-1",
      display_order: 1,
      points: 1
    },
    {
      id: "link-trim-2",
      exam_id: "exam-trimestral-me1",
      question_id: "question-airway-1",
      display_order: 2,
      points: 1
    },
    {
      id: "link-trim-3",
      exam_id: "exam-trimestral-me1",
      question_id: "question-obstetric-1",
      display_order: 3,
      points: 1
    }
  ],
  "exam-simulado-cet": [
    {
      id: "link-sim-1",
      exam_id: "exam-simulado-cet",
      question_id: "question-airway-1",
      display_order: 1,
      points: 1
    },
    {
      id: "link-sim-2",
      exam_id: "exam-simulado-cet",
      question_id: "question-ethics-1",
      display_order: 2,
      points: 1
    },
    {
      id: "link-sim-3",
      exam_id: "exam-simulado-cet",
      question_id: "question-obstetric-1",
      display_order: 3,
      points: 1
    }
  ]
};

const mockExamAttempts: ExamAttempt[] = [
  {
    id: "attempt-trimestral-1",
    exam_id: "exam-trimestral-me1",
    trainee_user_id: "trainee-001",
    started_at: new Date().toISOString(),
    submitted_at: new Date().toISOString(),
    raw_score: 2,
    percent_score: 67,
    status: "graded"
  }
];

const mockExamAnswers: Record<string, ExamAnswer[]> = {
  "attempt-trimestral-1": [
    {
      id: "answer-1",
      exam_attempt_id: "attempt-trimestral-1",
      question_id: "question-ethics-1",
      selected_option_ids: ["opt-ethics-2"],
      is_correct: true,
      points_awarded: 1,
      answered_at: new Date().toISOString()
    },
    {
      id: "answer-2",
      exam_attempt_id: "attempt-trimestral-1",
      question_id: "question-airway-1",
      selected_option_ids: ["opt-airway-2"],
      is_correct: false,
      points_awarded: 0,
      answered_at: new Date().toISOString()
    },
    {
      id: "answer-3",
      exam_attempt_id: "attempt-trimestral-1",
      question_id: "question-obstetric-1",
      selected_option_ids: ["opt-obstetric-1"],
      is_correct: true,
      points_awarded: 1,
      answered_at: new Date().toISOString()
    }
  ]
};

const mockExamResultDomains: Record<string, ExamResultDomain[]> = {
  "attempt-trimestral-1": [
    {
      id: "result-domain-1",
      exam_attempt_id: "attempt-trimestral-1",
      curriculum_topic_id: "topic-me1-ethics",
      score_percent: 100,
      correct_count: 1,
      total_count: 1
    },
    {
      id: "result-domain-2",
      exam_attempt_id: "attempt-trimestral-1",
      curriculum_topic_id: "topic-me1-airway",
      score_percent: 0,
      correct_count: 0,
      total_count: 1
    },
    {
      id: "result-domain-3",
      exam_attempt_id: "attempt-trimestral-1",
      curriculum_topic_id: "topic-me1-pharm",
      score_percent: 100,
      correct_count: 1,
      total_count: 1
    }
  ]
};

const categoryLabelMap: Record<ProcedureCategory, string> = {
  airway: "Vias aéreas",
  regional: "Anestesias regionais",
  vascular_access: "Acesso vascular",
  neuroaxis: "Neuroeixo",
  general_anesthesia: "Anestesia geral",
  monitoring: "Monitorização",
  pain: "Dor",
  other: "Outros"
};

const mockProcedureCatalog: ProcedureCatalog[] = [
  {
    id: "proc-intubation",
    name: "Intubação orotraqueal",
    category: "airway",
    description: "Acesso definitivo das vias aéreas em induções complexas.",
    complexity_level: "intermediate",
    active: true
  },
  {
    id: "proc-regional-block",
    name: "Bloqueio de plexo lombar",
    category: "regional",
    description: "Analgesia regional para cirurgias abdominais.",
    complexity_level: "intermediate",
    active: true
  },
  {
    id: "proc-arterial-line",
    name: "Linha arterial",
    category: "monitoring",
    description: "Monitorização invasiva inicial em pacientes críticos.",
    complexity_level: "basic",
    active: true
  }
];

const mockSurgeryCatalog: SurgeryCatalog[] = [
  {
    id: "surgery-general-appendectomy",
    specialty: "general",
    procedure_name: "Apendicectomia",
    procedure_group: "Cirurgia abdominal",
    complexity_level: "intermediate",
    active: true
  },
  {
    id: "surgery-obstetric-c-section",
    specialty: "obstetric",
    procedure_name: "Cesárea",
    procedure_group: "Obstetrícia",
    complexity_level: "intermediate",
    active: true
  }
];

const mockInstitutionUnits: InstitutionUnit[] = [
  {
    id: "unit-hospital-santa",
    institution_id: "institution-global",
    name: "Hospital Santa Maria",
    city: "São Paulo",
    state: "SP",
    type: "hospital",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "unit-sim-center",
    institution_id: "institution-global",
    name: "Centro de Simulação CET",
    city: "Belo Horizonte",
    state: "MG",
    type: "simulation_center",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockProcedureLogs: ProcedureLog[] = [
  {
    id: "log-airway-1",
    institution_id: "institution-global",
    trainee_user_id: "trainee-001",
    preceptor_user_id: "preceptor-001",
    unit_id: "unit-hospital-santa",
    surgery_catalog_id: "surgery-general-appendectomy",
    procedure_catalog_id: "proc-intubation",
    performed_on: "2025-02-10",
    trainee_year_snapshot: "ME1",
    trainee_role: "performed_supervised",
    anesthesia_technique_summary: "Indução com propofol e succinilcolina",
    patient_profile_summary: "ASA II com refluxo",
    difficulty_perceived: "medium",
    success_status: "successful",
    complications_summary: "Refluxo reto",
    notes: "Revisar plano B",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "log-regional-1",
    institution_id: "institution-global",
    trainee_user_id: "trainee-001",
    preceptor_user_id: "preceptor-002",
    unit_id: "unit-hospital-santa",
    surgery_catalog_id: "surgery-general-appendectomy",
    procedure_catalog_id: "proc-regional-block",
    performed_on: "2025-03-02",
    trainee_year_snapshot: "ME2",
    trainee_role: "assisted",
    anesthesia_technique_summary: "Bloqueio do plexo lombar com ropivacaína",
    patient_profile_summary: "Paciente com dor crônica",
    difficulty_perceived: "medium",
    success_status: "successful",
    complications_summary: "Nenhuma",
    notes: "Boa analgesia",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "log-line-1",
    institution_id: "institution-global",
    trainee_user_id: "trainee-002",
    preceptor_user_id: "preceptor-001",
    unit_id: "unit-sim-center",
    surgery_catalog_id: "surgery-obstetric-c-section",
    procedure_catalog_id: "proc-arterial-line",
    performed_on: "2025-03-15",
    trainee_year_snapshot: "ME3",
    trainee_role: "observed",
    anesthesia_technique_summary: "Linha arterial após indução",
    patient_profile_summary: "Pré-eclâmpsia leve",
    difficulty_perceived: "high",
    success_status: "successful",
    complications_summary: "Nenhuma",
    notes: "Revisar posicionamento",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockProcedureLogItems: Record<string, ProcedureLogItem[]> = {
  "log-airway-1": [
    {
      id: "item-airway-1",
      procedure_log_id: "log-airway-1",
      procedure_catalog_id: "proc-intubation",
      quantity: 1,
      success_status: "successful",
      notes: "Trajeto claro"
    }
  ],
  "log-regional-1": [
    {
      id: "item-regional-1",
      procedure_log_id: "log-regional-1",
      procedure_catalog_id: "proc-regional-block",
      quantity: 1,
      success_status: "successful",
      notes: "Analgesia satisfatória"
    }
  ],
  "log-line-1": [
    {
      id: "item-line-1",
      procedure_log_id: "log-line-1",
      procedure_catalog_id: "proc-arterial-line",
      quantity: 1,
      success_status: "successful",
      notes: "Posição ideal"
    }
  ]
};

const mockProcedureValidations: ProcedureValidation[] = [
  {
    id: "validation-airway-1",
    procedure_log_id: "log-airway-1",
    validator_user_id: "preceptor-101",
    validation_status: "pending",
    feedback: "Rever tempo de indução"
  },
  {
    id: "validation-regional-1",
    procedure_log_id: "log-regional-1",
    validator_user_id: "preceptor-102",
    validation_status: "approved",
    feedback: "Reforçar anatomia"
  }
];

const mockProcedureSelfAssessments: Record<string, ProcedureSelfAssessment> = {
  "log-airway-1": {
    id: "self-airway-1",
    procedure_log_id: "log-airway-1",
    confidence_level: 4,
    readiness_level: "ready_with_standard_supervision",
    reflection_text: "Preciso praticar o plano B da intubação difícil.",
    created_at: new Date().toISOString()
  },
  "log-regional-1": {
    id: "self-regional-1",
    procedure_log_id: "log-regional-1",
    confidence_level: 3,
    readiness_level: "ready_with_close_supervision",
    reflection_text: "Gostaria de reforçar o posicionamento do paciente.",
    created_at: new Date().toISOString()
  }
};

const mockLogbookStats: LogbookStats = {
  totalProcedures: mockProcedureLogs.length,
  procedureTypeDistribution: [
    { name: "Intubação orotraqueal", count: 1 },
    { name: "Bloqueio de plexo lombar", count: 1 },
    { name: "Cateter arterial", count: 1 }
  ],
  categoryDistribution: [
    { category: "airway", count: 1, label: categoryLabelMap.airway },
    { category: "regional", count: 1, label: categoryLabelMap.regional },
    { category: "monitoring", count: 1, label: categoryLabelMap.monitoring }
  ],
  difficultyDistribution: [
    { difficulty: "low", count: 0 },
    { difficulty: "medium", count: 2 },
    { difficulty: "high", count: 1 }
  ],
  monthlyTrend: [
    { label: "Fev 2025", count: 1 },
    { label: "Mar 2025", count: 2 }
  ],
  frequentProcedures: [
    { name: "Intubação orotraqueal", count: 1 },
    { name: "Bloqueio de plexo lombar", count: 1 }
  ],
  pendingValidations: mockProcedureValidations.filter((item) => item.validation_status === "pending").length,
  expectedProgress: {
    expectedTotal: 24,
    actualTotal: mockProcedureLogs.length,
    progressPercent: Math.round((mockProcedureLogs.length / 24) * 100),
    label: "Meta mínima sugerida para ME1"
  }
};

const mockEmergencyScenarios: EmergencyScenario[] = [
  {
    id: "scenario-airway",
    institution_id: null,
    title: "Via aérea difícil em indução",
    description: "Paciente com Mallampati 4, obesidade e falha em ventilação por máscara.",
    category: "airway",
    difficulty_level: "advanced",
    universal_access: true,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "scenario-anafylaxia",
    institution_id: null,
    title: "Anafilaxia perioperatória",
    description: "Reação alérgica grave após antibioticoprofilaxia.",
    category: "allergic",
    difficulty_level: "advanced",
    universal_access: true,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "scenario-hipertermia",
    institution_id: null,
    title: "Hipertermia maligna",
    description: "Aumento rápido de temperatura após succinilcolina.",
    category: "hemodynamic",
    difficulty_level: "advanced",
    universal_access: true,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockScenarioSteps: Record<string, EmergencyScenarioStep[]> = {
  "scenario-airway": [
    {
      id: "step-airway-1",
      scenario_id: "scenario-airway",
      step_order: 1,
      step_type: "text",
      prompt_text: "Paciente com Mallampati 4, ruído à ventilação. Qual o próximo passo?",
      payload_jsonb: {},
      correct_branch_key: "prepare-videolaringoscopio"
    },
    {
      id: "step-airway-2",
      scenario_id: "scenario-airway",
      step_order: 2,
      step_type: "decision",
      prompt_text: "Escolha a conduta para manter oxigenação.",
      payload_jsonb: {
        options: [
          { key: "intubacao", label: "Tentar intubação convencional" },
          { key: "videolaringoscopio", label: "Preparar videolaringoscópio e manter ventilação com máscara" },
          { key: "crico", label: "Cricotireoidostomia imediata" }
        ]
      }
    }
  ],
  "scenario-anafylaxia": [
    {
      id: "step-ana-1",
      scenario_id: "scenario-anafylaxia",
      step_order: 1,
      step_type: "text",
      prompt_text: "Paciente tinge, eritema e broncoespasmo após cefalosporina.",
      payload_jsonb: {},
      correct_branch_key: "stop-antibiotico"
    },
    {
      id: "step-ana-2",
      scenario_id: "scenario-anafylaxia",
      step_order: 2,
      step_type: "decision",
      prompt_text: "Qual a sequência farmacológica imediata?",
      payload_jsonb: {
        options: [
          { key: "adrenalina", label: "Adrenalina intramuscular + fluidos" },
          { key: "remover", label: "Remover medicamento e aguardar" },
          { key: "corticosteroide", label: "Corticosteroides isolados" }
        ]
      }
    }
  ]
};

const mockEmergencyAttempts: EmergencyAttempt[] = [
  {
    id: "attempt-airway-1",
    trainee_user_id: "trainee-001",
    scenario_id: "scenario-airway",
    started_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    score_percent: 85,
    completion_status: "completed",
    debrief_summary: "Manter oxigenação e videolaringoscópio foi a chave.",
    created_at: new Date().toISOString()
  }
];

const mockEmergencyAttemptActions: Record<string, EmergencyAttemptAction[]> = {
  "attempt-airway-1": [
    {
      id: "action-1",
      emergency_attempt_id: "attempt-airway-1",
      scenario_step_id: "step-airway-1",
      action_payload: { decision: "prepare-videolaringoscopio" },
      is_expected_action: true,
      action_timestamp: new Date().toISOString()
    },
    {
      id: "action-2",
      emergency_attempt_id: "attempt-airway-1",
      scenario_step_id: "step-airway-2",
      action_payload: { decision: "videolaringoscopio" },
      is_expected_action: true,
      action_timestamp: new Date().toISOString()
    }
  ]
};

const mockEmergencySelfAssessments: EmergencySelfAssessment[] = [
  {
    id: "self-airway-1",
    trainee_user_id: "trainee-001",
    scenario_id: "scenario-airway",
    confidence_before: 3,
    confidence_after: 4,
    perceived_readiness: "ready_with_standard_supervision",
    created_at: new Date().toISOString()
  }
];

const mockEmergencySummary: EmergencySummary = {
  totalAttempts: mockEmergencyAttempts.length,
  categoryBreakdown: {
    airway: 1,
    hemodynamic: 0,
    respiratory: 0,
    allergic: 0,
    regional: 0,
    obstetric: 0,
    pediatric: 0,
    other: 0
  },
  readinessLevels: {
    ready_with_standard_supervision: 1
  },
  pendingDebriefs: 0
};

const preanestheticCategoryLabels: Record<PreanestheticCategory, string> = {
  fasting: "Jejum",
  medication_continue: "Medicações a manter",
  medication_suspend: "Medicações a suspender",
  risk_assessment: "Estratificação de risco",
  lab_tests: "Exames complementares",
  special_population: "Populações especiais",
  checklist: "Checklists"
};

const mockContentSources: ContentSource[] = [
  {
    id: "source-sba-guide",
    title: "Guia SBA de jejum",
    source_type: "guide",
    publisher: "SBA",
    publication_year: 2025,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "source-guide-appendectomy",
    title: "Guia SBA de anestesia cirúrgica",
    source_type: "guide",
    publisher: "SBA",
    publication_year: 2024,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "source-guide-obstetric",
    title: "Protocolo SBA para obstetrícia",
    source_type: "guide",
    publisher: "SBA",
    publication_year: 2023,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockContentSourceSections: ContentSourceSection[] = [
  {
    id: "section-sba-1",
    content_source_id: "source-sba-guide",
    section_label: "SBA JEJUM",
    section_title: "Jejum e risco aspirativo",
    excerpt_text: "Jejum de 6h para sólidos e 2h para líquidos claros.",
    metadata_jsonb: {},
    created_at: new Date().toISOString()
  },
  {
    id: "section-guide-appendectomy",
    content_source_id: "source-guide-appendectomy",
    section_label: "Guia cirúrgico",
    section_title: "Apendicectomia e analgesia multimodal",
    excerpt_text: "Bloqueios neuraxiais podem ser associados à anestesia geral para analgesia.",
    metadata_jsonb: {},
    created_at: new Date().toISOString()
  },
  {
    id: "section-guide-obstetric",
    content_source_id: "source-guide-obstetric",
    section_label: "Obstetrícia",
    section_title: "Cesárea e protocolos de hemorragia",
    excerpt_text: "Monitorização invasiva e reposição precoce são recomendadas na pré-eclâmpsia.",
    metadata_jsonb: {},
    created_at: new Date().toISOString()
  }
];

const mockContentItems: ContentItem[] = [
  {
    id: "item-jejuns",
    title: "Jejum pré-operatório",
    content_type: "preanesthetic",
    slug: "preanesthetic-jejum",
    status: "published",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "item-guide-appendectomy",
    title: "Guia SBA - Apendicectomia",
    content_type: "guide",
    slug: "surgery-guide-surgery-general-appendectomy",
    status: "published",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "item-guide-cesarean",
    title: "Guia SBA - Cesárea",
    content_type: "guide",
    slug: "surgery-guide-surgery-obstetric-c-section",
    status: "published",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockContentVersions: ContentVersion[] = [
  {
    id: "version-jejuns-1",
    content_item_id: "item-jejuns",
    version_number: 1,
    summary: "Revisão de jejum e hidratação",
    body_markdown: "Jejum de 6h para sólidos e 2h para líquidos claros.",
    structured_jsonb: {},
    generated_by_ai: false,
    generation_model: null,
    generation_prompt_version: null,
    review_status: "approved",
    reviewer_user_id: "reviewer-001",
    review_notes: "Conteúdo editorial aprovado.",
    created_at: new Date().toISOString()
  },
  {
    id: "version-guide-appendectomy",
    content_item_id: "item-guide-appendectomy",
    version_number: 1,
    summary: "Guia anestésico para apendicectomia",
    body_markdown: "Bloqueio sensorial e analgesia multimodal para laparoscopia.",
    structured_jsonb: {},
    generated_by_ai: false,
    generation_model: null,
    generation_prompt_version: null,
    review_status: "approved",
    reviewer_user_id: "reviewer-002",
    review_notes: "Atualização conforme protocolo SBA 2024.",
    created_at: new Date().toISOString()
  },
  {
    id: "version-guide-cesarean",
    content_item_id: "item-guide-cesarean",
    version_number: 1,
    summary: "Guia obstétrico SBA",
    body_markdown: "Planejamento para cesárea em paciente com pré-eclâmpsia leve.",
    structured_jsonb: {},
    generated_by_ai: true,
    generation_model: "gpt-4-archived",
    generation_prompt_version: "v1.2",
    review_status: "pending",
    reviewer_user_id: null,
    review_notes: null,
    created_at: new Date().toISOString()
  }
];

const mockContentReferences: Record<string, ContentReference[]> = {
  "version-jejuns-1": [
    {
      id: "ref-para-1",
      content_version_id: "version-jejuns-1",
      citation_label: "Fonte SBA 2025",
      cited_excerpt: "Jejum de 6h para sólidos é padrão.",
      content_source_id: "source-sba-guide",
      support_type: "primary_support"
    }
  ],
  "version-guide-appendectomy": [
    {
      id: "ref-guide-append-1",
      content_version_id: "version-guide-appendectomy",
      citation_label: "SBA 2024 · Guia cirúrgico",
      cited_excerpt: "Analgesia multimodal + bloqueios fornece conforto pós-op.",
      content_source_id: "source-guide-appendectomy",
      support_type: "primary_support"
    }
  ],
  "version-guide-cesarean": [
    {
      id: "ref-guide-ces-1",
      content_version_id: "version-guide-cesarean",
      citation_label: "SBA Obstetrícia 2023",
      cited_excerpt: "Monitorização invasiva recomendada em pré-eclâmpsia.",
      content_source_id: "source-guide-obstetric",
      support_type: "primary_support"
    }
  ]
};

const mockEditorialReviews: EditorialReview[] = [
  {
    id: "review-jejuns-1",
    content_version_id: "version-jejuns-1",
    reviewer_user_id: "reviewer-001",
    decision: "approve",
    comments: "Referências conferidas; pronto para publicação.",
    reviewed_at: new Date().toISOString()
  },
  {
    id: "review-guide-append-1",
    content_version_id: "version-guide-appendectomy",
    reviewer_user_id: "reviewer-002",
    decision: "approve",
    comments: "Atualizado conforme protocolo SBA 2024.",
    reviewed_at: new Date().toISOString()
  },
  {
    id: "review-guide-ces-1",
    content_version_id: "version-guide-cesarean",
    reviewer_user_id: "reviewer-003",
    decision: "needs_revision",
    comments: "Aguardando dados de hemorragia massiva para inclusão.",
    reviewed_at: new Date().toISOString()
  }
];

const mockPromptTemplates: AIPromptTemplate[] = [
  {
    id: "template-lesson",
    name: "Aula interativa SBA",
    purpose: "Gerar lições baseadas em tópicos curriculares da SBA",
    version: "v1.0",
    template_text: "Descreva o passo a passo para abordar {{topic}} em um cenário hospitalar.",
    active: true,
    created_at: new Date().toISOString()
  },
  {
    id: "template-sources",
    name: "Resumo de fontes",
    purpose: "Extrair trechos relevantes e citar seções",
    version: "v1.1",
    template_text: "Liste os pontos principais do documento {{source}} e cite páginas.",
    active: true,
    created_at: new Date().toISOString()
  }
];

const mockAIGenerationJobs: AIGenerationJob[] = [
  {
    id: "job-cesarean-lesson",
    institution_id: "institution-global",
    content_item_id: "item-guide-cesarean",
    requested_by: "editor-001",
    job_type: "generate_lesson",
    status: "completed",
    input_payload: { topic: "Pré-eclâmpsia leve", locale: "pt-BR" },
    output_payload: { summary: "Raquianestesia reforçada e bloqueio TAP" },
    model_name: "gpt-4-anesthesia",
    generation_prompt_version: "v1.2",
    started_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    error_message: null,
    created_at: new Date().toISOString()
  },
  {
    id: "job-appendectomy-sources",
    institution_id: "institution-global",
    content_item_id: "item-guide-appendectomy",
    requested_by: "editor-002",
    job_type: "summarize_sources",
    status: "blocked_no_source",
    input_payload: { document: "source-guide-appendectomy" },
    output_payload: null,
    model_name: "gpt-4-rag",
    generation_prompt_version: "v0.9",
    started_at: new Date().toISOString(),
    completed_at: null,
    error_message: "Bloqueado: nenhuma fonte confiável anexada.",
    created_at: new Date().toISOString()
  }
];

const mockAIJobSourceLinks: AIJobSourceLink[] = [
  {
    id: "job-source-1",
    ai_generation_job_id: "job-cesarean-lesson",
    content_source_id: "source-guide-obstetric",
    content_source_section_id: "section-guide-obstetric"
  },
  {
    id: "job-source-2",
    ai_generation_job_id: "job-cesarean-lesson",
    content_source_id: "source-guide-appendectomy",
    content_source_section_id: "section-guide-appendectomy"
  }
];

const mockAIValidationChecks: AIValidationCheck[] = [
  {
    id: "validation-1",
    ai_generation_job_id: "job-cesarean-lesson",
    check_type: "citation_presence",
    result: "pass",
    details: "Fontes vinculadas e citadas corretamente.",
    created_at: new Date().toISOString()
  },
  {
    id: "validation-2",
    ai_generation_job_id: "job-appendectomy-sources",
    check_type: "unsupported_claim_detection",
    result: "fail",
    details: "Conteúdo tentou mencionar condutas sem fonte.",
    created_at: new Date().toISOString()
  }
];

const mockReportViews: Record<ReportScope, ReportViewData> = {
  trainee: {
    overviewMetrics: [
      { label: "Provas completas", value: "12", helper: "Último mês", trend: [30, 40, 50] },
      { label: "Trilhas concluídas", value: "4/6", helper: "ME2", trend: [20, 45, 75] },
      { label: "Questões acertadas", value: "82%", helper: "Banco de questões", trend: [70, 78, 82] }
    ],
    domainPerformance: [
      { domain: "Cardíaco", scorePercent: 88, bestTopic: "Hemodinâmica", worstTopic: "Vias aéreas" },
      { domain: "Respiratório", scorePercent: 72, bestTopic: "Ventilação", worstTopic: "Técnicas invasivas" }
    ],
    progressSummaries: [
      { title: "Trilhas", detail: "84% do ano ME2 concluído", progressPercent: 84 },
      { title: "Lições interativas", detail: "12 lições completadas", progressPercent: 81 }
    ],
    procedureStats: [
      { title: "Procedimentos registrados", value: "28", trend: "+4 últimos 30 dias" },
      { title: "Autoavaliação de confiança", value: "4/5 média", trend: "viés crescente" }
    ],
    validationAlerts: [
      { label: "Pendências de logbook", detail: "3 registros aguardam validação", severity: "medium" }
    ],
    emergencyPerformance: [
      { scenario: "Via aérea difícil", completed: 2, successRate: 90, confidenceChange: 1 },
      { scenario: "Anafilaxia", completed: 1, successRate: 100, confidenceChange: 0 }
    ],
    editorialCoverage: { coveragePercent: 92, itemsPublished: 48, inReview: 5, criticalPending: 2 },
    usageInsights: ["Conteúdos preanesthetic consultados 18 vezes", "Guias cirúrgicos referenciados para três cirurgias"],
    cohortProgress: [],
    traineeSnapshots: []
  },
  preceptor: {
    overviewMetrics: [
      { label: "Trainees acompanhados", value: "6", helper: "ME1 a ME3" },
      { label: "Validações pendentes", value: "8", helper: "Logbook", trend: [5, 6, 8] },
      { label: "Trainees com baixo desempenho", value: "2", helper: "Domínios críticos" }
    ],
    domainPerformance: [
      { domain: "Hemorragia", scorePercent: 66, bestTopic: "Reposição volêmica", worstTopic: "Controle de sangramento" },
      { domain: "Anestesia regional", scorePercent: 74, bestTopic: "Bloqueios", worstTopic: "Anestesia obstétrica" }
    ],
    progressSummaries: [
      { title: "Grupo em trilhas", detail: "58% das trilhas ME2 em progresso" },
      { title: "Questões revisadas", detail: "95 questões marcadas com feedback", progressPercent: 95 }
    ],
    procedureStats: [
      { title: "Procedimentos supervisionados", value: "64", trend: "↑ 10 vs mês anterior" },
      { title: "Complicações registradas", value: "3", trend: "relacionadas a trauma" }
    ],
    validationAlerts: [
      { label: "Logbooks", detail: "12 registros aguardam validação", severity: "high" },
      { label: "Provas trimestrais", detail: "2 tentativas com notas abaixo de 60%", severity: "medium" }
    ],
    emergencyPerformance: [
      { scenario: "Hipertermia maligna", completed: 1, successRate: 100, confidenceChange: 2 }
    ],
    editorialCoverage: { coveragePercent: 88, itemsPublished: 42, inReview: 7, criticalPending: 4 },
    usageInsights: ["Preceptors sharing editorial insights for 8 guides", "Emergencies completed used for briefing"],
    cohortProgress: [],
    traineeSnapshots: []
  },
  admin: {
    overviewMetrics: [
      { label: "Instituições ativas", value: "3", helper: "multi-tenant" },
      { label: "Acesso da plataforma", value: "96%", helper: "último mês" },
      { label: "Conteúdo crítico revisado", value: "92%", helper: "cobertura editorial" }
    ],
    domainPerformance: [
      { domain: "Monitorização", scorePercent: 81, improvement: "+5% mês" },
      { domain: "Gestão do centro cirúrgico", scorePercent: 73, worstTopic: "Qualidade" }
    ],
    progressSummaries: [
      { title: "Provas institucionais", detail: "94% das tentativas estão concluídas" },
      { title: "Cobertura curricular", detail: "50% dos tópicos com evidências de uso editorial", progressPercent: 50 }
    ],
    procedureStats: [
      { title: "Logbooks totais", value: "312", trend: "↑ 15 vs trimestre" },
      { title: "Validações críticas", value: "9", trend: "aguardando preceptores" }
    ],
    validationAlerts: [
      { label: "Conteúdo crítico", detail: "4 versões aguardam revisão editorial", severity: "high" }
    ],
    emergencyPerformance: [
      { scenario: "Parada em centro cirúrgico", completed: 2, successRate: 85, confidenceChange: 1 }
    ],
    editorialCoverage: { coveragePercent: 82, itemsPublished: 57, inReview: 11, criticalPending: 4 },
    usageInsights: ["IA jobs geraram 6 versões de conteúdos críticos", "Cobertura editorial rastreia 120 referências"],
    cohortProgress: [],
    traineeSnapshots: []
  }
};

const mockPreanestheticTopics: PreanestheticTopic[] = [
  {
    id: "topic-fasting",
    title: "Orientações de jejum",
    category: "fasting",
    target_audience: "all",
    summary: "Evite alimentos sólidos por 6h e líquidos claros por 2h antes da anestesia.",
    detailed_content_markdown: "Jejum reduz o risco de aspiração. Siga guidelines da SBA e revise formas de hidratação.",
    quick_reference_jsonb: {
      bullets: ["6h sólidos", "2h líquidos claros", "Hidratação liberal com líquidos claros até 2h antes"]
    },
    decision_tree_jsonb: {
      nodes: [
        { id: "start", text: "Paciente com risco alto?", yes: "assess", no: "proceed" },
        { id: "assess", text: "Adotar jejum estendido", yes: "proceed", no: "review based on surgery" }
      ]
    },
    status: "published",
    last_reviewed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "topic-medication-continue",
    title: "Medicações a manter",
    category: "medication_continue",
    target_audience: "trainee",
    summary: "Beta-bloqueadores e anti-hipertensivos devem ser mantidos conforme estabilidade.",
    detailed_content_markdown: "Mantenha beta-bloqueadores para evitar descompensação, ajuste IECA se hipotensão.",
    quick_reference_jsonb: {
      table: [
        { medication: "Beta-bloqueador", guidance: "Manter habitual" },
        { medication: "IECA/ARA", guidance: "Suspender na manhã do procedimento se hipotenso" }
      ]
    },
    decision_tree_jsonb: {
      nodes: [
        { id: "start", text: "Paciente com hipertensão controlada?", yes: "maintain", no: "consult" }
      ]
    },
    status: "under_review",
    last_reviewed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export interface PreanestheticFilters {
  category?: PreanestheticCategory;
  query?: string;
}

export async function fetchPreanestheticTopics(filters: PreanestheticFilters = {}): Promise<PreanestheticTopic[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return filterPreanestheticMocks(filters);
  }

  let builder = supabase
    .from("preanesthetic_topics")
    .select("*")
    .order("title", { ascending: true });

  if (filters.category) {
    builder = builder.eq("category", filters.category);
  }

  const { data } = await builder;
  if (!data) {
    return filterPreanestheticMocks(filters);
  }

  return data;
}

function filterPreanestheticMocks(filters: PreanestheticFilters) {
  return mockPreanestheticTopics.filter((topic) => {
    if (filters.category && topic.category !== filters.category) {
      return false;
    }

    if (filters.query) {
      const queryLower = filters.query.toLowerCase();
      return (
        topic.title.toLowerCase().includes(queryLower) ||
        (topic.summary?.toLowerCase().includes(queryLower) ?? false)
      );
    }

    return true;
  });
}

export async function fetchPreanestheticTopicById(topicId: string): Promise<PreanestheticTopic | null> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockPreanestheticTopics.find((topic) => topic.id === topicId) ?? null;
  }

  const { data } = await supabase.from("preanesthetic_topics").select("*").eq("id", topicId).maybeSingle();
  return data ?? null;
}

export async function fetchPreanestheticTopicLinks(topicId: string): Promise<PreanestheticTopicLink[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockPreanestheticTopicLinks.filter((link) => link.preanesthetic_topic_id === topicId);
  }

  const { data } = await supabase.from("preanesthetic_topic_links").select("*").eq("preanesthetic_topic_id", topicId);
  return data ?? [];
}

export async function fetchContentSources(): Promise<ContentSource[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockContentSources;
  }

  const { data } = await supabase.from("content_sources").select("*").order("title", { ascending: true });
  return data ?? mockContentSources;
}

export async function fetchContentSourceSections(sourceId: string): Promise<ContentSourceSection[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockContentSourceSections.filter((section) => section.content_source_id === sourceId);
  }

  const { data } = await supabase.from("content_source_sections").select("*").eq("content_source_id", sourceId);
  return data ?? [];
}

export async function fetchContentItems(): Promise<ContentItem[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockContentItems;
  }

  const builder = supabase.from("content_items").select("*").order("title", { ascending: true });
  const filtered = applyTenantFilter(builder, await resolveInstitutionId());
  const { data } = await filtered;
  return data ?? mockContentItems;
}

export async function fetchContentVersions(itemId: string): Promise<ContentVersion[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockContentVersions.filter((version) => version.content_item_id === itemId);
  }

  const { data } = await supabase.from("content_versions").select("*").eq("content_item_id", itemId).order("version_number", { ascending: false });
  return data ?? [];
}

export async function fetchContentReferences(versionId: string): Promise<ContentReference[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockContentReferences[versionId] ?? [];
  }

  const { data } = await supabase.from("content_references").select("*").eq("content_version_id", versionId);
  return data ?? mockContentReferences[versionId] ?? [];
}

export async function fetchAIPromptTemplates(): Promise<AIPromptTemplate[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockPromptTemplates;
  }

  const { data } = await supabase.from("ai_prompt_templates").select("*").order("name", { ascending: true });
  return data ?? mockPromptTemplates;
}

export async function fetchAIGenerationJobs(): Promise<AIGenerationJob[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockAIGenerationJobs;
  }

  const builder = supabase.from("ai_generation_jobs").select("*").order("created_at", { ascending: false });
  const filtered = applyTenantFilter(builder, await resolveInstitutionId());
  const { data } = await filtered;
  return data ?? mockAIGenerationJobs;
}

export async function fetchAIGenerationJobById(jobId: string): Promise<AIGenerationJob | null> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockAIGenerationJobs.find((job) => job.id === jobId) ?? null;
  }

  const { data } = await supabase.from("ai_generation_jobs").select("*").eq("id", jobId).maybeSingle();
  return data ?? null;
}

export async function fetchAIJobSourceLinks(jobId: string): Promise<AIJobSourceLink[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockAIJobSourceLinks.filter((link) => link.ai_generation_job_id === jobId);
  }

  const { data } = await supabase.from("ai_job_source_links").select("*").eq("ai_generation_job_id", jobId);
  return data ?? [];
}

export async function fetchAIValidationChecks(jobId: string): Promise<AIValidationCheck[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockAIValidationChecks.filter((check) => check.ai_generation_job_id === jobId);
  }

  const { data } = await supabase.from("ai_validation_checks").select("*").eq("ai_generation_job_id", jobId);
  return data ?? [];
}

export async function fetchAllAIValidationChecks(): Promise<AIValidationCheck[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockAIValidationChecks;
  }

  const { data } = await supabase.from("ai_validation_checks").select("*").order("created_at", { ascending: false });
  return data ?? [];
}

export async function fetchReportViewData(scope: ReportScope): Promise<ReportViewData> {
  if (!isSupabaseConfigured()) {
    return mockReportViews[scope];
  }

  // Placeholder for future Supabase queries; currently return mock data.
  return mockReportViews[scope];
}

export async function fetchAIGenerationJobTrace(jobId: string): Promise<AIGenerationJobTrace | null> {
  const job = await fetchAIGenerationJobById(jobId);
  if (!job) {
    return null;
  }

  const [links, validations] = await Promise.all([fetchAIJobSourceLinks(jobId), fetchAIValidationChecks(jobId)]);
  const allSources = await fetchContentSources();

  const sources = allSources.filter((source) => links.some((link) => link.content_source_id === source.id));

  return {
    job,
    sources,
    validations
  };
}

export async function fetchContentItemById(contentId: string): Promise<ContentItem | null> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockContentItems.find((item) => item.id === contentId) ?? null;
  }

  const { data } = await supabase.from("content_items").select("*").eq("id", contentId).maybeSingle();
  return data ?? null;
}

export async function fetchAllContentVersions(): Promise<ContentVersion[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockContentVersions;
  }

  const { data } = await supabase.from("content_versions").select("*").order("version_number", { ascending: true });
  return data ?? mockContentVersions;
}

export async function fetchContentLatestVersion(contentItemId: string): Promise<ContentVersion | null> {
  const supabase = await fetchClient();
  if (!supabase) {
    const versions = mockContentVersions.filter((version) => version.content_item_id === contentItemId);
    return versions.sort((a, b) => b.version_number - a.version_number)[0] ?? null;
  }

  const { data } = await supabase
    .from("content_versions")
    .select("*")
    .eq("content_item_id", contentItemId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data ?? null;
}

export async function fetchEditorialReviewsForVersion(versionId: string): Promise<EditorialReview[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockEditorialReviews.filter((review) => review.content_version_id === versionId);
  }

  const { data } = await supabase.from("editorial_reviews").select("*").eq("content_version_id", versionId).order("reviewed_at", { ascending: false });
  return data ?? [];
}

export async function fetchContentSummaries(): Promise<ContentSummary[]> {
  const [items, versions] = await Promise.all([fetchContentItems(), fetchAllContentVersions()]);
  const latestByItem = new Map<string, ContentVersion>();
  versions.forEach((version) => {
    const current = latestByItem.get(version.content_item_id);
    if (!current || version.version_number > current.version_number) {
      latestByItem.set(version.content_item_id, version);
    }
  });

  const versionReviewsMap = new Map<string, EditorialReview[]>();
  await Promise.all(
    Array.from(latestByItem.values()).map(async (version) => {
      const reviews = await fetchEditorialReviewsForVersion(version.id);
      versionReviewsMap.set(version.id, reviews);
    })
  );

  return items.map((item) => {
    const latestVersion = latestByItem.get(item.id);
    return {
      item,
      latestVersion,
      latestReviews: latestVersion ? versionReviewsMap.get(latestVersion.id) ?? [] : []
    };
  });
}

export async function fetchEditorialQueue(): Promise<ContentQueueEntry[]> {
  const [items, versions] = await Promise.all([fetchContentItems(), fetchAllContentVersions()]);
  const itemMap = new Map(items.map((item) => [item.id, item]));
  const queue = versions.filter((version) => version.review_status === "pending");

  return queue.map((version) => ({
    version,
    item: itemMap.get(version.content_item_id) as ContentItem
  }));
}

export async function fetchContentTimeline(contentItemId: string): Promise<ContentVersionTimelineEntry[]> {
  const versions = await fetchContentVersions(contentItemId);
  const entries: ContentVersionTimelineEntry[] = [];

  await Promise.all(
    versions.map(async (version) => {
      const reviews = await fetchEditorialReviewsForVersion(version.id);
      entries.push({ version, reviews });
    })
  );

  return entries.sort((a, b) => b.version.version_number - a.version.version_number);
}

async function gatherGuideReferencesFromContent(guideId: string, guideTitle: string): Promise<string[]> {
  const items = await fetchContentItems();
  if (!items.length) {
    return [];
  }

  const slugCandidate = `surgery-guide-${guideId}`.toLowerCase();
  const match = items.find(
    (item) =>
      (item.slug?.toLowerCase() ?? "") === slugCandidate ||
      item.title?.toLowerCase().includes(guideTitle.toLowerCase() ?? "")
  );

  if (!match) {
    return [];
  }

  const versions = await fetchContentVersions(match.id);
  const versionId = versions[0]?.id;
  if (!versionId) {
    return [];
  }

  const references = await fetchContentReferences(versionId);
  return references.map((reference) => reference.citation_label ?? reference.cited_excerpt ?? "Referência clínica");
}

export async function fetchSurgeryGuides(filters: SurgeryGuideFilters = {}): Promise<SurgeryGuideSummary[]> {
  const supabase = await fetchClient();

  if (!supabase) {
    const summaries = mockSurgeryGuides.map((guide) =>
      buildSurgeryGuideSummary({
        ...guide,
        surgery_catalog: mockSurgeryCatalog.find((item) => item.id === guide.surgery_catalog_id) ?? null
      })
    );
    return filterSurgeryGuides(summaries, filters);
  }

  const { data } = await supabase
    .from("surgery_anesthesia_guides")
    .select("*, surgery_catalog(*)")
    .order("title", { ascending: true });

  const summaries = (data ?? []).map((record) => buildSurgeryGuideSummary(record));
  return filterSurgeryGuides(summaries, filters);
}

export async function fetchSurgeryGuideById(guideId: string): Promise<SurgeryGuideDetail | null> {
  const supabase = await fetchClient();

  if (!supabase) {
    const mockGuide = mockSurgeryGuides.find((guide) => guide.id === guideId);
    if (!mockGuide) {
      return null;
    }

    const summary = buildSurgeryGuideSummary({
      ...mockGuide,
      surgery_catalog: mockSurgeryCatalog.find((item) => item.id === mockGuide.surgery_catalog_id) ?? null
    });
    const variants = mockSurgeryGuideVariants.filter((variant) => variant.guide_id === guideId);
    const references = await gatherGuideReferencesFromContent(guideId, mockGuide.title);
    return { ...summary, variants, references };
  }

  const { data } = await supabase
    .from("surgery_anesthesia_guides")
    .select("*, surgery_catalog(*)")
    .eq("id", guideId)
    .maybeSingle();

  if (!data) {
    return null;
  }

  const summary = buildSurgeryGuideSummary(data);
  const variants = await fetchSurgeryGuideVariants(guideId);
  const references = await gatherGuideReferencesFromContent(guideId, summary.guide.title);
  return { ...summary, variants, references };
}

export async function fetchSurgeryGuideVariants(guideId: string): Promise<SurgeryGuideVariant[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockSurgeryGuideVariants.filter((variant) => variant.guide_id === guideId);
  }

  const { data } = await supabase.from("surgery_guide_variants").select("*").eq("guide_id", guideId);
  return data ?? [];
}

function buildSurgeryGuideSummary(
  record: SurgeryAnesthesiaGuide & { surgery_catalog?: SurgeryCatalog | null }
): SurgeryGuideSummary {
  const surgery =
    record.surgery_catalog ??
    mockSurgeryCatalog.find((item) => item.id === record.surgery_catalog_id) ??
    ({
      id: record.surgery_catalog_id,
      specialty: record.specialty,
      procedure_name: record.title,
      procedure_group: null,
      complexity_level: "basic",
      active: true
    } satisfies SurgeryCatalog);

  const metadata = extractGuideChecklistMetadata(record.checklist_jsonb);

  return {
    guide: record,
    surgery,
    contexts: metadata.contexts ?? [],
    patientTypes: metadata.patient_types ?? [],
    suggestedYears: metadata.suggested_years ?? []
  };
}

function extractGuideChecklistMetadata(
  checklist: SurgeryGuideChecklist | Record<string, unknown> | null | undefined
): SurgeryGuideChecklistMetadata {
  const metadata = (checklist as SurgeryGuideChecklist)?.metadata ?? ({} as SurgeryGuideChecklistMetadata);
  return {
    contexts: normalizeStringArray(metadata.contexts),
    patient_types: normalizeStringArray(metadata.patient_types),
    suggested_years: normalizeYearArray(metadata.suggested_years),
    confidence_level: metadata.confidence_level
  };
}

function normalizeStringArray(value?: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }
  return [];
}

function normalizeYearArray(value?: unknown): TraineeYearCode[] {
  const validYears: TraineeYearCode[] = ["ME1", "ME2", "ME3"];

  if (Array.isArray(value)) {
    return value
      .filter(
        (item): item is TraineeYearCode => typeof item === "string" && validYears.includes(item as TraineeYearCode)
      )
      .filter((item, index, list) => list.indexOf(item) === index);
  }

  if (typeof value === "string" && validYears.includes(value as TraineeYearCode)) {
    return [value as TraineeYearCode];
  }

  return [];
}

function filterSurgeryGuides(summaries: SurgeryGuideSummary[], filters: SurgeryGuideFilters): SurgeryGuideSummary[] {
  const normalizedQuery = filters.query?.trim().toLowerCase();

  return summaries.filter((summary) => {
    if (filters.specialty && summary.surgery.specialty !== filters.specialty) {
      return false;
    }

    if (filters.complexity && summary.surgery.complexity_level !== filters.complexity) {
      return false;
    }

    if (filters.suggestedYear && !summary.suggestedYears.includes(filters.suggestedYear)) {
      return false;
    }

    if (filters.patientType && !summary.patientTypes.includes(filters.patientType)) {
      return false;
    }

    if (filters.context && !summary.contexts.includes(filters.context)) {
      return false;
    }

    if (normalizedQuery) {
      const target = `${summary.guide.title ?? ""} ${summary.guide.summary ?? ""} ${summary.surgery.procedure_name}`;
      if (!target.toLowerCase().includes(normalizedQuery)) {
        return false;
      }
    }

    return true;
  });
}

const mockPreanestheticTopicLinks: PreanestheticTopicLink[] = [
  { id: "link-jejuns", preanesthetic_topic_id: "topic-fasting", curriculum_topic_id: "topic-me1-airway" },
  { id: "link-med-maintain", preanesthetic_topic_id: "topic-medication-continue", curriculum_topic_id: "topic-me2-monitoring" }
];

const mockSurgeryGuides: SurgeryAnesthesiaGuide[] = [
  {
    id: "guide-surgery-general-appendectomy",
    surgery_catalog_id: "surgery-general-appendectomy",
    title: "Apendicectomia laparoscópica",
    specialty: "general",
    summary:
      "Anestesia geral balanceada com analgesia multimodal e plano de resgate para pacientes ASA I/II submetidos a apendicectomia laparoscópica.",
    educational_scope_notice:
      "Conteúdo educacional baseado em guidelines SBA. Veja o checklist e confirme protocolos institucionais antes de implementar qualquer conduta.",
    preop_considerations_markdown:
      "Identifique sinais de peritonite, avaliações laboratoriais e otimize volemia. A admissão deve incluir analgesia multimodal e antibiótico profilático.",
    monitoring_markdown:
      "Monitorização padrão com ECG, oximetria, capnografia e pressão não invasiva; considere monitorização invasiva se instabilidade.",
    anesthetic_approach_markdown:
      "Indução com propofol e fentanil, manutenção com sevoflurano e bloqueio paravertebral opcional para reduzir opioides.",
    medication_strategy_markdown:
      "Administre antieméticos dupla via e mantenha analgesia multimodal com AINEs e paracetamol; reveja dosagens renais.",
    analgesia_plan_markdown:
      "Bloqueio torácico paravertebral + ketorolaco + dipirona. Reserve opioide para dor moderada e registre doses.",
    postop_plan_markdown:
      "Terapia multimodal no pós-operatório imediato, controle da náusea e mobilização precoce. Protocolos de alta segura em 24h.",
    risks_and_pitfalls_markdown:
      "Dor refratária quando o bloqueio falha, laparoscopia prolongada, risco de hipoventilação pós-op.",
    checklist_jsonb: {
      objectives: [
        "Promover analgesia confortável",
        "Minimizar opioides",
        "Evitar hipotensão pós-indução"
      ],
      alternatives: ["Bloqueio paravertebral contínuo", "Bloqueio TAP em lugar do paravertebral"],
      entries: [
        { label: "Confirmações de jejum e avaliação de ASA" },
        { label: "Plano de bloqueio paravertebral registrado" },
        { label: "Anti-náuseas e DVT profilaxia em curso" }
      ],
      metadata: {
        contexts: ["elective", "inpatient"],
        patient_types: ["adult"],
        suggested_years: ["ME2", "ME3"],
        confidence_level: "medium"
      }
    },
    status: "published",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "guide-surgery-obstetric-c-section",
    surgery_catalog_id: "surgery-obstetric-c-section",
    title: "Cesárea em pré-eclâmpsia leve",
    specialty: "obstetric",
    summary:
      "Guia para anestesia espinhal com reforço de monitoração hemodinâmica em pacientes obstétricas com pré-eclâmpsia leve.",
    educational_scope_notice:
      "Conteúdo educacional que apoia decisões anestésicas; confirme as condutas obstétricas locais e protocolos maternos antes das intervenções.",
    preop_considerations_markdown:
      "Avalie pressão arterial, plaquetas e coagulação. Institua hidratação judiciosa e profiláxia de convulsões conforme protocolo.",
    monitoring_markdown:
      "Monitorização invasiva arterial, capnografia e doppler fetal quando indicado; mantenha linha venosa segura.",
    anesthetic_approach_markdown:
      "Raquianestesia com hiperbárica + fenilefrina titulada; considere cateter espinhal se sala com alto volume.",
    medication_strategy_markdown:
      "Fenilefrina em bolsa de bomba, cefazolina profilática, e antieméticos múltiplos; opte por tranexâmico se hemorragia esperada.",
    analgesia_plan_markdown:
      "Bloqueio TAP e parças de morfina intratecal; analgesia multimodal com AINEs e paracetamol após a drenagem uterina.",
    postop_plan_markdown:
      "Vigilância da PA, cuidado com hipovolemia, revisão da perda sanguínea e plano de alta da UTI obstétrica.",
    risks_and_pitfalls_markdown:
      "Hipotensão grave pós-raquianestesia, hemorragia obstétrica e aspiração pulmonar em população bariátrica.",
    checklist_jsonb: {
      objectives: [
        "Estabilizar hemodinâmica",
        "Preparar para hemorragia obstétrica",
        "Assegurar analgesia pós-operatória eficaz"
      ],
      alternatives: ["Raquianestesia com cateter", "Anestesia geral planejada com bloco TAP"],
      entries: [
        { label: "Cálculo de volemia e reposição" },
        { label: "Plano de anti-hipertensivo e antieméticos" },
        { label: "Checklist obstétrico e comunicação com obstetra" }
      ],
      metadata: {
        contexts: ["urgent", "inpatient"],
        patient_types: ["obstetric"],
        suggested_years: ["ME3"],
        confidence_level: "medium"
      }
    },
    status: "under_review",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockSurgeryGuideVariants: SurgeryGuideVariant[] = [
  {
    id: "variant-appendectomy-paravertebral",
    guide_id: "guide-surgery-general-appendectomy",
    variant_label: "Paravertebral com cateter contínuo",
    context_jsonb: { focus: "analgesia multimodal prolongada" },
    content_markdown:
      "Insira cateter paravertebral com infusão contínua de ropivacaína para reduzir opioides durante o pós-operatório."
  },
  {
    id: "variant-cesarean-hybrid",
    guide_id: "guide-surgery-obstetric-c-section",
    variant_label: "Raquianestesia reforçada + bloqueio TAP",
    context_jsonb: { focus: "obstetric high-risk" },
    content_markdown:
      "Raquianestesia planejada com fenilefrina titulada e bloqueio TAP bilateral após entrega para analgesia prolongada."
  }
];


export async function fetchProcedureCatalogEntries(): Promise<ProcedureCatalog[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockProcedureCatalog;
  }

  const { data } = await supabase.from("procedure_catalog").select("*").order("name", { ascending: true });
  return data ?? mockProcedureCatalog;
}

export async function fetchSurgeryCatalogEntries(): Promise<SurgeryCatalog[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockSurgeryCatalog;
  }

  const { data } = await supabase.from("surgery_catalog").select("*").order("procedure_name", { ascending: true });
  return data ?? mockSurgeryCatalog;
}

export async function fetchInstitutionUnits(institutionId?: string): Promise<InstitutionUnit[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockInstitutionUnits;
  }

  const builder = supabase.from("institution_units").select("*").order("name", { ascending: true });
  const filtered = applyTenantFilter(builder, institutionId);
  const { data } = await filtered;
  return data ?? mockInstitutionUnits;
}

export async function fetchInstitutionReviewers(institutionId?: string): Promise<InstitutionReviewerSummary[]> {
  const supabase = await fetchClient();
  if (!supabase || !institutionId) {
    return [];
  }

  const [profilesResult, rolesResult, rolesCatalogResult] = await Promise.all([
    supabase.from("user_profiles").select("id, full_name, email").eq("institution_id", institutionId),
    supabase.from("user_roles").select("user_id, role_id").eq("institution_id", institutionId),
    supabase.from("roles").select("id, code").in("code", ["preceptor", "coordinator", "institution_admin"])
  ]);

  const profiles = profilesResult.data;
  const roles = rolesResult.data;
  const roleIdToCode = new Map((rolesCatalogResult.data ?? []).map((role) => [role.id, role.code]));

  if (!profiles?.length || !roles?.length) {
    return [];
  }

  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
  const deduped = new Map<string, InstitutionReviewerSummary>();

  roles.forEach((entry) => {
    const profile = profileMap.get(entry.user_id);
    const roleCode = roleIdToCode.get(entry.role_id);
    if (!profile || !roleCode || deduped.has(entry.user_id)) {
      return;
    }

    deduped.set(entry.user_id, {
      id: entry.user_id,
      full_name: profile.full_name ?? profile.email ?? "Preceptor",
      email: profile.email ?? "",
      role: roleCode
    });
  });

  return Array.from(deduped.values()).sort((a, b) => a.full_name.localeCompare(b.full_name, "pt-BR"));
}

export async function fetchUserProfileSummaries(userIds: string[]): Promise<Map<string, { full_name: string; email: string }>> {
  const supabase = await fetchClient();
  if (!supabase || !userIds.length) {
    return new Map();
  }

  const { data } = await supabase.from("user_profiles").select("id, full_name, email").in("id", userIds);
  return new Map((data ?? []).map((profile) => [profile.id, { full_name: profile.full_name ?? "", email: profile.email ?? "" }]));
}

export async function fetchProcedureLogs(traineeId?: string, institutionId?: string): Promise<ProcedureLog[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return traineeId
      ? mockProcedureLogs.filter((log) => log.trainee_user_id === traineeId)
      : mockProcedureLogs;
  }

  let builder = supabase
    .from("procedure_logs")
    .select("*")
    .order("performed_on", { ascending: false });

  if (traineeId) {
    builder = builder.eq("trainee_user_id", traineeId);
  }

  builder = applyTenantFilter(builder, institutionId);

  const { data } = await builder;
  return data ?? mockProcedureLogs;
}

export async function fetchProcedureLogById(
  logId: string,
  options?: { traineeId?: string; institutionId?: string }
): Promise<ProcedureLog | null> {
  const supabase = await fetchClient();
  if (!supabase) {
    const mockLog = mockProcedureLogs.find((log) => log.id === logId) ?? null;
    if (options?.traineeId && mockLog?.trainee_user_id !== options.traineeId) {
      return null;
    }
    return mockLog;
  }

  let builder = supabase.from("procedure_logs").select("*").eq("id", logId);

  if (options?.traineeId) {
    builder = builder.eq("trainee_user_id", options.traineeId);
  }

  builder = applyTenantFilter(builder, options?.institutionId);

  const { data } = await builder.maybeSingle();
  return data ?? null;
}

export async function fetchProcedureLogItems(logId: string): Promise<ProcedureLogItem[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockProcedureLogItems[logId] ?? [];
  }

  const { data } = await supabase.from("procedure_log_items").select("*").eq("procedure_log_id", logId);
  return data ?? mockProcedureLogItems[logId] ?? [];
}

export async function fetchProcedureValidations(
  status?: ValidationStatus,
  options?: { validatorUserId?: string; procedureLogIds?: string[] }
): Promise<ProcedureValidation[]> {
  if (options?.procedureLogIds && options.procedureLogIds.length === 0) {
    return [];
  }

  const supabase = await fetchClient();
  if (!supabase) {
    return (status ? mockProcedureValidations.filter((validation) => validation.validation_status === status) : mockProcedureValidations)
      .filter((validation) => {
        if (options?.validatorUserId && validation.validator_user_id !== options.validatorUserId) {
          return false;
        }

        if (options?.procedureLogIds?.length && !options.procedureLogIds.includes(validation.procedure_log_id)) {
          return false;
        }

        return true;
      });
  }

  let builder = supabase.from("procedure_validations").select("*");
  if (status) {
    builder = builder.eq("validation_status", status);
  }

  if (options?.validatorUserId) {
    builder = builder.eq("validator_user_id", options.validatorUserId);
  }

  if (options?.procedureLogIds?.length) {
    builder = builder.in("procedure_log_id", options.procedureLogIds);
  }

  const { data } = await builder;
  return data ?? [];
}

export async function fetchProcedureSelfAssessment(logId: string): Promise<ProcedureSelfAssessment | null> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockProcedureSelfAssessments[logId] ?? null;
  }

  const { data } = await supabase.from("procedure_self_assessments").select("*").eq("procedure_log_id", logId).maybeSingle();
  return data ?? mockProcedureSelfAssessments[logId] ?? null;
}

export async function fetchLogbookStats(options?: {
  traineeId?: string;
  institutionId?: string;
  validatorUserId?: string;
  trainingYear?: TraineeYearCode;
}): Promise<LogbookStats> {
  const logs = await fetchProcedureLogs(options?.traineeId, options?.institutionId);
  const procedures = await fetchProcedureCatalogEntries();
  const pendingValidations = await fetchProcedureValidations("pending", {
    validatorUserId: options?.validatorUserId,
    procedureLogIds: logs.map((log) => log.id)
  });

  if (!logs.length) {
    const expectedTotalsByYear: Record<TraineeYearCode, number> = {
      ME1: 24,
      ME2: 60,
      ME3: 110
    };
    const expectedTotal = options?.trainingYear ? expectedTotalsByYear[options.trainingYear] : null;
    return {
      totalProcedures: 0,
      procedureTypeDistribution: [],
      categoryDistribution: [],
      difficultyDistribution: [],
      monthlyTrend: [],
      frequentProcedures: [],
      pendingValidations: 0,
      expectedProgress: expectedTotal
        ? {
            expectedTotal,
            actualTotal: 0,
            progressPercent: 0,
            label: `Meta mínima sugerida para ${options?.trainingYear}`
          }
        : null
    };
  }

  const procedureMap = new Map(procedures.map((proc) => [proc.id, proc]));
  const categoryCounts = new Map<ProcedureCategory, number>();
  const difficultyCounts: Record<PerceivedDifficulty, number> = { low: 0, medium: 0, high: 0 };
  const monthlyAccumulator = new Map<string, { key: string; label: string; count: number }>();
  const frequentProceduresMap = new Map<string, number>();
  const expectedTotalsByYear: Record<TraineeYearCode, number> = {
    ME1: 24,
    ME2: 60,
    ME3: 110
  };

  logs.forEach((log) => {
    if (log.procedure_catalog_id) {
      const catalog = procedureMap.get(log.procedure_catalog_id);
      if (catalog) {
        categoryCounts.set(catalog.category, (categoryCounts.get(catalog.category) ?? 0) + 1);
        frequentProceduresMap.set(catalog.name, (frequentProceduresMap.get(catalog.name) ?? 0) + 1);
      }
    }

    if (log.difficulty_perceived) {
      difficultyCounts[log.difficulty_perceived] = (difficultyCounts[log.difficulty_perceived] ?? 0) + 1;
    }

    if (log.performed_on) {
      const performedDate = new Date(log.performed_on);
      if (!Number.isNaN(performedDate.getTime())) {
        const key = `${performedDate.getFullYear()}-${performedDate.getMonth()}`;
        const label = new Date(performedDate.getFullYear(), performedDate.getMonth()).toLocaleString("pt-BR", {
          month: "short",
          year: "numeric"
        });
        const current = monthlyAccumulator.get(key) ?? { key, label, count: 0 };
        current.count += 1;
        monthlyAccumulator.set(key, current);
      }
    }
  });

  const categoryDistribution = Array.from(categoryCounts.entries()).map(([category, count]) => ({
    category,
    count,
    label: categoryLabelMap[category] ?? category
  }));

  const difficultyDistribution = (["low", "medium", "high"] as PerceivedDifficulty[])
    .map((level) => ({
      difficulty: level,
      count: difficultyCounts[level] ?? 0
    }))
    .filter((item) => item.count > 0);

  const monthlyTrend = Array.from(monthlyAccumulator.values())
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(({ label, count }) => ({
      label,
      count
    }));

  const frequentProcedures = Array.from(frequentProceduresMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  const procedureTypeDistribution = Array.from(frequentProceduresMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  const expectedTotal = options?.trainingYear ? expectedTotalsByYear[options.trainingYear] : null;
  const expectedProgress = expectedTotal
    ? {
        expectedTotal,
        actualTotal: logs.length,
        progressPercent: Math.min(100, Math.round((logs.length / expectedTotal) * 100)),
        label: `Meta mínima sugerida para ${options?.trainingYear}`
      }
    : null;

  return {
    totalProcedures: logs.length,
    procedureTypeDistribution: procedureTypeDistribution.length
      ? procedureTypeDistribution
      : mockLogbookStats.frequentProcedures,
    categoryDistribution: categoryDistribution.length ? categoryDistribution : mockLogbookStats.categoryDistribution,
    difficultyDistribution: difficultyDistribution.length
      ? difficultyDistribution
      : mockLogbookStats.difficultyDistribution,
    monthlyTrend: monthlyTrend.length ? monthlyTrend : mockLogbookStats.monthlyTrend,
    frequentProcedures: frequentProcedures.length ? frequentProcedures : mockLogbookStats.frequentProcedures,
    pendingValidations: pendingValidations.length,
    expectedProgress
  };
}

export async function fetchRecentEmergencyAttempts(userId: string): Promise<EmergencyAttempt[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("emergency_attempts")
    .select("*")
    .eq("trainee_user_id", userId)
    .order("started_at", { ascending: false })
    .limit(4);

  return data ?? [];
}

export async function fetchEmergencyAttemptsByTrainee(
  traineeUserId: string,
  limit?: number
): Promise<EmergencyAttempt[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockEmergencyAttempts
      .filter((attempt) => attempt.trainee_user_id === traineeUserId)
      .slice(0, limit ?? mockEmergencyAttempts.length);
  }

  let builder = supabase
    .from("emergency_attempts")
    .select("*")
    .eq("trainee_user_id", traineeUserId)
    .order("created_at", { ascending: false });

  if (limit) {
    builder = builder.limit(limit);
  }

  const { data } = await builder;
  return data ?? [];
}

export async function fetchEmergencySelfAssessmentByAttempt(
  attemptId: string
): Promise<EmergencySelfAssessment | null> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockEmergencySelfAssessments.find((assessment) => assessment.emergency_attempt_id === attemptId) ?? null;
  }

  const { data } = await supabase
    .from("emergency_self_assessments")
    .select("*")
    .eq("emergency_attempt_id", attemptId)
    .maybeSingle();

  return data ?? null;
}

export async function fetchExamById(examId: string, institutionId?: string): Promise<Exam | null> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockExams.find((exam) => exam.id === examId) ?? null;
  }

  const builder = supabase.from("exams").select("*").eq("id", examId);
  const filtered = applyTenantFilter(builder, institutionId);
  const { data } = await filtered.maybeSingle();
  return data ?? null;
}

export async function fetchExamBlueprints(examId: string): Promise<ExamBlueprint[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockExamBlueprints[examId] ?? [];
  }

  const { data } = await supabase
    .from("exam_blueprints")
    .select("*")
    .eq("exam_id", examId)
    .order("curriculum_topic_id", { ascending: true });

  return data ?? mockExamBlueprints[examId] ?? [];
}

export async function fetchExamQuestionLinks(examId: string): Promise<ExamQuestionLink[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockExamQuestionLinks[examId] ?? [];
  }

  const { data } = await supabase
    .from("exam_question_links")
    .select("*")
    .eq("exam_id", examId)
    .order("display_order", { ascending: true });

  return data ?? mockExamQuestionLinks[examId] ?? [];
}

export async function fetchExamAttemptById(
  attemptId: string,
  viewerUserId?: string,
  viewerRole?: "trainee" | "preceptor" | "admin"
): Promise<ExamAttempt | null> {
  const supabase = await fetchClient();
  if (!supabase) {
    const mockAttempt = mockExamAttempts.find((attempt) => attempt.id === attemptId) ?? null;
    if (viewerRole === "trainee" && viewerUserId && mockAttempt?.trainee_user_id !== viewerUserId) {
      return null;
    }
    return mockAttempt;
  }

  let builder = supabase.from("exam_attempts").select("*").eq("id", attemptId);

  if (viewerRole === "trainee" && viewerUserId) {
    builder = builder.eq("trainee_user_id", viewerUserId);
  }

  const { data } = await builder.maybeSingle();
  return data ?? null;
}

export async function fetchExamAttemptsByExam(
  examId: string,
  traineeId?: string,
  viewerRole?: "trainee" | "preceptor" | "admin"
): Promise<ExamAttempt[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockExamAttempts.filter((attempt) => {
      if (attempt.exam_id !== examId) {
        return false;
      }

      if (viewerRole === "trainee" && traineeId) {
        return attempt.trainee_user_id === traineeId;
      }

      return true;
    });
  }

  let builder = supabase.from("exam_attempts").select("*").eq("exam_id", examId).order("started_at", { ascending: false });

  if (viewerRole === "trainee" && traineeId) {
    builder = builder.eq("trainee_user_id", traineeId);
  }

  const { data } = await builder;
  return data ?? [];
}

export async function fetchExamAnswers(attemptId: string): Promise<ExamAnswer[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockExamAnswers[attemptId] ?? [];
  }

  const { data } = await supabase.from("exam_answers").select("*").eq("exam_attempt_id", attemptId);
  return data ?? mockExamAnswers[attemptId] ?? [];
}

export async function fetchExamResultDomains(attemptId: string): Promise<ExamResultDomain[]> {
  const supabase = await fetchClient();
  if (!supabase) {
    return mockExamResultDomains[attemptId] ?? [];
  }

  const { data } = await supabase.from("exam_result_domains").select("*").eq("exam_attempt_id", attemptId);
  return data ?? mockExamResultDomains[attemptId] ?? [];
}
