# Arquitetura

A arquitetura do Meu Missal é offline-first e date-authoritative.

## Fluxo alvo

```text
coleta -> snapshot bruto -> normalização -> validação -> quarentena/aprovação -> pacote offline -> IndexedDB -> PWA
```

## Status de conteúdo

- `PENDING`: recebido, ainda não validado
- `APPROVED`: validado e liberado ao PWA
- `QUARANTINED`: divergência detectada, requer revisão
- `REJECTED`: inválido ou incompleto
- `LOCAL_PRIVATE`: conteúdo local explicitamente mantido pelo usuário
