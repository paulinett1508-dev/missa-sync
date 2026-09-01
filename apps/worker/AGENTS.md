# Worker Guidelines

Leia `../../AGENTS.md` e `../../docs/runbooks/ingestion.md` antes de alterar esta aplicação.

Use BullMQ para jobs de coleta, normalização e validação. Jobs devem ser idempotentes, com chaves de deduplicação baseadas em dados explícitos, não em `today`. Defina retries apenas para falhas transitórias e registre tentativas, causa e evidência.

O worker nunca promove conteúdo sem uma decisão válida do validador. Preserve snapshots privados e metadados de origem fora do Git. Teste reprocessamento, retry, falha parcial e duplicidade.
