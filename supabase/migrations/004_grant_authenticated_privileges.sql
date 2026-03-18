-- Ensure Supabase client sessions using the `authenticated` role can access
-- public schema objects. Row-level security still enforces row visibility.

grant usage on schema public to anon, authenticated;

grant select on all tables in schema public to anon;
grant all privileges on all tables in schema public to authenticated;
grant all privileges on all sequences in schema public to authenticated;
grant all privileges on all routines in schema public to authenticated;

alter default privileges in schema public
grant select on tables to anon;

alter default privileges in schema public
grant all privileges on tables to authenticated;

alter default privileges in schema public
grant all privileges on sequences to authenticated;

alter default privileges in schema public
grant all privileges on routines to authenticated;
