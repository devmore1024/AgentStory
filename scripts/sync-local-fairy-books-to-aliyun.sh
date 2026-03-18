#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOCAL_DB_URL="${LOCAL_DB_URL:-postgresql://showjoy@127.0.0.1:5432/agentstory_dev}"
TMP_ENV_FILE="$(mktemp /tmp/agentstory-local-source-XXXXXX)"

cleanup() {
  rm -f "$TMP_ENV_FILE"
}

trap cleanup EXIT

printf 'DATABASE_URL=%s\n' "$LOCAL_DB_URL" > "$TMP_ENV_FILE"

cd "$ROOT_DIR"

psql "$LOCAL_DB_URL" -v ON_ERROR_STOP=1 -f db/006_add_story_book_import_fields.sql
npm run sync:fairy-books -- --source-env-file "$TMP_ENV_FILE" --target-env-file .env "$@"
