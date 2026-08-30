# Meu Missal — Instruções para agentes de código

## Contexto

`missa-sync` é o monorepo privado do aplicativo pessoal **Meu Missal**: um PWA offline-first para acompanhamento da Santa Missa. O sistema evoluirá para sincronizar conteúdo por data litúrgica, com validação rígida antes de qualquer exibição no aplicativo.

## Limites de privacidade e conteúdo

- Este projeto é privado e pessoal nesta fase.
- Não implementar compartilhamento público, catálogo público, pagamentos, SaaS, recursos multiusuário ou endpoints de conteúdo sem autenticação.
- Não adicionar ao Git textos integrais ou conteúdo protegido de terceiros.
- Versionar apenas schemas, tipos, fixtures sintéticas e exemplos reduzidos.
- Dados pessoais, snapshots externos e conteúdo privado devem usar `data/private/`, `storage/private/` ou `.local/`; esses locais são ignorados pelo Git.
- Não criar automações para contornar autenticação, paywall, CAPTCHA, bloqueios técnicos ou termos de fontes externas.

## Regra de negócio inegociável

A data é a autoridade principal.

- Toda operação de conteúdo deve receber uma data explícita `YYYY-MM-DD`.
- Não usar um endpoint `today` como verdade de negócio.
- Modelar e testar timezone, dia da semana, tempo litúrgico, cor, celebração, precedência, ciclo e leituras.
- O frontend só pode exibir conteúdo com status `APPROVED` ou `LOCAL_PRIVATE`.
- Divergências devem gerar `QUARANTINED`; divergência de Evangelho deve bloquear publicação.

## Arquitetura desejada

```text
apps/
  web/                  # React + Vite + PWA + Dexie
  api/                  # Fastify + Prisma
  worker/               # BullMQ e jobs de ingestão/validação
packages/
  domain/               # tipos e regras de negócio
  schemas/              # schemas Zod
  collectors/           # contratos/adaptadores de fontes
  validators/           # validação determinística
  package-builder/      # pacotes offline assinados
  shared/               # utilitários sem regra de domínio
infra/
docs/
```

## Stack obrigatória

- Node.js 22+, TypeScript strict, pnpm e Turborepo
- React, Vite, React Router, TanStack Query, Zustand e Dexie no frontend
- Fastify, Prisma, PostgreSQL, Redis, BullMQ e Zod no backend
- Vitest para unit/integration tests e Playwright para E2E
- Docker Compose para ambiente local

## Convenções de implementação

- Preferir funções pequenas, puras e testáveis.
- Não usar `any`; use `unknown` e valide com Zod.
- Centralizar tipos do domínio em `packages/domain`.
- Validar dados externos antes de persistir.
- Salvar evidências de coleta, hash, origem, data e versão de parser.
- Não publicar ou disponibilizar conteúdo que esteja em `PENDING`, `QUARANTINED` ou `REJECTED`.
- Cada mudança estrutural precisa incluir testes e documentação quando aplicável.

## Próxima implementação

Criar o scaffold completo do monorepo: `apps/web`, `apps/api`, `apps/worker`, todos os `packages` listados, Prisma, Docker Compose, schemas Zod, tipos do domínio, um validador inicial de data e uma rota `GET /health` e `GET /v1/day/:date`.
