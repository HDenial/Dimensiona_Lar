# DimensionaLar — projeto acadêmico

Aplicação para apoio ao dimensionamento preliminar de instalações elétricas residenciais. A interface usa React e TypeScript; os cálculos são módulos independentes da interface.

## Como executar

Instale **Bun 1.4.2** ([instruções oficiais](https://bun.com/docs/installation)) e **Node.js 22.23.1** para as ferramentas de teste. As versões utilizadas estão em `.version-control`.

Na pasta do projeto:

```bash
bun install --frozen-lockfile
bun run dev
```

Abra o endereço exibido no terminal (normalmente **http://localhost:5173**) e clique em **Carregar exemplo**. Para encerrar o servidor, pressione `Ctrl+C`.

Após a migração, abrir `index.html` diretamente ou servir o código-fonte com o comando abaixo

`python3 -m http.server 8000 --directory dist --bind 127.0.0.1`

## Comandos

```bash
bun run dev          # desenvolvimento com atualização automática
bun run check        # tipos, testes unitários e build
bun run format       # formatação da base
bun run format:check # verifica a formatação
bunx playwright install chromium # instala navegador para os testes
bun run test:e2e     # testes de navegador; executar build antes
bun run build       # gera dist/
bun run preview     # confere o build localmente
```

Use `bun run test`, não `bun test`: os testes deste projeto usam Vitest. Bun gerencia dependências e executa Vite; Node.js permanece disponível para as ferramentas que o utilizam. Versione `bun.lock` e evite criar lockfiles de outros gerenciadores.

## Estrutura

- `src/App.tsx`: fluxo das oito etapas e estado do projeto.
- `src/features/`: formulários de instalação, cômodos, equipamentos e circuitos.
- `src/components/`: campos e apresentação de resultados compartilhados.
- `src/domain/`: contratos TypeScript, validação de entrada e exemplo.
- `src/calculations/`: motor de cálculo e referências do protótipo, sem React ou DOM.
- `src/io/`: importação/exportação JSON e relatório HTML.
- `src/style.css`: aparência original; novos campos usam CSS Modules.
- `tests/`: testes de navegador em desktop e celular.
- `docs/`: manuais e limitações técnicas.

## Publicação

Execute `bun run build` e publique **o conteúdo de `dist/`** em uma hospedagem estática. Não é necessário backend ou banco de dados para esta versão. `bun run preview` serve para conferir o build, não para operar a hospedagem de produção.

Os projetos ficam na memória da página; exporte JSON antes de fechar ou recarregar. Arquivos legados são preservados, mas seus circuitos ambíguos ficam pendentes até recalcular. Na versão 2, os circuitos são resultados automáticos, regenerados a partir das entradas inclusive na importação.

## Trabalho em equipe

Cada alteração deve passar por revisão de pull request e pela CI de tipos, formatação, testes e build. Regras e testes de cálculo ficam separados dos componentes visuais. Veja [o manual de desenvolvimento](docs/manual-desenvolvimento.md) e [as limitações da migração](docs/migracao.md).

## Importante sobre as referências

O projeto foi estruturado a partir dos materiais fornecidos:

- Guia pedagógico do projeto de extensão.
- Hélio Creder, _Instalações Elétricas_, 16ª ed.
- PDF fornecido da ABNT NBR 5410, identificado no próprio arquivo como NBR 5410:1997.

O livro do Creder consultado menciona prescrições da NBR 5410:2004, enquanto o PDF da norma fornecido é de 1997. Portanto, o protótipo não deve declarar que seus valores são automaticamente a edição vigente. Antes de uso técnico real, as tabelas e critérios devem ser conferidos na edição vigente da norma e nas demais normas aplicáveis.

## Estado da auditoria

Foram corrigidos unidades, tensão, ligação e previsão básica de tomadas. Seleção de cabos, disjuntores e queda de tensão estão pendentes, sem tabelas demonstrativas apresentadas como resultado técnico. Consulte a [auditoria técnica](docs/auditoria-tecnica.md).

## Segurança de uso

Este software é educacional/preliminar. Não substitui projeto elétrico, ART/RRT, análise do local, especificações de fabricante, exigências da distribuidora ou verificação de profissional habilitado.
