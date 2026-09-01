# Validator Guidelines

Leia `../../AGENTS.md`, `../../docs/decisions/ADR-001-date-authoritative.md` e `../../docs/decisions/ADR-002-content-status.md` antes de alterar este pacote.

Validadores são determinísticos, puros sempre que possível e não acessam relógio implícito ou rede. Toda entrada inclui `YYYY-MM-DD`, timezone e evidências normalizadas. Registre os motivos da decisão.

Evangelho divergente retorna `REJECTED`. Celebração, ciclo ou precedência divergentes retornam `QUARANTINED`. Nunca retorne `APPROVED` sem evidência suficiente. Cubra timezone, domingos, solenidades, precedência, leituras ausentes e regressões conhecidas com Vitest.
