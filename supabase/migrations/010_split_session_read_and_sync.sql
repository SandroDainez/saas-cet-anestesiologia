create or replace function public.get_session_profile(_user_id uuid default auth.uid())
returns table (
  id uuid,
  full_name text,
  email text,
  role_code text,
  institution_id uuid,
  institution_name text,
  training_year public.trainee_year_code
)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
begin
  if _user_id is null then
    return;
  end if;

  return query
  with profile_cte as (
    select
      up.id,
      up.full_name,
      up.email,
      up.institution_id
    from public.user_profiles up
    where up.id = _user_id
    limit 1
  ),
  role_cte as (
    select
      public.normalize_auth_role(r.code, coalesce(tp.trainee_year::text, '')) as code,
      ur.institution_id
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    left join public.trainee_profiles tp on tp.user_id = ur.user_id
    where ur.user_id = _user_id
    order by case public.normalize_auth_role(r.code, coalesce(tp.trainee_year::text, ''))
      when 'super_admin' then 1
      when 'institution_admin' then 2
      when 'coordinator' then 3
      when 'preceptor' then 4
      when 'trainee_me3' then 5
      when 'trainee_me2' then 6
      when 'trainee_me1' then 7
      else 99
    end
    limit 1
  ),
  trainee_cte as (
    select tp.trainee_year, tp.institution_id
    from public.trainee_profiles tp
    where tp.user_id = _user_id
    limit 1
  ),
  preceptor_cte as (
    select pp.institution_id
    from public.preceptor_profiles pp
    where pp.user_id = _user_id
    limit 1
  ),
  resolved_cte as (
    select
      coalesce(pc.id, _user_id) as id,
      pc.full_name,
      pc.email,
      rc.code as role_code,
      coalesce(pc.institution_id, tc.institution_id, prc.institution_id, rc.institution_id) as institution_id,
      tc.trainee_year
    from profile_cte pc
    full outer join role_cte rc on true
    full outer join trainee_cte tc on true
    full outer join preceptor_cte prc on true
  )
  select
    resolved.id,
    resolved.full_name,
    resolved.email,
    resolved.role_code,
    resolved.institution_id,
    inst.name as institution_name,
    resolved.trainee_year
  from resolved_cte resolved
  left join public.institutions inst on inst.id = resolved.institution_id;
end;
$$;

create or replace function public.ensure_session_profile(_user_id uuid default auth.uid())
returns void
language plpgsql
volatile
security definer
set search_path = public, auth
as $$
begin
  if _user_id is null then
    return;
  end if;

  perform public.sync_auth_user_row(_user_id);
end;
$$;
