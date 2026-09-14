# Manual técnico — DimensionaLar

## Estado atual

O motor `audit-2` calcula previsões básicas de carga e corrente. Condutores, disjuntores, queda de tensão, demanda e alimentador permanecem **pendentes**. Veja a [auditoria técnica](auditoria-tecnica.md) para achados, referências e limitações.

## Potência e corrente

A potência de equipamento é a potência elétrica ativa de entrada em W. Para obter a previsão aparente, S=P/fp. Se o circuito já recebe VA, não se aplica novamente o fator de potência.

- Carga FN ou FF: I=S/V.
- Carga 3F equilibrada: I=S/(√3×VFF).

Uma carga FF usa dois condutores de fase, mas continua monofásica. O sistema global não transforma uma carga monofásica em trifásica. O programa exige tensão nominal compatível com a ligação proposta e bloqueia incompatibilidades. O modelo não determina correntes transitórias, harmônicas ou correntes de fase agregadas por análise fasorial.

## Previsões e circuitos

A previsão por ambiente segue o recorte do guia residencial referenciado na auditoria. Não é potência medida nem cálculo luminotécnico. A soma de VA é apresentada como soma aritmética das previsões, sem confundir com demanda simultânea.

A proposta separa iluminação, TUG por ambiente e equipamentos cadastrados. Os campos do usuário são entradas; circuitos são derivados automaticamente. Distribuição definitiva, balanceamento e condições de uso não foram aprovados.

## Condutor, proteção e queda

As antigas tabelas demonstrativas e a correção térmica arbitrária foram retiradas do cálculo. Sem catálogo validado e condições reais, não há seleção de seção, disjuntor ou cálculo de queda. O relatório informa os dados faltantes em cada circuito.

Material, isolação, temperatura, frequência, expansão, distância do alimentador e limite de queda são registros para a evolução do modelo. Seu preenchimento não conclui as verificações pendentes.

## Status

- **DADOS INCOMPATÍVEIS:** corrente bloqueada por dados ou ligação incompatíveis.
- **DIMENSIONAMENTO PENDENTE:** corrente calculável, porém dimensionamento incompleto.

Nenhum desses estados significa autorização para executar uma instalação.
