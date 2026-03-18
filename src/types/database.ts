export type InstitutionStatus = "active" | "inactive" | "trial";
export type PlanType = "starter" | "pro" | "enterprise";

export type TraineeYearCode = "ME1" | "ME2" | "ME3";
export type TraineeStatus = "active" | "paused" | "completed" | "inactive";
export type TrackType = "year_based" | "emergency" | "preanesthetic" | "procedure_guide" | "free_track";
export type ModuleType = "lesson" | "case_series" | "review" | "simulation" | "assessment_prep";
export type DifficultyLevel = "basic" | "intermediate" | "advanced";
export type LessonFormat = "interactive" | "flashcards" | "microlearning" | "case_based" | "algorithmic";
export type LessonStepType =
  | "text"
  | "question"
  | "flashcard"
  | "drag_order"
  | "case_decision"
  | "image_hotspot"
  | "checkpoint";
export type ProgressStatus = "not_started" | "in_progress" | "completed" | "mastered";
export type QuestionDifficulty = "easy" | "medium" | "hard";
export type QuestionTypeEnum = "single_choice" | "multiple_choice" | "true_false" | "matching" | "case_sequential" | "image_based";
export type EditorialStatus = "draft" | "under_review" | "approved" | "published" | "archived";
export type SourceGenerationType = "human" | "ai_derived" | "hybrid";
export type TagTypeEnum = "topic" | "skill" | "specialty" | "difficulty" | "emergency" | "procedure";
export type AttemptMode = "practice" | "exam" | "review" | "spaced_repetition";
export type ExamTypeEnum = "quarterly" | "annual" | "mock" | "mini_test" | "oral_simulation";
export type ExamStatus = "draft" | "scheduled" | "open" | "closed" | "published";
export type ExamAttemptStatus = "in_progress" | "submitted" | "graded" | "expired";
export type EmergencyCategory =
  | "airway"
  | "hemodynamic"
  | "respiratory"
  | "allergic"
  | "regional"
  | "obstetric"
  | "pediatric"
  | "other";

export type ProcedureCategory =
  | "airway"
  | "regional"
  | "vascular_access"
  | "neuroaxis"
  | "general_anesthesia"
  | "monitoring"
  | "pain"
  | "other";

export type SurgerySpecialty =
  | "general"
  | "ortho"
  | "obstetric"
  | "urology"
  | "thoracic"
  | "cardiac"
  | "neuro"
  | "pediatric"
  | "ent"
  | "ophthalmology"
  | "plastic"
  | "other";

export type PerceivedDifficulty = "low" | "medium" | "high";
export type ProcedureSuccessStatus = "successful" | "partial" | "failed" | "converted";
export type ValidationStatus = "pending" | "approved" | "rejected" | "needs_revision";
export type ProcedurePerformanceLevel =
  | "needs_direct_supervision"
  | "performed_with_significant_help"
  | "performed_with_minor_corrections"
  | "performed_safely";
export type ReadinessLevel =
  | "not_ready"
  | "ready_with_close_supervision"
  | "ready_with_standard_supervision"
  | "confident_under_indirect_supervision";
export type TraineeRoleInCase = "observed" | "assisted" | "performed_supervised" | "performed_with_relative_autonomy";

export type SupportType = "primary_support" | "secondary_support" | "context_only";

export interface Institution {
  id: string;
  name: string;
  slug: string;
  legal_name?: string | null;
  status: InstitutionStatus;
  plan_type: PlanType;
  created_at: string;
  updated_at: string;
}

export interface InstitutionUnit {
  id: string;
  institution_id: string;
  name: string;
  city?: string | null;
  state?: string | null;
  type: "hospital" | "ambulatory_center" | "simulation_center" | "other";
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CurriculumYear {
  id: string;
  code: TraineeYearCode;
  name: string;
  display_order: number;
}

export interface CurriculumTopic {
  id: string;
  curriculum_year_id: string;
  point_number: number;
  title: string;
  description?: string | null;
  display_order: number;
  source_label?: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CurriculumSubtopic {
  id: string;
  topic_id: string;
  code_ex?: string | null;
  title: string;
  description?: string | null;
  display_order: number;
  active: boolean;
}

export interface LearningTrack {
  id: string;
  institution_id?: string | null;
  curriculum_year_id?: string | null;
  title: string;
  description?: string | null;
  track_type: TrackType;
  estimated_minutes?: number | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LearningModule {
  id: string;
  learning_track_id: string;
  curriculum_topic_id?: string | null;
  title: string;
  description?: string | null;
  module_type: ModuleType;
  difficulty_level: DifficultyLevel;
  display_order: number;
  estimated_minutes?: number | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LearningLesson {
  id: string;
  learning_module_id: string;
  title: string;
  objective?: string | null;
  summary?: string | null;
  lesson_format: LessonFormat;
  display_order: number;
  active: boolean;
}

export interface LessonStep {
  id: string;
  lesson_id: string;
  step_type: LessonStepType;
  title?: string | null;
  body_markdown?: string | null;
  media_url?: string | null;
  structured_payload: Record<string, unknown>;
  display_order: number;
}

export interface TraineeLessonProgress {
  id: string;
  trainee_user_id: string;
  lesson_id: string;
  status: ProgressStatus;
  score_percent?: number | null;
  completed_at?: string | null;
  attempts_count: number;
  streak_snapshot?: number | null;
  created_at: string;
  updated_at: string;
}

export interface TraineeModuleProgress {
  id: string;
  trainee_user_id: string;
  module_id: string;
  status: ProgressStatus;
  completion_percent?: number | null;
  mastery_level?: number | null;
  updated_at: string;
}

export type StudyGoalStatus = "active" | "completed" | "expired";
export type StudyGoalItemType = "lesson" | "question_set" | "emergency";
export type ContentRefreshReason = "scheduled_daily" | "goal_completed" | "manual_admin";
export type ContentRefreshStatus = "queued" | "running" | "completed" | "failed";

export interface StudyGoal {
  id: string;
  institution_id: string;
  trainee_user_id: string;
  goal_date: string;
  refresh_sequence: number;
  target_minutes: number;
  status: StudyGoalStatus;
  source_reason: ContentRefreshReason;
  generated_at: string;
  completed_at?: string | null;
  updated_at: string;
}

export interface StudyGoalItem {
  id: string;
  study_goal_id: string;
  item_type: StudyGoalItemType;
  display_order: number;
  estimated_minutes: number;
  title: string;
  lesson_id?: string | null;
  emergency_scenario_id?: string | null;
  question_ids: string[];
  metadata_jsonb: Record<string, unknown>;
  created_at: string;
}

export interface UserContentRefreshJob {
  id: string;
  institution_id: string;
  trainee_user_id: string;
  study_goal_id?: string | null;
  trigger_reason: ContentRefreshReason;
  status: ContentRefreshStatus;
  payload_jsonb: Record<string, unknown>;
  requested_at: string;
  completed_at?: string | null;
  error_message?: string | null;
}

export interface QuestionBankEntry {
  id: string;
  institution_id?: string | null;
  curriculum_year_id?: string | null;
  curriculum_topic_id?: string | null;
  curriculum_subtopic_id?: string | null;
  title?: string | null;
  stem: string;
  rationale?: string | null;
  difficulty: QuestionDifficulty;
  question_type: QuestionTypeEnum;
  clinical_context_jsonb: Record<string, unknown>;
  educational_goal?: string | null;
  status: EditorialStatus;
  source_generation_type: SourceGenerationType;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_label?: string | null;
  option_text: string;
  is_correct: boolean;
  explanation?: string | null;
  display_order: number;
}

export interface QuestionTag {
  id: string;
  name: string;
  tag_type: TagTypeEnum;
}

export interface QuestionReference {
  id: string;
  question_id: string;
  content_reference_id?: string | null;
  citation_label?: string | null;
  cited_excerpt?: string | null;
  page_or_section?: string | null;
  created_at: string;
}

export interface TraineeQuestionAttempt {
  id: string;
  trainee_user_id: string;
  question_id: string;
  selected_option_ids: string[];
  is_correct?: boolean | null;
  response_time_seconds?: number | null;
  mode: AttemptMode;
  attempted_at: string;
}

export interface TraineeErrorNotebookEntry {
  id: string;
  trainee_user_id: string;
  question_id: string;
  first_wrong_at: string;
  last_wrong_at: string;
  times_wrong: number;
  resolved: boolean;
  notes?: string | null;
}

export interface Exam {
  id: string;
  institution_id: string;
  curriculum_year_id?: string | null;
  title: string;
  description?: string | null;
  exam_type: ExamTypeEnum;
  status: ExamStatus;
  duration_minutes?: number | null;
  total_questions?: number | null;
  passing_score?: number | null;
  available_from?: string | null;
  available_until?: string | null;
}

export interface ExamAttempt {
  id: string;
  exam_id: string;
  trainee_user_id: string;
  started_at?: string | null;
  submitted_at?: string | null;
  raw_score?: number | null;
  percent_score?: number | null;
  status: ExamAttemptStatus;
}

export interface ExamBlueprint {
  id: string;
  exam_id: string;
  curriculum_topic_id: string;
  target_question_count: number;
  difficulty_distribution_jsonb: Record<string, number>;
  weight_percent?: number | null;
}

export interface ExamQuestionLink {
  id: string;
  exam_id: string;
  question_id: string;
  display_order: number;
  points: number;
}

export interface ExamAnswer {
  id: string;
  exam_attempt_id: string;
  question_id: string;
  selected_option_ids: string[];
  is_correct?: boolean | null;
  points_awarded?: number | null;
  answered_at: string;
}

export interface ExamResultDomain {
  id: string;
  exam_attempt_id: string;
  curriculum_topic_id: string;
  score_percent?: number | null;
  correct_count: number;
  total_count: number;
}

export interface ProcedureLog {
  id: string;
  institution_id: string;
  trainee_user_id: string;
  preceptor_user_id?: string | null;
  unit_id?: string | null;
  surgery_catalog_id?: string | null;
  procedure_catalog_id?: string | null;
  performed_on: string;
  trainee_year_snapshot: TraineeYearCode;
  trainee_role: TraineeRoleInCase;
  anesthesia_technique_summary?: string | null;
  patient_profile_summary?: string | null;
  difficulty_perceived?: PerceivedDifficulty | null;
  success_status: ProcedureSuccessStatus;
  complications_summary?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProcedureValidation {
  id: string;
  procedure_log_id: string;
  validator_user_id: string;
  validation_status: ValidationStatus;
  performance_level?: ProcedurePerformanceLevel | null;
  feedback?: string | null;
  validated_at?: string | null;
}

export interface ProcedureCatalog {
  id: string;
  name: string;
  category: ProcedureCategory;
  description?: string | null;
  complexity_level: DifficultyLevel;
  active: boolean;
}

export interface SurgeryCatalog {
  id: string;
  specialty: SurgerySpecialty;
  procedure_name: string;
  procedure_group?: string | null;
  complexity_level: DifficultyLevel;
  active: boolean;
}

export interface ProcedureLogItem {
  id: string;
  procedure_log_id: string;
  procedure_catalog_id: string;
  quantity: number;
  success_status: ProcedureSuccessStatus;
  notes?: string | null;
}

export interface ProcedureSelfAssessment {
  id: string;
  procedure_log_id: string;
  confidence_level: number;
  readiness_level: ReadinessLevel;
  reflection_text?: string | null;
  created_at: string;
}

export interface LogbookStats {
  totalProcedures: number;
  procedureTypeDistribution: {
    name: string;
    count: number;
  }[];
  categoryDistribution: {
    category: ProcedureCategory;
    count: number;
    label: string;
  }[];
  difficultyDistribution: {
    difficulty: PerceivedDifficulty;
    count: number;
  }[];
  monthlyTrend: {
    label: string;
    count: number;
  }[];
  frequentProcedures: {
    name: string;
    count: number;
  }[];
  pendingValidations: number;
  expectedProgress?: {
    expectedTotal: number;
    actualTotal: number;
    progressPercent: number;
    label: string;
  } | null;
}

export interface EmergencyScenario {
  id: string;
  institution_id?: string | null;
  title: string;
  description?: string | null;
  category: EmergencyCategory;
  difficulty_level: DifficultyLevel;
  universal_access: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmergencyAttempt {
  id: string;
  trainee_user_id: string;
  scenario_id: string;
  started_at?: string | null;
  completed_at?: string | null;
  score_percent?: number | null;
  completion_status: ProgressStatus;
  debrief_summary?: string | null;
  created_at: string;
}

export interface EmergencyScenarioStep {
  id: string;
  scenario_id: string;
  step_order: number;
  step_type: string;
  prompt_text: string;
  payload_jsonb: Record<string, unknown>;
  correct_branch_key?: string | null;
}

export interface EmergencyAttemptAction {
  id: string;
  emergency_attempt_id: string;
  scenario_step_id: string;
  action_payload: Record<string, unknown>;
  is_expected_action?: boolean | null;
  action_timestamp: string;
}

export interface EmergencySelfAssessment {
  id: string;
  trainee_user_id: string;
  scenario_id: string;
  emergency_attempt_id?: string | null;
  confidence_before?: number | null;
  confidence_after?: number | null;
  perceived_readiness?: string | null;
  reflection_text?: string | null;
  created_at: string;
}

export interface EmergencySummary {
  totalAttempts: number;
  categoryBreakdown: Record<EmergencyCategory, number>;
  readinessLevels: Record<string, number>;
  pendingDebriefs: number;
}

export type PreanestheticCategory =
  | "fasting"
  | "medication_continue"
  | "medication_suspend"
  | "risk_assessment"
  | "lab_tests"
  | "special_population"
  | "checklist";

export interface PreanestheticTopic {
  id: string;
  title: string;
  category: PreanestheticCategory;
  target_audience: "all" | "trainee" | "preceptor";
  summary?: string | null;
  detailed_content_markdown?: string | null;
  quick_reference_jsonb: Record<string, unknown>;
  decision_tree_jsonb: Record<string, unknown>;
  status: EditorialStatus;
  last_reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PreanestheticTopicLink {
  id: string;
  preanesthetic_topic_id: string;
  curriculum_topic_id: string;
}

export interface ContentSource {
  id: string;
  title: string;
  source_type: string;
  publisher?: string | null;
  publication_year?: number | null;
  edition?: string | null;
  doi_or_identifier?: string | null;
  source_url?: string | null;
  citation_abnt?: string | null;
  citation_vancouver?: string | null;
  trust_level?: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentSourceSection {
  id: string;
  content_source_id: string;
  section_label?: string | null;
  section_title?: string | null;
  excerpt_text: string;
  page_start?: number | null;
  page_end?: number | null;
  metadata_jsonb: Record<string, unknown>;
  created_at: string;
}

export interface ContentItem {
  id: string;
  title: string;
  content_type: string;
  author_id?: string | null;
  current_version_id?: string | null;
  status: EditorialStatus;
  slug?: string | null;
  created_at: string;
  updated_at: string;
}

export type ReviewStatus = "pending" | "reviewed" | "approved" | "rejected";
export type ReviewDecision = "approve" | "reject" | "needs_revision";

export interface ContentVersion {
  id: string;
  content_item_id: string;
  version_number: number;
  summary: string;
  body_markdown: string;
  structured_jsonb: Record<string, unknown>;
  generated_by_ai: boolean;
  generation_model?: string | null;
  generation_prompt_version?: string | null;
  review_status: ReviewStatus;
  reviewer_user_id?: string | null;
  review_notes?: string | null;
  created_at: string;
}

export type JobType =
  | "generate_lesson"
  | "generate_question"
  | "generate_flashcards"
  | "generate_case"
  | "summarize_sources"
  | "update_content";

export type JobStatus = "queued" | "running" | "completed" | "failed" | "blocked_no_source";

export type CheckType =
  | "citation_presence"
  | "dosage_validation_required"
  | "clinical_claim_verification"
  | "unsupported_claim_detection";

export type CheckResult = "pass" | "fail" | "warning";

export interface AIPromptTemplate {
  id: string;
  name: string;
  purpose?: string | null;
  version: string;
  template_text: string;
  active: boolean;
  created_at: string;
}

export interface AIGenerationJob {
  id: string;
  institution_id?: string | null;
  content_item_id?: string | null;
  requested_by?: string | null;
  job_type: JobType;
  status: JobStatus;
  input_payload: Record<string, unknown>;
  output_payload?: Record<string, unknown> | null;
  model_name?: string | null;
  generation_prompt_version?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  error_message?: string | null;
  created_at: string;
}

export interface AIJobSourceLink {
  id: string;
  ai_generation_job_id: string;
  content_source_id: string;
  content_source_section_id?: string | null;
}

export interface AIValidationCheck {
  id: string;
  ai_generation_job_id: string;
  check_type: CheckType;
  result: CheckResult;
  details?: string | null;
  created_at: string;
}

export interface AIGenerationJobTrace {
  job: AIGenerationJob;
  sources: ContentSource[];
  validations: AIValidationCheck[];
}

export interface EditorialReview {
  id: string;
  content_version_id: string;
  reviewer_user_id: string;
  decision: ReviewDecision;
  comments?: string | null;
  reviewed_at: string;
}

export interface ContentSummary {
  item: ContentItem;
  latestVersion?: ContentVersion;
  latestReviews: EditorialReview[];
}

export interface ContentQueueEntry {
  item: ContentItem;
  version: ContentVersion;
}

export interface ContentVersionTimelineEntry {
  version: ContentVersion;
  reviews: EditorialReview[];
}

export type ReportScope = "trainee" | "preceptor" | "admin";

export interface MetricCardData {
  label: string;
  value: string;
  helper?: string;
  trend?: number[];
}

export interface DomainPerformance {
  domain: string;
  scorePercent: number;
  improvement?: string;
  bestTopic?: string;
  worstTopic?: string;
}

export interface ProgressSummary {
  title: string;
  detail: string;
  progressPercent?: number;
}

export interface ProcedureStat {
  title: string;
  value: string;
  trend?: string;
}

export interface ValidationAlert {
  label: string;
  detail: string;
  severity: "low" | "medium" | "high";
}

export interface EmergencyPerformance {
  scenario: string;
  completed: number;
  successRate: number;
  confidenceChange: number;
}

export interface EditorialCoverage {
  coveragePercent: number;
  itemsPublished: number;
  inReview: number;
  criticalPending: number;
}

export interface ReportViewData {
  overviewMetrics: MetricCardData[];
  domainPerformance: DomainPerformance[];
  progressSummaries: ProgressSummary[];
  procedureStats: ProcedureStat[];
  validationAlerts: ValidationAlert[];
  emergencyPerformance: EmergencyPerformance[];
  editorialCoverage: EditorialCoverage;
  usageInsights: string[];
  cohortProgress: CohortProgressSummary[];
  traineeSnapshots: TraineeSnapshot[];
}

export interface CohortProgressSummary {
  year: TraineeYearCode;
  traineeCount: number;
  expectedPercent: number;
  lessonProgressPercent: number;
  moduleProgressPercent: number;
  clinicalMaturityPercent: number;
  recentActivityCount: number;
}

export interface TraineeSnapshot {
  traineeId: string;
  traineeName: string;
  trainingYear: TraineeYearCode;
  expectedPercent: number;
  lessonProgressPercent: number;
  moduleProgressPercent: number;
  theoreticalGapPercent: number;
  clinicalMaturityPercent: number;
  recentQuestionAccuracy: number | null;
  recentExamAverage: number | null;
  recentProcedures: number;
  recentEmergencies: number;
  pendingValidations: number;
  openNotebookItems: number;
}

export interface ContentReference {
  id: string;
  content_version_id: string;
  content_reference_id?: string | null;
  citation_label?: string | null;
  cited_excerpt?: string | null;
  content_source_id: string;
  content_source_section_id?: string | null;
  support_type: SupportType;
  note?: string | null;
}

export interface SurgeryGuideChecklistMetadata {
  contexts?: string[];
  patient_types?: string[];
  suggested_years?: TraineeYearCode[];
  confidence_level?: string;
}

export interface SurgeryGuideChecklistEntry {
  label: string;
  detail?: string | null;
}

export interface SurgeryGuideChecklist {
  entries?: SurgeryGuideChecklistEntry[];
  objectives?: string[];
  alternatives?: string[];
  metadata?: SurgeryGuideChecklistMetadata;
}

export interface SurgeryAnesthesiaGuide {
  id: string;
  surgery_catalog_id: string;
  title: string;
  specialty: SurgerySpecialty;
  summary?: string | null;
  educational_scope_notice?: string | null;
  preop_considerations_markdown?: string | null;
  monitoring_markdown?: string | null;
  anesthetic_approach_markdown?: string | null;
  medication_strategy_markdown?: string | null;
  analgesia_plan_markdown?: string | null;
  postop_plan_markdown?: string | null;
  risks_and_pitfalls_markdown?: string | null;
  checklist_jsonb: SurgeryGuideChecklist;
  status: EditorialStatus;
  created_at: string;
  updated_at: string;
}

export interface SurgeryGuideVariant {
  id: string;
  guide_id: string;
  variant_label: string;
  context_jsonb: Record<string, unknown>;
  content_markdown?: string | null;
}

export interface SurgeryGuideFilters {
  specialty?: SurgerySpecialty;
  complexity?: DifficultyLevel;
  suggestedYear?: TraineeYearCode;
  patientType?: string;
  context?: string;
  query?: string;
}

export interface SurgeryGuideSummary {
  guide: SurgeryAnesthesiaGuide;
  surgery: SurgeryCatalog;
  contexts: string[];
  patientTypes: string[];
  suggestedYears: TraineeYearCode[];
}

export interface SurgeryGuideDetail extends SurgeryGuideSummary {
  variants: SurgeryGuideVariant[];
  references: string[];
}

export interface ModuleCounts {
  curriculumTopics: number;
  learningTracks: number;
  questionBankEntries: number;
  exams: number;
  procedureLogs: number;
  emergencyScenarios: number;
}
