# SaaS CET Anestesiologia

Plataforma SaaS multi-institucional para treinamento e avaliação de estagiários de anestesiologia dos CETs.

## Estado atual

Esta etapa entrega a fundação do projeto:

- base Next.js App Router com TypeScript
- Tailwind CSS configurado
- componentes-base no padrão shadcn/ui
- estrutura organizada em `src/app`, `src/components`, `src/features`, `src/lib`, `src/services` e `src/types`
- layout mobile-first
- autenticação inicial com Supabase Auth
- middleware de proteção de rotas
- dashboards iniciais para trainee, preceptor e admin institucional
- suporte inicial a multi-tenant via `institution_id`

Os módulos clínicos completos ainda não foram implementados.

## Objetivo do produto

Padronizar o treinamento dos estagiários de anestesiologia usando uma plataforma digital com:

- trilhas de estudo
- provas trimestrais
- banco de questões
- simulador de emergências
- logbook de procedimentos
- autoavaliação
- módulo pré-anestésico
- guias anestésicos por cirurgia

## Perfis de usuário

- super_admin
- institution_admin
- coordinator
- preceptor
- trainee ME1
- trainee ME2
- trainee ME3

## Stack tecnológica

- Next.js
- TypeScript
- Tailwind
- shadcn/ui
- Supabase
- PostgreSQL
- Vercel

## Arquitetura

Sistema SaaS multi-institucional com isolamento por institution_id.

Nesta fundação:

- o perfil é derivado do usuário autenticado no Supabase
- `role`, `institution_id`, `institution_name` e `training_year` são lidos do metadata do usuário
- o middleware protege `/dashboard/*`
- cada papel é redirecionado para seu dashboard inicial

## Estrutura

```text
src/
  app/          rotas, layouts e páginas
  components/   layout e componentes reutilizáveis
  features/     módulos por domínio funcional
  lib/          helpers, auth e clientes Supabase
  services/     acesso a sessão e regras de navegação
  types/        contratos TypeScript
```

## Alinhamento com o PRD e a arquitetura oficial

- o roadmap do PRD (currículo SBA → trilhas → banco de questões → provas → logbook → emergências → IA) já tem diretórios e serviços base em `src/features` e `src/services/db`.
- a estratégia mobile-first é priorizada nos layouts e componentes, como detalhado em `docs/ARQUITETURA.md`.
- a governança de IA exige fontes, revisão e versionamento (veja `docs/IA_GOVERNANCA.md`) e o schema contempla `content_sources`, `content_versions`, `ai_generation_jobs` e políticas RLS.
- o projeto segue a lógica multi-tenant (middleware, `institution_id` na metadata e filtros das queries ao consumir o schema).

## Supabase schema e tipos

- `supabase/migrations/001_initial_schema.sql` implementa funções utilitárias, enums, tabelas, triggers e políticas RLS citadas no PRD.
- `src/types/database.ts` mapeia os principais domínios (currículo, trilhas, questões, provas, logbook, emergências, IA) com tipagem forte para o frontend.
- `src/services/db/modules.ts` prepara queries essenciais e contadores por tenant para alimentar os dashboards e futuras visualizações.

## Bases dos módulos principais

- `src/features/curriculum`: currículo SBA e tópicos por ano.
- `src/features/learning-tracks`: trilhas, módulos e lições com progresso.
- `src/features/question-bank`: banco de questões com tags, referências e tentativas.
- `src/features/exams`: provas e simulados trimestrais/anuais.
- `src/features/logbook`: registro de procedimentos, validações e autoavaliações.
- `src/features/emergencies`: cenários e tentativas de emergências anestésicas.

## Currículo SBA e trilhas

- `/curriculum`: visão geral dos anos ME1/ME2/ME3 com tópicos e navegação.
- `/curriculum/[year]`: listagem dos tópicos oficiais por ano.
- `/curriculum/topic/[topicId]`: detalhe do tópico com subitens.
- `/trilhas`: visão das trilhas de estudo por ano.
- `/trilhas/[year]`: trilhas por ano com acesso aos módulos.
- `/trilhas/track/[trackId]`: módulos e lições de uma trilha específica.
- `/trilhas/lesson/[lessonId]`: lição interativa com passos guiados e mock coerente com o currículo.

## Setup

1. Instale as dependências:

```bash
npm install
```

2. Crie o arquivo de ambiente:

```bash
cp .env.example .env.local
```

3. Preencha as variáveis do Supabase em `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

4. Rode o projeto:

```bash
npm run dev
```

5. Acesse `http://localhost:3000`.

## Migrations e dados iniciais

1. Aplique o schema no Supabase real:
   ```bash
   npx supabase db push
   ```
2. Crie manualmente os usuários mencionados em `supabase/seeds/001_bootstrap.sql` (admin, preceptor, trainees) usando o painel Auth, garantindo metadata com `role`, `institution_id` (use `00000000-0000-0000-0000-000000000001`), `training_year` e `institution_name`. Consulte o [guia operacional de usuários](docs/AUTH_USER_SETUP.md) para exemplos de metadata e checklist pós-login.
3. Rode o seed bootstrap para popular os domínios iniciais:
   ```bash
   npx supabase db seed --file supabase/seeds/001_bootstrap.sql
   ```
   Ele depende dos usuários criados no passo 2 para preencher profiles, roles e logbook. Ao final, valide o checklist listado no guia citado acima.

## Configuração de Auth no Supabase

Para a base atual funcionar como esperado, configure os usuários com metadata semelhante a este:

```json
{
  "role": "institution_admin",
  "institution_id": "00000000-0000-0000-0000-000000000001",
  "institution_name": "CET Hospital Central",
  "training_year": "ME2",
  "full_name": "Nome do Usuario"
}
```

Papéis aceitos:

- `super_admin`
- `institution_admin`
- `coordinator`
- `preceptor`
- `trainee_me1`
- `trainee_me2`
- `trainee_me3`

Mapeamento inicial dos dashboards:

- `trainee_me1`, `trainee_me2`, `trainee_me3` -> `/dashboard/trainee`
- `preceptor` -> `/dashboard/preceptor`
- `institution_admin`, `coordinator`, `super_admin` -> `/dashboard/admin`

### Metadata obrigatória

- `role`, `institution_id`, `institution_name` e `training_year` são lidos do metadata do usuário.
- `training_year` também pode ser inferido do papel (ME1/ME2/ME3), mas sempre mantenha a informação consistente.
- O middleware protege `/dashboard`, `/reports`, `/curriculum`, `/trilhas`, `/question-bank`, `/exams`, `/logbook`, `/emergencies`, `/preanesthetic`, `/surgery-guides`, `/content-management` e `/ai` e redireciona conforme o escopo do usuário.
- Cada perfil autêntico recebe cookies de Supabase Auth, o `AuthForm` do login grava a sessão e o `LogoutButton` limpa a sessão.

## Supabase e Multi-tenant

- `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` precisam estar definidos no `.env.local` (e o projeto deve rodar com esses valores reais).
- Rode as migrations do Supabase (ex: `npx supabase db push` ou `supabase db push`) para criar o schema multi-tenant do projeto antes de consumir os módulos.
- O backend usa `createServerClient` (que respeta cookies) e `getSessionProfile` para ler o usuário atual; todas as queries relevantes aplicam `institution_id` automaticamente.
- As políticas RLS do schema (`content_items`, `procedure_logs`, `question_bank`, `ai_generation_jobs`, `editorial_reviews`, etc.) devem garantir que cada usuário só veja dados da sua instituição.
- O módulo de analytics (`/reports`) usa o mesmo `institution_id` para montar métricas específicas por tenant, e o `content-management`/`AI` ficam bloqueados até o conteúdo crítico ser aprovado manualmente.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run typecheck`

## Próximas fases

- currículo SBA e trilhas de estudo
- avaliações e banco de questões
- logbook e validação por preceptor
- simulações
- conteúdo clínico com governança editorial e científica

## Conteúdo científico

Todo conteúdo clínico deve:

- ter fonte científica
- ter revisão editorial
- não ser inventado por IA
