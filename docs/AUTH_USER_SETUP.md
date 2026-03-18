# Guia operacional: criação de usuários no Supabase Auth

Este documento descreve o fluxo mínimo para ativar o seed `supabase/seeds/001_bootstrap.sql` com usuários reais.

## Passo a passo

1. Acesse o painel do Supabase associado ao projeto real.
2. Vá para **Authentication → Users**.
3. Clique em **New User** e insira:
   - `email`: use os e-mails abaixo já referenciados no seed (não altere as strings sem atualizar o SQL).
   - `password`: uma senha segura temporária.
   - `user_metadata`: cole o JSON de metadata (veja a próxima seção).

Repita para cada perfil listado abaixo. O painel gera um UUID (`auth.users.id`) para cada conta.

## Metadata obrigatória por perfil

Cada usuário deve receber pelo menos os campos:

- `role`: código do papel (`institution_admin`, `preceptor`, `trainee_me1`, `trainee_me2`, `trainee_me3`).
- `institution_id`: use `00000000-0000-0000-0000-000000000001` (inserido no seed).
- `institution_name`: `"CET Hospital Central"`.
- `training_year`: para trainees, use `"ME1"`, `"ME2"` ou `"ME3"` conforme aplicável; para outros papéis, mantenha o valor coerente com o metadata (por exemplo, `"ME2"` para o admin institucional).
- `full_name`: nome descritivo do usuário (ex: `"Admin Institucional Demo"`).

### Exemplos

Admin institucional:
```json
{
  "role": "institution_admin",
  "institution_id": "00000000-0000-0000-0000-000000000001",
  "institution_name": "CET Hospital Central",
  "training_year": "ME2",
  "full_name": "Admin Institucional Demo"
}
```

Preceptor:
```json
{
  "role": "preceptor",
  "institution_id": "00000000-0000-0000-0000-000000000001",
  "institution_name": "CET Hospital Central",
  "full_name": "Preceptor Demo"
}
```

Trainee ME1:
```json
{
  "role": "trainee_me1",
  "institution_id": "00000000-0000-0000-0000-000000000001",
  "institution_name": "CET Hospital Central",
  "training_year": "ME1",
  "full_name": "Trainee ME1 Demo"
}
```

Repita o padrão para os trainees ME2 e ME3, ajustando o `training_year` e `role` correspondentes.

## Ligando o seed aos usuários criados

Após criar os usuários no Auth:

1. Copie o UUID exibido pelo Supabase para cada conta.
2. Os `INSERT ... SELECT` do `supabase/seeds/001_bootstrap.sql` consultam `auth.users.email`; portanto, se os e-mails forem mantidos, **não há placeholders no seed para substituir**. Verifique apenas se os e-mails do Auth coincidem com:
   - `admin@cet-demo.org`
   - `preceptor@cet-demo.org`
   - `trainee-me1@cet-demo.org`
   - `trainee-me2@cet-demo.org`
   - `trainee-me3@cet-demo.org`
3. Caso deseje usar outros e-mails, atualize ambos o seed e o documento de metadata para refletir esses valores antes de rodar o seed.

> **Importante**: os UUIDs do Auth aparecem ao lado de cada usuário no painel. Guarde-os se quiser referenciá-los manualmente em outros seeds (ex: `learning_tracks.created_by`), mas não é necessário alterá-los no SQL atual.

## Checklist de validação após o primeiro login

Após criar usuários e rodar o seed:

- [ ] O admin institucional consegue acessar `/dashboard/admin`.
- [ ] O preceptor consegue acessar `/dashboard/preceptor` e ver algum logbook/emergency/task.
- [ ] Cada trainee (ME1/ME2/ME3) consegue entrar em `/dashboard/trainee` e visualizar currículo e trilhas.
- [ ] O middleware redireciona adequadamente quando um usuário tenta acessar uma rota fora do escopo dele.
- [ ] A autenticação reutiliza as metadata definidas no Supabase Auth (confira em `Profiles → user_profiles` e metadata via SQL).

Se qualquer item estiver vermelho, revise os passos acima: e-mails, metadata e o seed dependem do mesmo conjunto de valores.
