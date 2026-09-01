# Repository Guidelines

## Propósito e escopo

Meu Missal é um monorepo privado para um PWA offline-first de acompanhamento da Santa Missa.

A data litúrgica é a autoridade de domínio.

Este arquivo contém regras universais.

Leia também a instrução mais próxima do arquivo que você for alterar.

## Pirâmide de contexto

Consulte a documentação nesta ordem:

1. `AGENTS.md` para regras globais.
2. `docs/architecture/overview.md` para fluxos e fronteiras.
3. `docs/decisions/` para decisões imutáveis de domínio.
4. `docs/runbooks/` para operação local e ingestão.
5. `apps/*/AGENTS.md` ou `packages/validators/AGENTS.md` para regras locais.

Não replique regras globais nos arquivos locais.

Atualize a camada de contexto apropriada quando uma mudança alterar uma regra, fluxo ou operação.

## Estrutura

- `apps/web`: PWA React, Vite e persistência local.
- `apps/api`: API Fastify, Prisma e acesso a dados.
- `apps/worker`: coleta, normalização e jobs assíncronos.
- `packages/domain`: tipos e regras de negócio.
- `packages/schemas`: contratos Zod.
- `packages/collectors`: adaptadores de fontes.
- `packages/validators`: validação determinística.
- `packages/package-builder`: pacotes offline.
- `packages/shared`: utilitários sem regra de domínio.
- `infra`: infraestrutura local.
- `docs`: arquitetura, decisões e runbooks.

## Modelo de trabalho

Use o perfil `fast` para tarefas mecânicas e limitadas.

Use `build` para implementação normal.

Use `critical` apenas para decisões ambíguas, caras ou de alto raio de impacto.

Antes de implementar uma tarefa crítica, apresente invariantes, riscos, arquivos afetados e estratégia de testes.

Não escreva código crítico antes da aprovação explícita do plano quando ela for solicitada.

## Limites de produto

O projeto é privado e pessoal nesta fase.

Não implementar catálogo público, compartilhamento, pagamentos, SaaS ou recursos multiusuário.

Não expor conteúdo sem autenticação.

Não criar automações para contornar autenticação, paywall, CAPTCHA, bloqueios técnicos ou termos de fontes externas.

Não adicionar textos integrais protegidos de terceiros ao Git.

Versione somente schemas, tipos, fixtures sintéticas e exemplos reduzidos.

## Privacidade e dados

Dados pessoais pertencem a `data/private/`.

Snapshots externos e pacotes privados pertencem a `storage/private/`.

Estado estritamente local pertence a `.local/`.

Esses caminhos são ignorados pelo Git; mantenha arquivos `.gitkeep` quando necessários.

Nunca inclua segredos em código, documentação, commits ou testes.

Use `.env.example` para documentar variáveis sem valores sensíveis.

## Invariantes de domínio

Toda resolução de conteúdo recebe uma data explícita no formato `YYYY-MM-DD`.

Toda resolução recebe timezone explícito.

Nunca use `today` como chave ou verdade de negócio.

A data de calendário deve permanecer distinguível de um instante de tempo.

Modele e teste timezone, dia da semana, tempo litúrgico, cor, celebração, precedência, ciclo e leituras.

Valide dados externos antes de persistir.

Registre origem, data, hash, evidência e versão do parser para cada decisão de validação.

Divergência de Evangelho resulta em `REJECTED`.

Divergência de celebração, ciclo ou precedência resulta em `QUARANTINED`.

Conteúdo inválido ou incompleto resulta em `REJECTED`.

Apenas `APPROVED` e `LOCAL_PRIVATE` podem ser servidos ao PWA.

`PENDING`, `QUARANTINED` e `REJECTED` nunca podem ser publicados.

## Estados de conteúdo

- `PENDING`: recebido e não validado.
- `APPROVED`: validado e disponível ao PWA.
- `QUARANTINED`: divergente e pendente de revisão.
- `REJECTED`: inválido, incompleto ou com Evangelho divergente.
- `LOCAL_PRIVATE`: conteúdo local mantido explicitamente pelo usuário.

Não faça transições de estado implícitas.

Toda transição deve preservar a evidência que a justifica.

## Código TypeScript

Use Node.js 22+, pnpm e Turborepo.

Escreva TypeScript estrito.

Não use `any`.

Use `unknown` em fronteiras e valide com Zod.

Prefira funções pequenas, puras e testáveis.

Mantenha regras e tipos de domínio em `packages/domain`.

Mantenha utilitários livres de domínio em `packages/shared`.

Não duplique contratos entre aplicações.

Use nomes descritivos em inglês para código e `kebab-case` para arquivos, por exemplo `day-validator.ts`.

Use `YYYY-MM-DD` em exemplos e fixtures de datas.

## Testes e verificação

Use Vitest para testes unitários e de integração.

Use Playwright para fluxos ponta a ponta.

Coloque testes próximos ao código coberto.

Nomeie-os como `*.test.ts`, por exemplo `day-validator.test.ts`.

Toda mudança estrutural deve incluir testes relevantes.

Toda regra de status, data ou precedência deve ter casos positivos, negativos e de regressão.

Execute do diretório raiz:

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Use `docker compose up -d` quando a tarefa exigir infraestrutura local.

## Alterações e revisão

Mantenha mudanças pequenas e focadas.

Não altere arquitetura, dependências ou schema fora do escopo autorizado.

Não modifique arquivos não autorizados em tarefas restritas.

Explique premissas que possam alterar o escopo.

Atualize documentação quando mudar comportamento, fluxo ou decisão de domínio.

Use mensagens Conventional Commit concisas, como `feat(api): add day route`.

Em pull requests, descreva objetivo, áreas afetadas, verificações executadas e riscos.

Inclua capturas de tela para alterações visuais no PWA.

## Leitura por área

- PWA: `apps/web/AGENTS.md`.
- API: `apps/api/AGENTS.md`.
- Worker: `apps/worker/AGENTS.md`.
- Validação: `packages/validators/AGENTS.md`.
- Arquitetura: `docs/architecture/overview.md`.
- Datas: `docs/decisions/ADR-001-date-authoritative.md`.
- Estados: `docs/decisions/ADR-002-content-status.md`.
- Ambiente local: `docs/runbooks/local-development.md`.
- Ingestão: `docs/runbooks/ingestion.md`.

## Escopo explícito

Trate a lista de tarefas do usuário como limite de autorização.

Trate a lista de arquivos autorizados como limite de edição.

Não faça refatorações oportunistas.

Não atualize dependências sem autorização explícita.

Não altere schema sem autorização explícita.

Não procure fontes externas quando a tarefa proibir pesquisa.

Prefira inspeções locais e testes proporcionais ao risco.

Se um requisito estiver ausente, registre a suposição antes de ampliar o escopo.

## Contratos e fronteiras

Todo dado externo entra por um schema.

Todo dado persistido deve ter origem auditável.

Não misture coleta, validação e publicação na mesma camada.

Não use estado do cliente para autorizar publicação.

Não use cache como fonte de verdade litúrgica.

Mantenha erros de validação estruturados e acionáveis.

Evite efeitos colaterais em funções de domínio.

Faça operações de escrita idempotentes quando possam ser reexecutadas.

## Evidência e auditoria

A evidência deve permitir reproduzir a decisão.

Inclua identificador da fonte quando disponível.

Inclua hash do material normalizado ou bruto conforme aplicável.

Inclua timestamp de coleta apenas como auditoria, nunca como data de negócio.

Inclua a versão do parser ou validador usada.

Inclua a regra que causou aprovação, quarentena ou rejeição.

Não descarte evidência ao reprocessar um item.

## Documentação operacional

Use ADRs para decisões duradouras e suas consequências.

Use runbooks para procedimentos repetíveis.

Use `overview.md` para fronteiras e fluxos entre componentes.

Mantenha instruções locais focadas apenas na área correspondente.

Remova instruções obsoletas quando a implementação mudar.

Evite copiar blocos extensos entre documentos.

Links relativos devem apontar para arquivos versionados.

Revise a documentação afetada antes de concluir uma mudança.

Preserve o histórico e os limites de privacidade do projeto.
