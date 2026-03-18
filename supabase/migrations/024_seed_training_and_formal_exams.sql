insert into public.exams (
  institution_id,
  curriculum_year_id,
  title,
  description,
  exam_type,
  status,
  duration_minutes,
  total_questions,
  passing_score
)
select
  i.id,
  cy.id,
  seed.title,
  seed.description,
  seed.exam_type::public.exam_type_enum,
  'published'::public.exam_status,
  seed.duration_minutes,
  seed.total_questions,
  seed.passing_score
from public.institutions i
cross join (
  values
    ('ME1', 'Prova Trimestral ME1', 'Prova formal trimestral com 50 questões cobrindo fundamentos do primeiro ano.', 'quarterly', 90, 50, 70),
    ('ME2', 'Prova Trimestral ME2', 'Prova formal trimestral com 50 questões cobrindo regional, obstetrícia e monitorização.', 'quarterly', 100, 50, 70),
    ('ME3', 'Prova Anual ME3', 'Prova formal anual com 100 questões e integração de casos complexos do terceiro ano.', 'annual', 180, 100, 75),
    ('ME1', 'Treino Rápido ME1 · Fundamentos', 'Prova curta de treinamento com 12 questões para revisão diária.', 'training_short', 18, 12, 65),
    ('ME2', 'Treino Rápido ME2 · Obstetrícia e Regional', 'Prova curta de treinamento com 10 questões para revisão dirigida.', 'training_short', 16, 10, 65),
    ('ME3', 'Treino Rápido ME3 · Crises e Casos Complexos', 'Prova curta de treinamento com 15 questões para consolidação clínica.', 'training_short', 22, 15, 65)
) as seed(year_code, title, description, exam_type, duration_minutes, total_questions, passing_score)
join public.curriculum_years cy on cy.code = seed.year_code::public.trainee_year_code
where i.slug = 'cet-hospital-central'
  and not exists (
    select 1 from public.exams e
    where e.institution_id = i.id
      and e.title = seed.title
  );
