alter table public.user_profiles
  add column if not exists cpf text,
  add column if not exists crm text,
  add column if not exists address_text text;

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
  fallback_institution_id uuid;
  institution_count bigint;
  full_name_value text;
  existing_full_name text;
  existing_institution_id uuid;
  existing_phone text;
  existing_avatar_url text;
  existing_cpf text;
  existing_crm text;
  existing_address_text text;
  phone_value text;
  avatar_url_value text;
  cpf_value text;
  crm_value text;
  address_text_value text;
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

  select up.full_name, up.institution_id, up.phone, up.avatar_url, up.cpf, up.crm, up.address_text
  into existing_full_name, existing_institution_id, existing_phone, existing_avatar_url, existing_cpf, existing_crm, existing_address_text
  from public.user_profiles up
  where up.id = auth_row.id
  limit 1;

  institution_id_value := coalesce(
    institution_id_value,
    existing_institution_id,
    (select tp.institution_id from public.trainee_profiles tp where tp.user_id = auth_row.id limit 1),
    (select pp.institution_id from public.preceptor_profiles pp where pp.user_id = auth_row.id limit 1),
    (select ur.institution_id from public.user_roles ur where ur.user_id = auth_row.id and ur.institution_id is not null limit 1)
  );

  if institution_id_value is null and role_code is not null and role_code <> 'super_admin' then
    select count(*)
    into institution_count
    from public.institutions
    where status = 'active';

    if institution_count = 1 then
      select i.id
      into fallback_institution_id
      from public.institutions i
      where i.status = 'active'
      order by i.created_at, i.id::text
      limit 1;

      institution_id_value := fallback_institution_id;
    end if;
  end if;

  full_name_value := coalesce(
    nullif(metadata ->> 'full_name', ''),
    nullif(existing_full_name, ''),
    split_part(coalesce(auth_row.email, 'Usuario'), '@', 1)
  );
  phone_value := coalesce(nullif(metadata ->> 'phone', ''), existing_phone);
  avatar_url_value := coalesce(nullif(metadata ->> 'avatar_url', ''), existing_avatar_url);
  cpf_value := coalesce(nullif(metadata ->> 'cpf', ''), existing_cpf);
  crm_value := coalesce(nullif(metadata ->> 'crm', ''), existing_crm);
  address_text_value := coalesce(nullif(metadata ->> 'address_text', ''), existing_address_text);

  if training_year_text in ('ME1', 'ME2', 'ME3') then
    training_year_value := training_year_text::public.trainee_year_code;
  else
    training_year_value := coalesce(
      (select tp.trainee_year from public.trainee_profiles tp where tp.user_id = auth_row.id limit 1),
      public.infer_training_year_from_role(role_code)
    );
  end if;

  insert into public.user_profiles (id, institution_id, full_name, email, phone, avatar_url, cpf, crm, address_text)
  values (auth_row.id, institution_id_value, full_name_value, coalesce(auth_row.email, ''), phone_value, avatar_url_value, cpf_value, crm_value, address_text_value)
  on conflict (id) do update
  set institution_id = coalesce(excluded.institution_id, public.user_profiles.institution_id),
      full_name = excluded.full_name,
      email = excluded.email,
      phone = excluded.phone,
      avatar_url = excluded.avatar_url,
      cpf = excluded.cpf,
      crm = excluded.crm,
      address_text = excluded.address_text,
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
  else
    delete from public.trainee_profiles
    where user_id = auth_row.id;
  end if;

  if role_code = 'preceptor' and institution_id_value is not null then
    insert into public.preceptor_profiles (user_id, institution_id, specialty_focus)
    values (auth_row.id, institution_id_value, null)
    on conflict (user_id) do update
    set institution_id = excluded.institution_id,
        updated_at = now();
  else
    delete from public.preceptor_profiles
    where user_id = auth_row.id;
  end if;
end;
$$;
