# ADR-006: Publicação privada por data explícita

## Status

Aceita.

## Decisão

Importação, validação, consulta e sincronização usam `YYYY-MM-DD` e timezone IANA explícito. A rota diária exige `timezone` como query parameter.

## Consequência

Não há rota de negócio baseada em `today`. Ausência de pacote, revisão e rejeição permanecem estados explícitos e não autorizam renderização litúrgica.
