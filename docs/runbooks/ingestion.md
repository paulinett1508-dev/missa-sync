# Coleta e normalização

## Fluxo operacional

1. Colete dados somente por meios permitidos.
2. Armazene o snapshot bruto em `storage/private/`.
3. Normalize em um contrato validado por Zod.
4. Anexe fonte, hash, data da coleta e versão do parser.
5. Envie a entrada para validação determinística.
6. Registre a decisão e sua evidência.
7. Para uma decisão `APPROVED`, produza o pacote offline e grave-o em `storage/private/` com escrita atômica e índice por data e timezone.

## Regras

Não contorne controles de fonte. Não grave conteúdo protegido no Git. Falha, ausência de dados ou divergência deve produzir um estado seguro; nunca publique por padrão.

Reprocessar um pacote com o mesmo checksum não deve regravá-lo. Estados `QUARANTINED` e `REJECTED` não geram pacote privado para distribuição.

O job `package-production` usa como chave de deduplicação a data, o timezone e o checksum explícitos. Configure `REDIS_URL` e, opcionalmente, `PRIVATE_PACKAGE_STORAGE_DIR` antes de iniciar o worker.

A API aceita enfileiramento apenas em `POST /v1/internal/packages`, com `Authorization: Bearer <INTERNAL_INGEST_TOKEN>`. A decisão é recalculada a partir das evidências recebidas; o cliente não informa o status de publicação.
