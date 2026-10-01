#!/usr/bin/env bash
# One command: Postgres up, migrations applied, API running.
set -Eeuo pipefail

cd "$(dirname -- "${BASH_SOURCE[0]}")/.."

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required to run Postgres." >&2
  exit 1
fi

docker compose up -d --wait postgres
npm run db:migrate
npm run start:dev --workspace @pocket-pantry/api
