# ADR-003: TLS entre Cloudflare e origin

## Status

Aceita.

## DecisÃ£o

Cloudflare opera em **Full (strict)**. O origin termina TLS no Nginx em 443 com certificado Cloudflare Origin CA ou Letâ€™s Encrypt vÃ¡lido para `missal.flowdigitalstudio.com.br` e `api-missal.flowdigitalstudio.com.br`.

## ConsequÃªncias

O modo Flexible Ã© proibido. O certificado e a chave ficam exclusivamente na VPS, em diretÃ³rio fora do repositÃ³rio. HTTP em 80 somente redireciona para HTTPS.
