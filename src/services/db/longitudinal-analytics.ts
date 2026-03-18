import { createServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { getSessionProfile } from "@/services/auth/get-session-profile";
import type {
  CohortProgressSummary,
  CurriculumTopic,
  EditorialCoverage,
  EmergencyAttempt,
  EmergencyPerformance,
  EmergencyScenario,
  EmergencySelfAssessment,
  ExamAttempt,
  ExamResultDomain,
  LearningLesson,
  LearningModule,
  LearningTrack,
  MetricCardData,
  ProcedureLog,
  ProcedureSelfAssessment,
  ProcedureStat,
  ProcedureValidation,
  ProgressSummary,
  ReportScope,
  ReportViewData,
  TraineeErrorNotebookEntry,
  TraineeLessonProgress,
  TraineeModuleProgress,
  TraineeQuestionAttempt,
  TraineeSnapshot,
  TraineeYearCode,
  ValidationAlert
} from "@/types/database";

interface TraineeRosterEntry {
  id: string;
  fullName: string;
  trainingYear: TraineeYearCode;
}

interface RoleDistribution {
  traineeCount: number;
  preceptorCount: number;
  adminCount: number;
}

interface QueryContext {
  institutionId: string;
  viewerId: string;
  scope: ReportScope;
}

interface QuestionTopicRow {
  id: string;
  curriculum_topic_id?: string | null;
}

const YEARS: TraineeYearCode[] = ["ME1", "ME2", "ME3"];
const RECENT_WINDOW_DAYS = 30;
const CLINICAL_EXPECTED_PROCEDURES: Record<TraineeYearCode, number> = {
  ME1: 24,
  ME2: 60,
  ME3: 110
};
const CLINICAL_EXPECTED_EMERGENCIES: Record<TraineeYearCode, number> = {
  ME1: 2,
  ME2: 4,
  ME3: 6
};

function startOfRecentWindow() {
  const date = new Date();
  date.setDate(date.getDate() - RECENT_WINDOW_DAYS);
  return date;
}

function yearProgressPercent() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const start = Date.UTC(year, 0, 1);
  const end = Date.UTC(year + 1, 0, 1);
  const ratio = (now.getTime() - start) / (end - start);
  return clampPercentage(ratio * 100);
}

function clampPercentage(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function averageOrNull(values: number[]) {
  return values.length ? Math.round(average(values)) : null;
}

function isRecent(value?: string | null) {
  if (!value) {
    return false;
  }

  return new Date(value).getTime() >= startOfRecentWindow().getTime();
}

function formatPercent(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "—";
  }

  return `${Math.round(value)}%`;
}

function formatDelta(value: number) {
  const rounded = Math.round(value);
  if (rounded === 0) {
    return "0 pp";
  }

  return `${rounded > 0 ? "+" : ""}${rounded} pp`;
}

function emptyEditorialCoverage(): EditorialCoverage {
  return {
    coveragePercent: 0,
    itemsPublished: 0,
    inReview: 0,
    criticalPending: 0
  };
}

function emptyReportView(): ReportViewData {
  return {
    overviewMetrics: [],
    domainPerformance: [],
    progressSummaries: [],
    procedureStats: [],
    validationAlerts: [],
    emergencyPerformance: [],
    editorialCoverage: emptyEditorialCoverage(),
    usageInsights: [],
    cohortProgress: [],
    traineeSnapshots: []
  };
}

async function resolveContext(scope: ReportScope): Promise<QueryContext | null> {
  const profile = await getSessionProfile();
  if (!profile?.institution_id) {
    return null;
  }

  return {
    institutionId: profile.institution_id,
    viewerId: profile.id,
    scope
  };
}

async function fetchRoster(context: QueryContext) {
  const supabase = await createServerClient();
  const [profilesResult, traineeProfilesResult, rolesResult, roleCatalogResult] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("id, full_name")
      .eq("institution_id", context.institutionId),
    supabase
      .from("trainee_profiles")
      .select("user_id, trainee_year")
      .eq("institution_id", context.institutionId),
    supabase
      .from("user_roles")
      .select("user_id, role_id")
      .eq("institution_id", context.institutionId),
    supabase
      .from("roles")
      .select("id, code")
      .in("code", ["institution_admin", "coordinator", "preceptor", "trainee_me1", "trainee_me2", "trainee_me3"])
  ]);

  const profileRows = profilesResult.data ?? [];
  const traineeRows = traineeProfilesResult.data ?? [];
  const roleRows = rolesResult.data ?? [];
  const roleCatalogRows = roleCatalogResult.data ?? [];

  const roleIdToCode = new Map(roleCatalogRows.map((role) => [role.id, role.code]));
  const userRoleCodes = new Map(roleRows.map((row) => [row.user_id, roleIdToCode.get(row.role_id) ?? "unknown"]));
  const traineeYearByUserId = new Map(
    traineeRows
      .filter((row) => row.trainee_year === "ME1" || row.trainee_year === "ME2" || row.trainee_year === "ME3")
      .map((row) => [row.user_id, row.trainee_year as TraineeYearCode])
  );

  const trainees = profileRows
    .map((profile) => {
      const trainingYear = traineeYearByUserId.get(profile.id);
      if (!trainingYear) {
        return null;
      }

      return {
        id: profile.id,
        fullName: profile.full_name,
        trainingYear
      } satisfies TraineeRosterEntry;
    })
    .filter(Boolean) as TraineeRosterEntry[];

  const roleDistribution: RoleDistribution = {
    traineeCount: trainees.length,
    preceptorCount: Array.from(userRoleCodes.values()).filter((code) => code === "preceptor").length,
    adminCount: Array.from(userRoleCodes.values()).filter((code) => code === "institution_admin" || code === "coordinator").length
  };

  return { trainees, roleDistribution };
}

async function fetchYearMaps() {
  const supabase = await createServerClient();
  const { data } = await supabase.from("curriculum_years").select("id, code");
  const idToYear = new Map<string, TraineeYearCode>();

  (data ?? []).forEach((row) => {
    if (row.code === "ME1" || row.code === "ME2" || row.code === "ME3") {
      idToYear.set(row.id, row.code);
    }
  });

  return idToYear;
}

async function fetchTenantTracks(institutionId: string): Promise<LearningTrack[]> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("learning_tracks")
    .select("*")
    .eq("active", true)
    .or(`institution_id.is.null,institution_id.eq.${institutionId}`)
    .order("created_at", { ascending: true });

  return (data ?? []) as LearningTrack[];
}

async function countContentRows(table: string, column: string, filter?: { column: string; value: string }) {
  const supabase = await createServerClient();
  let builder = supabase.from(table).select(column, { count: "exact", head: true });
  if (filter) {
    builder = builder.eq(filter.column, filter.value);
  }

  const { count, error } = await builder;
  if (error) {
    return 0;
  }

  return count ?? 0;
}

export async function fetchLongitudinalReportViewData(scope: ReportScope): Promise<ReportViewData> {
  if (!isSupabaseConfigured()) {
    return emptyReportView();
  }

  const context = await resolveContext(scope);
  if (!context) {
    return emptyReportView();
  }

  const { trainees, roleDistribution } = await fetchRoster(context);
  const visibleTrainees =
    context.scope === "trainee" ? trainees.filter((trainee) => trainee.id === context.viewerId) : trainees;
  const visibleTraineeIds = visibleTrainees.map((trainee) => trainee.id);

  if (context.scope === "trainee" && visibleTraineeIds.length === 0) {
    return emptyReportView();
  }

  const supabase = await createServerClient();
  const expectedPercent = yearProgressPercent();
  const yearMap = await fetchYearMaps();

  const [
    tracks,
    modulesResult,
    lessonsResult,
    lessonProgressResult,
    moduleProgressResult,
    questionAttemptsResult,
    notebookResult,
    questionBankResult,
    examAttemptsResult,
    procedureLogsResult,
    emergencyAttemptsResult,
    emergencyAssessmentsResult,
    emergencyScenariosResult,
    procedureValidationsResult,
    procedureSelfAssessmentsResult,
    topicsResult,
    publishedContentCount,
    inReviewContentCount
  ] = await Promise.all([
    fetchTenantTracks(context.institutionId),
    supabase.from("learning_modules").select("*").eq("active", true).order("display_order", { ascending: true }),
    supabase.from("learning_lessons").select("*").eq("active", true).order("display_order", { ascending: true }),
    visibleTraineeIds.length
      ? supabase.from("trainee_lesson_progress").select("*").in("trainee_user_id", visibleTraineeIds)
      : Promise.resolve({ data: [] as TraineeLessonProgress[] }),
    visibleTraineeIds.length
      ? supabase.from("trainee_module_progress").select("*").in("trainee_user_id", visibleTraineeIds)
      : Promise.resolve({ data: [] as TraineeModuleProgress[] }),
    visibleTraineeIds.length
      ? supabase
          .from("trainee_question_attempts")
          .select("*")
          .in("trainee_user_id", visibleTraineeIds)
          .order("attempted_at", { ascending: false })
      : Promise.resolve({ data: [] as TraineeQuestionAttempt[] }),
    visibleTraineeIds.length
      ? supabase
          .from("trainee_error_notebook")
          .select("*")
          .in("trainee_user_id", visibleTraineeIds)
          .order("last_wrong_at", { ascending: false })
      : Promise.resolve({ data: [] as TraineeErrorNotebookEntry[] }),
    supabase
      .from("question_bank")
      .select("id, curriculum_topic_id")
      .or(`institution_id.is.null,institution_id.eq.${context.institutionId}`),
    visibleTraineeIds.length
      ? supabase
          .from("exam_attempts")
          .select("*")
          .in("trainee_user_id", visibleTraineeIds)
          .order("started_at", { ascending: false })
      : Promise.resolve({ data: [] as ExamAttempt[] }),
    context.scope === "trainee"
      ? supabase.from("procedure_logs").select("*").eq("trainee_user_id", context.viewerId)
      : supabase.from("procedure_logs").select("*").eq("institution_id", context.institutionId),
    visibleTraineeIds.length
      ? supabase
          .from("emergency_attempts")
          .select("*")
          .in("trainee_user_id", visibleTraineeIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as EmergencyAttempt[] }),
    visibleTraineeIds.length
      ? supabase
          .from("emergency_self_assessments")
          .select("*")
          .in("trainee_user_id", visibleTraineeIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as EmergencySelfAssessment[] }),
    supabase
      .from("emergency_scenarios")
      .select("*")
      .or(`institution_id.is.null,institution_id.eq.${context.institutionId}`),
    Promise.resolve({ data: [] as ProcedureValidation[] }),
    Promise.resolve({ data: [] as ProcedureSelfAssessment[] }),
    supabase.from("curriculum_topics").select("id, title"),
    countContentRows("content_items", "id", { column: "status", value: "published" }),
    countContentRows("content_versions", "id", { column: "review_status", value: "pending" })
  ]);

  const modules = (modulesResult.data ?? []) as LearningModule[];
  const lessons = (lessonsResult.data ?? []) as LearningLesson[];
  const lessonProgress = (lessonProgressResult.data ?? []) as TraineeLessonProgress[];
  const moduleProgress = (moduleProgressResult.data ?? []) as TraineeModuleProgress[];
  const questionAttempts = (questionAttemptsResult.data ?? []) as TraineeQuestionAttempt[];
  const notebookEntries = (notebookResult.data ?? []) as TraineeErrorNotebookEntry[];
  const questionBankRows = (questionBankResult.data ?? []) as QuestionTopicRow[];
  const examAttempts = (examAttemptsResult.data ?? []) as ExamAttempt[];
  const procedureLogs = (procedureLogsResult.data ?? []) as ProcedureLog[];
  const emergencyAttempts = (emergencyAttemptsResult.data ?? []) as EmergencyAttempt[];
  const emergencyAssessments = (emergencyAssessmentsResult.data ?? []) as EmergencySelfAssessment[];
  const emergencyScenarios = (emergencyScenariosResult.data ?? []) as EmergencyScenario[];
  const topics = (topicsResult.data ?? []) as CurriculumTopic[];

  const examAttemptIds = examAttempts.map((attempt) => attempt.id);
  const procedureLogIds = procedureLogs.map((log) => log.id);

  const [examDomainsResult, procedureValidationsRaw, procedureSelfAssessmentsRaw] = await Promise.all([
    examAttemptIds.length
      ? supabase.from("exam_result_domains").select("*").in("exam_attempt_id", examAttemptIds)
      : Promise.resolve({ data: [] as ExamResultDomain[] }),
    procedureLogIds.length
      ? supabase.from("procedure_validations").select("*").in("procedure_log_id", procedureLogIds)
      : Promise.resolve({ data: [] as ProcedureValidation[] }),
    procedureLogIds.length
      ? supabase.from("procedure_self_assessments").select("*").in("procedure_log_id", procedureLogIds)
      : Promise.resolve({ data: [] as ProcedureSelfAssessment[] })
  ]);

  const examDomains = (examDomainsResult.data ?? []) as ExamResultDomain[];
  const procedureValidations = (procedureValidationsRaw.data ?? []) as ProcedureValidation[];
  const procedureSelfAssessments = (procedureSelfAssessmentsRaw.data ?? []) as ProcedureSelfAssessment[];

  const topicTitleById = new Map(topics.map((topic) => [topic.id, topic.title]));
  const questionTopicById = new Map(questionBankRows.map((question) => [question.id, question.curriculum_topic_id ?? null]));
  const scenarioById = new Map(emergencyScenarios.map((scenario) => [scenario.id, scenario]));
  const examById = new Map(examAttempts.map((attempt) => [attempt.id, attempt]));
  const lessonsForYear = new Map<TraineeYearCode, LearningLesson[]>();
  const modulesForYear = new Map<TraineeYearCode, LearningModule[]>();

  YEARS.forEach((year) => {
    const yearTracks = tracks.filter((track) => {
      if (!track.curriculum_year_id) {
        return true;
      }

      return yearMap.get(track.curriculum_year_id) === year;
    });
    const yearTrackIds = new Set(yearTracks.map((track) => track.id));
    const yearModules = modules.filter((module) => yearTrackIds.has(module.learning_track_id));
    const yearModuleIds = new Set(yearModules.map((module) => module.id));
    const yearLessons = lessons.filter((lesson) => yearModuleIds.has(lesson.learning_module_id));

    modulesForYear.set(year, yearModules);
    lessonsForYear.set(year, yearLessons);
  });

  const progressByTrainee = new Map<string, TraineeSnapshot>();

  visibleTrainees.forEach((trainee) => {
    const availableLessons = lessonsForYear.get(trainee.trainingYear) ?? [];
    const availableModules = modulesForYear.get(trainee.trainingYear) ?? [];
    const lessonIds = new Set(availableLessons.map((lesson) => lesson.id));
    const moduleIds = new Set(availableModules.map((module) => module.id));

    const traineeLessonRows = lessonProgress.filter(
      (entry) => entry.trainee_user_id === trainee.id && lessonIds.has(entry.lesson_id)
    );
    const traineeModuleRows = moduleProgress.filter(
      (entry) => entry.trainee_user_id === trainee.id && moduleIds.has(entry.module_id)
    );
    const traineeQuestionsRecent = questionAttempts.filter(
      (attempt) => attempt.trainee_user_id === trainee.id && isRecent(attempt.attempted_at)
    );
    const traineeQuestionsCorrect = traineeQuestionsRecent.filter((attempt) => attempt.is_correct).length;
    const traineeNotebookOpen = notebookEntries.filter((entry) => entry.trainee_user_id === trainee.id && !entry.resolved).length;
    const traineeExamRecent = examAttempts.filter(
      (attempt) =>
        attempt.trainee_user_id === trainee.id &&
        isRecent(attempt.submitted_at ?? attempt.started_at) &&
        typeof attempt.percent_score === "number"
    );
    const traineeLogsRecent = procedureLogs.filter(
      (log) => log.trainee_user_id === trainee.id && isRecent(log.performed_on)
    );
    const traineeEmergenciesRecent = emergencyAttempts.filter(
      (attempt) => attempt.trainee_user_id === trainee.id && isRecent(attempt.completed_at ?? attempt.created_at)
    );
    const traineePendingValidations = procedureLogs
      .filter((log) => log.trainee_user_id === trainee.id)
      .reduce((total, log) => {
        const pending = procedureValidations.filter(
          (validation) => validation.procedure_log_id === log.id && validation.validation_status === "pending"
        ).length;
        return total + pending;
      }, 0);

    const completedLessons = traineeLessonRows.filter((entry) => entry.status === "completed").length;
    const lessonProgressPercent = clampPercentage((completedLessons / Math.max(availableLessons.length, 1)) * 100);
    const moduleProgressPercent = clampPercentage(
      traineeModuleRows.reduce((sum, entry) => sum + (entry.completion_percent ?? 0), 0) / Math.max(availableModules.length, 1)
    );

    const totalProcedures = procedureLogs.filter((log) => log.trainee_user_id === trainee.id).length;
    const totalCompletedEmergencies = emergencyAttempts.filter(
      (attempt) => attempt.trainee_user_id === trainee.id && attempt.completion_status === "completed"
    ).length;
    const procedureProgress = Math.min(
      100,
      (totalProcedures / Math.max(CLINICAL_EXPECTED_PROCEDURES[trainee.trainingYear], 1)) * 100
    );
    const emergencyProgress = Math.min(
      100,
      (totalCompletedEmergencies / Math.max(CLINICAL_EXPECTED_EMERGENCIES[trainee.trainingYear], 1)) * 100
    );
    const clinicalMaturityPercent = clampPercentage(procedureProgress * 0.7 + emergencyProgress * 0.3);
    const theoreticalProgressPercent = Math.round((lessonProgressPercent + moduleProgressPercent) / 2);

    progressByTrainee.set(trainee.id, {
      traineeId: trainee.id,
      traineeName: trainee.fullName,
      trainingYear: trainee.trainingYear,
      expectedPercent,
      lessonProgressPercent,
      moduleProgressPercent,
      theoreticalGapPercent: theoreticalProgressPercent - expectedPercent,
      clinicalMaturityPercent,
      recentQuestionAccuracy: traineeQuestionsRecent.length
        ? clampPercentage((traineeQuestionsCorrect / traineeQuestionsRecent.length) * 100)
        : null,
      recentExamAverage: averageOrNull(
        traineeExamRecent.map((attempt) => Math.round(attempt.percent_score ?? 0)).filter((score) => score > 0)
      ),
      recentProcedures: traineeLogsRecent.length,
      recentEmergencies: traineeEmergenciesRecent.length,
      pendingValidations: traineePendingValidations,
      openNotebookItems: traineeNotebookOpen
    });
  });

  const traineeSnapshots = Array.from(progressByTrainee.values()).sort((left, right) => {
    if (left.trainingYear !== right.trainingYear) {
      return YEARS.indexOf(left.trainingYear) - YEARS.indexOf(right.trainingYear);
    }

    return left.traineeName.localeCompare(right.traineeName, "pt-BR");
  });

  const cohortProgress: CohortProgressSummary[] = YEARS.map((year) => {
    const yearSnapshots = traineeSnapshots.filter((snapshot) => snapshot.trainingYear === year);
    return {
      year,
      traineeCount: yearSnapshots.length,
      expectedPercent,
      lessonProgressPercent: clampPercentage(average(yearSnapshots.map((snapshot) => snapshot.lessonProgressPercent))),
      moduleProgressPercent: clampPercentage(average(yearSnapshots.map((snapshot) => snapshot.moduleProgressPercent))),
      clinicalMaturityPercent: clampPercentage(average(yearSnapshots.map((snapshot) => snapshot.clinicalMaturityPercent))),
      recentActivityCount: yearSnapshots.filter(
        (snapshot) => snapshot.recentProcedures > 0 || snapshot.recentEmergencies > 0 || snapshot.recentQuestionAccuracy !== null
      ).length
    };
  }).filter((summary) => summary.traineeCount > 0);

  const topicStats = new Map<
    string,
    {
      label: string;
      questionRecentScores: number[];
      questionPreviousScores: number[];
      examRecentScores: number[];
      examPreviousScores: number[];
      moduleScores: number[];
    }
  >();

  questionAttempts.forEach((attempt) => {
    const topicId = questionTopicById.get(attempt.question_id);
    if (!topicId) {
      return;
    }

    const label = topicTitleById.get(topicId) ?? "Sem tópico";
    const entry = topicStats.get(topicId) ?? {
      label,
      questionRecentScores: [],
      questionPreviousScores: [],
      examRecentScores: [],
      examPreviousScores: [],
      moduleScores: []
    };

    const score = attempt.is_correct ? 100 : 0;
    if (isRecent(attempt.attempted_at)) {
      entry.questionRecentScores.push(score);
    } else {
      entry.questionPreviousScores.push(score);
    }

    topicStats.set(topicId, entry);
  });

  examDomains.forEach((domain) => {
    const label = topicTitleById.get(domain.curriculum_topic_id) ?? "Sem tópico";
    const entry = topicStats.get(domain.curriculum_topic_id) ?? {
      label,
      questionRecentScores: [],
      questionPreviousScores: [],
      examRecentScores: [],
      examPreviousScores: [],
      moduleScores: []
    };
    const exam = examById.get(domain.exam_attempt_id);
    const targetBucket = exam && isRecent(exam.submitted_at ?? exam.started_at) ? entry.examRecentScores : entry.examPreviousScores;
    if (typeof domain.score_percent === "number") {
      targetBucket.push(domain.score_percent);
    }

    topicStats.set(domain.curriculum_topic_id, entry);
  });

  traineeSnapshots.forEach((snapshot) => {
    const traineeModules = moduleProgress.filter((entry) => entry.trainee_user_id === snapshot.traineeId);
    traineeModules.forEach((entry) => {
      const module = modules.find((candidate) => candidate.id === entry.module_id);
      if (!module?.curriculum_topic_id) {
        return;
      }

      const label = topicTitleById.get(module.curriculum_topic_id) ?? "Sem tópico";
      const topicEntry = topicStats.get(module.curriculum_topic_id) ?? {
        label,
        questionRecentScores: [],
        questionPreviousScores: [],
        examRecentScores: [],
        examPreviousScores: [],
        moduleScores: []
      };
      if (typeof entry.completion_percent === "number") {
        topicEntry.moduleScores.push(entry.completion_percent);
      }
      topicStats.set(module.curriculum_topic_id, topicEntry);
    });
  });

  const domainPerformance = Array.from(topicStats.values())
    .map((entry) => {
      const recentScores = [...entry.questionRecentScores, ...entry.examRecentScores];
      const previousScores = [...entry.questionPreviousScores, ...entry.examPreviousScores];
      const allScores = [...recentScores, ...previousScores, ...entry.moduleScores];
      return {
        domain: entry.label,
        scorePercent: clampPercentage(average(allScores)),
        improvement: recentScores.length && previousScores.length ? formatDelta(average(recentScores) - average(previousScores)) : undefined,
        bestTopic: entry.moduleScores.length ? `Trilhas ${formatPercent(Math.round(average(entry.moduleScores)))}` : undefined,
        worstTopic: recentScores.length ? `Recente ${formatPercent(Math.round(average(recentScores)))}` : undefined,
        activityCount: allScores.length
      };
    })
    .filter((entry) => entry.activityCount > 0)
    .sort((left, right) => right.activityCount - left.activityCount)
    .slice(0, 6)
    .map(({ activityCount: _activityCount, ...entry }) => entry);

  const recentQuestionAttempts = questionAttempts.filter((attempt) => isRecent(attempt.attempted_at));
  const recentQuestionAccuracy = recentQuestionAttempts.length
    ? clampPercentage((recentQuestionAttempts.filter((attempt) => attempt.is_correct).length / recentQuestionAttempts.length) * 100)
    : null;
  const recentSubmittedExams = examAttempts.filter(
    (attempt) => isRecent(attempt.submitted_at ?? attempt.started_at) && typeof attempt.percent_score === "number"
  );
  const pendingValidations = procedureValidations.filter((validation) => validation.validation_status === "pending");
  const approvedValidationsRecent = procedureValidations.filter(
    (validation) => validation.validation_status === "approved" && isRecent(validation.validated_at)
  );
  const recentProcedureLogs = procedureLogs.filter((log) => isRecent(log.performed_on));
  const recentEmergencyAttempts = emergencyAttempts.filter((attempt) => isRecent(attempt.completed_at ?? attempt.created_at));
  const confidenceDeltas = emergencyAssessments
    .filter(
      (assessment) =>
        typeof assessment.confidence_before === "number" &&
        typeof assessment.confidence_after === "number" &&
        isRecent(assessment.created_at)
    )
    .map((assessment) => (assessment.confidence_after ?? 0) - (assessment.confidence_before ?? 0));
  const procedureConfidenceRecent = procedureSelfAssessments
    .filter((assessment) => isRecent(assessment.created_at))
    .map((assessment) => assessment.confidence_level);

  const overviewMetrics: MetricCardData[] = [
    {
      label: context.scope === "trainee" ? "Progresso teórico" : "Trainees ativos",
      value:
        context.scope === "trainee"
          ? formatPercent(
              traineeSnapshots[0]
                ? Math.round((traineeSnapshots[0].lessonProgressPercent + traineeSnapshots[0].moduleProgressPercent) / 2)
                : null
            )
          : String(traineeSnapshots.length),
      helper:
        context.scope === "trainee"
          ? `Esperado no ano: ${expectedPercent}%`
          : `${roleDistribution.preceptorCount} preceptores e ${roleDistribution.adminCount} coord./admins`
    },
    {
      label: "Desempenho recente",
      value: recentQuestionAccuracy !== null ? formatPercent(recentQuestionAccuracy) : formatPercent(averageOrNull(recentSubmittedExams.map((attempt) => attempt.percent_score ?? 0))),
      helper:
        recentQuestionAccuracy !== null
          ? `${recentQuestionAttempts.length} questões nos últimos ${RECENT_WINDOW_DAYS} dias`
          : `${recentSubmittedExams.length} provas submetidas no período`
    },
    {
      label: "Maturidade clínica",
      value: formatPercent(
        context.scope === "trainee"
          ? traineeSnapshots[0]?.clinicalMaturityPercent ?? null
          : averageOrNull(traineeSnapshots.map((snapshot) => snapshot.clinicalMaturityPercent))
      ),
      helper: `${recentProcedureLogs.length} procedimentos e ${recentEmergencyAttempts.length} emergências recentes`
    }
  ];

  const progressSummaries: ProgressSummary[] = context.scope === "trainee"
    ? traineeSnapshots.slice(0, 1).flatMap((snapshot) => [
        {
          title: `Ano ${snapshot.trainingYear}`,
          detail: `${snapshot.lessonProgressPercent}% das lições e ${snapshot.moduleProgressPercent}% dos módulos concluídos.`,
          progressPercent: Math.round((snapshot.lessonProgressPercent + snapshot.moduleProgressPercent) / 2)
        },
        {
          title: "Atual vs. esperado",
          detail: `${formatDelta(snapshot.theoreticalGapPercent)} frente ao esperado para o período.`,
          progressPercent: snapshot.expectedPercent
        },
        {
          title: "Maturidade clínica",
          detail: `${snapshot.recentProcedures} procedimentos e ${snapshot.recentEmergencies} emergências nos últimos ${RECENT_WINDOW_DAYS} dias.`,
          progressPercent: snapshot.clinicalMaturityPercent
        }
      ])
    : cohortProgress.map((summary) => ({
        title: `${summary.year} · ${summary.traineeCount} trainees`,
        detail: `${summary.lessonProgressPercent}% lições, ${summary.moduleProgressPercent}% módulos e ${summary.clinicalMaturityPercent}% maturidade clínica.`,
        progressPercent: summary.expectedPercent
      }));

  const procedureStats: ProcedureStat[] = [
    {
      title: "Procedimentos recentes",
      value: String(recentProcedureLogs.length),
      trend: `${pendingValidations.length} pendentes de validação`
    },
    {
      title: "Validações concluídas",
      value: String(approvedValidationsRecent.length),
      trend: `${recentSubmittedExams.length} provas finalizadas no período`
    },
    {
      title: "Autoavaliação clínica",
      value: procedureConfidenceRecent.length ? `${Math.round(average(procedureConfidenceRecent))}/5` : "—",
      trend: confidenceDeltas.length ? `Confiança em emergências ${formatDelta(average(confidenceDeltas))}` : "Sem autopercepções recentes"
    }
  ];

  const validationAlerts: ValidationAlert[] = [];

  traineeSnapshots.forEach((snapshot) => {
    if (snapshot.theoreticalGapPercent <= -20) {
      validationAlerts.push({
        label: `${snapshot.traineeName} atrasado`,
        detail: `${snapshot.trainingYear} com ${Math.abs(snapshot.theoreticalGapPercent)} pp abaixo do esperado no bloco teórico.`,
        severity: "high"
      });
    }

    if (snapshot.recentQuestionAccuracy !== null && snapshot.recentQuestionAccuracy < 70) {
      validationAlerts.push({
        label: `${snapshot.traineeName} desempenho`,
        detail: `${snapshot.recentQuestionAccuracy}% de acerto recente e ${snapshot.openNotebookItems} itens abertos no caderno de erros.`,
        severity: snapshot.recentQuestionAccuracy < 60 ? "high" : "medium"
      });
    }

    if (snapshot.pendingValidations > 0) {
      validationAlerts.push({
        label: `${snapshot.traineeName} logbook`,
        detail: `${snapshot.pendingValidations} validações clínicas pendentes.`,
        severity: snapshot.pendingValidations >= 3 ? "high" : "medium"
      });
    }

    if (snapshot.recentProcedures === 0 && snapshot.recentEmergencies === 0 && snapshot.recentQuestionAccuracy === null) {
      validationAlerts.push({
        label: `${snapshot.traineeName} baixa atividade`,
        detail: `Sem sinais recentes em questões, logbook ou emergências nos últimos ${RECENT_WINDOW_DAYS} dias.`,
        severity: "medium"
      });
    }
  });

  const emergencyPerformance = Array.from(
    emergencyAttempts.reduce((map, attempt) => {
      const scenario = scenarioById.get(attempt.scenario_id);
      const current = map.get(attempt.scenario_id) ?? {
        scenario: scenario?.title ?? "Cenário",
        completed: 0,
        scores: [] as number[],
        confidenceChanges: [] as number[]
      };

      if (attempt.completion_status === "completed") {
        current.completed += 1;
      }

      if (typeof attempt.score_percent === "number") {
        current.scores.push(attempt.score_percent);
      }

      map.set(attempt.scenario_id, current);
      return map;
    }, new Map<string, { scenario: string; completed: number; scores: number[]; confidenceChanges: number[] }>())
  ).map(([scenarioId, summary]) => {
    emergencyAssessments
      .filter(
        (assessment) =>
          assessment.scenario_id === scenarioId &&
          typeof assessment.confidence_before === "number" &&
          typeof assessment.confidence_after === "number"
      )
      .forEach((assessment) => {
        summary.confidenceChanges.push((assessment.confidence_after ?? 0) - (assessment.confidence_before ?? 0));
      });

    return {
      scenario: summary.scenario,
      completed: summary.completed,
      successRate: clampPercentage(average(summary.scores)),
      confidenceChange: Math.round(average(summary.confidenceChanges))
    } satisfies EmergencyPerformance;
  })
    .sort((left, right) => right.completed - left.completed)
    .slice(0, 6);

  const itemsPublished = publishedContentCount;
  const inReview = inReviewContentCount;
  const editorialCoverage: EditorialCoverage = {
    coveragePercent: clampPercentage((itemsPublished / Math.max(itemsPublished + inReview, 1)) * 100),
    itemsPublished,
    inReview,
    criticalPending: inReview
  };

  const leadingCohort = cohortProgress
    .slice()
    .sort((left, right) => right.clinicalMaturityPercent - left.clinicalMaturityPercent)[0];
  const mostCriticalGap = traineeSnapshots
    .slice()
    .sort((left, right) => left.theoreticalGapPercent - right.theoreticalGapPercent)[0];

  const usageInsights = [
    `${recentQuestionAttempts.length} questões respondidas e ${recentSubmittedExams.length} provas concluídas nos últimos ${RECENT_WINDOW_DAYS} dias.`,
    `${recentProcedureLogs.length} procedimentos registrados, com ${pendingValidations.length} validações pendentes.`,
    leadingCohort
      ? `${leadingCohort.year} lidera a maturidade clínica institucional com ${leadingCohort.clinicalMaturityPercent}% de aderência.`
      : "Sem coorte suficiente para comparação institucional.",
    mostCriticalGap
      ? `${mostCriticalGap.traineeName} concentra a maior defasagem teórica atual: ${formatDelta(mostCriticalGap.theoreticalGapPercent)}.`
      : "Sem defasagens relevantes detectadas."
  ];

  return {
    overviewMetrics,
    domainPerformance,
    progressSummaries,
    procedureStats,
    validationAlerts: validationAlerts.slice(0, 8),
    emergencyPerformance,
    editorialCoverage,
    usageInsights,
    cohortProgress,
    traineeSnapshots
  };
}
