# Auditoria técnica do motor — 14/09/2026

## Resultado e limite da auditoria

Versão de cálculo `audit-2`. Foram corrigidos erros verificáveis de modelagem e removidas seleções sem base suficiente. A aplicação calcula previsões básicas de carga e corrente, mas **não conclui dimensionamento de cabos, proteção ou queda de tensão**. Nenhum status equivale a aprovação para execução.

Esta é uma auditoria de implementação com consulta documental, não uma validação independente por responsável técnico. Não é possível afirmar representação da realidade em 100%: faltam dados físicos, critérios completos e revisão normativa. Os PDFs de Creder e da norma citados pelo README original não estão no repositório e não foram auditados nesta entrega.

## Achados e tratamento

| Achado                                                       | Tratamento                                                                          |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Chuveiro 5500 W / 220 V calculado em 127 V                   | Corrigido: 25 A para ligação FF compatível; tensão do equipamento é usada           |
| W e VA misturados, fator de potência aplicado duas vezes     | Unidade explícita; S=P/fp para W, I=S/V para VA                                     |
| Fator de potência limitado silenciosamente a 0,1             | Removido; aceita fp positivo até 1 e bloqueia dados inválidos                       |
| Sistema trifásico tratado como se toda carga fosse trifásica | Ligação do equipamento explícita; raiz de três só para carga 3F equilibrada         |
| Fases indisponíveis e tensão incompatível                    | Corrente bloqueada e motivo visível                                                 |
| Soma de W e VA rotulada potência instalada                   | Agora soma aritmética das previsões aparentes, distinta de demanda e potência ativa |
| Contagem da cozinha usava o perímetro inteiro                | Divisor 3,5 na previsão básica do guia residencial                                  |
| Tomadas de cozinha consideradas apenas a 100 VA              | Previsão escalonada; valores legados não reduzem a base                             |
| Um circuito TUG misturava todos os ambientes                 | Proposta separada por ambiente; divisão final continua pendente                     |
| Distância fictícia de 10 m para iluminação/TUG               | Distância desconhecida explícita, sem cálculo de queda                              |
| Tabela de ampacidade sem método/material/isolação            | Seleção desativada; lista os dados e critérios faltantes                            |
| Correção térmica linear arbitrária                           | Removida do motor                                                                   |
| Última seção do catálogo retornada mesmo sem atender         | Catálogo demonstrativo removido do caminho de cálculo                               |
| Disjuntor e queda pareciam conclusivos                       | Saídas pendentes até implementar seleção e coordenação verificáveis                 |
| Desequilíbrio escalar incluía fases inexistentes             | Indicador removido; mostra fases disponíveis, sem fingir análise fasorial           |
| Alteração manual permitia contradizer entradas               | Circuitos apresentados como resultados automáticos                                  |
| Arquivos antigos sem unidade e ligação                       | Preservados como legado; não adivinha significado; requer recalcular                |

## Matriz de entradas

| Entrada                             | Efeito atual / limite                                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Tipo residencial                    | Escopo fixo                                                                                                               |
| Sistema e tensões FN/FF             | Fases disponíveis, compatibilidade da ligação e tensão da corrente; topologia completa do fornecimento ainda não modelada |
| Frequência                          | Registrada; sem análise de impedância, harmônicos ou compatibilidade de equipamentos                                      |
| Material, isolação, temperatura     | Registrados; seleção do cabo bloqueada sem catálogo e condições completos                                                 |
| Queda limite                        | Registrada; não verificada sem alimentador, condutor e percurso                                                           |
| Distância do alimentador, expansão  | Registradas; não aplicadas como fator de demanda ou dimensionamento                                                       |
| Nome/tipo/dimensões do cômodo       | Identificação, área e previsão básica de iluminação/TUG                                                                   |
| Perímetro importado                 | Usado na previsão de TUG; dimensões retangulares são usadas na sua ausência                                               |
| Potência nominal das lâmpadas       | Apenas registro, rotulado assim; não substitui luminotécnica ou potência aparente real                                    |
| Quantidade/carga TUG legadas        | Preservadas quando superiores à previsão; não reduzem automaticamente a base                                              |
| Equipamento: potência               | Deve ser potência elétrica de entrada em W; não potência mecânica de saída                                                |
| Equipamento: tensão, fp, quantidade | Corrente e previsão aparente do conjunto                                                                                  |
| Equipamento: ligação                | Monofásica FN/FF ou trifásica equilibrada; padrão monofásico precisa ser confirmado pelo usuário                          |
| Equipamento: distância              | Registrada; zero é pendência, não prova de queda nula                                                                     |
| Ambiente do equipamento             | Identificação por nome; ainda não determina percurso ou condições ambientais                                              |

Valores iniciais e exemplos não são medições. O usuário deve confirmar os dados da residência e das placas. Quantidade maior que um ainda representa uma carga agregada na proposta; a divisão por equipamento precisa de revisão. Os circuitos não representam uma distribuição final aprovada.

## Base documental e rastreabilidade

- [Schneider Electric — Installed apparent power](<https://www.electrical-installation.org/enwiki/Installed_apparent_power_(kVA)>): conversão de potência e corrente; diferença entre soma de previsões e demanda. Consultado em 14/09/2026.
- [Prysmian — Manual de Instalações Elétricas Residenciais](https://br.prysmian.com/sites/default/files/atoms/files/Manual_Prysmian_1_0%20%281%29.pdf), páginas impressas 16–19: previsão básica de iluminação e tomadas. É um guia explicativo, não substitui o texto normativo integral. Inclui condições espaciais que o sistema ainda não verifica.
- [Catálogo oficial ABNT](https://www.abntcatalogo.com.br/): a consulta mostrou NBR 5410:2004 Versão Corrigida:2008. A listagem não substitui acesso ao conteúdo integral nem verificação de todas as normas aplicáveis.
- [Manual Prysmian 2010](https://br.prysmian.com/sites/default/files/atoms/files/Manual_Instalacoes_Eletricas.pdf), p. 47: há divergência entre sua tabela de tomadas e o guia residencial. A tabela antiga não foi usada como base nova.

A implementação usa uma previsão básica, sem alegar cobrir exceções de pequenos ambientes, disposição em bancadas, volumes de banheiro, pontos externos ou alternativas normativas. Os resultados permanecem pendentes. Novos critérios exigem registro de cláusula, edição, condições e revisão técnica.

## Verificação realizada

Casos analíticos cobrem corrente FN/FF/3F, W/VA, fp baixo, incompatibilidades, dados legados, previsão de cargas, estabilidade da geração e ausência de aprovação indevida. Testes no navegador cobrem entradas, resultados automáticos, importação/exportação e relatório em desktop e celular.

Os resultados esperados foram estabelecidos por aritmética e pelas referências consultadas, independentemente da função testada. Isso não constitui revisão independente por outro profissional.

## Trabalho necessário para concluir o dimensionamento

1. Revisar integralmente os critérios aplicáveis com responsável técnico, incluindo exigências da distribuidora.
2. Modelar condições reais: método de instalação, agrupamento, condutores carregados, trajetos, aterramento e curto-circuito presumido.
3. Implementar catálogo rastreável e seleção conjunta por ampacidade, proteção e queda, com rejeição quando nenhum item atender.
4. Calcular alimentador e demanda com critérios adequados, distinguindo reserva de expansão.
5. Verificar proteção contra choques, neutro/PE, DR/DPS e demais requisitos do escopo aprovado.
6. Validar com projetos de referência revisados e limites de aplicação explícitos.
