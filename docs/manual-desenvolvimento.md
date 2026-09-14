# Manual de desenvolvimento — DimensionaLar

## Arquitetura

Aplicação React com TypeScript estrito e Vite, publicada como arquivos estáticos. Bun gerencia dependências e executa os scripts de desenvolvimento. Node.js é usado pelas ferramentas que possuem esse requisito, como a execução configurada do Vitest e Playwright.

O estado de `Project` é mantido em `App.tsx` com atualizações imutáveis. Componentes recebem dados e callbacks; não há variáveis globais nem handlers HTML inline. O motor de cálculo recebe `Circuit` e `Installation` explicitamente e não importa React, APIs de navegador ou Bun. As sugestões usam IDs determinísticos derivados das entradas.

## Responsabilidades

- `domain/project.ts`: schemas Zod e tipos inferidos; é o contrato compartilhado da equipe.
- `domain/example.ts`: dados de demonstração.
- `calculations/reference.ts`: referências numéricas herdadas e sua versão.
- `calculations/engine.ts`: iluminação, TUG, sugestões, corrente, seção, proteção e queda.
- `features/`: componentes por etapa funcional.
- `components/`: campos acessíveis e tabela compartilhada de resultados.
- `io/project.ts`: leitura validada, serialização e download.
- `io/report.tsx`: relatório escapado pelo React; carregado sob demanda.

O CSS original foi preservado para evitar uma reformulação visual durante a migração. Novos estilos de componentes devem preferir arquivos `.module.css`.

## Contratos e dados

O JSON novo contém `schemaVersion: 2`, instalação, cômodos, equipamentos, circuitos e etapa. Circuitos possuem unidade, tensão e ligação explícitas. Arquivos versão 1 ou sem versão são preservados como legados, sem inferir unidades. Na versão 2, a importação regenera os circuitos a partir das entradas. Arquivos inválidos não substituem o estado atual.

Números devem ser finitos, tensões e dimensões positivas, potências e distâncias não negativas, quantidades inteiras e fatores de potência entre 0 e 1 (exclusivo em zero). Os campos permitem digitação intermediária e restauram o último valor válido ao perder foco.

Alterar cômodos, equipamentos ou instalação regenera as sugestões. Circuitos são resultados sem edição manual. Não há salvamento automático: exporte antes de recarregar.

## Colaboração

Divida as tarefas por funcionalidade e mantenha regras elétricas no motor. Mudanças nos contratos devem ser combinadas com os responsáveis pelos componentes consumidores. Use branches curtas, revisão de pull requests e o mesmo `bun.lock`.

Antes de abrir um PR:

```bash
bun run format
bun run check
bun run test:e2e
```

Para preparar os testes de navegador pela primeira vez: `bunx playwright install chromium`. Em Linux, dependências de sistema podem ser instaladas com `bunx playwright install --with-deps chromium`.

A CI repete essas verificações em desktop e viewport móvel. Os testes comprovam comportamento de software; não certificam engenharia ou conformidade normativa.

## Referências elétricas

A versão `audit-2` identifica o motor revisado; `reference.ts` registra fontes, não um catálogo de ampacidade. Novas tabelas devem registrar fonte, edição, seção/tabela, condições de aplicação, data e responsável pela validação. Não espalhe constantes normativas pela interface.

As limitações conhecidas estão em `migracao.md`. A evolução deve incluir validação normativa, unidades de potência explícitas, tensão e ligação por circuito, método de instalação, agrupamento, neutro/PE e proteção. O futuro editor deve consumir o mesmo contrato de projeto e motor.

## Backend e publicação

O build produz `dist/`, publicável em hospedagem estática. Para contas e projetos na nuvem, introduza uma camada de persistência e API; os componentes não devem acessar SQL diretamente. Nenhum backend ou editor de planta foi incluído nesta migração.
