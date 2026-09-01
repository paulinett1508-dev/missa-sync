# Visão geral da arquitetura

## Objetivo

O sistema produz conteúdo litúrgico offline por data, com validação antes da distribuição ao PWA.

## Fluxo

```text
coleta -> snapshot bruto -> normalização -> validação -> decisão de status -> pacote offline -> IndexedDB -> PWA
```

`apps/worker` coleta e normaliza. `packages/validators` aplica regras determinísticas. `apps/api` expõe somente conteúdo elegível. `apps/web` consome pacotes e mantém experiência offline.

## Pacote offline

O pacote offline versão `1` contém a data litúrgica e o timezone explícitos, status elegível, checksum, evidências auditáveis e seções da celebração. O PWA valida o contrato antes de importar e usa a identidade `data + timezone`; uma reimportação com o mesmo checksum não altera o armazenamento local.

O worker só constrói e entrega um pacote quando recebe decisão explícita `APPROVED`. Decisões `QUARANTINED` e `REJECTED` não geram escrita no destino de pacotes.

## Fronteiras

- `packages/domain` define o vocabulário e as invariantes.
- `packages/schemas` valida contratos de entrada e saída.
- Coletores não decidem publicação.
- Validadores não dependem de relógio implícito.
- A API é a fronteira de entrega, não a fonte de verdade litúrgica.

Consulte `README.md` neste diretório para os estados de conteúdo e `docs/decisions/` para decisões normativas.
