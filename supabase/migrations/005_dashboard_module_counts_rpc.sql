create or replace function public.get_dashboard_module_counts(_institution_id uuid default null)
returns table (
  curriculum_topics bigint,
  learning_tracks bigint,
  question_bank_entries bigint,
  exams bigint,
  procedure_logs bigint,
  emergency_scenarios bigint
)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  target_institution_id uuid;
begin
  target_institution_id := coalesce(_institution_id, public.current_user_institution_id());

  if target_institution_id is null and not public.is_super_admin() then
    raise exception 'Institution context is required';
  end if;

  if target_institution_id is not null
     and not public.is_super_admin()
     and target_institution_id <> public.current_user_institution_id() then
    raise exception 'Institution access denied';
  end if;

  return query
  select
    (select count(*)::bigint from public.curriculum_topics) as curriculum_topics,
    (
      select count(*)::bigint
      from public.learning_tracks lt
      where target_institution_id is null or lt.institution_id = target_institution_id
    ) as learning_tracks,
    (
      select count(*)::bigint
      from public.question_bank qb
      where target_institution_id is null or qb.institution_id = target_institution_id
    ) as question_bank_entries,
    (
      select count(*)::bigint
      from public.exams e
      where target_institution_id is null or e.institution_id = target_institution_id
    ) as exams,
    (
      select count(*)::bigint
      from public.procedure_logs pl
      where target_institution_id is null or pl.institution_id = target_institution_id
    ) as procedure_logs,
    (
      select count(*)::bigint
      from public.emergency_scenarios es
      where target_institution_id is null
         or es.institution_id = target_institution_id
         or es.universal_access = true
    ) as emergency_scenarios;
end;
$$;
