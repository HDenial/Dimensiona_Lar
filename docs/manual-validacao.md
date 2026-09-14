# Manual de validação

Execute `bun run check` para tipos, testes unitários e build. Execute `bun run test:e2e` para o navegador após o build.

## Casos de referência

- Chuveiro de entrada 5500 W, 220 V FF e fp=1: corrente 25 A.
- Carga de 1270 VA em 127 V: 10 A, sem nova divisão pelo fp.
- Carga FN em fornecimento trifásico conserva a fórmula monofásica.
- Carga 3F equilibrada usa a tensão FF e o fator √3.
- Ligação FF em fornecimento monofásico: corrente bloqueada.
- Tensão incompatível, fp inválido ou unidade legada desconhecida: pendência/erro explícito.
- Sala 4×3 m: previsão de iluminação 160 VA e três pontos TUG básicos.
- Cozinha 3×2,5 m: quatro pontos TUG e previsão 1900 VA.
- Seção, disjuntor e queda permanecem pendentes enquanto não houver seleção validada.

## Fluxo de navegador

Percorrer oito etapas; alterar cômodo; conferir recálculo; exportar/importar; gerar relatório; confirmar que não há aprovação indevida. Testar em desktop e celular. Erro de importação não pode apagar os dados atuais.

## Compatibilidade

JSON sem versão ou versão 1 permanece legado, sem inferir unidades ambíguas. A ação de recalcular gera versão 2 a partir das entradas. Importação da versão 2 regenera os resultados e não aceita circuitos derivados adulterados como fonte de verdade.

## Aceite

Os testes verificam software e aritmética. O aceite para dimensionamento real exige os critérios e a revisão independente descritos na [auditoria](auditoria-tecnica.md).
