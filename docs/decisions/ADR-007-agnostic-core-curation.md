# ADR-007 — Curadoria do agnostic-core

## Status

Aceita

## Contexto

O Meu Missal precisa de um olhar consistente para produto, frontend, PWA offline, segurança e operação sem carregar um acervo genérico inteiro em cada sessão de desenvolvimento. O projeto é privado e pessoal, portanto a curadoria deve preservar a fronteira de conteúdo privado e não introduzir integrações externas.

## Decisão

O repositório incorpora `agnostic-core` como submódulo em `.agnostic-core`. O arquivo `.agnostic-skills` seleciona apenas as skills pertinentes à aplicação: design sem aparência genérica de IA, qualidade de interface, acessibilidade, React/PWA, contratos de API, dados, testes, segurança, auditoria e deploy.

`.claude/skills/` é uma camada gerada pelo script do submódulo. A fonte de verdade é sempre o submódulo e a lista de seleção; não editar arquivos gerados isoladamente.

Alterações visuais devem seguir `design/sem-cara-de-ia`, incluindo exploração de três direções visuais distintas antes da implementação. A aplicação dessa referência não autoriza scraping, fonte externa, conteúdo litúrgico integral ou alteração da topologia de produção.

## Consequências

- O agente recebe orientações específicas para o PWA, em vez de skills irrelevantes.
- Atualizações do acervo podem ser auditadas pelo diff do submódulo e regeneradas de forma determinística.
- A curadoria precisa ser revisada quando a stack ou o fluxo offline mudar.
- O acervo não é runtime e não deve ser publicado na imagem de produção.
