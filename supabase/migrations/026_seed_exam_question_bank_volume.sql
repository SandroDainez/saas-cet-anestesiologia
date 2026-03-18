insert into public.question_tags (id, name, tag_type)
values
  ('20000000-0000-0000-0000-000000000401', 'Monitorização', 'topic'),
  ('20000000-0000-0000-0000-000000000402', 'CEC', 'topic')
on conflict (name) do nothing;

insert into public.question_bank (
  id,
  institution_id,
  curriculum_year_id,
  curriculum_topic_id,
  curriculum_subtopic_id,
  title,
  stem,
  rationale,
  difficulty,
  question_type,
  clinical_context_jsonb,
  educational_goal,
  status,
  source_generation_type,
  active
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
  seed.question_type::public.question_type_enum,
  seed.clinical_context_jsonb::jsonb,
  seed.educational_goal,
  'published',
  'human',
  true
from (
  values
    (
      '20000000-0000-0000-0000-000000000001',
      'ME1',
      1,
      'Avaliação preditiva',
      'Preoxigenação em paciente obeso',
      'Paciente com obesidade importante, roncos e redução de reserva funcional programado para laparoscopia. Qual estratégia inicial aumenta mais a segurança antes da indução anestésica?',
      'Reservatório de oxigênio adequado, posicionamento em rampa e vedação correta da máscara reduzem dessaturação precoce.',
      'medium',
      'single_choice',
      'Aprimorar a preparação da via aérea em pacientes com baixa reserva funcional.',
      '{"scenario":"Obesidade e risco de dessaturação rápida"}'
    ),
    (
      '20000000-0000-0000-0000-000000000002',
      'ME1',
      2,
      'Indução venosa',
      'Sequência rápida e contraindicação farmacológica',
      'Em paciente com queimadura extensa há 10 dias e necessidade de sequência rápida, qual bloqueador neuromuscular deve ser evitado?',
      'A succinilcolina pode precipitar hipercalemia grave após queimaduras e outras condições de up regulation nicotínica.',
      'medium',
      'single_choice',
      'Reconhecer contraindicações relevantes em sequência rápida de intubação.',
      '{"scenario":"Queimadura recente e necessidade de intubação de urgência"}'
    ),
    (
      '20000000-0000-0000-0000-000000000003',
      'ME1',
      1,
      'Plano alternativo',
      'Via aérea difícil prevista: julgue as assertivas',
      'Paciente com limitação cervical, abertura oral reduzida e risco de falha de intubação. Julgue as assertivas abaixo como verdadeiras ou falsas.',
      'Questões SBA em assertivas exigem julgamento item a item sobre planejamento, oxigenação e escalada técnica.',
      'hard',
      'sba_true_false',
      'Treinar raciocínio estruturado em via aérea difícil prevista.',
      '{"scenario":"Via aérea difícil prevista em cirurgia eletiva"}'
    ),
    (
      '20000000-0000-0000-0000-000000000004',
      'ME2',
      1,
      'Estratégia ventilatória',
      'Ventilação protetora na laparoscopia',
      'Em paciente obeso submetido a videolaparoscopia prolongada, qual estratégia ventilatória está mais alinhada à proteção pulmonar?',
      'Ventilação protetora combina volume corrente ajustado ao peso predito, PEEP titulada e vigilância de pressão de platô.',
      'medium',
      'single_choice',
      'Aplicar ventilação protetora em contexto de pneumoperitônio e obesidade.',
      '{"scenario":"Videolaparoscopia longa em paciente obeso"}'
    ),
    (
      '20000000-0000-0000-0000-000000000005',
      'ME2',
      2,
      'Linha arterial',
      'Curva arterial amortecida',
      'Durante monitorização invasiva, a curva arterial torna-se amortecida e a pressão sistólica cai artificialmente. Qual causa deve ser verificada primeiro?',
      'Dobras, bolhas e conexões inadequadas são causas comuns de amortecimento e devem ser excluídas antes de decisões terapêuticas.',
      'medium',
      'single_choice',
      'Interpretar falhas técnicas básicas da linha arterial antes de intervir no paciente.',
      '{"scenario":"Linha arterial com perda de qualidade da curva"}'
    ),
    (
      '20000000-0000-0000-0000-000000000006',
      'ME2',
      2,
      'Linha arterial',
      'Monitorização invasiva no choque: julgue as assertivas',
      'Paciente séptico em norepinefrina crescente, com necessidade de anestesia para laparotomia de urgência. Julgue as assertivas abaixo como verdadeiras ou falsas.',
      'O formato assertivo da SBA obriga integração entre monitorização, calibração do sistema e interpretação hemodinâmica.',
      'hard',
      'sba_true_false',
      'Treinar julgamento estruturado em monitorização invasiva perioperatória.',
      '{"scenario":"Choque séptico em cirurgia de urgência"}'
    ),
    (
      '20000000-0000-0000-0000-000000000007',
      'ME3',
      1,
      'Saída de circulação extracorpórea',
      'Vasoplegia após circulação extracorpórea',
      'Após saída da circulação extracorpórea, o paciente apresenta hipotensão, baixa resistência vascular sistêmica e débito preservado. Qual diagnóstico deve ser lembrado como prioritário?',
      'Vasoplegia pós CEC cursa com hipotensão refratária, vasodilatação e, frequentemente, necessidade de vasopressores em doses crescentes.',
      'hard',
      'single_choice',
      'Reconhecer padrões hemodinâmicos críticos no pós CEC imediato.',
      '{"scenario":"Hipotensão vasodilatadora após cirurgia cardíaca"}'
    ),
    (
      '20000000-0000-0000-0000-000000000008',
      'ME3',
      1,
      'Saída de circulação extracorpórea',
      'Baixo débito após CEC',
      'No desmame da CEC, o ventrículo esquerdo encontra-se pouco complacente, com hipotensão e aumento de pressões de enchimento. Qual conduta inicial faz mais sentido?',
      'Baixo débito exige reavaliação da pré-carga, contratilidade, ritmo e suporte vasoativo/inotrópico com integração ecocardiográfica quando disponível.',
      'hard',
      'single_choice',
      'Organizar o raciocínio inicial diante de síndrome de baixo débito no pós CEC.',
      '{"scenario":"Baixo débito no desmame da circulação extracorpórea"}'
    ),
    (
      '20000000-0000-0000-0000-000000000009',
      'ME3',
      1,
      'Saída de circulação extracorpórea',
      'Desmame da CEC: julgue as assertivas',
      'Paciente em reaquecimento final e preparo para retirada de circulação extracorpórea. Julgue as assertivas abaixo como verdadeiras ou falsas.',
      'O julgamento assertiva por assertiva é útil para checar temperatura, ventilação, ritmo, anticoagulação e suporte vasoativo no desmame.',
      'hard',
      'sba_true_false',
      'Fixar os checkpoints críticos do desmame da circulação extracorpórea.',
      '{"scenario":"Checklist avançado de saída da circulação extracorpórea"}'
    )
) as seed(id, year_code, point_number, subtopic_title, title, stem, rationale, difficulty, question_type, educational_goal, clinical_context_jsonb)
join public.institutions inst on inst.slug = 'cet-hospital-central'
join public.curriculum_years cy on cy.code = seed.year_code::public.trainee_year_code
join public.curriculum_topics ct on ct.curriculum_year_id = cy.id and ct.point_number = seed.point_number
join public.curriculum_subtopics cst on cst.topic_id = ct.id and cst.title = seed.subtopic_title
on conflict (id) do nothing;

insert into public.question_options (id, question_id, option_label, option_text, is_correct, explanation, display_order)
values
  ('20000000-0000-0000-0000-000000000101','20000000-0000-0000-0000-000000000001','A','Posição em rampa, máscara bem selada e preoxigenação vigorosa antes da indução',true,'Melhora capacidade residual funcional e prolonga tempo seguro de apneia.',1),
  ('20000000-0000-0000-0000-000000000102','20000000-0000-0000-0000-000000000001','B','Indução imediata para reduzir ansiedade, deixando a ventilação para depois',false,'A perda precoce da ventilação agrava o risco de dessaturação.',2),
  ('20000000-0000-0000-0000-000000000103','20000000-0000-0000-0000-000000000001','C','Ventilação manual vigorosa sem ajuste de posicionamento',false,'Sem preparo adequado, não resolve o principal risco fisiológico.',3),
  ('20000000-0000-0000-0000-000000000104','20000000-0000-0000-0000-000000000002','A','Rocurônio',false,'É opção plausível na sequência rápida quando a succinilcolina é contraindicada.',1),
  ('20000000-0000-0000-0000-000000000105','20000000-0000-0000-0000-000000000002','B','Succinilcolina',true,'Após queimadura recente, há risco de hipercalemia potencialmente fatal.',2),
  ('20000000-0000-0000-0000-000000000106','20000000-0000-0000-0000-000000000002','C','Cisatracúrio',false,'Não é o fármaco classicamente contraindicado neste cenário.',3),
  ('20000000-0000-0000-0000-000000000107','20000000-0000-0000-0000-000000000004','A','VT 6-8 ml/kg de peso predito, PEEP individualizada e vigilância de pressão de platô',true,'Representa a essência da ventilação protetora moderna.',1),
  ('20000000-0000-0000-0000-000000000108','20000000-0000-0000-0000-000000000004','B','VT 10-12 ml/kg sem PEEP para evitar hipercapnia',false,'Eleva risco de volutrauma e atelectasia.',2),
  ('20000000-0000-0000-0000-000000000109','20000000-0000-0000-0000-000000000004','C','Frequência respiratória baixa e hipercapnia permissiva sem controle de pressão',false,'Não descreve uma estratégia protetora completa.',3),
  ('20000000-0000-0000-0000-000000000110','20000000-0000-0000-0000-000000000005','A','Bolhas, coágulos ou conexões frouxas no sistema pressurizado',true,'São causas técnicas frequentes de amortecimento da curva.',1),
  ('20000000-0000-0000-0000-000000000111','20000000-0000-0000-0000-000000000005','B','Insuficiência adrenal aguda como causa inicial da alteração da curva',false,'Pode causar hipotensão real, mas não explica curva amortecida isoladamente.',2),
  ('20000000-0000-0000-0000-000000000112','20000000-0000-0000-0000-000000000005','C','Redução inevitável da pressão arterial por anestesia profunda',false,'Antes de tratar clinicamente, é preciso validar a monitorização.',3),
  ('20000000-0000-0000-0000-000000000113','20000000-0000-0000-0000-000000000007','A','Vasoplegia pós circulação extracorpórea',true,'É compatível com vasodilatação importante e necessidade de suporte vasoativo.',1),
  ('20000000-0000-0000-0000-000000000114','20000000-0000-0000-0000-000000000007','B','Tamponamento cardíaco clássico',false,'O padrão não é de baixo enchimento com restrição mecânica dominante.',2),
  ('20000000-0000-0000-0000-000000000115','20000000-0000-0000-0000-000000000007','C','Broncoespasmo isolado',false,'Não explica o perfil hemodinâmico descrito.',3),
  ('20000000-0000-0000-0000-000000000116','20000000-0000-0000-0000-000000000008','A','Reavaliar ritmo, contratilidade, enchimento e considerar inotrópico guiado por contexto hemodinâmico',true,'É a abordagem inicial integrada mais coerente.',1),
  ('20000000-0000-0000-0000-000000000117','20000000-0000-0000-0000-000000000008','B','Retirar todo suporte vasoativo para testar a função cardíaca real',false,'Pode precipitar colapso e não ajuda no tratamento inicial.',2),
  ('20000000-0000-0000-0000-000000000118','20000000-0000-0000-0000-000000000008','C','Hiperventilar agressivamente como medida principal',false,'Não aborda o mecanismo central do baixo débito.',3)
on conflict (id) do nothing;

insert into public.question_assertions (id, question_id, assertion_text, is_true, explanation, display_order)
values
  ('20000000-0000-0000-0000-000000000201','20000000-0000-0000-0000-000000000003','Na via aérea difícil prevista, o plano alternativo deve ser definido antes da indução e comunicado à equipe.',true,'Planejamento verbalizado reduz atraso e improviso diante da falha.',1),
  ('20000000-0000-0000-0000-000000000202','20000000-0000-0000-0000-000000000003','Se a ventilação sob máscara estiver adequada, repetir muitas tentativas idênticas de laringoscopia costuma ser a estratégia mais segura.',false,'Repetição traumática piora edema e reduz chance de sucesso.',2),
  ('20000000-0000-0000-0000-000000000203','20000000-0000-0000-0000-000000000003','A manutenção da oxigenação é prioridade maior do que insistir em uma técnica específica de intubação.',true,'O alvo primário é manter oxigenação e segurança.',3),
  ('20000000-0000-0000-0000-000000000204','20000000-0000-0000-0000-000000000003','Dispositivo supraglótico pode fazer parte do plano de resgate quando a intubação falha e a ventilação está ameaçada.',true,'É componente clássico de planos B/C em via aérea difícil.',4),
  ('20000000-0000-0000-0000-000000000205','20000000-0000-0000-0000-000000000003','A ausência de dessaturação nos primeiros segundos elimina a necessidade de estratégia de resgate invasiva.',false,'A reserva pode acabar rapidamente; o resgate deve continuar planejado.',5),
  ('20000000-0000-0000-0000-000000000206','20000000-0000-0000-0000-000000000006','Em choque séptico com altas doses de vasopressor, linha arterial invasiva antes da indução pode aumentar a segurança do caso.',true,'Permite resposta rápida a oscilações pressóricas e titulação fina.',1),
  ('20000000-0000-0000-0000-000000000207','20000000-0000-0000-0000-000000000006','Zerar o transdutor fora do nível do átrio direito não interfere de maneira relevante na interpretação clínica.',false,'Nivelamento incorreto produz erro sistemático relevante.',2),
  ('20000000-0000-0000-0000-000000000208','20000000-0000-0000-0000-000000000006','Curva muito amortecida pode subestimar a pressão sistólica e superestimar a diastólica.',true,'É o padrão típico de amortecimento excessivo.',3),
  ('20000000-0000-0000-0000-000000000209','20000000-0000-0000-0000-000000000006','Antes de aumentar vasopressor por um traçado estranho, é adequado excluir problemas mecânicos do sistema.',true,'A leitura só é útil se o sistema estiver íntegro.',4),
  ('20000000-0000-0000-0000-000000000210','20000000-0000-0000-0000-000000000006','Em cirurgia de urgência, a linha arterial perde valor porque atrasa o início do procedimento.',false,'Nos pacientes instáveis, ela frequentemente ganha valor justamente no peri-indução.',5),
  ('20000000-0000-0000-0000-000000000211','20000000-0000-0000-0000-000000000009','Antes do desmame da CEC, temperatura, ventilação e ritmo devem estar reavaliados de forma explícita.',true,'Esses itens fazem parte do checklist básico do desmame.',1),
  ('20000000-0000-0000-0000-000000000212','20000000-0000-0000-0000-000000000009','Baixo débito após CEC deve ser atribuído automaticamente à hipovolemia, sem investigação adicional.',false,'Pode envolver disfunção ventricular, isquemia, ritmo e vasoplegia.',2),
  ('20000000-0000-0000-0000-000000000213','20000000-0000-0000-0000-000000000009','Suporte vasoativo e inotrópico deve ser preparado antes da retirada do suporte extracorpóreo.',true,'Antecipação reduz atraso terapêutico em momento crítico.',3),
  ('20000000-0000-0000-0000-000000000214','20000000-0000-0000-0000-000000000009','Problemas de ventilação podem comprometer o desmame e precisam ser corrigidos antes da retirada plena do suporte.',true,'Oxigenação e ventilação inadequadas dificultam estabilidade na transição.',4),
  ('20000000-0000-0000-0000-000000000215','20000000-0000-0000-0000-000000000009','Se a pressão estiver adequada por poucos segundos, não é necessário observar tendência hemodinâmica durante a transição.',false,'A tendência e a sustentação do desempenho são fundamentais.',5)
on conflict do nothing;

insert into public.question_references (id, question_id, citation_label, cited_excerpt, page_or_section)
values
  ('20000000-0000-0000-0000-000000000301','20000000-0000-0000-0000-000000000001','SBA Via Aérea','Preparo, posicionamento e preoxigenação eficaz reduzem dessaturação precoce.','Cap. 4'),
  ('20000000-0000-0000-0000-000000000302','20000000-0000-0000-0000-000000000002','SBA Farmacologia','Queimaduras e denervação aumentam risco de hipercalemia com succinilcolina.','Cap. 7'),
  ('20000000-0000-0000-0000-000000000303','20000000-0000-0000-0000-000000000003','SBA Via Aérea Difícil','Oxigenação e plano alternativo estruturado precedem insistência técnica.','Cap. 6'),
  ('20000000-0000-0000-0000-000000000304','20000000-0000-0000-0000-000000000004','SBA Ventilação','VT ajustado ao peso predito e PEEP titulada são pilares da proteção pulmonar.','Cap. 9'),
  ('20000000-0000-0000-0000-000000000305','20000000-0000-0000-0000-000000000005','SBA Monitorização','Falhas do sistema devem ser excluídas antes de interpretar a linha arterial.','Cap. 11'),
  ('20000000-0000-0000-0000-000000000306','20000000-0000-0000-0000-000000000006','SBA Monitorização Invasiva','Nivelamento, amortecimento e contexto hemodinâmico precisam ser avaliados em conjunto.','Cap. 11'),
  ('20000000-0000-0000-0000-000000000307','20000000-0000-0000-0000-000000000007','SBA Cirurgia Cardíaca','Vasoplegia pós CEC é causa clássica de hipotensão vasodilatadora refratária.','Cap. 18'),
  ('20000000-0000-0000-0000-000000000308','20000000-0000-0000-0000-000000000008','SBA Cirurgia Cardíaca','Baixo débito exige abordagem integrada entre volume, contratilidade e ritmo.','Cap. 18'),
  ('20000000-0000-0000-0000-000000000309','20000000-0000-0000-0000-000000000009','SBA Cirurgia Cardíaca','Desmame da CEC depende de checklist ativo e suporte antecipado.','Cap. 19')
on conflict do nothing;

insert into public.question_tag_links (id, question_id, tag_id)
select seed.id::uuid, seed.question_id::uuid, qt.id
from (
  values
    ('20000000-0000-0000-0000-000000000351','20000000-0000-0000-0000-000000000001','Via aérea'),
    ('20000000-0000-0000-0000-000000000352','20000000-0000-0000-0000-000000000002','Farmacologia'),
    ('20000000-0000-0000-0000-000000000353','20000000-0000-0000-0000-000000000003','Via aérea'),
    ('20000000-0000-0000-0000-000000000354','20000000-0000-0000-0000-000000000004','Ventilação'),
    ('20000000-0000-0000-0000-000000000355','20000000-0000-0000-0000-000000000005','Monitorização'),
    ('20000000-0000-0000-0000-000000000356','20000000-0000-0000-0000-000000000006','Monitorização'),
    ('20000000-0000-0000-0000-000000000357','20000000-0000-0000-0000-000000000007','CEC'),
    ('20000000-0000-0000-0000-000000000358','20000000-0000-0000-0000-000000000008','Cirurgia cardíaca'),
    ('20000000-0000-0000-0000-000000000359','20000000-0000-0000-0000-000000000009','CEC')
) as seed(id, question_id, tag_name)
join public.question_tags qt on qt.name = seed.tag_name
on conflict do nothing;

insert into public.exam_question_links (id, exam_id, question_id, display_order, points)
select
  seed.id::uuid,
  e.id,
  seed.question_id::uuid,
  seed.display_order,
  1
from (
  values
    ('20000000-0000-0000-0000-000000000501','Prova Trimestral ME1','20000000-0000-0000-0000-000000000001',3),
    ('20000000-0000-0000-0000-000000000502','Prova Trimestral ME1','20000000-0000-0000-0000-000000000002',4),
    ('20000000-0000-0000-0000-000000000503','Prova Trimestral ME1','20000000-0000-0000-0000-000000000003',5),
    ('20000000-0000-0000-0000-000000000504','Prova Trimestral ME2','20000000-0000-0000-0000-000000000004',3),
    ('20000000-0000-0000-0000-000000000505','Prova Trimestral ME2','20000000-0000-0000-0000-000000000005',4),
    ('20000000-0000-0000-0000-000000000506','Prova Trimestral ME2','20000000-0000-0000-0000-000000000006',5),
    ('20000000-0000-0000-0000-000000000507','Prova Anual ME3','20000000-0000-0000-0000-000000000007',1),
    ('20000000-0000-0000-0000-000000000508','Prova Anual ME3','20000000-0000-0000-0000-000000000008',2),
    ('20000000-0000-0000-0000-000000000509','Prova Anual ME3','20000000-0000-0000-0000-000000000009',3),
    ('20000000-0000-0000-0000-000000000510','Treino Rápido ME1 · Fundamentos','20000000-0000-0000-0000-000000000001',1),
    ('20000000-0000-0000-0000-000000000511','Treino Rápido ME1 · Fundamentos','20000000-0000-0000-0000-000000000002',2),
    ('20000000-0000-0000-0000-000000000512','Treino Rápido ME1 · Fundamentos','20000000-0000-0000-0000-000000000003',3),
    ('20000000-0000-0000-0000-000000000513','Treino Rápido ME2 · Obstetrícia e Regional','20000000-0000-0000-0000-000000000004',2),
    ('20000000-0000-0000-0000-000000000514','Treino Rápido ME2 · Obstetrícia e Regional','20000000-0000-0000-0000-000000000005',3),
    ('20000000-0000-0000-0000-000000000515','Treino Rápido ME2 · Obstetrícia e Regional','20000000-0000-0000-0000-000000000006',4),
    ('20000000-0000-0000-0000-000000000516','Treino Rápido ME3 · Crises e Casos Complexos','20000000-0000-0000-0000-000000000007',1),
    ('20000000-0000-0000-0000-000000000517','Treino Rápido ME3 · Crises e Casos Complexos','20000000-0000-0000-0000-000000000008',2),
    ('20000000-0000-0000-0000-000000000518','Treino Rápido ME3 · Crises e Casos Complexos','20000000-0000-0000-0000-000000000009',3)
) as seed(id, exam_title, question_id, display_order)
join public.institutions inst on inst.slug = 'cet-hospital-central'
join public.exams e on e.institution_id = inst.id and e.title = seed.exam_title
where not exists (
  select 1
  from public.exam_question_links eql
  where eql.exam_id = e.id
    and eql.question_id = seed.question_id::uuid
)
on conflict (id) do nothing;
