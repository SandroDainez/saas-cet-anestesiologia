-- ====== Supabase Bootstrap Seed (execute after migrations) ======
-- Order of execution:
--   1. Institutions / units
--   2. Roles
--   3. Auth-dependent profiles (requires manual creation of the Auth users listed below)
--   4. Curriculum / learning tracks
--   5. Question bank / exams
--   6. Logbook / emergencies / preanesthetic / surgery guides
--   7. Content management + AI references
--
-- BEFORE RUNNING:
--   Create the following users via Supabase Auth and copy their UUID (auth.users.id) into the metadata shown on the next section.
--     • institutional admin:   admin@cet-demo.org   (metadata role: "institution_admin", training_year: "ME2")
--     • preceptor:            preceptor@cet-demo.org   (role: "preceptor")
--     • trainee ME1:          trainee-me1@cet-demo.org (role: "trainee_me1", training_year: "ME1")
--     • trainee ME2:          trainee-me2@cet-demo.org (role: "trainee_me2", training_year: "ME2")
--     • trainee ME3:          trainee-me3@cet-demo.org (role: "trainee_me3", training_year: "ME3")
--   After the users exist, rerun this seed so the INSERT ... SELECT statements can resolve their UUIDs via auth.users.email.
-- ==================================================================

-- SECTION 1: institution + unit
INSERT INTO public.institutions (id, name, slug, legal_name, status, plan_type)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'CET Hospital Central', 'cet-hospital-central', 'Centro de Educação em Traumas Hospital Central', 'active', 'starter')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status, plan_type = EXCLUDED.plan_type;

INSERT INTO public.institution_units (id, institution_id, name, city, state, type)
VALUES
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'CET Hospital Central - Campus Demo', 'São Paulo', 'SP', 'hospital')
ON CONFLICT (id) DO NOTHING;

-- SECTION 2: roles
INSERT INTO public.roles (id, code, name, description)
VALUES
  ('00000000-0000-0000-0000-000000000010', 'super_admin', 'Super Admin', 'Controle total da plataforma.'),
  ('00000000-0000-0000-0000-000000000011', 'institution_admin', 'Admin Institucional', 'Gerencia usuários e conteúdo por instituição.'),
  ('00000000-0000-0000-0000-000000000012', 'coordinator', 'Coordenador', 'Coordena trilhas e métricas.'),
  ('00000000-0000-0000-0000-000000000013', 'preceptor', 'Preceptor', 'Valida logbook e acompanhamentos.'),
  ('00000000-0000-0000-0000-000000000014', 'trainee_me1', 'Trainee ME1', 'Trainee do primeiro ano.'),
  ('00000000-0000-0000-0000-000000000015', 'trainee_me2', 'Trainee ME2', 'Trainee do segundo ano.'),
  ('00000000-0000-0000-0000-000000000016', 'trainee_me3', 'Trainee ME3', 'Trainee do terceiro ano.')
ON CONFLICT (code) DO NOTHING;

-- SECTION 3: user profiles / roles / trainee/preceptor
INSERT INTO public.user_profiles (id, institution_id, full_name, email)
SELECT u.id, inst.id, 'Admin Institucional Demo', u.email
FROM auth.users u
CROSS JOIN (SELECT id FROM public.institutions WHERE slug = 'cet-hospital-central') inst
WHERE u.email = 'admin@cet-demo.org'
  AND NOT EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = u.id);

INSERT INTO public.user_profiles (id, institution_id, full_name, email)
SELECT u.id, inst.id, 'Preceptor Demo', u.email
FROM auth.users u
CROSS JOIN (SELECT id FROM public.institutions WHERE slug = 'cet-hospital-central') inst
WHERE u.email = 'preceptor@cet-demo.org'
  AND NOT EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = u.id);

INSERT INTO public.user_profiles (id, institution_id, full_name, email)
SELECT u.id, inst.id, 'Trainee ME1 Demo', u.email
FROM auth.users u
CROSS JOIN (SELECT id FROM public.institutions WHERE slug = 'cet-hospital-central') inst
WHERE u.email = 'trainee-me1@cet-demo.org'
  AND NOT EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = u.id);

INSERT INTO public.user_profiles (id, institution_id, full_name, email)
SELECT u.id, inst.id, 'Trainee ME2 Demo', u.email
FROM auth.users u
CROSS JOIN (SELECT id FROM public.institutions WHERE slug = 'cet-hospital-central') inst
WHERE u.email = 'trainee-me2@cet-demo.org'
  AND NOT EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = u.id);

INSERT INTO public.user_profiles (id, institution_id, full_name, email)
SELECT u.id, inst.id, 'Trainee ME3 Demo', u.email
FROM auth.users u
CROSS JOIN (SELECT id FROM public.institutions WHERE slug = 'cet-hospital-central') inst
WHERE u.email = 'trainee-me3@cet-demo.org'
  AND NOT EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = u.id);

-- user roles
INSERT INTO public.user_roles (user_id, role_id, institution_id)
SELECT u.id, r.id, inst.id
FROM auth.users u
JOIN public.roles r ON r.code = 'institution_admin'
CROSS JOIN (SELECT id FROM public.institutions WHERE slug = 'cet-hospital-central') inst
WHERE u.email = 'admin@cet-demo.org'
ON CONFLICT (user_id, role_id, institution_id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id, institution_id)
SELECT u.id, r.id, inst.id
FROM auth.users u
JOIN public.roles r ON r.code = 'preceptor'
CROSS JOIN (SELECT id FROM public.institutions WHERE slug = 'cet-hospital-central') inst
WHERE u.email = 'preceptor@cet-demo.org'
ON CONFLICT (user_id, role_id, institution_id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id, institution_id)
SELECT u.id, r.id, inst.id
FROM auth.users u
JOIN public.roles r ON r.code = 'trainee_me1'
CROSS JOIN (SELECT id FROM public.institutions WHERE slug = 'cet-hospital-central') inst
WHERE u.email = 'trainee-me1@cet-demo.org'
ON CONFLICT (user_id, role_id, institution_id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id, institution_id)
SELECT u.id, r.id, inst.id
FROM auth.users u
JOIN public.roles r ON r.code = 'trainee_me2'
CROSS JOIN (SELECT id FROM public.institutions WHERE slug = 'cet-hospital-central') inst
WHERE u.email = 'trainee-me2@cet-demo.org'
ON CONFLICT (user_id, role_id, institution_id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id, institution_id)
SELECT u.id, r.id, inst.id
FROM auth.users u
JOIN public.roles r ON r.code = 'trainee_me3'
CROSS JOIN (SELECT id FROM public.institutions WHERE slug = 'cet-hospital-central') inst
WHERE u.email = 'trainee-me3@cet-demo.org'
ON CONFLICT (user_id, role_id, institution_id) DO NOTHING;

-- trainee & preceptor profiles
INSERT INTO public.trainee_profiles (user_id, institution_id, trainee_year, enrollment_date, current_status)
SELECT u.id, inst.id, 'ME1', now()::date, 'active'
FROM auth.users u
CROSS JOIN (SELECT id FROM public.institutions WHERE slug = 'cet-hospital-central') inst
WHERE u.email = 'trainee-me1@cet-demo.org'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.trainee_profiles (user_id, institution_id, trainee_year, enrollment_date, current_status)
SELECT u.id, inst.id, 'ME2', now()::date, 'active'
FROM auth.users u
CROSS JOIN (SELECT id FROM public.institutions WHERE slug = 'cet-hospital-central') inst
WHERE u.email = 'trainee-me2@cet-demo.org'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.trainee_profiles (user_id, institution_id, trainee_year, enrollment_date, current_status)
SELECT u.id, inst.id, 'ME3', now()::date, 'active'
FROM auth.users u
CROSS JOIN (SELECT id FROM public.institutions WHERE slug = 'cet-hospital-central') inst
WHERE u.email = 'trainee-me3@cet-demo.org'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.preceptor_profiles (user_id, institution_id, specialty_focus)
SELECT u.id, inst.id, 'Anestesia Regional'
FROM auth.users u
CROSS JOIN (SELECT id FROM public.institutions WHERE slug = 'cet-hospital-central') inst
WHERE u.email = 'preceptor@cet-demo.org'
ON CONFLICT (user_id) DO NOTHING;

-- SECTION 4: currículo SBA + trilhas
INSERT INTO public.curriculum_years (id, code, name, display_order)
VALUES
  ('00000000-0000-0000-0000-000000000011','ME1','Ano 1 – Fundamentos',1),
  ('00000000-0000-0000-0000-000000000012','ME2','Ano 2 – Intermediário',2),
  ('00000000-0000-0000-0000-000000000013','ME3','Ano 3 – Avançado',3)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.curriculum_topics (id, curriculum_year_id, point_number, title, description, display_order)
SELECT '00000000-0000-0000-0000-000000000021', id, 1, 'Manejo básico de vias aéreas', 'Cobertura inicial sobre anatomia e intubação.', 1
FROM public.curriculum_years WHERE code = 'ME1'
ON CONFLICT (curriculum_year_id, point_number) DO NOTHING;

INSERT INTO public.curriculum_topics (id, curriculum_year_id, point_number, title, description, display_order)
SELECT '00000000-0000-0000-0000-000000000022', id, 2, 'Farmacologia anestésica básica', 'Farmacocinética de agentes inalatórios e venosos.', 2
FROM public.curriculum_years WHERE code = 'ME1'
ON CONFLICT (curriculum_year_id, point_number) DO NOTHING;

INSERT INTO public.curriculum_topics (id, curriculum_year_id, point_number, title, description, display_order)
SELECT '00000000-0000-0000-0000-000000000023', id, 1, 'Ventilação mecânica intermediária', 'Parâmetros ventilatórios em pacientes críticos.', 1
FROM public.curriculum_years WHERE code = 'ME2'
ON CONFLICT (curriculum_year_id, point_number) DO NOTHING;

INSERT INTO public.curriculum_topics (id, curriculum_year_id, point_number, title, description, display_order)
SELECT '00000000-0000-0000-0000-000000000024', id, 2, 'Monitorização invasiva', 'Uso de cateter venoso central e artéria.', 2
FROM public.curriculum_years WHERE code = 'ME2'
ON CONFLICT (curriculum_year_id, point_number) DO NOTHING;

INSERT INTO public.curriculum_topics (id, curriculum_year_id, point_number, title, description, display_order)
SELECT '00000000-0000-0000-0000-000000000025', id, 1, 'Anestesia em cirurgia cardíaca', 'Gerenciamento de cirurgias cardíacas.', 1
FROM public.curriculum_years WHERE code = 'ME3'
ON CONFLICT (curriculum_year_id, point_number) DO NOTHING;

INSERT INTO public.learning_tracks (id, institution_id, curriculum_year_id, title, description, track_type)
SELECT '00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000001', id, 'Trilha Básica ME1', 'Fundamentos da anestesia geral.', 'year_based'
FROM public.curriculum_years WHERE code = 'ME1'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.learning_tracks (id, institution_id, curriculum_year_id, title, description, track_type)
SELECT '00000000-0000-0000-0000-000000000032', '00000000-0000-0000-0000-000000000001', id, 'Trilha Intensiva ME2', 'Monitorização avançada.', 'year_based'
FROM public.curriculum_years WHERE code = 'ME2'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.learning_tracks (id, institution_id, curriculum_year_id, title, description, track_type)
SELECT '00000000-0000-0000-0000-000000000033', '00000000-0000-0000-0000-000000000001', id, 'Trilha Avançada ME3', 'Urgências e cardio.', 'year_based'
FROM public.curriculum_years WHERE code = 'ME3'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.learning_modules (id, learning_track_id, curriculum_topic_id, title, module_type, difficulty_level, display_order)
SELECT '00000000-0000-0000-0000-000000000041', lt.id, ct.id, 'Módulo de via aérea', 'lesson', 'basic', 1
FROM public.learning_tracks lt
JOIN public.curriculum_years cy ON cy.code = 'ME1'
JOIN public.curriculum_topics ct ON ct.curriculum_year_id = cy.id AND ct.point_number = 1
WHERE lt.id = '00000000-0000-0000-0000-000000000031'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.learning_modules (id, learning_track_id, curriculum_topic_id, title, module_type, difficulty_level, display_order)
SELECT '00000000-0000-0000-0000-000000000042', lt.id, ct.id, 'Módulo de monitorização', 'lesson', 'intermediate', 1
FROM public.learning_tracks lt
JOIN public.curriculum_years cy ON cy.code = 'ME2'
JOIN public.curriculum_topics ct ON ct.curriculum_year_id = cy.id AND ct.point_number = 2
WHERE lt.id = '00000000-0000-0000-0000-000000000032'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.learning_modules (id, learning_track_id, curriculum_topic_id, title, module_type, difficulty_level, display_order)
SELECT '00000000-0000-0000-0000-000000000043', lt.id, ct.id, 'Módulo cardio', 'lesson', 'advanced', 1
FROM public.learning_tracks lt
JOIN public.curriculum_years cy ON cy.code = 'ME3'
JOIN public.curriculum_topics ct ON ct.curriculum_year_id = cy.id AND ct.point_number = 1
WHERE lt.id = '00000000-0000-0000-0000-000000000033'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.learning_lessons (id, learning_module_id, title, lesson_format, display_order)
VALUES
  ('00000000-0000-0000-0000-000000000051','00000000-0000-0000-0000-000000000041','Lição: Intubação orotraqueal','interactive',1),
  ('00000000-0000-0000-0000-000000000052','00000000-0000-0000-0000-000000000042','Lição: Monitorização invasiva','interactive',1),
  ('00000000-0000-0000-0000-000000000053','00000000-0000-0000-0000-000000000043','Lição: Cirurgia cardíaca','interactive',1)
ON CONFLICT (id) DO NOTHING;

-- SECTION 5: question bank + exams
INSERT INTO public.question_tags (id, name, tag_type)
VALUES
  ('00000000-0000-0000-0000-000000000061','Via aérea','topic'),
  ('00000000-0000-0000-0000-000000000062','Monitorização','topic')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.question_bank (id, institution_id, curriculum_year_id, curriculum_topic_id, title, stem, difficulty, question_type, status)
SELECT '00000000-0000-0000-0000-000000000071', inst.id, cy.id, ct.id, 'Intubação eletiva', 'Paciente com obstrução parcial...', 'medium', 'single_choice', 'published'
FROM public.institutions inst
JOIN public.curriculum_years cy ON cy.code = 'ME1'
JOIN public.curriculum_topics ct ON ct.curriculum_year_id = cy.id AND ct.point_number = 1
WHERE inst.slug = 'cet-hospital-central'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (id, question_id, option_label, option_text, is_correct, display_order)
VALUES
  ('00000000-0000-0000-0000-000000000081','00000000-0000-0000-0000-000000000071','A','Utilizar máscara laríngea',false,1),
  ('00000000-0000-0000-0000-000000000082','00000000-0000-0000-0000-000000000071','B','Intubação orotraqueal após preoxigenação',true,2),
  ('00000000-0000-0000-0000-000000000083','00000000-0000-0000-0000-000000000071','C','Ventilar com bolsa e não intubar',false,3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_tag_links (id, question_id, tag_id)
VALUES
  ('00000000-0000-0000-0000-000000000091','00000000-0000-0000-0000-000000000071','00000000-0000-0000-0000-000000000061')
ON CONFLICT (question_id, tag_id) DO NOTHING;

INSERT INTO public.exams (id, institution_id, curriculum_year_id, title, exam_type, status, duration_minutes, total_questions)
SELECT '00000000-0000-0000-0000-000000000101', inst.id, cy.id, 'Prova Trimestral ME1', 'quarterly', 'open', 60, 10
FROM public.institutions inst
JOIN public.curriculum_years cy ON cy.code = 'ME1'
WHERE inst.slug = 'cet-hospital-central'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.exams (id, institution_id, curriculum_year_id, title, exam_type, status, duration_minutes, total_questions)
SELECT '00000000-0000-0000-0000-000000000102', inst.id, cy.id, 'Simulado Cardiovascular ME3', 'mock', 'open', 90, 12
FROM public.institutions inst
JOIN public.curriculum_years cy ON cy.code = 'ME3'
WHERE inst.slug = 'cet-hospital-central'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.exam_blueprints (id, exam_id, curriculum_topic_id, target_question_count)
SELECT '00000000-0000-0000-0000-000000000111', e.id, ct.id, 6
FROM public.exams e
JOIN public.curriculum_topics ct ON ct.curriculum_year_id = e.curriculum_year_id AND ct.point_number = 1
WHERE e.id = '00000000-0000-0000-0000-000000000101'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.exam_question_links (id, exam_id, question_id, display_order)
VALUES
  ('00000000-0000-0000-0000-000000000121','00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000071',1)
ON CONFLICT (id) DO NOTHING;

-- SECTION 6: logbook
INSERT INTO public.procedure_catalog (id, name, category, complexity_level)
VALUES
  ('00000000-0000-0000-0000-000000000131','Intubação orotraqueal guiada','airway','intermediate')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.procedure_logs (id, institution_id, trainee_user_id, preceptor_user_id, unit_id, procedure_catalog_id, performed_on, trainee_year_snapshot, trainee_role, anesthesia_technique_summary, difficulty_perceived)
SELECT '00000000-0000-0000-0000-000000000141', inst.id, trainee.id, preceptor.id, unit.id, proc.id, now()::date - 5, 'ME1', 'observed', 'RTX + succinilcolina', 'medium'
FROM (SELECT id FROM public.institutions WHERE slug = 'cet-hospital-central') inst
JOIN auth.users trainee ON trainee.email = 'trainee-me1@cet-demo.org'
JOIN auth.users preceptor ON preceptor.email = 'preceptor@cet-demo.org'
JOIN public.institution_units unit ON unit.institution_id = inst.id
JOIN public.procedure_catalog proc ON proc.name = 'Intubação orotraqueal guiada'
WHERE NOT EXISTS (SELECT 1 FROM public.procedure_logs WHERE id = '00000000-0000-0000-0000-000000000141');

INSERT INTO public.procedure_validations (id, procedure_log_id, validator_user_id, validation_status)
SELECT '00000000-0000-0000-0000-000000000151', '00000000-0000-0000-0000-000000000141', validator.id, 'approved'
FROM auth.users validator
WHERE validator.email = 'preceptor@cet-demo.org'
  AND NOT EXISTS (SELECT 1 FROM public.procedure_validations WHERE id = '00000000-0000-0000-0000-000000000151');

INSERT INTO public.procedure_self_assessments (id, procedure_log_id, confidence_level, readiness_level, reflection_text)
VALUES
  ('00000000-0000-0000-0000-000000000161','00000000-0000-0000-0000-000000000141',4,'ready_with_standard_supervision','Conduzi bem a pré-oxigenação.')
ON CONFLICT (id) DO NOTHING;

-- SECTION 7: emergencies
INSERT INTO public.emergency_scenarios (id, institution_id, title, description, category, difficulty_level, universal_access, active)
VALUES
  ('00000000-0000-0000-0000-000000000171','00000000-0000-0000-0000-000000000001','Via aérea difícil em emergência obstétrica','Cenário obstétrico com vias aéreas limitadas.','airway','advanced', true, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.emergency_scenario_steps (id, scenario_id, step_order, step_type, prompt_text)
VALUES
  ('00000000-0000-0000-0000-000000000181','00000000-0000-0000-0000-000000000171',1,'presentation','Paciente com obstrução de vias aéreas.'),
  ('00000000-0000-0000-0000-000000000182','00000000-0000-0000-0000-000000000171',2,'decision','Escolha técnica de via aérea.'),
  ('00000000-0000-0000-0000-000000000183','00000000-0000-0000-0000-000000000171',3,'feedback','Revisar planos alternativos.')
ON CONFLICT (id) DO NOTHING;

-- SECTION 8: preanesthetic
INSERT INTO public.preanesthetic_topics (id, title, category, summary)
VALUES
  ('00000000-0000-0000-0000-000000000191','Jejum pediátrico','fasting','Jejum mínimo de 6 horas para sólidos.')
ON CONFLICT (id) DO NOTHING;

-- SECTION 9: surgery guides
INSERT INTO public.surgery_catalog (id, specialty, procedure_name, complexity_level)
VALUES
  ('00000000-0000-0000-0000-000000000201','general','Colecistectomia eletiva','intermediate')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.surgery_anesthesia_guides (id, surgery_catalog_id, title, specialty, summary, educational_scope_notice, anesthetic_approach_markdown, checklist_jsonb, status)
VALUES
  ('00000000-0000-0000-0000-000000000211','00000000-0000-0000-0000-000000000201','Guia colecistectomia','general','Resumo da colecistectomia.','Conteúdo educacional de referência.','Técnica padrão.',json_build_object('items', ARRAY['Pré-oxigenação','Monitorização']),'approved')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.surgery_guide_variants (id, guide_id, variant_label, content_markdown)
VALUES
  ('00000000-0000-0000-0000-000000000221','00000000-0000-0000-0000-000000000211','Alternativa regional','Bloqueio neuroaxial assistido por ultrassom.')
ON CONFLICT (id) DO NOTHING;

-- SECTION 10: content seeds + AI governance
INSERT INTO public.content_sources (id, title, source_type, publisher, publication_year)
VALUES
  ('00000000-0000-0000-0000-000000000231','Diretrizes SBA 2025','guideline','Sociedade Brasileira de Anestesiologia',2025)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.content_source_sections (id, content_source_id, section_label, excerpt_text)
VALUES
  ('00000000-0000-0000-0000-000000000241','00000000-0000-0000-0000-000000000231','Seção 1','Aborda o manejo de vias aéreas.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.content_items (id, institution_id, content_type, title, slug, editorial_status)
VALUES
  ('00000000-0000-0000-0000-000000000251','00000000-0000-0000-0000-000000000001','lesson','Conteúdo editorial inicial','curriculum-basics','published')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.content_versions (id, content_item_id, version_number, body_markdown, review_status)
VALUES
  ('00000000-0000-0000-0000-000000000261','00000000-0000-0000-0000-000000000251',1,'Conteúdo aprovado para uso.', 'approved')
ON CONFLICT (id) DO NOTHING;

UPDATE public.content_items
SET current_version_id = '00000000-0000-0000-0000-000000000261'
WHERE id = '00000000-0000-0000-0000-000000000251';

INSERT INTO public.content_references (id, content_version_id, content_source_id, citation_label)
VALUES
  ('00000000-0000-0000-0000-000000000271','00000000-0000-0000-0000-000000000261','00000000-0000-0000-0000-000000000231','SBA 2025 - Seção 1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.editorial_reviews (id, content_version_id, reviewer_user_id, decision, comments)
SELECT '00000000-0000-0000-0000-000000000281','00000000-0000-0000-0000-000000000261', reviewer.id, 'approve', 'Conteúdo adequado para ME1.'
FROM auth.users reviewer
WHERE reviewer.email = 'preceptor@cet-demo.org'
  AND NOT EXISTS (SELECT 1 FROM public.editorial_reviews WHERE id = '00000000-0000-0000-0000-000000000281');

INSERT INTO public.ai_prompt_templates (id, name, purpose, version, template_text)
VALUES
  ('00000000-0000-0000-0000-000000000291','Resumo Clínico','Criar resumo de conteúdo','v1','[PROMPT AQUI]')
ON CONFLICT (name, version) DO NOTHING;

INSERT INTO public.ai_generation_jobs (id, institution_id, content_item_id, requested_by, job_type, status, model_name)
SELECT '00000000-0000-0000-0000-000000000301', inst.id, ci.id, requester.id, 'generate_lesson', 'completed', 'gpt-4o'
FROM public.institutions inst
JOIN public.content_items ci ON ci.slug = 'curriculum-basics'
JOIN auth.users requester ON requester.email = 'admin@cet-demo.org'
WHERE NOT EXISTS (SELECT 1 FROM public.ai_generation_jobs WHERE id = '00000000-0000-0000-0000-000000000301');

INSERT INTO public.ai_job_source_links (id, ai_generation_job_id, content_source_id)
VALUES
  ('00000000-0000-0000-0000-000000000311','00000000-0000-0000-0000-000000000301','00000000-0000-0000-0000-000000000231')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.ai_validation_checks (id, ai_generation_job_id, check_type, result, details)
VALUES
  ('00000000-0000-0000-0000-000000000321','00000000-0000-0000-0000-000000000301','citation_presence','pass','Referências presentes.')
ON CONFLICT (id) DO NOTHING;

-- ====== End of seed ======
