# Primeiro pacote privado

1. Copie a estrutura de `data/fixtures/liturgical-day.sample.json` para `data/private/imports/`.
2. Informe uma data e timezone explícitos; não use `today`.
3. Execute `pnpm --filter @missa-sync/worker private-import data/private/imports/seu-dia.json`.
4. Um resultado `APPROVED` cria o pacote privado. `QUARANTINED` e `REJECTED` não são publicados.
5. Inicie uma sessão no PWA, selecione a mesma data e timezone e use **Sincronizar pacote**. Desconecte a rede e reabra a mesma data para confirmar o fallback IndexedDB.

Em desenvolvimento, consulte a API com a sessão local ou um token privado configurado fora do Git. Exemplo com cookie de sessão:

```bash
curl --cookie "missa_sync_session=<sessao>" "http://localhost:3001/v1/packages/daily/2026-08-23?timezone=America%2FSao_Paulo"
```

Alternativamente, defina `DEVELOPMENT_PRIVATE_API_TOKEN` somente no `.env` local e execute:

```bash
curl -H "Authorization: Bearer <token-local>" "http://localhost:3001/v1/packages/daily/2026-08-23?timezone=America%2FSao_Paulo"
```

Para limpar o dispositivo, apague o banco `missa-sync` no armazenamento do navegador. Para limpar dados de importação, remova manualmente apenas arquivos conhecidos em `storage/private/`; não use comandos recursivos amplos.
