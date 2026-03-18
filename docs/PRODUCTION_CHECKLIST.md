# Production Readiness Checklist

## Infrastructure
- [ ] Projeto Supabase provisionado com URL/anon key reais.
- [ ] Migrações aplicadas (`supabase db push` ou equivalente).
- [ ] Pipeline de deploy (Vercel ou similar) configurado com variáveis.

## Banco
- [ ] Schema completo criado em produção.
- [ ] Dados essenciais (currículo, trilhas, question bank, exames, logbook, emergências) populados por tenant.
- [ ] Usuários e instituições configurados para multi-tenant.

## Auth
- [x] Supabase Auth integra login, sessão e logout com metadata de papel/instituição.
- [ ] Perfis com `role`, `institution_id` e `training_year` validados em produção.

## RLS
- [ ] Políticas de RLS aplicadas e testadas para `content_*`, `procedure_logs`, `ai_generation_jobs`, etc.
- [ ] Auditoria da cobertura editorial/gen AI para garantir bloqueios automáticos.

## Conteúdo
- [ ] Conteúdos pré-anestésico, guias cirúrgicos e currículos carregados com referências.
- [ ] Editorial reviews vinculadas a versões críticas.
- [ ] Módulos de conteúdo exibem status e referências em tempo real.

## IA/Governança
- [x] Jobs de geração, validação e rastreabilidade implementados.
- [ ] IA jobs conectados a fontes reais e validações automáticas de produção.

## Observabilidade
- [ ] Logs/monitoramento das queries Supabase disponíveis (ex: SLO dashboards).
- [ ] Alertas para falhas em validações ou bloqueios críticos.

## Deploy
- [ ] `npm run build` e `npm run start` validados em ambiente de staging.
- [ ] Fluxo de deploy automatizado com rollback documentado.

## Testes
- [x] `npm run lint`.
- [ ] Testes automatizados de ponta a ponta e regressão clínica.

## Segurança
- [ ] Políticas de secrets (env vars) em repositórios/CI.
- [ ] Revisão de RBAC/roles (super_admin/institution_admin/preceptor/trainee) e logs de auditoria.
