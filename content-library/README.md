# Biblioteca de Conteúdo

Esta pasta concentra as fontes usadas para apoiar geração e revisão de:

- conteúdo teórico
- lições interativas
- banco de questões
- provas
- emergências
- guias anestésicos

## Estrutura

- `books/`: livros-texto, manuais e obras longas
- `sba/`: matriz curricular, provas-modelo, documentos e materiais ligados à SBA
- `emergencies/`: protocolos, algoritmos, diretrizes e materiais de crise
- `surgery-guides/`: materiais por procedimento, técnica e perioperatório
- `protocols/`: rotinas institucionais, diretrizes internas e fluxos assistenciais
- `questions/`: fontes usadas para derivar treino, provas e revisão
- `references/`: artigos, consensos, revisões, tabelas e materiais auxiliares

## Como usar

1. Coloque os arquivos na subpasta mais adequada ao tipo da fonte.
2. Registre cada fonte em `index.json`.
3. Preencha metadados mínimos:
   - `id`
   - `title`
   - `filePath`
   - `sourceType`
   - `usage`
   - `applicability`
   - `topics`

## Observações

- Um mesmo livro pode servir para `ME1`, `ME2` e `ME3`.
- A separação principal aqui é por tipo de fonte, não por ano.
- O ano é controlado por metadados no índice, não por pasta física.
- PDFs com texto selecionável funcionam melhor do que PDFs escaneados.

## Exemplo de uso editorial

- livro de farmacologia anestésica:
  - `sourceType`: `book`
  - `usage`: `["theory", "questions", "exams"]`
  - `applicability`: `["ME1", "ME2", "ME3"]`

- protocolo institucional de hemorragia maciça:
  - `sourceType`: `protocol`
  - `usage`: `["emergencies", "surgery-guides"]`
  - `applicability`: `["ME2", "ME3"]`

- prova modelo da SBA:
  - `sourceType`: `exam_reference`
  - `usage`: `["exams", "questions"]`
  - `applicability`: `["ME1"]`
