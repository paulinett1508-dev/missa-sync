# Deploy: Cloudflare e Hostinger VPS

## PrÃ©-requisitos manuais

1. Criar registros `A` proxied para `missal` e `api.missal`, ambos apontando para `195.200.5.145`.
2. Em Cloudflare, definir SSL/TLS como **Full (strict)**.
3. Com os DNS resolvendo para a VPS, emitir certificados Letâ€™s Encrypt no Nginx do host para os dois hostnames. Cloudflare Origin CA tambÃ©m Ã© aceito, mas o template atual usa Certbot.
4. Liberar 80/tcp e 443/tcp; manter 22/tcp por chave SSH e restringir por IP quando possÃ­vel.

## Primeiro deploy manual

```bash
ssh root@195.200.5.145
mkdir -p /opt/missa-sync
cd /opt/missa-sync
cp .env.example .env.production
# editar .env.production com segredos exclusivos de produÃ§Ã£o
# copiar infra/nginx/host-missa-sync.conf para /etc/nginx/sites-available/missa-sync
# criar o link em /etc/nginx/sites-enabled/ e validar: nginx -t
# emitir os certificados com Certbot, depois recarregar Nginx
docker compose --env-file .env.production -f docker-compose.production.yml up -d --build
docker compose --env-file .env.production -f docker-compose.production.yml ps
```

Verifique `https://api-missal.flowdigitalstudio.com.br/health` e `https://missal.flowdigitalstudio.com.br/`. NÃ£o use modo Flexible, nÃ£o exponha 5432/6379 e nÃ£o copie `.env.production` para o repositÃ³rio.

## CI/CD futuro

O pipeline futuro deve executar lint, typecheck, testes e build antes de uma etapa de deploy SSH aprovada. Ele deve usar segredos do provedor de CI e atualizar somente a VPS autorizada; nÃ£o implemente automaÃ§Ã£o de deploy antes de validar o procedimento manual.
