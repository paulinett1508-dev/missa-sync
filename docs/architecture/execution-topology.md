# Arquitetura de execuÃ§Ã£o

## Topologia de produÃ§Ã£o

```text
Cliente
  -> HTTPS
Cloudflare (DNS proxied + Full strict)
  -> HTTPS:443
VPS Hostinger 195.200.5.145
  -> sslh:443 -> Nginx do host:8443
     -> web Docker:127.0.0.1:9020
     -> api Docker:127.0.0.1:9021
     -> worker, PostgreSQL e Redis (rede Docker interna)
```

Os hostnames pÃºblicos sÃ£o `missal.flowdigitalstudio.com.br` e `api-missal.flowdigitalstudio.com.br`. Ambos apontam a registros `A` proxied para a VPS. Cloudflare usa **Full (strict)**, logo o Nginx do host deve apresentar certificado vÃ¡lido para ambos os nomes.

## Redes e portas

`sslh` mantÃ©m 443 e encaminha TLS para Nginx em 8443, padrÃ£o jÃ¡ usado na VPS. Nginx Ã© o Ãºnico proxy pÃºblico. Os containers `web` e `api` escutam apenas em `127.0.0.1:9020` e `127.0.0.1:9021`; worker, PostgreSQL e Redis nÃ£o publicam portas. A rede Docker `application` Ã© interna.

## ConfianÃ§a de proxy

A API recebe trÃ¡fego apenas via loopback/Nginx e, quando for necessÃ¡rio registrar IP real, deve confiar somente em cabeÃ§alhos encaminhados pelo Nginx. A proteÃ§Ã£o de origem por firewall deve ser configurada antes de dados reais.
