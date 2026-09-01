# API Guidelines

Leia `../../AGENTS.md` e `../../docs/architecture/overview.md` antes de alterar esta aplicação.

Use Fastify, Prisma e Zod. Contratos de entrada e saída devem ser explícitos e validados. Rotas que resolvem conteúdo recebem data `YYYY-MM-DD` e timezone explícito; não introduza uma rota `today` como fonte de verdade.

A API deve bloquear `PENDING`, `QUARANTINED` e `REJECTED`. Preserve evidências de validação em vez de recomputar ou ocultar a decisão. Adicione testes de integração para autorização, contrato e elegibilidade de conteúdo.
