#!/usr/bin/env bash
# Starts everything needed to run the SSSVM site locally:
# Postgres (via docker compose) + Prisma migrations + the Next.js dev server.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

if [ ! -f .env ]; then
  echo "No .env found — copying .env.example. Review it before continuing." >&2
  cp .env.example .env
fi

echo "==> Starting Postgres..."
docker compose up -d postgres

echo "==> Waiting for Postgres to be healthy..."
until [ "$(docker compose ps -q postgres | xargs docker inspect -f '{{.State.Health.Status}}')" = "healthy" ]; do
  sleep 1
done

echo "==> Applying Prisma migrations..."
npx prisma migrate deploy

echo "==> Starting Next.js dev server..."
exec npm run dev
