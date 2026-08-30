# Meu Missal

Monorepo privado do projeto **Meu Missal** — um PWA offline-first para acompanhamento pessoal da Santa Missa, com sincronismo e validação rigorosa por data litúrgica.

## Estado atual

Esta é a fundação do repositório. O projeto ainda não contém conteúdo litúrgico de terceiros.

## Princípios

- A data `YYYY-MM-DD` é a autoridade principal.
- O frontend só deve apresentar conteúdo com status `APPROVED` ou `LOCAL_PRIVATE`.
- Divergências entre calendário, fontes e conteúdo editorial devem ir para `QUARANTINED`.
- Conteúdo pessoal e dados de fontes externas ficam fora do Git.
- O projeto não terá recursos públicos, multiusuário ou compartilhamento nesta fase.

## Estrutura

```text
apps/        # web, api e worker
packages/    # domain, schemas, collectors, validators, package-builder e shared
infra/       # serviços e infraestrutura local
docs/        # documentação técnica
data/private # dados pessoais não versionados
storage/private # snapshots e pacotes privados não versionados
```

## Stack planejada

- Node.js 22+ e TypeScript
- pnpm workspaces e Turborepo
- React + Vite para o PWA
- Fastify para API
- PostgreSQL + Prisma
- Redis + BullMQ
- Zod, Dexie, Vitest e Playwright

## Primeiros comandos

```bash
pnpm install
docker compose up -d
pnpm dev
```

> Os scripts serão adicionados pelos aplicativos e pacotes durante o scaffold inicial.
