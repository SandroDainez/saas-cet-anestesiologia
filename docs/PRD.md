# PRD — SaaS CET Anestesiologia

## Visão do produto

Plataforma SaaS multi-institucional, mobile-first, para treinamento, avaliação e acompanhamento dos estagiários de anestesiologia dos CETs.

## Objetivo

Padronizar a formação dos estagiários de anestesiologia com uma plataforma digital que una ensino, avaliação, logbook, autoavaliação, emergências, conteúdo pré-anestésico e guias anestésicos por cirurgia.

## Perfis de usuário

- super_admin
- institution_admin
- coordinator
- preceptor
- trainee ME1
- trainee ME2
- trainee ME3

## Módulos principais

- autenticação
- dashboard do trainee
- dashboard do preceptor
- dashboard do admin institucional
- currículo SBA
- trilhas de estudo
- lições interativas
- banco de questões
- provas trimestrais
- provas anuais
- simulados
- logbook de procedimentos
- validação por preceptor
- autoavaliação
- emergências anestésicas
- pré-anestésico
- guias anestésicos por cirurgia
- analytics
- gestão editorial
- IA com rastreabilidade de fontes

## Requisitos principais

- sistema mobile-first
- multi-tenant por institution_id
- autenticação via Supabase
- conteúdo científico com fontes
- IA sem alucinação
- revisão humana para conteúdo crítico
- versionamento editorial
- deploy na Vercel

## Roadmap

### Fase 1
- base do sistema
- autenticação
- dashboards
- arquitetura multi-tenant

### Fase 2
- currículo SBA
- trilhas de estudo
- lições interativas

### Fase 3
- banco de questões
- provas
- resultados

### Fase 4
- logbook
- autoavaliação
- validação por preceptor

### Fase 5
- emergências
- pré-anestésico
- guias por cirurgia

### Fase 6
- IA com RAG
- gestão editorial
- analytics avançado