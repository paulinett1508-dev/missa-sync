# ADR-003 — Provider de calendário litúrgico

## Status

Aceito — 2026-08-31

## Decisão

O domínio depende apenas de `LiturgicalCalendarProvider`. A implementação atual é `MockCalendarProvider`; `RomcalCalendarProvider` existe como fronteira isolada e só será ativado após validar a distribuição, o mapeamento de ciclos, precedência, idioma e particularidades do Brasil.

## Consequências

O PWA e a API já podem evoluir sem acoplamento à biblioteca. Romcal é uma referência do calendário romano geral, não substitui validação editorial ou nacional.

## Referência

Romcal documenta suporte ao calendário romano geral e plugins de calendários particulares: https://github.com/romcal/romcal
