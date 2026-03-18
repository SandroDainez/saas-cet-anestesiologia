do $$
begin
  if not exists (select 1 from pg_type where typname = 'exam_refresh_cadence_enum') then
    create type public.exam_refresh_cadence_enum as enum ('weekly', 'monthly', 'on_completion', 'manual');
  end if;

  if not exists (select 1 from pg_type where typname = 'exam_refresh_scope_enum') then
    create type public.exam_refresh_scope_enum as enum ('global', 'per_user');
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typname = 'content_refresh_reason_enum'
      and e.enumlabel = 'training_exam_completed'
  ) then
    alter type public.content_refresh_reason_enum add value 'training_exam_completed';
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typname = 'content_refresh_reason_enum'
      and e.enumlabel = 'quarterly_exam_scheduled'
  ) then
    alter type public.content_refresh_reason_enum add value 'quarterly_exam_scheduled';
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typname = 'content_refresh_reason_enum'
      and e.enumlabel = 'annual_exam_scheduled'
  ) then
    alter type public.content_refresh_reason_enum add value 'annual_exam_scheduled';
  end if;
end $$;

alter table public.exams
  add column if not exists refresh_cadence public.exam_refresh_cadence_enum,
  add column if not exists refresh_scope public.exam_refresh_scope_enum,
  add column if not exists refresh_interval_days integer,
  add column if not exists refresh_on_completion boolean not null default false,
  add column if not exists last_refreshed_at timestamptz,
  add column if not exists next_refresh_at timestamptz;

update public.exams
set
  refresh_cadence = 'weekly',
  refresh_scope = 'global',
  refresh_interval_days = 7,
  refresh_on_completion = false,
  last_refreshed_at = coalesce(last_refreshed_at, now()),
  next_refresh_at = coalesce(next_refresh_at, now() + interval '7 days')
where exam_type = 'quarterly';

update public.exams
set
  refresh_cadence = 'monthly',
  refresh_scope = 'global',
  refresh_interval_days = 30,
  refresh_on_completion = false,
  last_refreshed_at = coalesce(last_refreshed_at, now()),
  next_refresh_at = coalesce(next_refresh_at, now() + interval '30 days')
where exam_type = 'annual';

update public.exams
set
  refresh_cadence = 'on_completion',
  refresh_scope = 'per_user',
  refresh_interval_days = null,
  refresh_on_completion = true,
  last_refreshed_at = coalesce(last_refreshed_at, now()),
  next_refresh_at = null
where exam_type = 'training_short';
