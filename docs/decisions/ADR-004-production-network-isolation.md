# ADR-004: Isolamento de rede de produção

## Status

Aceita.

## Decisão

Somente Nginx publica 80/443. PostgreSQL, Redis, worker, API e servidor do PWA comunicam-se por redes Docker internas. O worker não possui rota pública.

## Consequências

O Compose de produção não mapeia portas de banco, Redis ou API. Healthchecks internos verificam disponibilidade sem ampliar a superfície pública.
