set check_function_bodies = off;

-- BLOCO 1: seed funcional mínimo para currículo, trilhas, lições, questões e provas.

insert into public.curriculum_years (id, code, name, display_order)
values
  ('10000000-0000-0000-0000-000000000011','ME1','Ano 1 – Fundamentos',1),
  ('10000000-0000-0000-0000-000000000012','ME2','Ano 2 – Intermediário',2),
  ('10000000-0000-0000-0000-000000000013','ME3','Ano 3 – Avançado',3)
on conflict (code) do nothing;

insert into public.curriculum_topics (id, curriculum_year_id, point_number, title, description, display_order)
select '10000000-0000-0000-0000-000000000021', cy.id, 1, 'Manejo básico de vias aéreas', 'Cobertura inicial sobre anatomia, avaliação e intubação.', 1
from public.curriculum_years cy
where cy.code = 'ME1'
on conflict do nothing;

insert into public.curriculum_topics (id, curriculum_year_id, point_number, title, description, display_order)
select '10000000-0000-0000-0000-000000000022', cy.id, 2, 'Farmacologia anestésica básica', 'Farmacocinética e escolha de agentes venosos e inalatórios.', 2
from public.curriculum_years cy
where cy.code = 'ME1'
on conflict do nothing;

insert into public.curriculum_topics (id, curriculum_year_id, point_number, title, description, display_order)
select '10000000-0000-0000-0000-000000000023', cy.id, 1, 'Ventilação mecânica intermediária', 'Parâmetros ventilatórios em pacientes críticos e intraoperatórios.', 1
from public.curriculum_years cy
where cy.code = 'ME2'
on conflict do nothing;

insert into public.curriculum_topics (id, curriculum_year_id, point_number, title, description, display_order)
select '10000000-0000-0000-0000-000000000024', cy.id, 2, 'Monitorização invasiva', 'Uso de linha arterial e interpretação de curvas.', 2
from public.curriculum_years cy
where cy.code = 'ME2'
on conflict do nothing;

insert into public.curriculum_topics (id, curriculum_year_id, point_number, title, description, display_order)
select '10000000-0000-0000-0000-000000000025', cy.id, 1, 'Anestesia em cirurgia cardíaca', 'Gerenciamento de indução, CEC e desmame em cirurgia cardíaca.', 1
from public.curriculum_years cy
where cy.code = 'ME3'
on conflict do nothing;

insert into public.curriculum_subtopics (id, topic_id, code_ex, title, description, display_order, active)
select '10000000-0000-0000-0000-000000000201', ct.id, 'ME1-VA-1', 'Avaliação preditiva', 'Mallampati, distância tireomentoniana e mobilidade cervical.', 1, true
from public.curriculum_topics ct
join public.curriculum_years cy on cy.id = ct.curriculum_year_id
where cy.code = 'ME1' and ct.point_number = 1
on conflict do nothing;

insert into public.curriculum_subtopics (id, topic_id, code_ex, title, description, display_order, active)
select '10000000-0000-0000-0000-000000000202', ct.id, 'ME1-VA-2', 'Plano alternativo', 'Plano B, dispositivos supraglóticos e falha de intubação.', 2, true
from public.curriculum_topics ct
join public.curriculum_years cy on cy.id = ct.curriculum_year_id
where cy.code = 'ME1' and ct.point_number = 1
on conflict do nothing;

insert into public.curriculum_subtopics (id, topic_id, code_ex, title, description, display_order, active)
select '10000000-0000-0000-0000-000000000203', ct.id, 'ME1-FAR-1', 'Indução venosa', 'Propofol, etomidato e cetamina na indução anestésica.', 1, true
from public.curriculum_topics ct
join public.curriculum_years cy on cy.id = ct.curriculum_year_id
where cy.code = 'ME1' and ct.point_number = 2
on conflict do nothing;

insert into public.curriculum_subtopics (id, topic_id, code_ex, title, description, display_order, active)
select '10000000-0000-0000-0000-000000000204', ct.id, 'ME2-VM-1', 'Estratégia ventilatória', 'Volume corrente protetor e ajuste por complacência.', 1, true
from public.curriculum_topics ct
join public.curriculum_years cy on cy.id = ct.curriculum_year_id
where cy.code = 'ME2' and ct.point_number = 1
on conflict do nothing;

insert into public.curriculum_subtopics (id, topic_id, code_ex, title, description, display_order, active)
select '10000000-0000-0000-0000-000000000205', ct.id, 'ME2-MON-1', 'Linha arterial', 'Indicações, preparo e interpretação de PAM invasiva.', 1, true
from public.curriculum_topics ct
join public.curriculum_years cy on cy.id = ct.curriculum_year_id
where cy.code = 'ME2' and ct.point_number = 2
on conflict do nothing;

insert into public.curriculum_subtopics (id, topic_id, code_ex, title, description, display_order, active)
select '10000000-0000-0000-0000-000000000206', ct.id, 'ME3-CARD-1', 'Saída de circulação extracorpórea', 'Desmame da CEC e vigilância hemodinâmica.', 1, true
from public.curriculum_topics ct
join public.curriculum_years cy on cy.id = ct.curriculum_year_id
where cy.code = 'ME3' and ct.point_number = 1
on conflict do nothing;

insert into public.learning_tracks (id, institution_id, curriculum_year_id, title, description, track_type, active)
select '10000000-0000-0000-0000-000000000031', inst.id, cy.id, 'Trilha Básica ME1', 'Fundamentos da anestesia geral.', 'year_based', true
from public.institutions inst
join public.curriculum_years cy on cy.code = 'ME1'
where inst.slug = 'cet-hospital-central'
on conflict do nothing;

insert into public.learning_tracks (id, institution_id, curriculum_year_id, title, description, track_type, active)
select '10000000-0000-0000-0000-000000000032', inst.id, cy.id, 'Trilha Intensiva ME2', 'Ventilação e monitorização avançada.', 'year_based', true
from public.institutions inst
join public.curriculum_years cy on cy.code = 'ME2'
where inst.slug = 'cet-hospital-central'
on conflict do nothing;

insert into public.learning_tracks (id, institution_id, curriculum_year_id, title, description, track_type, active)
select '10000000-0000-0000-0000-000000000033', inst.id, cy.id, 'Trilha Avançada ME3', 'Cardiovascular e casos complexos.', 'year_based', true
from public.institutions inst
join public.curriculum_years cy on cy.code = 'ME3'
where inst.slug = 'cet-hospital-central'
on conflict do nothing;

insert into public.learning_modules (id, learning_track_id, curriculum_topic_id, title, description, module_type, difficulty_level, display_order)
select '10000000-0000-0000-0000-000000000041', '10000000-0000-0000-0000-000000000031', ct.id, 'Módulo de via aérea', 'Base operacional para avaliação e preparo da intubação.', 'lesson', 'basic', 1
from public.curriculum_topics ct
join public.curriculum_years cy on cy.id = ct.curriculum_year_id
where cy.code = 'ME1' and ct.point_number = 1
on conflict do nothing;

insert into public.learning_modules (id, learning_track_id, curriculum_topic_id, title, description, module_type, difficulty_level, display_order)
select '10000000-0000-0000-0000-000000000042', '10000000-0000-0000-0000-000000000032', ct.id, 'Módulo de ventilação', 'Ventilação protetora e leitura do ventilador no intraoperatório.', 'lesson', 'intermediate', 1
from public.curriculum_topics ct
join public.curriculum_years cy on cy.id = ct.curriculum_year_id
where cy.code = 'ME2' and ct.point_number = 1
on conflict do nothing;

insert into public.learning_modules (id, learning_track_id, curriculum_topic_id, title, description, module_type, difficulty_level, display_order)
select '10000000-0000-0000-0000-000000000043', '10000000-0000-0000-0000-000000000033', ct.id, 'Módulo cardio', 'Panorama de indução e momentos críticos da cirurgia cardíaca.', 'lesson', 'advanced', 1
from public.curriculum_topics ct
join public.curriculum_years cy on cy.id = ct.curriculum_year_id
where cy.code = 'ME3' and ct.point_number = 1
on conflict do nothing;

insert into public.learning_lessons (id, learning_module_id, title, objective, summary, lesson_format, display_order)
values
  ('10000000-0000-0000-0000-000000000051','10000000-0000-0000-0000-000000000041','Lição: Intubação orotraqueal','Executar a sequência segura de preoxigenação e intubação eletiva.','Lição-base de via aérea para o trainee no início do programa.','interactive',1),
  ('10000000-0000-0000-0000-000000000052','10000000-0000-0000-0000-000000000042','Lição: Monitorização invasiva','Selecionar monitorização invasiva conforme o cenário clínico.','Lição introdutória de monitorização invasiva e vigilância perioperatória.','interactive',1),
  ('10000000-0000-0000-0000-000000000053','10000000-0000-0000-0000-000000000043','Lição: Cirurgia cardíaca','Reconhecer marcos críticos da anestesia em cirurgia cardíaca.','Panorama inicial dos momentos críticos de uma anestesia cardíaca.','interactive',1),
  ('10000000-0000-0000-0000-000000000221','10000000-0000-0000-0000-000000000041','Checklist de preoxigenação','Preparar o ambiente e reduzir falhas previsíveis antes da indução.','Microlição operacional para antes do primeiro caso.','microlearning',2),
  ('10000000-0000-0000-0000-000000000222','10000000-0000-0000-0000-000000000041','Escolha do agente de indução','Comparar propofol, etomidato e cetamina segundo o cenário clínico.','Lição comparativa focada em hemodinâmica e perfil do paciente.','case_based',3),
  ('10000000-0000-0000-0000-000000000223','10000000-0000-0000-0000-000000000042','Ventilação protetora no intraoperatório','Ajustar VT, PEEP e alarmes conforme pulmão e cirurgia.','Lição guiada com decisões rápidas.','interactive',2),
  ('10000000-0000-0000-0000-000000000224','10000000-0000-0000-0000-000000000042','Passo a passo da linha arterial','Organizar material, técnica asséptica e checagem da curva.','Algoritmo enxuto para monitorização invasiva.','algorithmic',3),
  ('10000000-0000-0000-0000-000000000225','10000000-0000-0000-0000-000000000043','Plano anestésico na indução cardíaca','Reconhecer pontos de instabilidade hemodinâmica na indução.','Sequência crítica para casos de cirurgia cardíaca.','case_based',2),
  ('10000000-0000-0000-0000-000000000226','10000000-0000-0000-0000-000000000043','Checklist de saída da CEC','Priorizar temperatura, ritmo, ventilação e suporte vasoativo.','Checklist de alto impacto para revisão rápida.','microlearning',3)
on conflict do nothing;

insert into public.lesson_steps (id, lesson_id, step_type, title, body_markdown, structured_payload, display_order)
values
  ('10000000-0000-0000-0000-000000000231', '10000000-0000-0000-0000-000000000051', 'text', 'Sequência inicial', 'Posicione o paciente, confirme capnógrafo, sucção e estratégia de intubação antes da indução.', '{}'::jsonb, 1),
  ('10000000-0000-0000-0000-000000000232', '10000000-0000-0000-0000-000000000051', 'checkpoint', 'Itens críticos', 'Antes de iniciar, os itens abaixo precisam estar disponíveis.', '{"checklist":["Fonte de O2","Capnógrafo funcional","Dispositivo alternativo","Acesso venoso pérvio"]}'::jsonb, 2),
  ('10000000-0000-0000-0000-000000000233', '10000000-0000-0000-0000-000000000221', 'checkpoint', 'Preoxigenação adequada', 'Quais condições devem ser checadas antes da sequência rápida?', '{"checklist":["Máscara bem vedada","Fluxo alto de O2","Paciente em posição adequada"]}'::jsonb, 1),
  ('10000000-0000-0000-0000-000000000234', '10000000-0000-0000-0000-000000000222', 'question', 'Cenário de choque', 'Paciente séptico, hipotenso e agitado. Qual agente preserva mais a pressão na indução?', '{"options":["Propofol","Etomidato","Midazolam"]}'::jsonb, 1),
  ('10000000-0000-0000-0000-000000000235', '10000000-0000-0000-0000-000000000223', 'checkpoint', 'Ventilação protetora', 'Revise os componentes básicos antes do início do caso.', '{"checklist":["VT 6-8 ml/kg","PEEP ajustada","Pressão de platô observada"]}'::jsonb, 1),
  ('10000000-0000-0000-0000-000000000236', '10000000-0000-0000-0000-000000000224', 'text', 'Montagem do sistema', 'Prepare transdutor, flush pressurizado e nível do átrio direito antes da punção.', '{}'::jsonb, 1),
  ('10000000-0000-0000-0000-000000000237', '10000000-0000-0000-0000-000000000052', 'text', 'Quando usar monitorização invasiva', 'Indique monitorização contínua em instabilidade hemodinâmica, drogas vasoativas e cirurgias de maior risco.', '{}'::jsonb, 1),
  ('10000000-0000-0000-0000-000000000238', '10000000-0000-0000-0000-000000000053', 'text', 'Momentos críticos da cirurgia cardíaca', 'Atenção à indução, canulação, CEC, reaquecimento e saída de circulação extracorpórea.', '{}'::jsonb, 1),
  ('10000000-0000-0000-0000-000000000239', '10000000-0000-0000-0000-000000000225', 'question', 'Indução na fração de ejeção baixa', 'Em paciente com FE reduzida, qual objetivo é prioritário durante a indução?', '{"options":["Queda rápida da pós-carga","Estabilidade hemodinâmica","Hiperventilação deliberada"]}'::jsonb, 1),
  ('10000000-0000-0000-0000-000000000240', '10000000-0000-0000-0000-000000000226', 'checkpoint', 'Saída da CEC', 'Confirme a sequência abaixo antes de reduzir o suporte da circulação extracorpórea.', '{"checklist":["Temperatura aceitável","Ritmo avaliado","Ventilação retomada","Vasoativos preparados"]}'::jsonb, 1)
on conflict do nothing;

insert into public.question_tags (id, name, tag_type)
values
  ('10000000-0000-0000-0000-000000000251', 'Via aérea', 'topic'),
  ('10000000-0000-0000-0000-000000000252', 'Farmacologia', 'topic'),
  ('10000000-0000-0000-0000-000000000253', 'Ventilação', 'topic'),
  ('10000000-0000-0000-0000-000000000254', 'Cirurgia cardíaca', 'topic')
on conflict (name) do nothing;

insert into public.question_bank (
  id, institution_id, curriculum_year_id, curriculum_topic_id, curriculum_subtopic_id, title, stem, rationale,
  difficulty, question_type, educational_goal, status, source_generation_type, active
)
select
  seed.id::uuid,
  inst.id,
  cy.id,
  ct.id,
  cst.id,
  seed.title,
  seed.stem,
  seed.rationale,
  seed.difficulty::public.question_difficulty,
  'single_choice',
  seed.educational_goal,
  'published',
  'human',
  true
from (
  values
    ('10000000-0000-0000-0000-000000000260','ME1',1,'Plano alternativo','Falha na primeira laringoscopia','Após falha na primeira tentativa de laringoscopia e ventilação ainda possível, qual conduta é mais apropriada?','Mantendo oxigenação, a estratégia deve migrar para dispositivo alternativo antes de manobras invasivas.','medium','Reforçar o plano B em via aérea difícil.'),
    ('10000000-0000-0000-0000-000000000261','ME1',2,'Indução venosa','Escolha do agente de indução','Paciente séptico, hipotenso e com risco de instabilidade circulatória. Qual agente venoso tende a preservar mais a pressão arterial na indução?','Etomidato costuma preservar melhor a estabilidade hemodinâmica do que o propofol em cenários de choque.','medium','Diferenciar agentes de indução segundo o perfil hemodinâmico.'),
    ('10000000-0000-0000-0000-000000000262','ME2',1,'Estratégia ventilatória','Ventilação protetora','Em paciente sem doença pulmonar prévia, qual estratégia está mais alinhada à ventilação protetora no intraoperatório?','Volume corrente baixo e PEEP adequada reduzem volutrauma e atelectrauma.','medium','Aplicar conceitos de ventilação protetora no centro cirúrgico.'),
    ('10000000-0000-0000-0000-000000000263','ME2',2,'Linha arterial','Monitorização invasiva','Qual situação tem indicação mais forte de linha arterial invasiva antes da indução?','A monitorização invasiva é especialmente útil em grande instabilidade hemodinâmica e uso de drogas vasoativas.','hard','Reconhecer quando a linha arterial muda a segurança do caso.'),
    ('10000000-0000-0000-0000-000000000264','ME3',1,'Saída de circulação extracorpórea','Saída da circulação extracorpórea','No desmame da CEC, qual item deve ser checado antes de reduzir o suporte extracorpóreo?','Temperatura, ritmo e ventilação precisam estar organizados antes do desmame.','hard','Fixar o checklist básico de saída da circulação extracorpórea.'),
    ('10000000-0000-0000-0000-000000000265','ME3',1,'Saída de circulação extracorpórea','Indução em cardiopata grave','Em paciente com fração de ejeção muito reduzida, qual meta é prioritária na indução anestésica?','Evitar colapso hemodinâmico é prioridade maior do que profundidade anestésica agressiva.','medium','Reforçar a meta principal da indução em cardiopatas de alto risco.')
) as seed(id, year_code, point_number, subtopic_title, title, stem, rationale, difficulty, educational_goal)
join public.institutions inst on inst.slug = 'cet-hospital-central'
join public.curriculum_years cy on cy.code = seed.year_code::public.trainee_year_code
join public.curriculum_topics ct on ct.curriculum_year_id = cy.id and ct.point_number = seed.point_number
join public.curriculum_subtopics cst on cst.topic_id = ct.id and cst.title = seed.subtopic_title
on conflict do nothing;

insert into public.question_options (id, question_id, option_label, option_text, is_correct, explanation, display_order)
values
  ('10000000-0000-0000-0000-000000000266','10000000-0000-0000-0000-000000000260','A','Realizar cricotireoidostomia imediata',false,'Ainda não é a melhor conduta se a oxigenação está preservada.',1),
  ('10000000-0000-0000-0000-000000000267','10000000-0000-0000-0000-000000000260','B','Passar imediatamente para videolaringoscópio ou dispositivo alternativo',true,'Com oxigenação mantida, a escalada para plano alternativo é o passo adequado.',2),
  ('10000000-0000-0000-0000-000000000268','10000000-0000-0000-0000-000000000260','C','Repetir a mesma técnica indefinidamente',false,'Repetição cega aumenta trauma e não melhora segurança.',3),
  ('10000000-0000-0000-0000-000000000271','10000000-0000-0000-0000-000000000261','A','Propofol',false,'Pode agravar hipotensão em paciente instável.',1),
  ('10000000-0000-0000-0000-000000000272','10000000-0000-0000-0000-000000000261','B','Etomidato',true,'É a opção mais estável do ponto de vista hemodinâmico nesse contexto.',2),
  ('10000000-0000-0000-0000-000000000273','10000000-0000-0000-0000-000000000261','C','Tiopental',false,'Não é a melhor escolha diante de choque e instabilidade.',3),
  ('10000000-0000-0000-0000-000000000274','10000000-0000-0000-0000-000000000262','A','VT 10-12 ml/kg sem PEEP',false,'Aumenta risco de volutrauma.',1),
  ('10000000-0000-0000-0000-000000000275','10000000-0000-0000-0000-000000000262','B','VT 6-8 ml/kg com PEEP titulada',true,'Representa a estratégia protetora padrão.',2),
  ('10000000-0000-0000-0000-000000000276','10000000-0000-0000-0000-000000000262','C','Hiperventilação rotineira',false,'Não constitui estratégia protetora.',3),
  ('10000000-0000-0000-0000-000000000277','10000000-0000-0000-0000-000000000263','A','Paciente com pequeno procedimento e hemodinâmica estável',false,'Não há indicação forte nesse caso.',1),
  ('10000000-0000-0000-0000-000000000278','10000000-0000-0000-0000-000000000263','B','Paciente em uso de vasopressores e instabilidade importante',true,'É um cenário clássico de indicação de linha arterial.',2),
  ('10000000-0000-0000-0000-000000000279','10000000-0000-0000-0000-000000000263','C','Paciente jovem ASA I em anestesia leve',false,'Não justifica monitorização invasiva rotineira.',3),
  ('10000000-0000-0000-0000-000000000280','10000000-0000-0000-0000-000000000264','A','Temperatura, ritmo e ventilação',true,'São checagens centrais antes do desmame.',1),
  ('10000000-0000-0000-0000-000000000281','10000000-0000-0000-0000-000000000264','B','Apenas diurese horária',false,'Importante, mas insuficiente como critério principal.',2),
  ('10000000-0000-0000-0000-000000000282','10000000-0000-0000-0000-000000000264','C','Apenas saturação periférica',false,'É um parâmetro isolado e incompleto.',3),
  ('10000000-0000-0000-0000-000000000283','10000000-0000-0000-0000-000000000265','A','Estabilidade hemodinâmica',true,'Evitar colapso circulatório é a meta prioritária.',1),
  ('10000000-0000-0000-0000-000000000284','10000000-0000-0000-0000-000000000265','B','Hipotensão controlada deliberada',false,'Não é objetivo seguro em fração de ejeção muito baixa.',2),
  ('10000000-0000-0000-0000-000000000285','10000000-0000-0000-0000-000000000265','C','Hiperventilação sistemática',false,'Não resolve o principal risco do cenário.',3)
on conflict do nothing;

insert into public.question_tag_links (id, question_id, tag_id)
select
  seed.id::uuid,
  seed.question_id::uuid,
  qt.id
from (
  values
    ('10000000-0000-0000-0000-000000000289','10000000-0000-0000-0000-000000000260','Via aérea'),
    ('10000000-0000-0000-0000-000000000286','10000000-0000-0000-0000-000000000261','Farmacologia'),
    ('10000000-0000-0000-0000-000000000287','10000000-0000-0000-0000-000000000262','Ventilação'),
    ('10000000-0000-0000-0000-000000000288','10000000-0000-0000-0000-000000000264','Cirurgia cardíaca')
) as seed(id, question_id, tag_name)
join public.question_tags qt on qt.name = seed.tag_name
on conflict do nothing;

insert into public.exams (
  id, institution_id, curriculum_year_id, title, description, exam_type, status, duration_minutes, total_questions,
  available_from, available_until
)
select '10000000-0000-0000-0000-000000000291', inst.id, cy.id, 'Prova Trimestral ME1', 'Avaliação curta de ME1 com foco em via aérea e farmacologia inicial.', 'quarterly', 'open', 45, 2, now() - interval '7 days', now() + interval '180 days'
from public.institutions inst
join public.curriculum_years cy on cy.code = 'ME1'
where inst.slug = 'cet-hospital-central'
on conflict do nothing;

insert into public.exams (
  id, institution_id, curriculum_year_id, title, description, exam_type, status, duration_minutes, total_questions,
  available_from, available_until
)
select '10000000-0000-0000-0000-000000000292', inst.id, cy.id, 'Prova Trimestral ME2', 'Avaliação curta sobre ventilação e monitorização invasiva.', 'quarterly', 'open', 45, 2, now() - interval '7 days', now() + interval '180 days'
from public.institutions inst
join public.curriculum_years cy on cy.code = 'ME2'
where inst.slug = 'cet-hospital-central'
on conflict do nothing;

insert into public.exams (
  id, institution_id, curriculum_year_id, title, description, exam_type, status, duration_minutes, total_questions,
  available_from, available_until
)
select '10000000-0000-0000-0000-000000000293', inst.id, cy.id, 'Simulado Cardiovascular ME3', 'Simulado de ME3 para revisão cardiovascular e desmame de CEC.', 'mock', 'open', 60, 2, now() - interval '7 days', now() + interval '180 days'
from public.institutions inst
join public.curriculum_years cy on cy.code = 'ME3'
where inst.slug = 'cet-hospital-central'
on conflict do nothing;

insert into public.exam_blueprints (id, exam_id, curriculum_topic_id, target_question_count, weight_percent)
select '10000000-0000-0000-0000-000000000294', '10000000-0000-0000-0000-000000000291', ct.id, 1, 50
from public.curriculum_topics ct
join public.curriculum_years cy on cy.id = ct.curriculum_year_id
where cy.code = 'ME1' and ct.point_number = 1
on conflict do nothing;

insert into public.exam_blueprints (id, exam_id, curriculum_topic_id, target_question_count, weight_percent)
select '10000000-0000-0000-0000-000000000295', '10000000-0000-0000-0000-000000000291', ct.id, 1, 50
from public.curriculum_topics ct
join public.curriculum_years cy on cy.id = ct.curriculum_year_id
where cy.code = 'ME1' and ct.point_number = 2
on conflict do nothing;

insert into public.exam_blueprints (id, exam_id, curriculum_topic_id, target_question_count, weight_percent)
select '10000000-0000-0000-0000-000000000296', '10000000-0000-0000-0000-000000000292', ct.id, 1, 50
from public.curriculum_topics ct
join public.curriculum_years cy on cy.id = ct.curriculum_year_id
where cy.code = 'ME2' and ct.point_number = 1
on conflict do nothing;

insert into public.exam_blueprints (id, exam_id, curriculum_topic_id, target_question_count, weight_percent)
select '10000000-0000-0000-0000-000000000297', '10000000-0000-0000-0000-000000000292', ct.id, 1, 50
from public.curriculum_topics ct
join public.curriculum_years cy on cy.id = ct.curriculum_year_id
where cy.code = 'ME2' and ct.point_number = 2
on conflict do nothing;

insert into public.exam_blueprints (id, exam_id, curriculum_topic_id, target_question_count, weight_percent)
select '10000000-0000-0000-0000-000000000298', '10000000-0000-0000-0000-000000000293', ct.id, 2, 100
from public.curriculum_topics ct
join public.curriculum_years cy on cy.id = ct.curriculum_year_id
where cy.code = 'ME3' and ct.point_number = 1
on conflict do nothing;

insert into public.exam_question_links (id, exam_id, question_id, display_order, points)
values
  ('10000000-0000-0000-0000-000000000299','10000000-0000-0000-0000-000000000291','10000000-0000-0000-0000-000000000261',1,1),
  ('10000000-0000-0000-0000-000000000300','10000000-0000-0000-0000-000000000291','10000000-0000-0000-0000-000000000260',2,1),
  ('10000000-0000-0000-0000-000000000301','10000000-0000-0000-0000-000000000292','10000000-0000-0000-0000-000000000262',1,1),
  ('10000000-0000-0000-0000-000000000302','10000000-0000-0000-0000-000000000292','10000000-0000-0000-0000-000000000263',2,1),
  ('10000000-0000-0000-0000-000000000303','10000000-0000-0000-0000-000000000293','10000000-0000-0000-0000-000000000264',1,1),
  ('10000000-0000-0000-0000-000000000304','10000000-0000-0000-0000-000000000293','10000000-0000-0000-0000-000000000265',2,1)
on conflict do nothing;
