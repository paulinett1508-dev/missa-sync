# PWA Guidelines

Leia `../../AGENTS.md` antes de alterar este aplicativo.

O PWA é offline-first e só pode apresentar conteúdo com status `APPROVED` ou `LOCAL_PRIVATE`. Não decida status nem data litúrgica no cliente. Consuma uma data `YYYY-MM-DD` e timezone explícito fornecidos pelo fluxo de domínio.

Use React, Vite, React Router, TanStack Query, Zustand e Dexie conforme o scaffold evoluir. Mantenha dados privados apenas no armazenamento local apropriado. Inclua capturas de tela em revisões de mudanças visuais e cubra fluxos críticos com Playwright.
