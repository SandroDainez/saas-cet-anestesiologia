# Arquitetura do Sistema

## Stack principal

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase Edge Functions
- Vercel
- GitHub Actions

## Estrutura do projeto

- src/app
- src/components
- src/features
- src/lib
- src/services
- src/types

## Estratégia mobile-first

O sistema deve ser desenhado primeiro para celular, com navegação simples, telas leves e excelente experiência para uso hospitalar.

## Multi-tenant

O sistema é SaaS multi-institucional.

Cada instituição deve ser isolada por `institution_id`.

Regras:
- usuários pertencem a uma instituição
- dados institucionais são filtrados por institution_id
- conteúdo global pode ser compartilhado
- RLS deve proteger o acesso no banco

## Banco de dados

Banco em PostgreSQL via Supabase.

Principais grupos de tabelas:
- instituições
- usuários e perfis
- currículo SBA
- trilhas e lições
- banco de questões
- provas
- emergências
- logbook
- autoavaliação
- pré-anestésico
- guias por cirurgia
- conteúdo editorial
- fontes científicas
- IA e auditoria

## Supabase

Responsável por:
- autenticação
- banco de dados
- RLS
- storage
- funções backend

## GitHub

Responsável por:
- versionamento
- branches
- histórico do projeto
- CI/CD com GitHub Actions

## Vercel

Responsável por:
- deploy do frontend
- preview deploy
- ambiente de produção

## Princípios técnicos

- código limpo
- forte tipagem
- componentes reutilizáveis
- separação por domínio
- validação com zod
- formulários com react-hook-form
- suporte a crescimento modular