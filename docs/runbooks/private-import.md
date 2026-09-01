# Importação privada por metadados

O Meu Missal funciona sem digitalizar o livreto. A importação registra apenas os metadados litúrgicos necessários para localizar a celebração e as notas pessoais do usuário.

## Arquivo

Coloque o JSON privado em `data/private/imports/`. Esse diretório é ignorado pelo Git. Use como modelo `data/fixtures/private-liturgical-import.sample.json`, que contém somente dados sintéticos.

Preencha `date` (`YYYY-MM-DD`), `timezone` IANA, celebração, tempo, cor, ciclo, grau, referências das leituras, chaves de `massFlow`, cantos escolhidos, notas pessoais e `sourceReference` (livreto, página ou edição). Nunca copie o texto de leituras, salmos, Evangelhos, orações ou letras de cantos.

## Processamento local

```bash
pnpm --filter @missa-sync/worker private-import data/private/imports/seu-dia.json
```

O pipeline valida com Zod, cria snapshot bruto privado, normaliza, verifica data/timezone e a referência do Evangelho, e só gera pacote para `APPROVED` ou `LOCAL_PRIVATE`. O checksum SHA-256 torna a operação idempotente.

Snapshots ficam em `storage/private/raw-snapshots/` e pacotes em `storage/private/packages/`. Esses diretórios também são privados e ignorados pelo Git.

## Uso no PWA

Abra o pacote aprovado pelo controle de arquivo ou autentique-se e atualize a data explícita. O pacote é salvo no IndexedDB e pode ser aberto sem rede. O PWA exibe celebração, referências, fluxo, cantos, notas pessoais e status offline; nunca exibe conteúdo `PENDING`, `QUARANTINED` ou `REJECTED`.

Para limpar os dados locais, use as ferramentas de armazenamento do navegador e remova o banco IndexedDB `missa-sync`. Não apague os arquivos privados do servidor sem confirmar o backup.

Não implemente OCR, PDF, scraping, automação de navegador ou download de conteúdo de terceiros neste fluxo.
