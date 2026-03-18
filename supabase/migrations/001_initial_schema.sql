-- Supabase / PostgreSQL migration
-- SaaS multi-institucional para treinamento e avaliação em anestesiologia (CET)
-- Versão inicial do schema

-- =========================================================
-- EXTENSÕES
-- =========================================================
create extension if not exists pgcrypto;
create extension if not exists vector;

-- =========================================================
-- FUNÇÕES UTILITÁRIAS
-- =========================================================
-- =========================================================
-- ENUMS
-- =========================================================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'institution_status') then
    create type public.institution_status as enum ('active', 'inactive', 'trial');
  end if;

  if not exists (select 1 from pg_type where typname = 'plan_type') then
    create type public.plan_type as enum ('starter', 'pro', 'enterprise');
  end if;

  if not exists (select 1 from pg_type where typname = 'unit_type') then
    create type public.unit_type as enum ('hospital', 'ambulatory_center', 'simulation_center', 'other');
  end if;

  if not exists (select 1 from pg_type where typname = 'trainee_year_code') then
    create type public.trainee_year_code as enum ('ME1', 'ME2', 'ME3');
  end if;

  if not exists (select 1 from pg_type where typname = 'trainee_status') then
    create type public.trainee_status as enum ('active', 'paused', 'completed', 'inactive');
  end if;

  if not exists (select 1 from pg_type where typname = 'track_type') then
    create type public.track_type as enum ('year_based', 'emergency', 'preanesthetic', 'procedure_guide', 'free_track');
  end if;

  if not exists (select 1 from pg_type where typname = 'module_type') then
    create type public.module_type as enum ('lesson', 'case_series', 'review', 'simulation', 'assessment_prep');
  end if;

  if not exists (select 1 from pg_type where typname = 'difficulty_level') then
    create type public.difficulty_level as enum ('basic', 'intermediate', 'advanced');
  end if;

  if not exists (select 1 from pg_type where typname = 'lesson_format') then
    create type public.lesson_format as enum ('interactive', 'flashcards', 'microlearning', 'case_based', 'algorithmic');
  end if;

  if not exists (select 1 from pg_type where typname = 'lesson_step_type') then
    create type public.lesson_step_type as enum ('text', 'question', 'flashcard', 'drag_order', 'case_decision', 'image_hotspot', 'checkpoint');
  end if;

  if not exists (select 1 from pg_type where typname = 'progress_status') then
    create type public.progress_status as enum ('not_started', 'in_progress', 'completed', 'mastered');
  end if;

  if not exists (select 1 from pg_type where typname = 'question_difficulty') then
    create type public.question_difficulty as enum ('easy', 'medium', 'hard');
  end if;

  if not exists (select 1 from pg_type where typname = 'question_type_enum') then
    create type public.question_type_enum as enum ('single_choice', 'multiple_choice', 'true_false', 'matching', 'case_sequential', 'image_based');
  end if;

  if not exists (select 1 from pg_type where typname = 'editorial_status') then
    create type public.editorial_status as enum ('draft', 'under_review', 'approved', 'published', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'source_generation_type') then
    create type public.source_generation_type as enum ('human', 'ai_derived', 'hybrid');
  end if;

  if not exists (select 1 from pg_type where typname = 'tag_type_enum') then
    create type public.tag_type_enum as enum ('topic', 'skill', 'specialty', 'difficulty', 'emergency', 'procedure');
  end if;

  if not exists (select 1 from pg_type where typname = 'attempt_mode') then
    create type public.attempt_mode as enum ('practice', 'exam', 'review', 'spaced_repetition');
  end if;

  if not exists (select 1 from pg_type where typname = 'exam_type_enum') then
    create type public.exam_type_enum as enum ('quarterly', 'annual', 'mock', 'mini_test', 'oral_simulation');
  end if;

  if not exists (select 1 from pg_type where typname = 'exam_status') then
    create type public.exam_status as enum ('draft', 'scheduled', 'open', 'closed', 'published');
  end if;

  if not exists (select 1 from pg_type where typname = 'exam_attempt_status') then
    create type public.exam_attempt_status as enum ('in_progress', 'submitted', 'graded', 'expired');
  end if;

  if not exists (select 1 from pg_type where typname = 'emergency_category') then
    create type public.emergency_category as enum ('airway', 'hemodynamic', 'respiratory', 'allergic', 'regional', 'obstetric', 'pediatric', 'other');
  end if;

  if not exists (select 1 from pg_type where typname = 'scenario_step_type') then
    create type public.scenario_step_type as enum ('presentation', 'decision', 'action', 'feedback', 'debrief');
  end if;

  if not exists (select 1 from pg_type where typname = 'procedure_category') then
    create type public.procedure_category as enum ('airway', 'regional', 'vascular_access', 'neuroaxis', 'general_anesthesia', 'monitoring', 'pain', 'other');
  end if;

  if not exists (select 1 from pg_type where typname = 'complexity_level_enum') then
    create type public.complexity_level_enum as enum ('basic', 'intermediate', 'advanced');
  end if;

  if not exists (select 1 from pg_type where typname = 'surgery_specialty') then
    create type public.surgery_specialty as enum ('general', 'ortho', 'obstetric', 'urology', 'thoracic', 'cardiac', 'neuro', 'pediatric', 'ent', 'ophthalmology', 'plastic', 'other');
  end if;

  if not exists (select 1 from pg_type where typname = 'trainee_role_in_case') then
    create type public.trainee_role_in_case as enum ('observed', 'assisted', 'performed_supervised', 'performed_with_relative_autonomy');
  end if;

  if not exists (select 1 from pg_type where typname = 'perceived_difficulty') then
    create type public.perceived_difficulty as enum ('low', 'medium', 'high');
  end if;

  if not exists (select 1 from pg_type where typname = 'procedure_success_status') then
    create type public.procedure_success_status as enum ('successful', 'partial', 'failed', 'converted');
  end if;

  if not exists (select 1 from pg_type where typname = 'validation_status') then
    create type public.validation_status as enum ('pending', 'approved', 'rejected', 'needs_revision');
  end if;

  if not exists (select 1 from pg_type where typname = 'readiness_level_enum') then
    create type public.readiness_level_enum as enum ('not_ready', 'ready_with_close_supervision', 'ready_with_standard_supervision', 'confident_under_indirect_supervision');
  end if;

  if not exists (select 1 from pg_type where typname = 'form_type_enum') then
    create type public.form_type_enum as enum ('procedure', 'topic', 'emergency', 'rotation_readiness', 'global');
  end if;

  if not exists (select 1 from pg_type where typname = 'assessment_dimension') then
    create type public.assessment_dimension as enum ('confidence', 'knowledge', 'technical_skill', 'decision_making', 'communication', 'crisis_management');
  end if;

  if not exists (select 1 from pg_type where typname = 'preanesthetic_category') then
    create type public.preanesthetic_category as enum ('fasting', 'medication_continue', 'medication_suspend', 'risk_assessment', 'lab_tests', 'special_population', 'checklist');
  end if;

  if not exists (select 1 from pg_type where typname = 'content_target_audience') then
    create type public.content_target_audience as enum ('all', 'ME1', 'ME2', 'ME3', 'preceptor');
  end if;

  if not exists (select 1 from pg_type where typname = 'source_type_enum') then
    create type public.source_type_enum as enum ('guideline', 'society_document', 'book', 'review_article', 'rct', 'consensus', 'institutional_protocol');
  end if;

  if not exists (select 1 from pg_type where typname = 'trust_level_enum') then
    create type public.trust_level_enum as enum ('high', 'moderate', 'restricted_use');
  end if;

  if not exists (select 1 from pg_type where typname = 'content_type_enum') then
    create type public.content_type_enum as enum ('lesson', 'question', 'preanesthetic', 'guide', 'scenario', 'flashcard', 'summary');
  end if;

  if not exists (select 1 from pg_type where typname = 'review_status_enum') then
    create type public.review_status_enum as enum ('pending', 'reviewed', 'approved', 'rejected');
  end if;

  if not exists (select 1 from pg_type where typname = 'support_type_enum') then
    create type public.support_type_enum as enum ('primary_support', 'secondary_support', 'context_only');
  end if;

  if not exists (select 1 from pg_type where typname = 'review_decision_enum') then
    create type public.review_decision_enum as enum ('approve', 'reject', 'needs_revision');
  end if;

  if not exists (select 1 from pg_type where typname = 'job_type_enum') then
    create type public.job_type_enum as enum ('generate_lesson', 'generate_question', 'generate_flashcards', 'generate_case', 'summarize_sources', 'update_content');
  end if;

  if not exists (select 1 from pg_type where typname = 'job_status_enum') then
    create type public.job_status_enum as enum ('queued', 'running', 'completed', 'failed', 'blocked_no_source');
  end if;

  if not exists (select 1 from pg_type where typname = 'check_type_enum') then
    create type public.check_type_enum as enum ('citation_presence', 'dosage_validation_required', 'clinical_claim_verification', 'unsupported_claim_detection');
  end if;

  if not exists (select 1 from pg_type where typname = 'check_result_enum') then
    create type public.check_result_enum as enum ('pass', 'fail', 'warning');
  end if;

  if not exists (select 1 from pg_type where typname = 'competency_type_enum') then
    create type public.competency_type_enum as enum ('knowledge', 'technical_skill', 'clinical_reasoning', 'professionalism', 'safety', 'communication', 'leadership');
  end if;

  if not exists (select 1 from pg_type where typname = 'development_plan_status') then
    create type public.development_plan_status as enum ('active', 'completed', 'superseded');
  end if;

  if not exists (select 1 from pg_type where typname = 'audit_action_enum') then
    create type public.audit_action_enum as enum ('create', 'update', 'delete', 'approve', 'publish', 'validate', 'submit');
  end if;
end $$;

-- =========================================================
-- TABELAS DE BASE
-- =========================================================
create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  legal_name text,
  cnpj_optional text,
  status public.institution_status not null default 'trial',
  plan_type public.plan_type not null default 'starter',
  settings_jsonb jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.institution_units (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  name text not null,
  city text,
  state text,
  type public.unit_type not null default 'hospital',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cohorts (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  name text not null,
  start_date date,
  end_date date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text
);

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  institution_id uuid references public.institutions(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  avatar_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null
);

create unique index if not exists user_profiles_email_unique on public.user_profiles (lower(email));
create index if not exists user_profiles_institution_idx on public.user_profiles (institution_id);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  institution_id uuid references public.institutions(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, role_id, institution_id)
);

create index if not exists user_roles_user_idx on public.user_roles (user_id);
create index if not exists user_roles_institution_idx on public.user_roles (institution_id);

create table if not exists public.trainee_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  institution_id uuid not null references public.institutions(id) on delete cascade,
  cohort_id uuid references public.cohorts(id) on delete set null,
  trainee_year public.trainee_year_code not null,
  enrollment_date date,
  expected_completion_date date,
  current_status public.trainee_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null
);

create index if not exists trainee_profiles_institution_idx on public.trainee_profiles (institution_id);
create index if not exists trainee_profiles_year_idx on public.trainee_profiles (trainee_year);

create table if not exists public.preceptor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  institution_id uuid not null references public.institutions(id) on delete cascade,
  specialty_focus text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null
);

create index if not exists preceptor_profiles_institution_idx on public.preceptor_profiles (institution_id);

-- =========================================================
-- CURRÍCULO SBA
-- =========================================================
create table if not exists public.curriculum_years (
  id uuid primary key default gen_random_uuid(),
  code public.trainee_year_code not null unique,
  name text not null,
  display_order integer not null
);

create table if not exists public.curriculum_topics (
  id uuid primary key default gen_random_uuid(),
  curriculum_year_id uuid not null references public.curriculum_years(id) on delete cascade,
  point_number integer not null,
  title text not null,
  description text,
  display_order integer not null,
  source_label text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (curriculum_year_id, point_number)
);

create index if not exists curriculum_topics_year_idx on public.curriculum_topics (curriculum_year_id, display_order);

create table if not exists public.curriculum_subtopics (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.curriculum_topics(id) on delete cascade,
  code_ex text,
  title text not null,
  description text,
  display_order integer not null,
  active boolean not null default true,
  unique (topic_id, code_ex)
);

create index if not exists curriculum_subtopics_topic_idx on public.curriculum_subtopics (topic_id, display_order);

-- =========================================================
-- TRILHAS E LIÇÕES
-- =========================================================
create table if not exists public.learning_tracks (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid references public.institutions(id) on delete cascade,
  curriculum_year_id uuid references public.curriculum_years(id) on delete set null,
  title text not null,
  description text,
  track_type public.track_type not null,
  active boolean not null default true,
  estimated_minutes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null
);

create index if not exists learning_tracks_institution_idx on public.learning_tracks (institution_id);
create index if not exists learning_tracks_year_idx on public.learning_tracks (curriculum_year_id);

create table if not exists public.learning_track_topics (
  id uuid primary key default gen_random_uuid(),
  learning_track_id uuid not null references public.learning_tracks(id) on delete cascade,
  curriculum_topic_id uuid not null references public.curriculum_topics(id) on delete cascade,
  display_order integer not null,
  unique (learning_track_id, curriculum_topic_id)
);

create table if not exists public.learning_modules (
  id uuid primary key default gen_random_uuid(),
  learning_track_id uuid not null references public.learning_tracks(id) on delete cascade,
  curriculum_topic_id uuid references public.curriculum_topics(id) on delete set null,
  title text not null,
  description text,
  module_type public.module_type not null,
  difficulty_level public.difficulty_level not null default 'basic',
  display_order integer not null,
  estimated_minutes integer,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null
);

create index if not exists learning_modules_track_idx on public.learning_modules (learning_track_id, display_order);
create index if not exists learning_modules_topic_idx on public.learning_modules (curriculum_topic_id);

create table if not exists public.learning_lessons (
  id uuid primary key default gen_random_uuid(),
  learning_module_id uuid not null references public.learning_modules(id) on delete cascade,
  title text not null,
  objective text,
  summary text,
  lesson_format public.lesson_format not null,
  display_order integer not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null
);

create index if not exists learning_lessons_module_idx on public.learning_lessons (learning_module_id, display_order);

create table if not exists public.lesson_steps (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.learning_lessons(id) on delete cascade,
  step_type public.lesson_step_type not null,
  title text,
  body_markdown text,
  media_url text,
  structured_payload jsonb not null default '{}'::jsonb,
  display_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lesson_id, display_order)
);

create index if not exists lesson_steps_lesson_idx on public.lesson_steps (lesson_id, display_order);

create table if not exists public.trainee_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  trainee_user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.learning_lessons(id) on delete cascade,
  status public.progress_status not null default 'not_started',
  score_percent numeric(5,2),
  completed_at timestamptz,
  attempts_count integer not null default 0,
  streak_snapshot integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trainee_user_id, lesson_id)
);

create table if not exists public.trainee_module_progress (
  id uuid primary key default gen_random_uuid(),
  trainee_user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid not null references public.learning_modules(id) on delete cascade,
  status public.progress_status not null default 'not_started',
  completion_percent numeric(5,2),
  mastery_level numeric(5,2),
  updated_at timestamptz not null default now(),
  unique (trainee_user_id, module_id)
);

-- =========================================================
-- QUESTÕES E PROVAS
-- =========================================================
create table if not exists public.question_bank (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid references public.institutions(id) on delete cascade,
  curriculum_year_id uuid references public.curriculum_years(id) on delete set null,
  curriculum_topic_id uuid references public.curriculum_topics(id) on delete set null,
  curriculum_subtopic_id uuid references public.curriculum_subtopics(id) on delete set null,
  title text,
  stem text not null,
  rationale text,
  difficulty public.question_difficulty not null default 'medium',
  question_type public.question_type_enum not null,
  clinical_context_jsonb jsonb not null default '{}'::jsonb,
  educational_goal text,
  status public.editorial_status not null default 'draft',
  source_generation_type public.source_generation_type not null default 'human',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null
);

create index if not exists question_bank_institution_idx on public.question_bank (institution_id);
create index if not exists question_bank_topic_idx on public.question_bank (curriculum_topic_id);
create index if not exists question_bank_status_idx on public.question_bank (status);

create table if not exists public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.question_bank(id) on delete cascade,
  option_label text,
  option_text text not null,
  is_correct boolean not null default false,
  explanation text,
  display_order integer not null,
  unique (question_id, display_order)
);

create table if not exists public.question_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  tag_type public.tag_type_enum not null
);

create table if not exists public.question_tag_links (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.question_bank(id) on delete cascade,
  tag_id uuid not null references public.question_tags(id) on delete cascade,
  unique (question_id, tag_id)
);

create table if not exists public.content_sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_type public.source_type_enum not null,
  publisher text,
  publication_year integer,
  edition text,
  doi_or_identifier text,
  source_url text,
  citation_abnt text,
  citation_vancouver text,
  trust_level public.trust_level_enum not null default 'high',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_source_sections (
  id uuid primary key default gen_random_uuid(),
  content_source_id uuid not null references public.content_sources(id) on delete cascade,
  section_label text,
  section_title text,
  excerpt_text text not null,
  page_start integer,
  page_end integer,
  embedding vector(1536),
  metadata_jsonb jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists content_source_sections_source_idx on public.content_source_sections (content_source_id);

create table if not exists public.question_references (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.question_bank(id) on delete cascade,
  content_reference_id uuid references public.content_source_sections(id) on delete set null,
  citation_label text,
  cited_excerpt text,
  page_or_section text,
  created_at timestamptz not null default now()
);

create table if not exists public.trainee_question_attempts (
  id uuid primary key default gen_random_uuid(),
  trainee_user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.question_bank(id) on delete cascade,
  selected_option_ids jsonb not null default '[]'::jsonb,
  is_correct boolean,
  response_time_seconds integer,
  mode public.attempt_mode not null default 'practice',
  attempted_at timestamptz not null default now()
);

create index if not exists trainee_question_attempts_trainee_idx on public.trainee_question_attempts (trainee_user_id, attempted_at desc);

create table if not exists public.trainee_error_notebook (
  id uuid primary key default gen_random_uuid(),
  trainee_user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.question_bank(id) on delete cascade,
  first_wrong_at timestamptz not null,
  last_wrong_at timestamptz not null,
  times_wrong integer not null default 1,
  resolved boolean not null default false,
  notes text,
  unique (trainee_user_id, question_id)
);

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  curriculum_year_id uuid references public.curriculum_years(id) on delete set null,
  title text not null,
  description text,
  exam_type public.exam_type_enum not null,
  status public.exam_status not null default 'draft',
  duration_minutes integer,
  total_questions integer,
  passing_score numeric(5,2),
  available_from timestamptz,
  available_until timestamptz,
  randomize_questions boolean not null default true,
  randomize_options boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists exams_institution_idx on public.exams (institution_id);
create index if not exists exams_year_idx on public.exams (curriculum_year_id);

create table if not exists public.exam_blueprints (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  curriculum_topic_id uuid not null references public.curriculum_topics(id) on delete cascade,
  target_question_count integer not null,
  difficulty_distribution_jsonb jsonb not null default '{}'::jsonb,
  weight_percent numeric(5,2)
);

create table if not exists public.exam_question_links (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  question_id uuid not null references public.question_bank(id) on delete cascade,
  display_order integer not null,
  points numeric(8,2) not null default 1,
  unique (exam_id, question_id)
);

create table if not exists public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  trainee_user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz,
  submitted_at timestamptz,
  raw_score numeric(8,2),
  percent_score numeric(5,2),
  percentile numeric(5,2),
  status public.exam_attempt_status not null default 'in_progress',
  proctoring_jsonb jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (exam_id, trainee_user_id)
);

create table if not exists public.exam_answers (
  id uuid primary key default gen_random_uuid(),
  exam_attempt_id uuid not null references public.exam_attempts(id) on delete cascade,
  question_id uuid not null references public.question_bank(id) on delete cascade,
  selected_option_ids jsonb not null default '[]'::jsonb,
  is_correct boolean,
  points_awarded numeric(8,2),
  answered_at timestamptz not null default now(),
  unique (exam_attempt_id, question_id)
);

create table if not exists public.exam_result_domains (
  id uuid primary key default gen_random_uuid(),
  exam_attempt_id uuid not null references public.exam_attempts(id) on delete cascade,
  curriculum_topic_id uuid not null references public.curriculum_topics(id) on delete cascade,
  score_percent numeric(5,2),
  correct_count integer,
  total_count integer,
  unique (exam_attempt_id, curriculum_topic_id)
);

-- =========================================================
-- EMERGÊNCIAS
-- =========================================================
create table if not exists public.emergency_scenarios (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid references public.institutions(id) on delete cascade,
  title text not null,
  description text,
  category public.emergency_category not null,
  difficulty_level public.difficulty_level not null default 'intermediate',
  universal_access boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null
);

create table if not exists public.emergency_scenario_steps (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.emergency_scenarios(id) on delete cascade,
  step_order integer not null,
  step_type public.scenario_step_type not null,
  prompt_text text not null,
  payload_jsonb jsonb not null default '{}'::jsonb,
  correct_branch_key text,
  unique (scenario_id, step_order)
);

create table if not exists public.emergency_attempts (
  id uuid primary key default gen_random_uuid(),
  trainee_user_id uuid not null references auth.users(id) on delete cascade,
  scenario_id uuid not null references public.emergency_scenarios(id) on delete cascade,
  started_at timestamptz,
  completed_at timestamptz,
  score_percent numeric(5,2),
  completion_status public.progress_status not null default 'in_progress',
  debrief_summary text,
  created_at timestamptz not null default now()
);

create table if not exists public.emergency_attempt_actions (
  id uuid primary key default gen_random_uuid(),
  emergency_attempt_id uuid not null references public.emergency_attempts(id) on delete cascade,
  scenario_step_id uuid not null references public.emergency_scenario_steps(id) on delete cascade,
  action_payload jsonb not null default '{}'::jsonb,
  is_expected_action boolean,
  action_timestamp timestamptz not null default now()
);

create table if not exists public.emergency_self_assessments (
  id uuid primary key default gen_random_uuid(),
  trainee_user_id uuid not null references auth.users(id) on delete cascade,
  scenario_id uuid not null references public.emergency_scenarios(id) on delete cascade,
  confidence_before numeric(5,2),
  confidence_after numeric(5,2),
  perceived_readiness text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- LOGBOOK
-- =========================================================
create table if not exists public.procedure_catalog (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category public.procedure_category not null,
  description text,
  complexity_level public.complexity_level_enum not null default 'basic',
  active boolean not null default true
);

create table if not exists public.surgery_catalog (
  id uuid primary key default gen_random_uuid(),
  specialty public.surgery_specialty not null,
  procedure_name text not null,
  procedure_group text,
  complexity_level public.complexity_level_enum not null default 'basic',
  active boolean not null default true,
  unique (specialty, procedure_name)
);

create table if not exists public.procedure_logs (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  trainee_user_id uuid not null references auth.users(id) on delete cascade,
  preceptor_user_id uuid references auth.users(id) on delete set null,
  unit_id uuid references public.institution_units(id) on delete set null,
  surgery_catalog_id uuid references public.surgery_catalog(id) on delete set null,
  procedure_catalog_id uuid references public.procedure_catalog(id) on delete set null,
  performed_on date not null,
  trainee_year_snapshot public.trainee_year_code not null,
  trainee_role public.trainee_role_in_case not null,
  anesthesia_technique_summary text,
  patient_profile_summary text,
  difficulty_perceived public.perceived_difficulty,
  success_status public.procedure_success_status not null default 'successful',
  complications_summary text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists procedure_logs_trainee_idx on public.procedure_logs (trainee_user_id, performed_on desc);
create index if not exists procedure_logs_institution_idx on public.procedure_logs (institution_id);

create table if not exists public.procedure_log_items (
  id uuid primary key default gen_random_uuid(),
  procedure_log_id uuid not null references public.procedure_logs(id) on delete cascade,
  procedure_catalog_id uuid not null references public.procedure_catalog(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  success_status public.procedure_success_status not null default 'successful',
  notes text
);

create table if not exists public.procedure_validations (
  id uuid primary key default gen_random_uuid(),
  procedure_log_id uuid not null references public.procedure_logs(id) on delete cascade,
  validator_user_id uuid not null references auth.users(id) on delete cascade,
  validation_status public.validation_status not null default 'pending',
  feedback text,
  validated_at timestamptz,
  unique (procedure_log_id, validator_user_id)
);

create table if not exists public.procedure_self_assessments (
  id uuid primary key default gen_random_uuid(),
  procedure_log_id uuid not null unique references public.procedure_logs(id) on delete cascade,
  confidence_level integer not null check (confidence_level between 1 and 5),
  readiness_level public.readiness_level_enum not null,
  reflection_text text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- AUTOAVALIAÇÃO
-- =========================================================
create table if not exists public.self_assessment_forms (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  form_type public.form_type_enum not null,
  active boolean not null default true
);

create table if not exists public.self_assessment_form_items (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.self_assessment_forms(id) on delete cascade,
  item_text text not null,
  dimension public.assessment_dimension not null,
  display_order integer not null,
  unique (form_id, display_order)
);

create table if not exists public.self_assessment_responses (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.self_assessment_forms(id) on delete cascade,
  trainee_user_id uuid not null references auth.users(id) on delete cascade,
  curriculum_topic_id uuid references public.curriculum_topics(id) on delete set null,
  related_entity_type text,
  related_entity_id uuid,
  submitted_at timestamptz not null default now(),
  summary_jsonb jsonb not null default '{}'::jsonb
);

create table if not exists public.self_assessment_response_items (
  id uuid primary key default gen_random_uuid(),
  self_assessment_response_id uuid not null references public.self_assessment_responses(id) on delete cascade,
  form_item_id uuid not null references public.self_assessment_form_items(id) on delete cascade,
  score_numeric numeric(5,2),
  note_text text,
  unique (self_assessment_response_id, form_item_id)
);

-- =========================================================
-- PRÉ-ANESTÉSICO E GUIAS CIRÚRGICOS
-- =========================================================
create table if not exists public.preanesthetic_topics (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category public.preanesthetic_category not null,
  target_audience public.content_target_audience not null default 'all',
  summary text,
  detailed_content_markdown text,
  quick_reference_jsonb jsonb not null default '{}'::jsonb,
  decision_tree_jsonb jsonb not null default '{}'::jsonb,
  status public.editorial_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null
);

create table if not exists public.preanesthetic_topic_links (
  id uuid primary key default gen_random_uuid(),
  preanesthetic_topic_id uuid not null references public.preanesthetic_topics(id) on delete cascade,
  curriculum_topic_id uuid not null references public.curriculum_topics(id) on delete cascade,
  unique (preanesthetic_topic_id, curriculum_topic_id)
);

create table if not exists public.surgery_anesthesia_guides (
  id uuid primary key default gen_random_uuid(),
  surgery_catalog_id uuid not null references public.surgery_catalog(id) on delete cascade,
  title text not null,
  specialty public.surgery_specialty not null,
  summary text,
  educational_scope_notice text,
  preop_considerations_markdown text,
  monitoring_markdown text,
  anesthetic_approach_markdown text,
  medication_strategy_markdown text,
  analgesia_plan_markdown text,
  postop_plan_markdown text,
  risks_and_pitfalls_markdown text,
  checklist_jsonb jsonb not null default '{}'::jsonb,
  status public.editorial_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null
);

create table if not exists public.surgery_guide_variants (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid not null references public.surgery_anesthesia_guides(id) on delete cascade,
  variant_label text not null,
  context_jsonb jsonb not null default '{}'::jsonb,
  content_markdown text
);

-- =========================================================
-- CONTEÚDO EDITORIAL E VERSIONAMENTO
-- =========================================================
create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid references public.institutions(id) on delete cascade,
  content_type public.content_type_enum not null,
  title text not null,
  slug text not null unique,
  current_version_id uuid,
  editorial_status public.editorial_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null
);

create table if not exists public.content_versions (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  version_number integer not null,
  body_markdown text,
  structured_jsonb jsonb not null default '{}'::jsonb,
  generated_by_ai boolean not null default false,
  generation_model text,
  generation_prompt_version text,
  review_status public.review_status_enum not null default 'pending',
  reviewer_user_id uuid references auth.users(id) on delete set null,
  review_notes text,
  created_at timestamptz not null default now(),
  unique (content_item_id, version_number)
);

alter table public.content_items
  drop constraint if exists content_items_current_version_id_fkey;

alter table public.content_items
  add constraint content_items_current_version_id_fkey
  foreign key (current_version_id) references public.content_versions(id) on delete set null;

create table if not exists public.content_references (
  id uuid primary key default gen_random_uuid(),
  content_version_id uuid not null references public.content_versions(id) on delete cascade,
  content_source_id uuid not null references public.content_sources(id) on delete cascade,
  content_source_section_id uuid references public.content_source_sections(id) on delete set null,
  citation_label text,
  support_type public.support_type_enum not null default 'primary_support',
  note text
);

create table if not exists public.editorial_reviews (
  id uuid primary key default gen_random_uuid(),
  content_version_id uuid not null references public.content_versions(id) on delete cascade,
  reviewer_user_id uuid not null references auth.users(id) on delete cascade,
  decision public.review_decision_enum not null,
  comments text,
  reviewed_at timestamptz not null default now()
);

-- =========================================================
-- IA E GOVERNANÇA
-- =========================================================
create table if not exists public.ai_prompt_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  purpose text,
  version text not null,
  template_text text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (name, version)
);

create table if not exists public.ai_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid references public.institutions(id) on delete cascade,
  content_item_id uuid references public.content_items(id) on delete set null,
  requested_by uuid references auth.users(id) on delete set null,
  job_type public.job_type_enum not null,
  status public.job_status_enum not null default 'queued',
  input_payload jsonb not null default '{}'::jsonb,
  output_payload jsonb,
  model_name text,
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_job_source_links (
  id uuid primary key default gen_random_uuid(),
  ai_generation_job_id uuid not null references public.ai_generation_jobs(id) on delete cascade,
  content_source_id uuid not null references public.content_sources(id) on delete cascade,
  content_source_section_id uuid references public.content_source_sections(id) on delete set null
);

create table if not exists public.ai_validation_checks (
  id uuid primary key default gen_random_uuid(),
  ai_generation_job_id uuid not null references public.ai_generation_jobs(id) on delete cascade,
  check_type public.check_type_enum not null,
  result public.check_result_enum not null,
  details text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- COMPETÊNCIAS
-- =========================================================
create table if not exists public.competency_frameworks (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid references public.institutions(id) on delete cascade,
  curriculum_year_id uuid references public.curriculum_years(id) on delete set null,
  title text not null,
  description text,
  active boolean not null default true
);

create table if not exists public.competency_items (
  id uuid primary key default gen_random_uuid(),
  competency_framework_id uuid not null references public.competency_frameworks(id) on delete cascade,
  curriculum_topic_id uuid references public.curriculum_topics(id) on delete set null,
  name text not null,
  competency_type public.competency_type_enum not null,
  expected_level public.trainee_year_code not null,
  display_order integer not null
);

create table if not exists public.competency_assessments (
  id uuid primary key default gen_random_uuid(),
  trainee_user_id uuid not null references auth.users(id) on delete cascade,
  assessor_user_id uuid not null references auth.users(id) on delete cascade,
  competency_item_id uuid not null references public.competency_items(id) on delete cascade,
  assessment_date date not null,
  rating integer not null check (rating between 1 and 5),
  narrative_feedback text,
  assessment_context text
);

create table if not exists public.trainee_development_plans (
  id uuid primary key default gen_random_uuid(),
  trainee_user_id uuid not null references auth.users(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  start_date date not null,
  end_date date,
  focus_areas_jsonb jsonb not null default '[]'::jsonb,
  recommended_actions_jsonb jsonb not null default '[]'::jsonb,
  status public.development_plan_status not null default 'active',
  created_at timestamptz not null default now()
);

-- =========================================================
-- NOTIFICAÇÕES E AUDITORIA
-- =========================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  action_url text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid references public.institutions(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action public.audit_action_enum not null,
  before_jsonb jsonb,
  after_jsonb jsonb,
  ip_address inet,
  created_at timestamptz not null default now()
);

-- =========================================================
-- FUNÇÕES UTILITÁRIAS (depois das tabelas)
-- =========================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_user_id()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.code = 'super_admin'
  );
$$;

create or replace function public.current_user_institution_id()
returns uuid
language sql
stable
as $$
  select up.institution_id
  from public.user_profiles up
  where up.id = auth.uid()
  limit 1;
$$;

create or replace function public.has_role(_role text)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.code = _role
      and (
        ur.institution_id = public.current_user_institution_id()
        or ur.institution_id is null
      )
  );
$$;

create or replace function public.is_institution_admin()
returns boolean
language sql
stable
as $$
  select public.has_role('institution_admin');
$$;

create or replace function public.is_coordinator()
returns boolean
language sql
stable
as $$
  select public.has_role('coordinator');
$$;

create or replace function public.is_preceptor()
returns boolean
language sql
stable
as $$
  select public.has_role('preceptor');
$$;

create or replace function public.is_trainee()
returns boolean
language sql
stable
as $$
  select public.has_role('trainee');
$$;

create or replace function public.same_institution(_institution_id uuid)
returns boolean
language sql
stable
as $$
  select (
    public.is_super_admin()
    or _institution_id = public.current_user_institution_id()
  );
$$;

-- =========================================================
-- TRIGGERS DE UPDATED_AT
-- =========================================================
create trigger set_updated_at_institutions
before update on public.institutions
for each row execute function public.set_updated_at();

create trigger set_updated_at_institution_units
before update on public.institution_units
for each row execute function public.set_updated_at();

create trigger set_updated_at_cohorts
before update on public.cohorts
for each row execute function public.set_updated_at();

create trigger set_updated_at_user_profiles
before update on public.user_profiles
for each row execute function public.set_updated_at();

create trigger set_updated_at_trainee_profiles
before update on public.trainee_profiles
for each row execute function public.set_updated_at();

create trigger set_updated_at_preceptor_profiles
before update on public.preceptor_profiles
for each row execute function public.set_updated_at();

create trigger set_updated_at_curriculum_topics
before update on public.curriculum_topics
for each row execute function public.set_updated_at();

create trigger set_updated_at_learning_tracks
before update on public.learning_tracks
for each row execute function public.set_updated_at();

create trigger set_updated_at_learning_modules
before update on public.learning_modules
for each row execute function public.set_updated_at();

create trigger set_updated_at_learning_lessons
before update on public.learning_lessons
for each row execute function public.set_updated_at();

create trigger set_updated_at_lesson_steps
before update on public.lesson_steps
for each row execute function public.set_updated_at();

create trigger set_updated_at_trainee_lesson_progress
before update on public.trainee_lesson_progress
for each row execute function public.set_updated_at();

create trigger set_updated_at_question_bank
before update on public.question_bank
for each row execute function public.set_updated_at();

create trigger set_updated_at_exams
before update on public.exams
for each row execute function public.set_updated_at();

create trigger set_updated_at_emergency_scenarios
before update on public.emergency_scenarios
for each row execute function public.set_updated_at();

create trigger set_updated_at_procedure_logs
before update on public.procedure_logs
for each row execute function public.set_updated_at();

create trigger set_updated_at_preanesthetic_topics
before update on public.preanesthetic_topics
for each row execute function public.set_updated_at();

create trigger set_updated_at_surgery_anesthesia_guides
before update on public.surgery_anesthesia_guides
for each row execute function public.set_updated_at();

create trigger set_updated_at_content_sources
before update on public.content_sources
for each row execute function public.set_updated_at();

create trigger set_updated_at_content_items
before update on public.content_items
for each row execute function public.set_updated_at();

-- =========================================================
-- RLS
-- =========================================================
alter table public.institutions enable row level security;
alter table public.institution_units enable row level security;
alter table public.cohorts enable row level security;
alter table public.roles enable row level security;
alter table public.user_profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.trainee_profiles enable row level security;
alter table public.preceptor_profiles enable row level security;
alter table public.curriculum_years enable row level security;
alter table public.curriculum_topics enable row level security;
alter table public.curriculum_subtopics enable row level security;
alter table public.learning_tracks enable row level security;
alter table public.learning_track_topics enable row level security;
alter table public.learning_modules enable row level security;
alter table public.learning_lessons enable row level security;
alter table public.lesson_steps enable row level security;
alter table public.trainee_lesson_progress enable row level security;
alter table public.trainee_module_progress enable row level security;
alter table public.question_bank enable row level security;
alter table public.question_options enable row level security;
alter table public.question_tags enable row level security;
alter table public.question_tag_links enable row level security;
alter table public.question_references enable row level security;
alter table public.trainee_question_attempts enable row level security;
alter table public.trainee_error_notebook enable row level security;
alter table public.exams enable row level security;
alter table public.exam_blueprints enable row level security;
alter table public.exam_question_links enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.exam_answers enable row level security;
alter table public.exam_result_domains enable row level security;
alter table public.emergency_scenarios enable row level security;
alter table public.emergency_scenario_steps enable row level security;
alter table public.emergency_attempts enable row level security;
alter table public.emergency_attempt_actions enable row level security;
alter table public.emergency_self_assessments enable row level security;
alter table public.procedure_catalog enable row level security;
alter table public.surgery_catalog enable row level security;
alter table public.procedure_logs enable row level security;
alter table public.procedure_log_items enable row level security;
alter table public.procedure_validations enable row level security;
alter table public.procedure_self_assessments enable row level security;
alter table public.self_assessment_forms enable row level security;
alter table public.self_assessment_form_items enable row level security;
alter table public.self_assessment_responses enable row level security;
alter table public.self_assessment_response_items enable row level security;
alter table public.preanesthetic_topics enable row level security;
alter table public.preanesthetic_topic_links enable row level security;
alter table public.surgery_anesthesia_guides enable row level security;
alter table public.surgery_guide_variants enable row level security;
alter table public.content_sources enable row level security;
alter table public.content_source_sections enable row level security;
alter table public.content_items enable row level security;
alter table public.content_versions enable row level security;
alter table public.content_references enable row level security;
alter table public.editorial_reviews enable row level security;
alter table public.ai_prompt_templates enable row level security;
alter table public.ai_generation_jobs enable row level security;
alter table public.ai_job_source_links enable row level security;
alter table public.ai_validation_checks enable row level security;
alter table public.competency_frameworks enable row level security;
alter table public.competency_items enable row level security;
alter table public.competency_assessments enable row level security;
alter table public.trainee_development_plans enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

-- =========================================================
-- POLÍTICAS BÁSICAS DE LEITURA GLOBAL
-- =========================================================
create policy institutions_select_policy on public.institutions
for select using (public.is_super_admin() or id = public.current_user_institution_id());

create policy roles_select_policy on public.roles
for select using (auth.uid() is not null);

create policy curriculum_years_select_policy on public.curriculum_years
for select using (auth.uid() is not null);

create policy curriculum_topics_select_policy on public.curriculum_topics
for select using (auth.uid() is not null);

create policy curriculum_subtopics_select_policy on public.curriculum_subtopics
for select using (auth.uid() is not null);

create policy question_tags_select_policy on public.question_tags
for select using (auth.uid() is not null);

create policy procedure_catalog_select_policy on public.procedure_catalog
for select using (auth.uid() is not null);

create policy surgery_catalog_select_policy on public.surgery_catalog
for select using (auth.uid() is not null);

create policy self_assessment_forms_select_policy on public.self_assessment_forms
for select using (auth.uid() is not null);

create policy self_assessment_form_items_select_policy on public.self_assessment_form_items
for select using (auth.uid() is not null);

create policy content_sources_select_policy on public.content_sources
for select using (auth.uid() is not null);

create policy content_source_sections_select_policy on public.content_source_sections
for select using (auth.uid() is not null);

create policy ai_prompt_templates_select_policy on public.ai_prompt_templates
for select using (public.is_super_admin() or public.is_institution_admin() or public.is_coordinator());

-- =========================================================
-- POLÍTICAS POR INSTITUIÇÃO
-- =========================================================
create policy institution_units_all_policy on public.institution_units
for all using (public.same_institution(institution_id))
with check (public.same_institution(institution_id));

create policy cohorts_all_policy on public.cohorts
for all using (public.same_institution(institution_id))
with check (public.same_institution(institution_id));

create policy user_profiles_select_policy on public.user_profiles
for select using (
  public.is_super_admin()
  or id = auth.uid()
  or institution_id = public.current_user_institution_id()
);

create policy user_profiles_update_policy on public.user_profiles
for update using (
  public.is_super_admin()
  or id = auth.uid()
  or (
    institution_id = public.current_user_institution_id()
    and (public.is_institution_admin() or public.is_coordinator())
  )
)
with check (
  public.is_super_admin()
  or id = auth.uid()
  or (
    institution_id = public.current_user_institution_id()
    and (public.is_institution_admin() or public.is_coordinator())
  )
);

create policy user_roles_select_policy on public.user_roles
for select using (
  public.is_super_admin()
  or institution_id = public.current_user_institution_id()
  or user_id = auth.uid()
);

create policy user_roles_insert_policy on public.user_roles
for insert with check (
  public.is_super_admin()
  or (
    institution_id = public.current_user_institution_id()
    and public.is_institution_admin()
  )
);

create policy trainee_profiles_select_policy on public.trainee_profiles
for select using (
  public.is_super_admin()
  or user_id = auth.uid()
  or institution_id = public.current_user_institution_id()
);

create policy trainee_profiles_manage_policy on public.trainee_profiles
for all using (
  public.is_super_admin()
  or (
    institution_id = public.current_user_institution_id()
    and (public.is_institution_admin() or public.is_coordinator() or public.is_preceptor())
  )
)
with check (
  public.is_super_admin()
  or (
    institution_id = public.current_user_institution_id()
    and (public.is_institution_admin() or public.is_coordinator())
  )
);

create policy preceptor_profiles_all_policy on public.preceptor_profiles
for all using (
  public.is_super_admin()
  or user_id = auth.uid()
  or institution_id = public.current_user_institution_id()
)
with check (
  public.is_super_admin()
  or institution_id = public.current_user_institution_id()
);

create policy learning_tracks_select_policy on public.learning_tracks
for select using (
  auth.uid() is not null
  and (
    institution_id is null
    or institution_id = public.current_user_institution_id()
  )
);

create policy learning_tracks_manage_policy on public.learning_tracks
for all using (
  public.is_super_admin()
  or (
    institution_id = public.current_user_institution_id()
    and (public.is_institution_admin() or public.is_coordinator())
  )
)
with check (
  public.is_super_admin()
  or (
    institution_id = public.current_user_institution_id()
    and (public.is_institution_admin() or public.is_coordinator())
  )
);

create policy learning_track_topics_select_policy on public.learning_track_topics
for select using (
  exists (
    select 1 from public.learning_tracks lt
    where lt.id = learning_track_id
      and (lt.institution_id is null or lt.institution_id = public.current_user_institution_id())
  )
);

create policy learning_modules_select_policy on public.learning_modules
for select using (
  exists (
    select 1 from public.learning_tracks lt
    where lt.id = learning_track_id
      and (lt.institution_id is null or lt.institution_id = public.current_user_institution_id())
  )
);

create policy learning_lessons_select_policy on public.learning_lessons
for select using (
  exists (
    select 1
    from public.learning_modules lm
    join public.learning_tracks lt on lt.id = lm.learning_track_id
    where lm.id = learning_module_id
      and (lt.institution_id is null or lt.institution_id = public.current_user_institution_id())
  )
);

create policy lesson_steps_select_policy on public.lesson_steps
for select using (
  exists (
    select 1
    from public.learning_lessons ll
    join public.learning_modules lm on lm.id = ll.learning_module_id
    join public.learning_tracks lt on lt.id = lm.learning_track_id
    where ll.id = lesson_id
      and (lt.institution_id is null or lt.institution_id = public.current_user_institution_id())
  )
);

create policy trainee_lesson_progress_policy on public.trainee_lesson_progress
for all using (
  public.is_super_admin()
  or trainee_user_id = auth.uid()
  or (
    public.same_institution((select institution_id from public.user_profiles where id = trainee_user_id))
    and (public.is_preceptor() or public.is_coordinator() or public.is_institution_admin())
  )
)
with check (
  public.is_super_admin()
  or trainee_user_id = auth.uid()
  or (
    public.same_institution((select institution_id from public.user_profiles where id = trainee_user_id))
    and (public.is_preceptor() or public.is_coordinator() or public.is_institution_admin())
  )
);

create policy trainee_module_progress_policy on public.trainee_module_progress
for all using (
  public.is_super_admin()
  or trainee_user_id = auth.uid()
  or (
    public.same_institution((select institution_id from public.user_profiles where id = trainee_user_id))
    and (public.is_preceptor() or public.is_coordinator() or public.is_institution_admin())
  )
)
with check (
  public.is_super_admin()
  or trainee_user_id = auth.uid()
  or (
    public.same_institution((select institution_id from public.user_profiles where id = trainee_user_id))
    and (public.is_preceptor() or public.is_coordinator() or public.is_institution_admin())
  )
);

create policy question_bank_select_policy on public.question_bank
for select using (
  auth.uid() is not null and (institution_id is null or institution_id = public.current_user_institution_id())
);

create policy question_bank_manage_policy on public.question_bank
for all using (
  public.is_super_admin()
  or (
    (institution_id is null and public.is_super_admin())
    or (institution_id = public.current_user_institution_id() and (public.is_coordinator() or public.is_institution_admin()))
  )
)
with check (
  public.is_super_admin()
  or (
    (institution_id is null and public.is_super_admin())
    or (institution_id = public.current_user_institution_id() and (public.is_coordinator() or public.is_institution_admin()))
  )
);

create policy question_options_select_policy on public.question_options
for select using (
  exists (
    select 1 from public.question_bank qb
    where qb.id = question_id
      and (qb.institution_id is null or qb.institution_id = public.current_user_institution_id())
  )
);

create policy question_references_select_policy on public.question_references
for select using (
  exists (
    select 1 from public.question_bank qb
    where qb.id = question_id
      and (qb.institution_id is null or qb.institution_id = public.current_user_institution_id())
  )
);

create policy question_tag_links_select_policy on public.question_tag_links
for select using (
  exists (
    select 1 from public.question_bank qb
    where qb.id = question_id
      and (qb.institution_id is null or qb.institution_id = public.current_user_institution_id())
  )
);

create policy trainee_question_attempts_policy on public.trainee_question_attempts
for all using (
  public.is_super_admin()
  or trainee_user_id = auth.uid()
  or (
    public.same_institution((select institution_id from public.user_profiles where id = trainee_user_id))
    and (public.is_preceptor() or public.is_coordinator() or public.is_institution_admin())
  )
)
with check (
  public.is_super_admin()
  or trainee_user_id = auth.uid()
  or (
    public.same_institution((select institution_id from public.user_profiles where id = trainee_user_id))
    and (public.is_preceptor() or public.is_coordinator() or public.is_institution_admin())
  )
);

create policy trainee_error_notebook_policy on public.trainee_error_notebook
for all using (
  public.is_super_admin()
  or trainee_user_id = auth.uid()
  or (
    public.same_institution((select institution_id from public.user_profiles where id = trainee_user_id))
    and (public.is_preceptor() or public.is_coordinator() or public.is_institution_admin())
  )
)
with check (
  public.is_super_admin()
  or trainee_user_id = auth.uid()
);

create policy exams_policy on public.exams
for all using (
  public.is_super_admin()
  or institution_id = public.current_user_institution_id()
)
with check (
  public.is_super_admin()
  or institution_id = public.current_user_institution_id()
);

create policy exam_blueprints_select_policy on public.exam_blueprints
for select using (
  exists (
    select 1 from public.exams e
    where e.id = exam_id
      and e.institution_id = public.current_user_institution_id()
  ) or public.is_super_admin()
);

create policy exam_question_links_select_policy on public.exam_question_links
for select using (
  exists (
    select 1 from public.exams e
    where e.id = exam_id
      and e.institution_id = public.current_user_institution_id()
  ) or public.is_super_admin()
);

create policy exam_attempts_policy on public.exam_attempts
for all using (
  public.is_super_admin()
  or trainee_user_id = auth.uid()
  or exists (
    select 1 from public.exams e
    where e.id = exam_id and e.institution_id = public.current_user_institution_id()
  )
)
with check (
  public.is_super_admin()
  or trainee_user_id = auth.uid()
  or exists (
    select 1 from public.exams e
    where e.id = exam_id and e.institution_id = public.current_user_institution_id()
  )
);

create policy exam_answers_policy on public.exam_answers
for all using (
  exists (
    select 1
    from public.exam_attempts ea
    join public.exams e on e.id = ea.exam_id
    where ea.id = exam_attempt_id
      and (
        ea.trainee_user_id = auth.uid()
        or e.institution_id = public.current_user_institution_id()
        or public.is_super_admin()
      )
  )
)
with check (
  exists (
    select 1
    from public.exam_attempts ea
    join public.exams e on e.id = ea.exam_id
    where ea.id = exam_attempt_id
      and (
        ea.trainee_user_id = auth.uid()
        or e.institution_id = public.current_user_institution_id()
        or public.is_super_admin()
      )
  )
);

create policy exam_result_domains_policy on public.exam_result_domains
for all using (
  exists (
    select 1
    from public.exam_attempts ea
    join public.exams e on e.id = ea.exam_id
    where ea.id = exam_attempt_id
      and (
        ea.trainee_user_id = auth.uid()
        or e.institution_id = public.current_user_institution_id()
        or public.is_super_admin()
      )
  )
)
with check (
  exists (
    select 1
    from public.exam_attempts ea
    join public.exams e on e.id = ea.exam_id
    where ea.id = exam_attempt_id
      and (
        ea.trainee_user_id = auth.uid()
        or e.institution_id = public.current_user_institution_id()
        or public.is_super_admin()
      )
  )
);

create policy emergency_scenarios_select_policy on public.emergency_scenarios
for select using (
  auth.uid() is not null
  and (
    institution_id is null
    or institution_id = public.current_user_institution_id()
    or universal_access = true
  )
);

create policy emergency_scenarios_manage_policy on public.emergency_scenarios
for all using (
  public.is_super_admin()
  or (institution_id = public.current_user_institution_id() and (public.is_institution_admin() or public.is_coordinator()))
)
with check (
  public.is_super_admin()
  or (institution_id = public.current_user_institution_id() and (public.is_institution_admin() or public.is_coordinator()))
);

create policy emergency_scenario_steps_select_policy on public.emergency_scenario_steps
for select using (
  exists (
    select 1 from public.emergency_scenarios es
    where es.id = scenario_id
      and (
        es.institution_id is null
        or es.institution_id = public.current_user_institution_id()
        or es.universal_access = true
      )
  )
);

create policy emergency_attempts_policy on public.emergency_attempts
for all using (
  public.is_super_admin()
  or trainee_user_id = auth.uid()
  or public.same_institution((select institution_id from public.user_profiles where id = trainee_user_id))
)
with check (
  public.is_super_admin()
  or trainee_user_id = auth.uid()
  or public.same_institution((select institution_id from public.user_profiles where id = trainee_user_id))
);

create policy emergency_attempt_actions_policy on public.emergency_attempt_actions
for all using (
  exists (
    select 1 from public.emergency_attempts ea
    where ea.id = emergency_attempt_id
      and (
        ea.trainee_user_id = auth.uid()
        or public.same_institution((select institution_id from public.user_profiles where id = ea.trainee_user_id))
        or public.is_super_admin()
      )
  )
)
with check (
  exists (
    select 1 from public.emergency_attempts ea
    where ea.id = emergency_attempt_id
      and (
        ea.trainee_user_id = auth.uid()
        or public.same_institution((select institution_id from public.user_profiles where id = ea.trainee_user_id))
        or public.is_super_admin()
      )
  )
);

create policy emergency_self_assessments_policy on public.emergency_self_assessments
for all using (
  public.is_super_admin()
  or trainee_user_id = auth.uid()
  or public.same_institution((select institution_id from public.user_profiles where id = trainee_user_id))
)
with check (
  public.is_super_admin()
  or trainee_user_id = auth.uid()
);

create policy procedure_logs_policy on public.procedure_logs
for all using (
  public.is_super_admin()
  or trainee_user_id = auth.uid()
  or institution_id = public.current_user_institution_id()
)
with check (
  public.is_super_admin()
  or trainee_user_id = auth.uid()
  or institution_id = public.current_user_institution_id()
);

create policy procedure_log_items_policy on public.procedure_log_items
for all using (
  exists (
    select 1 from public.procedure_logs pl
    where pl.id = procedure_log_id
      and (
        pl.trainee_user_id = auth.uid()
        or pl.institution_id = public.current_user_institution_id()
        or public.is_super_admin()
      )
  )
)
with check (
  exists (
    select 1 from public.procedure_logs pl
    where pl.id = procedure_log_id
      and (
        pl.trainee_user_id = auth.uid()
        or pl.institution_id = public.current_user_institution_id()
        or public.is_super_admin()
      )
  )
);

create policy procedure_validations_policy on public.procedure_validations
for all using (
  exists (
    select 1 from public.procedure_logs pl
    where pl.id = procedure_log_id
      and (
        pl.preceptor_user_id = auth.uid()
        or pl.institution_id = public.current_user_institution_id()
        or public.is_super_admin()
      )
  )
)
with check (
  exists (
    select 1 from public.procedure_logs pl
    where pl.id = procedure_log_id
      and (
        pl.preceptor_user_id = auth.uid()
        or pl.institution_id = public.current_user_institution_id()
        or public.is_super_admin()
      )
  )
);

create policy procedure_self_assessments_policy on public.procedure_self_assessments
for all using (
  exists (
    select 1 from public.procedure_logs pl
    where pl.id = procedure_log_id
      and (
        pl.trainee_user_id = auth.uid()
        or pl.institution_id = public.current_user_institution_id()
        or public.is_super_admin()
      )
  )
)
with check (
  exists (
    select 1 from public.procedure_logs pl
    where pl.id = procedure_log_id
      and pl.trainee_user_id = auth.uid()
  ) or public.is_super_admin());

create policy self_assessment_responses_policy on public.self_assessment_responses
for all using (
  public.is_super_admin()
  or trainee_user_id = auth.uid()
  or public.same_institution((select institution_id from public.user_profiles where id = trainee_user_id))
)
with check (
  public.is_super_admin()
  or trainee_user_id = auth.uid()
);

create policy self_assessment_response_items_policy on public.self_assessment_response_items
for all using (
  exists (
    select 1 from public.self_assessment_responses sar
    where sar.id = self_assessment_response_id
      and (
        sar.trainee_user_id = auth.uid()
        or public.same_institution((select institution_id from public.user_profiles where id = sar.trainee_user_id))
        or public.is_super_admin()
      )
  )
)
with check (
  exists (
    select 1 from public.self_assessment_responses sar
    where sar.id = self_assessment_response_id
      and (
        sar.trainee_user_id = auth.uid()
        or public.is_super_admin()
      )
  )
);

create policy preanesthetic_topics_select_policy on public.preanesthetic_topics
for select using (auth.uid() is not null);

create policy preanesthetic_topics_manage_policy on public.preanesthetic_topics
for all using (public.is_super_admin() or public.is_coordinator() or public.is_institution_admin())
with check (public.is_super_admin() or public.is_coordinator() or public.is_institution_admin());

create policy preanesthetic_topic_links_select_policy on public.preanesthetic_topic_links
for select using (auth.uid() is not null);

create policy surgery_anesthesia_guides_select_policy on public.surgery_anesthesia_guides
for select using (auth.uid() is not null);

create policy surgery_anesthesia_guides_manage_policy on public.surgery_anesthesia_guides
for all using (public.is_super_admin() or public.is_coordinator() or public.is_institution_admin())
with check (public.is_super_admin() or public.is_coordinator() or public.is_institution_admin());

create policy surgery_guide_variants_select_policy on public.surgery_guide_variants
for select using (auth.uid() is not null);

create policy content_items_policy on public.content_items
for all using (
  public.is_super_admin()
  or institution_id is null
  or institution_id = public.current_user_institution_id()
)
with check (
  public.is_super_admin()
  or institution_id = public.current_user_institution_id()
  or institution_id is null
);

create policy content_versions_policy on public.content_versions
for all using (
  exists (
    select 1 from public.content_items ci
    where ci.id = content_item_id
      and (
        ci.institution_id is null
        or ci.institution_id = public.current_user_institution_id()
        or public.is_super_admin()
      )
  )
)
with check (
  exists (
    select 1 from public.content_items ci
    where ci.id = content_item_id
      and (
        ci.institution_id = public.current_user_institution_id()
        or ci.institution_id is null
        or public.is_super_admin()
      )
  )
);

create policy content_references_policy on public.content_references
for all using (
  exists (
    select 1
    from public.content_versions cv
    join public.content_items ci on ci.id = cv.content_item_id
    where cv.id = content_version_id
      and (
        ci.institution_id is null
        or ci.institution_id = public.current_user_institution_id()
        or public.is_super_admin()
      )
  )
)
with check (
  exists (
    select 1
    from public.content_versions cv
    join public.content_items ci on ci.id = cv.content_item_id
    where cv.id = content_version_id
      and (
        ci.institution_id is null
        or ci.institution_id = public.current_user_institution_id()
        or public.is_super_admin()
      )
  )
);

create policy editorial_reviews_policy on public.editorial_reviews
for all using (
  public.is_super_admin() or public.is_coordinator() or public.is_institution_admin()
)
with check (
  public.is_super_admin() or public.is_coordinator() or public.is_institution_admin()
);

create policy ai_generation_jobs_policy on public.ai_generation_jobs
for all using (
  public.is_super_admin()
  or institution_id = public.current_user_institution_id()
  or requested_by = auth.uid()
)
with check (
  public.is_super_admin()
  or institution_id = public.current_user_institution_id()
  or requested_by = auth.uid()
);

create policy ai_job_source_links_policy on public.ai_job_source_links
for all using (
  exists (
    select 1 from public.ai_generation_jobs agj
    where agj.id = ai_generation_job_id
      and (
        agj.institution_id = public.current_user_institution_id()
        or agj.requested_by = auth.uid()
        or public.is_super_admin()
      )
  )
)
with check (
  exists (
    select 1 from public.ai_generation_jobs agj
    where agj.id = ai_generation_job_id
      and (
        agj.institution_id = public.current_user_institution_id()
        or agj.requested_by = auth.uid()
        or public.is_super_admin()
      )
  )
);

create policy ai_validation_checks_policy on public.ai_validation_checks
for all using (
  exists (
    select 1 from public.ai_generation_jobs agj
    where agj.id = ai_generation_job_id
      and (
        agj.institution_id = public.current_user_institution_id()
        or agj.requested_by = auth.uid()
        or public.is_super_admin()
      )
  )
)
with check (
  exists (
    select 1 from public.ai_generation_jobs agj
    where agj.id = ai_generation_job_id
      and (
        agj.institution_id = public.current_user_institution_id()
        or agj.requested_by = auth.uid()
        or public.is_super_admin()
      )
  )
);

create policy competency_frameworks_policy on public.competency_frameworks
for all using (
  institution_id is null
  or institution_id = public.current_user_institution_id()
  or public.is_super_admin()
)
with check (
  institution_id is null
  or institution_id = public.current_user_institution_id()
  or public.is_super_admin()
);

create policy competency_items_policy on public.competency_items
for all using (
  exists (
    select 1 from public.competency_frameworks cf
    where cf.id = competency_framework_id
      and (
        cf.institution_id is null
        or cf.institution_id = public.current_user_institution_id()
        or public.is_super_admin()
      )
  )
)
with check (
  exists (
    select 1 from public.competency_frameworks cf
    where cf.id = competency_framework_id
      and (
        cf.institution_id is null
        or cf.institution_id = public.current_user_institution_id()
        or public.is_super_admin()
      )
  )
);

create policy competency_assessments_policy on public.competency_assessments
for all using (
  public.is_super_admin()
  or trainee_user_id = auth.uid()
  or assessor_user_id = auth.uid()
  or public.same_institution((select institution_id from public.user_profiles where id = trainee_user_id))
)
with check (
  public.is_super_admin()
  or assessor_user_id = auth.uid()
  or public.same_institution((select institution_id from public.user_profiles where id = trainee_user_id))
);

create policy trainee_development_plans_policy on public.trainee_development_plans
for all using (
  public.is_super_admin()
  or trainee_user_id = auth.uid()
  or public.same_institution((select institution_id from public.user_profiles where id = trainee_user_id))
)
with check (
  public.is_super_admin()
  or public.same_institution((select institution_id from public.user_profiles where id = trainee_user_id))
);

create policy notifications_policy on public.notifications
for all using (
  user_id = auth.uid() or public.is_super_admin()
)
with check (
  user_id = auth.uid() or public.is_super_admin()
);

create policy audit_logs_select_policy on public.audit_logs
for select using (
  public.is_super_admin()
  or institution_id = public.current_user_institution_id()
);

create policy audit_logs_insert_policy on public.audit_logs
for insert with check (
  public.is_super_admin()
  or institution_id = public.current_user_institution_id()
  or institution_id is null
);

-- =========================================================
-- SEED MÍNIMO DE ROLES E CURRÍCULO
-- =========================================================
insert into public.roles (code, name, description)
values
  ('super_admin', 'Super Admin', 'Administrador global da plataforma'),
  ('institution_admin', 'Administrador Institucional', 'Administrador do tenant/instituição'),
  ('coordinator', 'Coordenador', 'Coordenação do CET'),
  ('preceptor', 'Preceptor', 'Preceptor avaliador'),
  ('trainee', 'Trainee', 'Estagiário ME1/ME2/ME3')
on conflict (code) do nothing;

insert into public.curriculum_years (code, name, display_order)
values
  ('ME1', 'Primeiro Ano de Especialização', 1),
  ('ME2', 'Segundo Ano de Especialização', 2),
  ('ME3', 'Terceiro Ano de Especialização', 3)
on conflict (code) do nothing;

-- ME1
insert into public.curriculum_topics (curriculum_year_id, point_number, title, description, display_order, source_label)
select cy.id, v.point_number, v.title, v.description, v.display_order, 'SBA'
from public.curriculum_years cy
join (
  values
    (1, 'Ética Médica e Bioética. Responsabilidade Profissional do Anestesiologista', 'Conteúdo mínimo obrigatório do ME1', 1),
    (2, 'Organização da SBA, Cooperativismo e SUS', 'Conteúdo mínimo obrigatório do ME1', 2),
    (3, 'Risco Profissional do Anestesiologista', 'Conteúdo mínimo obrigatório do ME1', 3),
    (4, 'Avaliação e Preparo Pré-Anestésico', 'Conteúdo mínimo obrigatório do ME1', 4),
    (5, 'Vias Aéreas', 'Conteúdo mínimo obrigatório do ME1', 5),
    (6, 'Posicionamento', 'Conteúdo mínimo obrigatório do ME1', 6),
    (7, 'Equipamentos', 'Conteúdo mínimo obrigatório do ME1', 7),
    (8, 'Sistema Nervoso Central e Autônomo', 'Conteúdo mínimo obrigatório do ME1', 8),
    (9, 'Fisiologia e Farmacologia do Sistema Cardiocirculatório', 'Conteúdo mínimo obrigatório do ME1', 9),
    (10, 'Fisiologia e Farmacologia do Sistema Respiratório', 'Conteúdo mínimo obrigatório do ME1', 10),
    (11, 'Farmacologia Geral', 'Conteúdo mínimo obrigatório do ME1', 11),
    (12, 'Farmacologia dos Anestésicos Venosos', 'Conteúdo mínimo obrigatório do ME1', 12),
    (13, 'Farmacologia dos Anestésicos Inalatórios', 'Conteúdo mínimo obrigatório do ME1', 13),
    (14, 'Farmacologia dos Anestésicos Locais', 'Conteúdo mínimo obrigatório do ME1', 14),
    (15, 'Transmissão e Bloqueio Neuromuscular', 'Conteúdo mínimo obrigatório do ME1', 15),
    (16, 'Parada Cardíaca e Reanimação', 'Conteúdo mínimo obrigatório do ME1', 16),
    (17, 'Bloqueios Subaracnóideo e Peridural', 'Conteúdo mínimo obrigatório do ME1', 17),
    (18, 'Complicações da Anestesia', 'Conteúdo mínimo obrigatório do ME1', 18),
    (19, 'Recuperação Pós-anestésica', 'Conteúdo mínimo obrigatório do ME1', 19)
) as v(point_number, title, description, display_order)
on cy.code = 'ME1'
on conflict (curriculum_year_id, point_number) do nothing;

-- ME2
insert into public.curriculum_topics (curriculum_year_id, point_number, title, description, display_order, source_label)
select cy.id, v.point_number, v.title, v.description, v.display_order, 'SBA'
from public.curriculum_years cy
join (
  values
    (20, 'Metodologia Científica', 'Conteúdo mínimo obrigatório do ME2', 20),
    (21, 'Monitorização', 'Conteúdo mínimo obrigatório do ME2', 21),
    (22, 'Sistemas de Administração de Anestesia Inalatória', 'Conteúdo mínimo obrigatório do ME2', 22),
    (23, 'Anestesia Inalatória', 'Conteúdo mínimo obrigatório do ME2', 23),
    (24, 'Anestesia Venosa', 'Conteúdo mínimo obrigatório do ME2', 24),
    (25, 'Bloqueios Periféricos', 'Conteúdo mínimo obrigatório do ME2', 25),
    (26, 'Equilíbrio Hidroeletrolítico e Acidobásico', 'Conteúdo mínimo obrigatório do ME2', 26),
    (27, 'Reposição Volêmica e Transfusão', 'Conteúdo mínimo obrigatório do ME2', 27),
    (28, 'Hemostasia e Anticoagulação', 'Conteúdo mínimo obrigatório do ME2', 28),
    (29, 'Fisiologia e Farmacologia do Sistema Urinário', 'Conteúdo mínimo obrigatório do ME2', 29),
    (30, 'Anestesia em Urologia', 'Conteúdo mínimo obrigatório do ME2', 30),
    (31, 'Anestesia em Obstetrícia', 'Conteúdo mínimo obrigatório do ME2', 31),
    (32, 'Anestesia em Ortopedia', 'Conteúdo mínimo obrigatório do ME2', 32),
    (33, 'Anestesia para Cirurgia Abdominal', 'Conteúdo mínimo obrigatório do ME2', 33),
    (34, 'Anestesia para Otorrinolaringologia', 'Conteúdo mínimo obrigatório do ME2', 34),
    (35, 'Anestesia para Oftalmologia', 'Conteúdo mínimo obrigatório do ME2', 35),
    (36, 'Anestesia Ambulatorial', 'Conteúdo mínimo obrigatório do ME2', 36)
) as v(point_number, title, description, display_order)
on cy.code = 'ME2'
on conflict (curriculum_year_id, point_number) do nothing;

-- ME3
insert into public.curriculum_topics (curriculum_year_id, point_number, title, description, display_order, source_label)
select cy.id, v.point_number, v.title, v.description, v.display_order, 'SBA'
from public.curriculum_years cy
join (
  values
    (37, 'Anestesia e Sistema Endócrino', 'Conteúdo mínimo obrigatório do ME3', 37),
    (38, 'Anestesia em Urgências e no Trauma', 'Conteúdo mínimo obrigatório do ME3', 38),
    (39, 'Anestesia para Cirurgia Plástica', 'Conteúdo mínimo obrigatório do ME3', 39),
    (40, 'Anestesia Bucomaxilofacial e para Odontologia', 'Conteúdo mínimo obrigatório do ME3', 40),
    (41, 'Anestesia para Cirurgia Torácica', 'Conteúdo mínimo obrigatório do ME3', 41),
    (42, 'Anestesia e Sistema Cardiovascular', 'Conteúdo mínimo obrigatório do ME3', 42),
    (43, 'Anestesia para Neurocirurgia', 'Conteúdo mínimo obrigatório do ME3', 43),
    (44, 'Hipotermia e Hipotensão Arterial Induzida', 'Conteúdo mínimo obrigatório do ME3', 44),
    (45, 'Choque', 'Conteúdo mínimo obrigatório do ME3', 45),
    (46, 'Anestesia em Geriatria', 'Conteúdo mínimo obrigatório do ME3', 46),
    (47, 'Anestesia em Pediatria', 'Conteúdo mínimo obrigatório do ME3', 47),
    (48, 'Anestesia para Transplantes', 'Conteúdo mínimo obrigatório do ME3', 48),
    (49, 'Anestesia para Procedimentos Fora do Centro Cirúrgico', 'Conteúdo mínimo obrigatório do ME3', 49),
    (50, 'Dor Aguda e Inflamação', 'Conteúdo mínimo obrigatório do ME3', 50),
    (51, 'Dor Crônica', 'Conteúdo mínimo obrigatório do ME3', 51),
    (52, 'Suporte Ventilatório', 'Conteúdo mínimo obrigatório do ME3', 52),
    (53, 'Qualidade e Segurança em Anestesia', 'Conteúdo mínimo obrigatório do ME3', 53),
    (54, 'Gerenciamento do Centro Cirúrgico', 'Conteúdo mínimo obrigatório do ME3', 54)
) as v(point_number, title, description, display_order)
on cy.code = 'ME3'
on conflict (curriculum_year_id, point_number) do nothing;

-- =========================================================
-- OBSERVAÇÕES
-- =========================================================
-- 1. Esta migration cria o schema base e um seed resumido dos tópicos SBA.
-- 2. Os subitens completos do currículo podem entrar em uma migration/seed separada.
-- 3. Para produção, recomenda-se separar em múltiplos arquivos:
--    001_extensions.sql
--    002_enums.sql
--    003_core_tables.sql
--    004_learning_and_exams.sql
--    005_clinical_content.sql
--    006_ai_governance.sql
--    007_rls.sql
--    008_seed_roles.sql
--    009_seed_curriculum.sql
-- 4. Para buscas vetoriais reais, ajustar a dimensão do campo vector conforme o modelo de embeddings usado.
