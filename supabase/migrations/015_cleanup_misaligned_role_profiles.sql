delete from public.trainee_profiles tp
where exists (
  select 1
  from public.user_roles ur
  join public.roles r on r.id = ur.role_id
  where ur.user_id = tp.user_id
    and r.code in ('institution_admin', 'coordinator', 'preceptor', 'super_admin')
);

delete from public.preceptor_profiles pp
where exists (
  select 1
  from public.user_roles ur
  join public.roles r on r.id = ur.role_id
  where ur.user_id = pp.user_id
    and r.code in ('institution_admin', 'coordinator', 'trainee', 'trainee_me1', 'trainee_me2', 'trainee_me3', 'super_admin')
);

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
