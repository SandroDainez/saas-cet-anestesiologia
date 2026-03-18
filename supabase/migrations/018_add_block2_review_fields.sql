do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'procedure_performance_level'
  ) then
    create type public.procedure_performance_level as enum (
      'needs_direct_supervision',
      'performed_with_significant_help',
      'performed_with_minor_corrections',
      'performed_safely'
    );
  end if;
end $$;

alter table public.procedure_validations
  add column if not exists performance_level public.procedure_performance_level;

alter table public.emergency_self_assessments
  add column if not exists emergency_attempt_id uuid references public.emergency_attempts(id) on delete cascade,
  add column if not exists reflection_text text;

create unique index if not exists emergency_self_assessments_attempt_uidx
  on public.emergency_self_assessments (emergency_attempt_id)
  where emergency_attempt_id is not null;
