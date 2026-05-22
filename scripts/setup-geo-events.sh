#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

DB_NAME="${DB_NAME:-videoplatform}"
GRANT_OK=0

if sudo -n -u postgres psql -d "$DB_NAME" -v ON_ERROR_STOP=1 -f scripts/db-grant-app-ddl.sql 2>/dev/null; then
  GRANT_OK=1
elif psql -U postgres -d "$DB_NAME" -v ON_ERROR_STOP=1 -f scripts/db-grant-app-ddl.sql 2>/dev/null; then
  GRANT_OK=1
fi

if [[ "$GRANT_OK" -eq 0 ]]; then
  echo "Could not grant CREATE on public to app user. Run as PostgreSQL superuser:"
  echo "  sudo -u postgres psql -d $DB_NAME -f scripts/db-grant-app-ddl.sql"
  echo "Then re-run: npm run db:setup-geo-events"
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is not set. Add it to .env (e.g. postgres://user:pass@localhost:5432/videoplatform)."
  exit 1
fi

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 \
  -f prisma/migrations/20250523120000_add_channel_geo_events/migration.sql

echo "ChannelGeoEvent table is ready."
