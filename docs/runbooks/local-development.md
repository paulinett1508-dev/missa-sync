# Desenvolvimento local

## Pré-requisitos

Use Node.js 22+, pnpm 10 e Docker Compose.

## Inicialização

```bash
pnpm install
docker compose up -d
pnpm dev
```

## Verificação

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Execute os comandos na raiz do monorepo. Variáveis locais devem derivar de `.env.example`; não registre `.env` no Git. Pare a infraestrutura com `docker compose down` quando não for mais necessária.
