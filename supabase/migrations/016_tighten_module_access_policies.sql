drop policy if exists exam_attempts_policy on public.exam_attempts;
create policy exam_attempts_policy on public.exam_attempts
for all using (
  public.is_super_admin()
  or trainee_user_id = auth.uid()
  or (
    exists (
      select 1
      from public.exams e
      where e.id = exam_id
        and e.institution_id = public.current_user_institution_id()
    )
    and (public.is_preceptor() or public.is_coordinator() or public.is_institution_admin())
  )
)
with check (
  public.is_super_admin()
  or trainee_user_id = auth.uid()
  or (
    exists (
      select 1
      from public.exams e
      where e.id = exam_id
        and e.institution_id = public.current_user_institution_id()
    )
    and (public.is_preceptor() or public.is_coordinator() or public.is_institution_admin())
  )
);

drop policy if exists exam_answers_policy on public.exam_answers;
create policy exam_answers_policy on public.exam_answers
for all using (
  exists (
    select 1
    from public.exam_attempts ea
    join public.exams e on e.id = ea.exam_id
    where ea.id = exam_attempt_id
      and (
        public.is_super_admin()
        or ea.trainee_user_id = auth.uid()
        or (
          e.institution_id = public.current_user_institution_id()
          and (public.is_preceptor() or public.is_coordinator() or public.is_institution_admin())
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.exam_attempts ea
    join public.exams e on e.id = ea.exam_id
    where ea.id = exam_attempt_id
      and (
        public.is_super_admin()
        or ea.trainee_user_id = auth.uid()
        or (
          e.institution_id = public.current_user_institution_id()
          and (public.is_preceptor() or public.is_coordinator() or public.is_institution_admin())
        )
      )
  )
);

drop policy if exists exam_result_domains_policy on public.exam_result_domains;
create policy exam_result_domains_policy on public.exam_result_domains
for all using (
  exists (
    select 1
    from public.exam_attempts ea
    join public.exams e on e.id = ea.exam_id
    where ea.id = exam_attempt_id
      and (
        public.is_super_admin()
        or ea.trainee_user_id = auth.uid()
        or (
          e.institution_id = public.current_user_institution_id()
          and (public.is_preceptor() or public.is_coordinator() or public.is_institution_admin())
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.exam_attempts ea
    join public.exams e on e.id = ea.exam_id
    where ea.id = exam_attempt_id
      and (
        public.is_super_admin()
        or ea.trainee_user_id = auth.uid()
        or (
          e.institution_id = public.current_user_institution_id()
          and (public.is_preceptor() or public.is_coordinator() or public.is_institution_admin())
        )
      )
  )
);

drop policy if exists emergency_attempts_policy on public.emergency_attempts;
create policy emergency_attempts_policy on public.emergency_attempts
for all using (
  public.is_super_admin()
  or trainee_user_id = auth.uid()
  or (
    public.same_institution((select institution_id from public.user_profiles where id = trainee_user_id))
    and (public.is_preceptor() or public.is_coordinator() or public.is_institution_admin())
  )
)
with check (
  public.is_super_admin()
  or trainee_user_id = auth.uid()
  or (
    public.same_institution((select institution_id from public.user_profiles where id = trainee_user_id))
    and (public.is_preceptor() or public.is_coordinator() or public.is_institution_admin())
  )
);

drop policy if exists emergency_attempt_actions_policy on public.emergency_attempt_actions;
create policy emergency_attempt_actions_policy on public.emergency_attempt_actions
for all using (
  exists (
    select 1
    from public.emergency_attempts ea
    where ea.id = emergency_attempt_id
      and (
        public.is_super_admin()
        or ea.trainee_user_id = auth.uid()
        or (
          public.same_institution((select institution_id from public.user_profiles where id = ea.trainee_user_id))
          and (public.is_preceptor() or public.is_coordinator() or public.is_institution_admin())
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.emergency_attempts ea
    where ea.id = emergency_attempt_id
      and (
        public.is_super_admin()
        or ea.trainee_user_id = auth.uid()
        or (
          public.same_institution((select institution_id from public.user_profiles where id = ea.trainee_user_id))
          and (public.is_preceptor() or public.is_coordinator() or public.is_institution_admin())
        )
      )
  )
);

drop policy if exists emergency_self_assessments_policy on public.emergency_self_assessments;
create policy emergency_self_assessments_policy on public.emergency_self_assessments
for all using (
  public.is_super_admin()
  or trainee_user_id = auth.uid()
  or (
    public.same_institution((select institution_id from public.user_profiles where id = trainee_user_id))
    and (public.is_preceptor() or public.is_coordinator() or public.is_institution_admin())
  )
)
with check (
  public.is_super_admin()
  or trainee_user_id = auth.uid()
  or (
    public.same_institution((select institution_id from public.user_profiles where id = trainee_user_id))
    and (public.is_preceptor() or public.is_coordinator() or public.is_institution_admin())
  )
);

drop policy if exists procedure_logs_policy on public.procedure_logs;
create policy procedure_logs_policy on public.procedure_logs
for all using (
  public.is_super_admin()
  or trainee_user_id = auth.uid()
  or preceptor_user_id = auth.uid()
  or (
    institution_id = public.current_user_institution_id()
    and (public.is_preceptor() or public.is_coordinator() or public.is_institution_admin())
  )
)
with check (
  public.is_super_admin()
  or trainee_user_id = auth.uid()
  or preceptor_user_id = auth.uid()
  or (
    institution_id = public.current_user_institution_id()
    and (public.is_preceptor() or public.is_coordinator() or public.is_institution_admin())
  )
);

drop policy if exists procedure_log_items_policy on public.procedure_log_items;
create policy procedure_log_items_policy on public.procedure_log_items
for all using (
  exists (
    select 1
    from public.procedure_logs pl
    where pl.id = procedure_log_id
      and (
        public.is_super_admin()
        or pl.trainee_user_id = auth.uid()
        or pl.preceptor_user_id = auth.uid()
        or (
          pl.institution_id = public.current_user_institution_id()
          and (public.is_preceptor() or public.is_coordinator() or public.is_institution_admin())
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.procedure_logs pl
    where pl.id = procedure_log_id
      and (
        public.is_super_admin()
        or pl.trainee_user_id = auth.uid()
        or pl.preceptor_user_id = auth.uid()
        or (
          pl.institution_id = public.current_user_institution_id()
          and (public.is_preceptor() or public.is_coordinator() or public.is_institution_admin())
        )
      )
  )
);

drop policy if exists procedure_validations_policy on public.procedure_validations;
create policy procedure_validations_select_policy on public.procedure_validations
for select using (
  exists (
    select 1
    from public.procedure_logs pl
    where pl.id = procedure_log_id
      and (
        public.is_super_admin()
        or pl.trainee_user_id = auth.uid()
        or pl.preceptor_user_id = auth.uid()
        or validator_user_id = auth.uid()
        or (
          pl.institution_id = public.current_user_institution_id()
          and (public.is_preceptor() or public.is_coordinator() or public.is_institution_admin())
        )
      )
  )
);

create policy procedure_validations_manage_policy on public.procedure_validations
for all using (
  exists (
    select 1
    from public.procedure_logs pl
    where pl.id = procedure_log_id
      and (
        public.is_super_admin()
        or pl.preceptor_user_id = auth.uid()
        or validator_user_id = auth.uid()
        or (
          pl.institution_id = public.current_user_institution_id()
          and (public.is_preceptor() or public.is_coordinator() or public.is_institution_admin())
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.procedure_logs pl
    where pl.id = procedure_log_id
      and (
        public.is_super_admin()
        or pl.preceptor_user_id = auth.uid()
        or validator_user_id = auth.uid()
        or (
          pl.institution_id = public.current_user_institution_id()
          and (public.is_preceptor() or public.is_coordinator() or public.is_institution_admin())
        )
      )
  )
);
