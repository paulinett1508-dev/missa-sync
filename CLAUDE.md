# Meu Missal — compatibilidade para Claude Code

`AGENTS.md` é a fonte primária de instruções deste repositório. Leia-o integralmente antes de qualquer alteração e siga a instrução mais próxima da área modificada.

Consulte também:

- `docs/architecture/overview.md` e `docs/architecture/execution-topology.md` para arquitetura;
- `docs/decisions/` para decisões normativas;
- `docs/runbooks/` e `docs/deployment/` para operação;
- `apps/*/AGENTS.md` e `packages/validators/AGENTS.md` para regras locais.

As invariantes fundamentais são data explícita `YYYY-MM-DD`, timezone explícito, evidência auditável e entrega exclusiva de conteúdo `APPROVED` ou `LOCAL_PRIVATE`. Não use este arquivo para duplicar regras globais.

## Curadoria agnostic-core

Este repositório usa o acervo privado [`agnostic-core`](https://github.com/paulinett1508-dev/agnostic-core) como referência de qualidade, não como acervo inteiro. A seleção em `.agnostic-skills` é a fonte do que se aplica ao Meu Missal; os arquivos expostos em `.claude/skills/` são gerados e não devem ser editados manualmente.

Para qualquer alteração visual no PWA, aplicar primeiro `design/sem-cara-de-ia`: decidir uma direção visual específica do produto, reduzir copy óbvia, evitar componentes uniformemente arredondados e apresentar 3 opções distintas (clara/escura) antes de implementar. Mudanças visuais também devem passar pelos gates de acessibilidade, CSS e PWA offline selecionados.
