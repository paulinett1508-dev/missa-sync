# ADR-005: Fronteira de conteúdo privado

## Status

Aceita.

## Decisão

Imports pessoais, snapshots brutos, OCR e materiais externos permanecem em `data/private/`, `storage/private/` ou `.local/`, todos ignorados pelo Git. Fixtures versionadas são pequenas, sintéticas e não reproduzem conteúdo protegido.

## Consequência

O PWA recebe somente pacotes elegíveis, acompanhados de checksum e evidência mínima; ele nunca recebe o snapshot bruto.
