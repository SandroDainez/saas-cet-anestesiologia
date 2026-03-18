do $$
begin
  if exists (
    select 1
    from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typname = 'exam_type_enum'
      and e.enumlabel = 'training_short'
  ) then
    null;
  else
    alter type public.exam_type_enum add value 'training_short';
  end if;
end $$;
