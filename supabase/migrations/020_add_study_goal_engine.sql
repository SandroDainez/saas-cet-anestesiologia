do $$
begin
  if not exists (select 1 from pg_type where typname = 'study_goal_status_enum') then
    create type public.study_goal_status_enum as enum ('active', 'completed', 'expired');
  end if;

  if not exists (select 1 from pg_type where typname = 'study_goal_item_type_enum') then
    create type public.study_goal_item_type_enum as enum ('lesson', 'question_set', 'emergency');
  end if;

  if not exists (select 1 from pg_type where typname = 'content_refresh_reason_enum') then
    create type public.content_refresh_reason_enum as enum ('scheduled_daily', 'goal_completed', 'manual_admin');
  end if;

  if not exists (select 1 from pg_type where typname = 'content_refresh_status_enum') then
    create type public.content_refresh_status_enum as enum ('queued', 'running', 'completed', 'failed');
  end if;
end $$;

create table if not exists public.study_goals (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  trainee_user_id uuid not null references auth.users(id) on delete cascade,
  goal_date date not null default current_date,
  refresh_sequence integer not null default 1,
  target_minutes integer not null default 12,
  status public.study_goal_status_enum not null default 'active',
  source_reason public.content_refresh_reason_enum not null default 'scheduled_daily',
  generated_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create unique index if not exists study_goals_unique_daily_sequence_idx
  on public.study_goals (trainee_user_id, goal_date, refresh_sequence);

create unique index if not exists study_goals_single_active_idx
  on public.study_goals (trainee_user_id)
  where status = 'active';

create table if not exists public.study_goal_items (
  id uuid primary key default gen_random_uuid(),
  study_goal_id uuid not null references public.study_goals(id) on delete cascade,
  item_type public.study_goal_item_type_enum not null,
  display_order integer not null default 1,
  estimated_minutes integer not null default 5,
  title text not null,
  lesson_id uuid references public.learning_lessons(id) on delete set null,
  emergency_scenario_id uuid references public.emergency_scenarios(id) on delete set null,
  question_ids uuid[] not null default '{}'::uuid[],
  metadata_jsonb jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists study_goal_items_goal_idx
  on public.study_goal_items (study_goal_id, display_order);

create table if not exists public.user_content_refresh_jobs (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  trainee_user_id uuid not null references auth.users(id) on delete cascade,
  study_goal_id uuid references public.study_goals(id) on delete set null,
  trigger_reason public.content_refresh_reason_enum not null,
  status public.content_refresh_status_enum not null default 'queued',
  payload_jsonb jsonb not null default '{}'::jsonb,
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  error_message text
);

create index if not exists user_content_refresh_jobs_user_idx
  on public.user_content_refresh_jobs (trainee_user_id, requested_at desc);

create trigger set_updated_at_study_goals
before update on public.study_goals
for each row execute function public.set_updated_at();

alter table public.study_goals enable row level security;
alter table public.study_goal_items enable row level security;
alter table public.user_content_refresh_jobs enable row level security;

drop policy if exists study_goals_policy on public.study_goals;
create policy study_goals_policy on public.study_goals
for all using (
  public.is_super_admin()
  or trainee_user_id = auth.uid()
  or (
    public.same_institution(institution_id)
    and (public.is_preceptor() or public.is_coordinator() or public.is_institution_admin())
  )
)
with check (
  public.is_super_admin()
  or trainee_user_id = auth.uid()
  or (
    public.same_institution(institution_id)
    and (public.is_preceptor() or public.is_coordinator() or public.is_institution_admin())
  )
);

drop policy if exists study_goal_items_policy on public.study_goal_items;
create policy study_goal_items_policy on public.study_goal_items
for all using (
  exists (
    select 1
    from public.study_goals sg
    where sg.id = study_goal_id
      and (
        public.is_super_admin()
        or sg.trainee_user_id = auth.uid()
        or (
          public.same_institution(sg.institution_id)
          and (public.is_preceptor() or public.is_coordinator() or public.is_institution_admin())
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.study_goals sg
    where sg.id = study_goal_id
      and (
        public.is_super_admin()
        or sg.trainee_user_id = auth.uid()
        or (
          public.same_institution(sg.institution_id)
          and (public.is_preceptor() or public.is_coordinator() or public.is_institution_admin())
        )
      )
  )
);

drop policy if exists user_content_refresh_jobs_policy on public.user_content_refresh_jobs;
create policy user_content_refresh_jobs_policy on public.user_content_refresh_jobs
for all using (
  public.is_super_admin()
  or trainee_user_id = auth.uid()
  or (
    public.same_institution(institution_id)
    and (public.is_preceptor() or public.is_coordinator() or public.is_institution_admin())
  )
)
with check (
  public.is_super_admin()
  or trainee_user_id = auth.uid()
  or (
    public.same_institution(institution_id)
    and (public.is_preceptor() or public.is_coordinator() or public.is_institution_admin())
  )
);
