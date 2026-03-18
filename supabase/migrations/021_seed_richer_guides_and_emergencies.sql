insert into public.surgery_catalog (specialty, procedure_name, procedure_group, complexity_level, active)
values
  ('general', 'Apendicectomia laparoscópica', 'abdome agudo', 'intermediate', true),
  ('obstetric', 'Cesárea em pré-eclâmpsia leve', 'obstetrícia', 'intermediate', true),
  ('urology', 'Ressecção transuretral de próstata', 'urologia', 'advanced', true)
on conflict (specialty, procedure_name) do update
set procedure_group = excluded.procedure_group,
    complexity_level = excluded.complexity_level,
    active = excluded.active;

with selected_surgeries as (
  select id, specialty, procedure_name
  from public.surgery_catalog
  where (specialty, procedure_name) in (
    ('general', 'Apendicectomia laparoscópica'),
    ('obstetric', 'Cesárea em pré-eclâmpsia leve'),
    ('urology', 'Ressecção transuretral de próstata')
  )
)
insert into public.surgery_anesthesia_guides (
  surgery_catalog_id,
  title,
  specialty,
  summary,
  educational_scope_notice,
  preop_considerations_markdown,
  monitoring_markdown,
  anesthetic_approach_markdown,
  medication_strategy_markdown,
  analgesia_plan_markdown,
  postop_plan_markdown,
  risks_and_pitfalls_markdown,
  checklist_jsonb,
  status
)
select
  s.id,
  guide_data.title,
  s.specialty,
  guide_data.summary,
  guide_data.educational_scope_notice,
  guide_data.preop_considerations_markdown,
  guide_data.monitoring_markdown,
  guide_data.anesthetic_approach_markdown,
  guide_data.medication_strategy_markdown,
  guide_data.analgesia_plan_markdown,
  guide_data.postop_plan_markdown,
  guide_data.risks_and_pitfalls_markdown,
  guide_data.checklist_jsonb,
  guide_data.status::public.editorial_status
from selected_surgeries s
join (
  values
    (
      'Apendicectomia laparoscópica',
      'Apendicectomia laparoscópica',
      'Anestesia geral balanceada com sequência rápida quando houver abdome agudo e maior risco de aspiração.',
      'Conteúdo educacional com foco em técnica recomendada, monitorização, drogas usuais e profilaxias relevantes.',
      'Avaliar risco de aspiração, estado volêmico, sepse abdominal, função renal e necessidade de antibiótico pré-incisão.',
      'Monitorização mínima: ECG, PANI, oximetria, capnografia, temperatura e análise de gases. Considerar linha arterial se instabilidade ou sepse.',
      'Técnica principal: anestesia geral balanceada com propofol, opioide, bloqueador neuromuscular e ventilação protetora. Em alto risco de aspiração, sequência rápida.',
      'Cefazolina profilática, propofol 1,5-2,5 mg/kg, fentanil 1-2 mcg/kg, rocurônio 0,9-1,2 mg/kg e vasopressores titulados conforme resposta hemodinâmica.',
      'Analgesia multimodal com dipirona, paracetamol, AINE se permitido e TAP block quando necessário. Profilaxia de PONV conforme risco.',
      'Manter vigilância de dor, náusea, distensão abdominal, diurese e sinais de sepse residual no pós-operatório imediato.',
      'Riscos principais: aspiração, hipotensão pós-indução em séptico, ventilação inadequada sob pneumoperitônio e analgesia insuficiente.',
      jsonb_build_object(
        'objectives', jsonb_build_array('Controlar dor com baixa exposição a opioides', 'Assegurar indução segura', 'Prevenir PONV'),
        'alternatives', jsonb_build_array('TAP block bilateral', 'Plano de resgate hemodinâmico intensificado'),
        'entries', jsonb_build_array(
          jsonb_build_object('label', 'Jejum e risco de aspiração revisados'),
          jsonb_build_object('label', 'Antibioticoprofilaxia alinhada'),
          jsonb_build_object('label', 'Analgesia multimodal planejada')
        ),
        'metadata', jsonb_build_object(
          'contexts', jsonb_build_array('elective', 'inpatient'),
          'patient_types', jsonb_build_array('adult'),
          'suggested_years', jsonb_build_array('ME2', 'ME3'),
          'confidence_level', 'high'
        )
      ),
      'published'
    ),
    (
      'Cesárea em pré-eclâmpsia leve',
      'Cesárea em pré-eclâmpsia leve',
      'Guia com foco em técnica neuraxial, hemodinâmica materna, antiemese, hemorragia e analgesia pós-operatória.',
      'Conteúdo educacional para suporte à decisão. Sempre compatibilizar com protocolo obstétrico local.',
      'Avaliar PA, plaquetas, função hepática, proteinúria, jejum, risco de aspiração e disponibilidade de hemoderivados.',
      'Monitorização mínima: ECG, PANI frequente, oximetria e temperatura. Considerar cateter arterial quando houver labilidade hemodinâmica relevante.',
      'Técnica principal: raquianestesia com bupivacaína hiperbárica e opioide intratecal, associada a fenilefrina titulada e deslocamento uterino.',
      'Cefazolina profilática, antiácido, antiemético e fenilefrina em bolus ou infusão. Preparar ácido tranexâmico e uterotônicos conforme risco.',
      'Morfina intratecal, dipirona, paracetamol, AINE se permitido e TAP block em cenários selecionados. Profilaxia de PONV e trombose conforme risco.',
      'Seguir vigilância intensiva de PA, perda sanguínea, dor, diurese, náusea e sinais respiratórios maternos no pós-parto.',
      'Armadilhas principais: hipotensão pós-raqui, hemorragia, falha do neuroeixo e necessidade de conversão rápida para anestesia geral.',
      jsonb_build_object(
        'objectives', jsonb_build_array('Estabilizar hemodinâmica materna', 'Garantir analgesia efetiva', 'Antecipar hemorragia'),
        'alternatives', jsonb_build_array('Técnica combinada', 'Anestesia geral planejada'),
        'entries', jsonb_build_array(
          jsonb_build_object('label', 'Plano de hemorragia obstétrica disponível'),
          jsonb_build_object('label', 'Vasopressor preparado'),
          jsonb_build_object('label', 'Profilaxias maternas alinhadas')
        ),
        'metadata', jsonb_build_object(
          'contexts', jsonb_build_array('urgent', 'inpatient'),
          'patient_types', jsonb_build_array('obstetric'),
          'suggested_years', jsonb_build_array('ME2', 'ME3'),
          'confidence_level', 'high'
        )
      ),
      'published'
    ),
    (
      'Ressecção transuretral de próstata',
      'Ressecção transuretral de próstata',
      'Guia para paciente urológico idoso com ênfase em técnica neuraxial, fluídos, síndrome da RTU e estabilidade hemodinâmica.',
      'Conteúdo educacional de apoio. Doses e escolhas finais devem respeitar o perfil do paciente e o protocolo institucional.',
      'Revisar sódio basal, função renal, anticoagulação, cardiopatia, fragilidade e risco de sobrecarga volêmica.',
      'Monitorização mínima: ECG, PANI, oximetria e temperatura. Considerar linha arterial em idosos frágeis ou ressecções longas.',
      'Técnica principal: raquianestesia com nível sensorial adequado, mantendo possibilidade de reconhecer sintomas precoces de síndrome da RTU.',
      'Sedação mínima titulada. Antibioticoprofilaxia conforme protocolo urológico. Vasopressores e manejo de fluidos ajustados ao idoso.',
      'Dor geralmente moderada; usar dipirona, paracetamol e opioide apenas se necessário. Profilaxias: antibiótico, hipotermia, PONV conforme risco.',
      'No pós-operatório, vigiar sangramento urinário, sódio, diurese, consciência e estabilidade hemodinâmica.',
      'Armadilhas principais: síndrome da RTU, sobrecarga hídrica, sangramento, hipotermia e subtratamento da fragilidade.',
      jsonb_build_object(
        'objectives', jsonb_build_array('Detectar síndrome da RTU', 'Manter segurança hemodinâmica', 'Minimizar agressão fisiológica'),
        'alternatives', jsonb_build_array('Anestesia geral balanceada', 'Raqui com sedação mínima'),
        'entries', jsonb_build_array(
          jsonb_build_object('label', 'Sódio e função renal revisados'),
          jsonb_build_object('label', 'Estratégia de fluidos definida'),
          jsonb_build_object('label', 'Plano de vigilância pós-op alinhado')
        ),
        'metadata', jsonb_build_object(
          'contexts', jsonb_build_array('elective', 'inpatient'),
          'patient_types', jsonb_build_array('adult'),
          'suggested_years', jsonb_build_array('ME2', 'ME3'),
          'confidence_level', 'high'
        )
      ),
      'published'
    )
) as guide_data(
  procedure_name,
  title,
  summary,
  educational_scope_notice,
  preop_considerations_markdown,
  monitoring_markdown,
  anesthetic_approach_markdown,
  medication_strategy_markdown,
  analgesia_plan_markdown,
  postop_plan_markdown,
  risks_and_pitfalls_markdown,
  checklist_jsonb,
  status
) on guide_data.procedure_name = s.procedure_name
where not exists (
  select 1 from public.surgery_anesthesia_guides g
  where g.surgery_catalog_id = s.id
    and g.title = guide_data.title
);

insert into public.emergency_scenarios (title, description, category, difficulty_level, universal_access, active)
values
  ('Toxicidade sistêmica de anestésico local', 'Paciente evolui com zumbido, convulsão e colapso circulatório após bloqueio regional.', 'regional', 'advanced', true, true),
  ('Hipertermia maligna', 'Rigidez, hipercarbia e instabilidade após agente halogenado/succinilcolina.', 'other', 'advanced', true, true),
  ('Broncoespasmo perioperatório grave', 'Aumento da pressão de vias aéreas, sibilância e dessaturação após manipulação da via aérea.', 'respiratory', 'advanced', true, true)
on conflict do nothing;
