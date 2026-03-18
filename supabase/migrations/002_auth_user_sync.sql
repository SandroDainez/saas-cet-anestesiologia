-- Keep Auth metadata and relational authorization tables aligned.
-- This avoids sessions falling back to placeholder roles/institutions in the app
-- while RLS depends on user_profiles/user_roles.

create or replace function public.try_parse_uuid(value text)
returns uuid
language plpgsql
stable
as $$
begin
  if value is null or btrim(value) = '' then
    return null;
  end if;

  if value ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    return value::uuid;
  end if;

  return null;
end;
$$;

create or replace function public.infer_training_year_from_role(role_code text)
returns public.trainee_year_code
language plpgsql
stable
as $$
begin
  if role_code = 'trainee_me1' then
    return 'ME1';
  end if;

  if role_code = 'trainee_me2' then
    return 'ME2';
  end if;

  if role_code = 'trainee_me3' then
    return 'ME3';
  end if;

  return null;
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
  role_code := metadata ->> 'role';
  institution_id_text := metadata ->> 'institution_id';
  institution_id_value := public.try_parse_uuid(institution_id_text);
  full_name_value := coalesce(nullif(metadata ->> 'full_name', ''), split_part(coalesce(auth_row.email, 'Usuario'), '@', 1));
  training_year_text := metadata ->> 'training_year';

  if training_year_text in ('ME1', 'ME2', 'ME3') then
    training_year_value := training_year_text::public.trainee_year_code;
  else
    training_year_value := public.infer_training_year_from_role(role_code);
  end if;

  insert into public.user_profiles (id, institution_id, full_name, email)
  values (auth_row.id, institution_id_value, full_name_value, coalesce(auth_row.email, ''))
  on conflict (id) do update
  set institution_id = excluded.institution_id,
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
          where code in ('super_admin', 'institution_admin', 'coordinator', 'preceptor', 'trainee_me1', 'trainee_me2', 'trainee_me3')
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

create or replace function public.sync_auth_user_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  perform public.sync_auth_user_row(new.id);
  return new;
end;
$$;

drop trigger if exists sync_auth_user_after_change on auth.users;

create trigger sync_auth_user_after_change
after insert or update of email, raw_user_meta_data
on auth.users
for each row
execute function public.sync_auth_user_trigger();

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
