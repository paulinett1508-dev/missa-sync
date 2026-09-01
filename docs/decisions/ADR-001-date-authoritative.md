# ADR-001: A data é a autoridade de domínio

## Status

Aceita.

## Contexto

Conteúdo litúrgico depende de uma data de calendário e de um timezone. Um instante, relógio do servidor ou endpoint `today` pode resolver o dia errado.

## Decisão

Toda operação de resolução, validação, armazenamento e entrega recebe `YYYY-MM-DD` e timezone explícito. A data é a chave de negócio; instantes existem apenas como metadados de coleta e auditoria.

## Consequências

Testes devem cobrir mudanças de dia, timezone, domingos, solenidades e precedência. APIs não devem inferir a data atual como verdade de negócio.
