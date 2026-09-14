# Migração para React e TypeScript

> Registro histórico da migração inicial. O comportamento atual e a resolução dos achados abaixo estão na [auditoria técnica](auditoria-tecnica.md). Os critérios `prototype-1` foram substituídos por `audit-2`.

## Escopo

As oito etapas, exemplo, edição, importação/exportação JSON, relatório e layout responsivo foram migrados para componentes React. O arquivo `src/app.js` foi substituído por módulos tipados, com build Vite, Bun, Vitest e Playwright. Não há mudança de hospedagem publicada nesta entrega.

## Correções de comportamento

- Adicionar um cômodo atualiza os circuitos imediatamente.
- A importação valida a estrutura e os valores, e preserva os circuitos editados em vez de reconstruí-los.
- Quando nenhum disjuntor do catálogo atende à corrente e à ampacidade corrigida, o resultado é “Não encontrado” / “NECESSITA VERIFICAÇÃO”, em vez de retornar 6 A como se fosse uma seleção válida.
- Uma fase ABC importada distribui a potência entre as três fases no resumo.
- Distância zero permanece zero nas sugestões, sem substituição silenciosa por 10 m.
- Conteúdo do usuário no relatório é escapado; falha de popup permite baixar o HTML.

## Limitações herdadas que exigem revisão elétrica

A migração não valida as fórmulas ou tabelas do protótipo. Estas limitações permanecem explícitas para a próxima etapa:

- A tensão cadastrada por equipamento não é usada na corrente do circuito: o motor conserva a seleção original por sistema/fase.
- As sugestões de TUE transportam potência ativa, enquanto a edição do circuito é rotulada em VA. As unidades e o uso do fator de potência precisam de revisão conjunta.
- O fator trifásico de queda depende do sistema global, sem modelagem completa da ligação de cada circuito.
- A sugestão TUG pode usar fase B em instalação monofásica; não há validação de ligação/fase disponível.
- Quantidade e potência sugeridas de TUG seguem o código original e precisam de revisão normativa.
- Ampacidade e correção térmica são simplificadas; isolação e método de instalação não determinam a tabela.
- A seção não é aumentada automaticamente para corrigir queda de tensão; queda excessiva é sinalizada.
- A margem de expansão e distância do alimentador são registradas, mas não compõem dimensionamento completo do alimentador ou demanda.
- O indicador de desequilíbrio considera as três fases, inclusive quando o sistema não é trifásico.
- Não há dimensionamento completo de PE, neutro, DR, DPS, curto-circuito, eletrodutos ou seletividade.

“ATENDE” descreve apenas os testes simplificados implementados. Não significa projeto apto à execução ou conformidade com uma norma. Os testes automatizados são regressões de software e não substituem revisão técnica.

## Próxima etapa

Definir critérios e casos de referência com revisão técnica antes de ampliar o motor. A arquitetura permite alterar as regras e testar os efeitos sem reescrever a interface. Depois, especificar o editor de planta: escala, medidas, símbolos, pontos, circuitos e trajetos.
