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
    select r.code
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = _user_id
    order by case r.code
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
    select tp.trainee_year
    from public.trainee_profiles tp
    where tp.user_id = _user_id
    limit 1
  )
  select
    cp.id,
    cp.full_name,
    cp.email,
    cr.code as role_code,
    cp.institution_id,
    inst.name as institution_name,
    ct.trainee_year
  from profile_cte cp
  cross join role_cte cr
  left join public.institutions inst on inst.id = cp.institution_id
  left join trainee_cte ct on true;
end;
$$;
