create or replace function public.sync_auth_user_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  begin
    perform public.sync_auth_user_row(new.id);
  exception
    when others then
      raise warning
        'sync_auth_user_trigger failed for user %: [%] %',
        new.id,
        sqlstate,
        sqlerrm;
  end;

  return new;
end;
$$;
