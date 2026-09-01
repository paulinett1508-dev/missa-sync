#!/usr/bin/env sh
set -eu

: "${DEPLOY_DIR:=/opt/missa-sync}"
: "${ENV_FILE:=$DEPLOY_DIR/.env.production}"

cd "$DEPLOY_DIR"
test -f "$ENV_FILE"

docker compose --env-file "$ENV_FILE" -f docker-compose.production.yml up -d --build
docker compose --env-file "$ENV_FILE" -f docker-compose.production.yml ps
