# Implantação

A implantação inicial é manual por SSH e descrita em `cloudflare-hostinger.md`. O script `infra/scripts/deploy-production.sh` deve ser executado somente na VPS, depois de atualizar o checkout e preparar `.env.production` e os certificados do origin.

A configuração Docker referencia `pnpm-lock.yaml` deliberadamente: gere e versione o lockfile quando as dependências do scaffold forem instaladas, antes do primeiro build de produção. Não flexibilize esse requisito no Dockerfile.
