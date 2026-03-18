do $$
begin
  if exists (
    select 1
    from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typname = 'question_type_enum'
      and e.enumlabel = 'sba_true_false'
  ) then
    null;
  else
    alter type public.question_type_enum add value 'sba_true_false';
  end if;
end $$;

create table if not exists public.question_assertions (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.question_bank(id) on delete cascade,
  assertion_text text not null,
  is_true boolean not null,
  explanation text,
  display_order integer not null,
  unique (question_id, display_order)
);

create index if not exists question_assertions_question_idx
  on public.question_assertions (question_id, display_order);

alter table public.question_assertions enable row level security;

drop policy if exists question_assertions_select_policy on public.question_assertions;
create policy question_assertions_select_policy on public.question_assertions
for select using (
  exists (
    select 1 from public.question_bank qb
    where qb.id = question_id
      and (qb.institution_id is null or qb.institution_id = public.current_user_institution_id())
  )
);
