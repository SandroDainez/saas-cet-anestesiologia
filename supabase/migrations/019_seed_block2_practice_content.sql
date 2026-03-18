insert into public.procedure_catalog (name, category, description, complexity_level, active)
values
  ('Intubação orotraqueal', 'airway', 'Manejo padrão de via aérea com tubo orotraqueal.', 'basic', true),
  ('Máscara laríngea', 'airway', 'Dispositivo supraglótico em anestesia geral e resgate.', 'basic', true),
  ('Raquianestesia', 'neuroaxis', 'Punção subaracnoidea com anestesia neuraxial.', 'intermediate', true),
  ('Bloqueio de plexo braquial', 'regional', 'Bloqueio periférico guiado por ultrassom.', 'intermediate', true),
  ('Cateter arterial', 'monitoring', 'Monitorização invasiva contínua.', 'intermediate', true),
  ('Acesso venoso central', 'vascular_access', 'Punção venosa central guiada por landmarks ou US.', 'advanced', true)
on conflict (name) do update
set category = excluded.category,
    description = excluded.description,
    complexity_level = excluded.complexity_level,
    active = excluded.active;

insert into public.surgery_catalog (specialty, procedure_name, procedure_group, complexity_level, active)
values
  ('general', 'Colecistectomia laparoscópica', 'abdome', 'intermediate', true),
  ('obstetric', 'Cesárea', 'obstetrícia', 'intermediate', true),
  ('ortho', 'Artroscopia de joelho', 'ortopedia', 'basic', true),
  ('urology', 'Ressecção transuretral de próstata', 'urologia', 'advanced', true)
on conflict (specialty, procedure_name) do update
set procedure_group = excluded.procedure_group,
    complexity_level = excluded.complexity_level,
    active = excluded.active;

insert into public.institution_units (institution_id, name, city, state, type, active)
select i.id, unit_data.name, unit_data.city, unit_data.state, unit_data.type::public.unit_type, true
from public.institutions i
cross join (
  values
    ('Centro Cirúrgico Principal', 'São Paulo', 'SP', 'hospital'),
    ('Centro Obstétrico', 'São Paulo', 'SP', 'hospital'),
    ('Laboratório de Simulação', 'São Paulo', 'SP', 'simulation_center')
) as unit_data(name, city, state, type)
where i.slug = 'cet-hospital-central'
  and not exists (
    select 1
    from public.institution_units iu
    where iu.institution_id = i.id
      and iu.name = unit_data.name
  );

with inserted_scenarios as (
  insert into public.emergency_scenarios (title, description, category, difficulty_level, universal_access, active)
  values
    (
      'Via aérea difícil inesperada',
      'Paciente em indução com ventilação difícil e necessidade de resgate rápido da oxigenação.',
      'airway',
      'advanced',
      true,
      true
    ),
    (
      'Anafilaxia intraoperatória',
      'Queda abrupta de pressão, broncoespasmo e rash após antibiótico profilático.',
      'allergic',
      'advanced',
      true,
      true
    )
  on conflict do nothing
  returning id, title
)
select 1;

with airway as (
  select id
  from public.emergency_scenarios
  where title = 'Via aérea difícil inesperada'
  limit 1
),
anaphylaxis as (
  select id
  from public.emergency_scenarios
  where title = 'Anafilaxia intraoperatória'
  limit 1
)
insert into public.emergency_scenario_steps (scenario_id, step_order, step_type, prompt_text, payload_jsonb, correct_branch_key)
select scenario_id, step_order, step_type, prompt_text, payload_jsonb, correct_branch_key
from (
  select
    (select id from airway) as scenario_id,
    1 as step_order,
    'presentation'::public.scenario_step_type as step_type,
    'Paciente dessatura rapidamente após indução. Qual é sua primeira prioridade?' as prompt_text,
    jsonb_build_object(
      'options',
      jsonb_build_array(
        jsonb_build_object('key', 'oxygen', 'label', 'Chamar ajuda e otimizar oxigenação imediatamente'),
        jsonb_build_object('key', 'wait', 'label', 'Aguardar melhora espontânea com ventilação mínima'),
        jsonb_build_object('key', 'drug', 'label', 'Aplicar mais hipnótico antes de reavaliar')
      )
    ) as payload_jsonb,
    'oxygen' as correct_branch_key
  union all
  select
    (select id from airway),
    2,
    'decision'::public.scenario_step_type,
    'A laringoscopia falhou. Qual caminho de resgate é mais adequado agora?',
    jsonb_build_object(
      'options',
      jsonb_build_array(
        jsonb_build_object('key', 'sgd', 'label', 'Inserir dispositivo supraglótico e reoxigenar'),
        jsonb_build_object('key', 'repeat', 'label', 'Repetir laringoscopia múltiplas vezes sem mudar estratégia'),
        jsonb_build_object('key', 'wake', 'label', 'Acordar o paciente sem recuperar oxigenação')
      )
    ),
    'sgd'
  union all
  select
    (select id from airway),
    3,
    'action'::public.scenario_step_type,
    'Persistindo a falha ventilatória, qual ação deve ser preparada em seguida?',
    jsonb_build_object(
      'options',
      jsonb_build_array(
        jsonb_build_object('key', 'front', 'label', 'Preparar acesso frontal do pescoço de emergência'),
        jsonb_build_object('key', 'observe', 'label', 'Observar por mais alguns minutos'),
        jsonb_build_object('key', 'position', 'label', 'Trocar somente o braço do manguito')
      )
    ),
    'front'
  union all
  select
    (select id from anaphylaxis),
    1,
    'presentation'::public.scenario_step_type,
    'Após antibiótico, o paciente evolui com broncoespasmo e hipotensão. Qual conduta vem primeiro?',
    jsonb_build_object(
      'options',
      jsonb_build_array(
        jsonb_build_object('key', 'epi', 'label', 'Suspender agente suspeito e administrar adrenalina'),
        jsonb_build_object('key', 'analgesia', 'label', 'Aumentar analgesia e observar'),
        jsonb_build_object('key', 'extubate', 'label', 'Extubar imediatamente')
      )
    ),
    'epi'
  union all
  select
    (select id from anaphylaxis),
    2,
    'decision'::public.scenario_step_type,
    'Qual suporte adicional deve ser iniciado junto à adrenalina?',
    jsonb_build_object(
      'options',
      jsonb_build_array(
        jsonb_build_object('key', 'fluids', 'label', 'Reposição vigorosa com cristaloide e suporte ventilatório'),
        jsonb_build_object('key', 'ignore', 'label', 'Seguir cirurgia normalmente'),
        jsonb_build_object('key', 'only_steroid', 'label', 'Usar apenas corticoide e aguardar')
      )
    ),
    'fluids'
  union all
  select
    (select id from anaphylaxis),
    3,
    'feedback'::public.scenario_step_type,
    'Após estabilização inicial, qual é o passo de segurança final mais importante?',
    jsonb_build_object(
      'options',
      jsonb_build_array(
        jsonb_build_object('key', 'document', 'label', 'Documentar o evento e planejar investigação alérgica'),
        jsonb_build_object('key', 'restart', 'label', 'Reiniciar o antibiótico suspeito'),
        jsonb_build_object('key', 'ignore', 'label', 'Encerrar o caso sem comunicação posterior')
      )
    ),
    'document'
) seeded_steps
where scenario_id is not null
  and not exists (
    select 1
    from public.emergency_scenario_steps ess
    where ess.scenario_id = seeded_steps.scenario_id
      and ess.step_order = seeded_steps.step_order
  );
