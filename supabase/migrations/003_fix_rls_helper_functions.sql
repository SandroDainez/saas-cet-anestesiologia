-- Fix recursive RLS evaluation in helper functions used by policies.
-- These functions must bypass table RLS when resolving the current user's
-- institution and roles, otherwise policies that call them can recurse.

create or replace function public.current_user_id()
returns uuid
language sql
stable
security definer
set search_path = public, auth
as $$
  select auth.uid();
$$;

create or replace function public.current_user_institution_id()
returns uuid
language sql
stable
security definer
set search_path = public, auth
as $$
  select up.institution_id
  from public.user_profiles up
  where up.id = auth.uid()
  limit 1;
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.code = 'super_admin'
  );
$$;

create or replace function public.has_role(_role text)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.code = _role
      and (
        ur.institution_id = public.current_user_institution_id()
        or ur.institution_id is null
      )
  );
$$;

create or replace function public.is_institution_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.has_role('institution_admin');
$$;

create or replace function public.is_coordinator()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.has_role('coordinator');
$$;

create or replace function public.is_preceptor()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.has_role('preceptor');
$$;

create or replace function public.is_trainee()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.has_role('trainee');
$$;

create or replace function public.same_institution(_institution_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select (
    public.is_super_admin()
    or _institution_id = public.current_user_institution_id()
  );
$$;
