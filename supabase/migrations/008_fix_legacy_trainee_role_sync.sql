create or replace function public.normalize_auth_role(role_code text, training_year_text text)
returns text
language plpgsql
stable
as $$
begin
  if role_code in ('super_admin', 'institution_admin', 'coordinator', 'preceptor', 'trainee_me1', 'trainee_me2', 'trainee_me3') then
    return role_code;
  end if;

  if role_code = 'trainee' then
    if training_year_text = 'ME3' then
      return 'trainee_me3';
    end if;

    if training_year_text = 'ME2' then
      return 'trainee_me2';
    end if;

    return 'trainee_me1';
  end if;

  return role_code;
end;
$$;

create or replace function public.sync_auth_user_row(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  auth_row auth.users%rowtype;
  metadata jsonb;
  role_code text;
  institution_id_text text;
  institution_id_value uuid;
  full_name_value text;
  existing_full_name text;
  training_year_text text;
  training_year_value public.trainee_year_code;
  role_id_value uuid;
begin
  select *
  into auth_row
  from auth.users
  where id = target_user_id;

  if not found then
    return;
  end if;

  metadata := coalesce(auth_row.raw_user_meta_data, '{}'::jsonb);
  training_year_text := metadata ->> 'training_year';
  role_code := public.normalize_auth_role(metadata ->> 'role', training_year_text);
  institution_id_text := metadata ->> 'institution_id';
  institution_id_value := public.try_parse_uuid(institution_id_text);

  select up.full_name, up.institution_id
  into existing_full_name, institution_id_value
  from public.user_profiles up
  where up.id = auth_row.id
    and institution_id_value is null;

  if institution_id_value is null then
    select coalesce(
      (select tp.institution_id from public.trainee_profiles tp where tp.user_id = auth_row.id limit 1),
      (select pp.institution_id from public.preceptor_profiles pp where pp.user_id = auth_row.id limit 1),
      (select ur.institution_id from public.user_roles ur where ur.user_id = auth_row.id and ur.institution_id is not null limit 1)
    )
    into institution_id_value;
  end if;

  full_name_value := coalesce(
    nullif(metadata ->> 'full_name', ''),
    nullif(existing_full_name, ''),
    split_part(coalesce(auth_row.email, 'Usuario'), '@', 1)
  );

  if training_year_text in ('ME1', 'ME2', 'ME3') then
    training_year_value := training_year_text::public.trainee_year_code;
  else
    training_year_value := public.infer_training_year_from_role(role_code);
  end if;

  insert into public.user_profiles (id, institution_id, full_name, email)
  values (auth_row.id, institution_id_value, full_name_value, coalesce(auth_row.email, ''))
  on conflict (id) do update
  set institution_id = coalesce(excluded.institution_id, public.user_profiles.institution_id),
      full_name = excluded.full_name,
      email = excluded.email,
      updated_at = now();

  if role_code is not null then
    select id
    into role_id_value
    from public.roles
    where code = role_code
    limit 1;

    if role_id_value is not null then
      delete from public.user_roles
      where user_id = auth_row.id
        and role_id in (
          select id
          from public.roles
          where code in (
            'super_admin',
            'institution_admin',
            'coordinator',
            'preceptor',
            'trainee',
            'trainee_me1',
            'trainee_me2',
            'trainee_me3'
          )
        );

      insert into public.user_roles (user_id, role_id, institution_id)
      values (auth_row.id, role_id_value, institution_id_value)
      on conflict (user_id, role_id, institution_id) do nothing;
    end if;
  end if;

  if role_code in ('trainee_me1', 'trainee_me2', 'trainee_me3') and institution_id_value is not null and training_year_value is not null then
    insert into public.trainee_profiles (user_id, institution_id, trainee_year, enrollment_date, current_status)
    values (auth_row.id, institution_id_value, training_year_value, coalesce(auth_row.created_at::date, now()::date), 'active')
    on conflict (user_id) do update
    set institution_id = excluded.institution_id,
        trainee_year = excluded.trainee_year,
        current_status = 'active',
        updated_at = now();
  end if;

  if role_code = 'preceptor' and institution_id_value is not null then
    insert into public.preceptor_profiles (user_id, institution_id, specialty_focus)
    values (auth_row.id, institution_id_value, null)
    on conflict (user_id) do update
    set institution_id = excluded.institution_id,
        updated_at = now();
  end if;
end;
$$;

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

do $$
declare
  auth_user record;
begin
  for auth_user in
    select id from auth.users
  loop
    perform public.sync_auth_user_row(auth_user.id);
  end loop;
end;
$$;
