# ADR-002: Estados e elegibilidade de conteúdo

## Status

Aceita.

## Decisão

O conteúdo passa por `PENDING`, `APPROVED`, `QUARANTINED`, `REJECTED` ou `LOCAL_PRIVATE`. Somente `APPROVED` e `LOCAL_PRIVATE` são elegíveis para o PWA.

Divergência de Evangelho resulta em `REJECTED`. Divergência de celebração, ciclo ou precedência resulta em `QUARANTINED`.

## Consequências

A decisão precisa registrar evidência: fontes, hash, data, parser e motivo. Nenhuma aplicação pode contornar a verificação de elegibilidade.
