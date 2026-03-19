# Database Bootstrap

AgentStory first-pass PostgreSQL schema and seed files.

## Files

- `001_init_schema.sql`: core tables, indexes, constraints, triggers
- `002_seed_base.sql`: base categories and story styles
- `003_seed_story_books.sql`: first-batch story book catalog (99 books)
- `004_enrich_story_books.sql`: batch-enrich `key_scenes` for the first 99 books
- `005_assign_cover_images.sql`: assign stable local cover URLs for the first 99 books
- `006_add_story_book_import_fields.sql`: add source metadata and full story fields for imported book content
- `007_expand_fairy_tale_catalog.sql`: expand the fairy tale shelf to the source-backed 100-book catalog
- `008_adventure_memory_refactor.sql`: add adventure, memory, and supporting generation tables
- `009_personal_companion_split.sql`: split personal and companion story threads
- `010_zhihu_style_strategy.sql`: expand the style pool and add Zhihu reference storage
- `011_expand_persona_style_pool.sql`: expand persona animals to 20, add 7 new regular styles, and normalize `story_preferences`

## Expected local database

- database name: `agentstory_dev`
- default connection in `.env.local`:

```bash
DATABASE_URL=postgresql://YOUR_PG_USER@127.0.0.1:5432/agentstory_dev
DATABASE_URL_UNPOOLED=postgresql://YOUR_PG_USER@127.0.0.1:5432/agentstory_dev
```

- on this machine, the local PostgreSQL role is `showjoy`

## Apply order

```bash
createdb -h 127.0.0.1 -U YOUR_PG_USER agentstory_dev
psql -h 127.0.0.1 -U YOUR_PG_USER -d agentstory_dev -f db/001_init_schema.sql
psql -h 127.0.0.1 -U YOUR_PG_USER -d agentstory_dev -f db/002_seed_base.sql
psql -h 127.0.0.1 -U YOUR_PG_USER -d agentstory_dev -f db/003_seed_story_books.sql
psql -h 127.0.0.1 -U YOUR_PG_USER -d agentstory_dev -f db/004_enrich_story_books.sql
psql -h 127.0.0.1 -U YOUR_PG_USER -d agentstory_dev -f db/005_assign_cover_images.sql
psql -h 127.0.0.1 -U YOUR_PG_USER -d agentstory_dev -f db/006_add_story_book_import_fields.sql
psql -h 127.0.0.1 -U YOUR_PG_USER -d agentstory_dev -f db/007_expand_fairy_tale_catalog.sql
psql -h 127.0.0.1 -U YOUR_PG_USER -d agentstory_dev -f db/008_adventure_memory_refactor.sql
psql -h 127.0.0.1 -U YOUR_PG_USER -d agentstory_dev -f db/009_personal_companion_split.sql
psql -h 127.0.0.1 -U YOUR_PG_USER -d agentstory_dev -f db/010_zhihu_style_strategy.sql
psql -h 127.0.0.1 -U YOUR_PG_USER -d agentstory_dev -f db/011_expand_persona_style_pool.sql
```

## Notes

- This schema assumes PostgreSQL and uses `pgcrypto` for `gen_random_uuid()`.
- Async jobs are modeled with `generation_jobs` so Redis is not required in phase 1.
- `004_enrich_story_books.sql` is idempotent and only fills books whose `key_scenes` is empty.
- `005_assign_cover_images.sql` is idempotent and points `cover_image` to dynamic local SVG covers served by the app.
- `006_add_story_book_import_fields.sql` is additive only and prepares `story_books` for offline import pipelines.

## Run TypeScript DB backfills

Some DB maintenance scripts are written in TypeScript and import project modules via `@/` aliases.

Use the shared loader:

```bash
node --experimental-strip-types --loader ./scripts/ts-strip-loader.mjs scripts/recompute-animal-personas.ts
```

If you need to point the script at production, pass `DATABASE_URL` explicitly:

```bash
DATABASE_URL="$DATABASE_URL_UNPOOLED" \
node --experimental-strip-types --loader ./scripts/ts-strip-loader.mjs scripts/recompute-animal-personas.ts
```

For the full production checklist, see:

- [AgentStory 线上数据库发布清单](/Users/showjoy/devmore/waytoagi/AgentStory/docs/AgentStory%20%E7%BA%BF%E4%B8%8A%E6%95%B0%E6%8D%AE%E5%BA%93%E5%8F%91%E5%B8%83%E6%B8%85%E5%8D%95.md)

## Sync the 100 source-backed fairy books

When you need to copy only the primary-entry fairy catalog from local PostgreSQL into another PostgreSQL database, run:

```bash
npm run sync:fairy-books
```

Default behavior:

- source DB: `.env.local` -> `DATABASE_URL`
- target DB: `.env` -> `DATABASE_URL_UNPOOLED`
- synced tables: `story_categories` (`fairy_tale` only) and `story_books`
- synced rows: exactly 100 `fairy_tale` books with `popularity_rank` 1..100
- excluded tables: `users`, `story_threads`, `story_episodes`, `short_stories`, `timeline_items`, `feed_stories`, `ai_comments`

Safety rules:

- the script validates that the source side really contains exactly 100 ranked fairy books before writing
- writes use `slug` upserts, so rerunning the sync is safe
- target `cover_image` is preserved when it already exists
- use `npm run sync:fairy-books -- --dry-run` to verify the source selection without writing

If your real source database is local PostgreSQL on `127.0.0.1:5432/agentstory_dev`, use:

```bash
npm run sync:fairy-books:from-local
```

That helper will:

- run `db/006_add_story_book_import_fields.sql` on the local source database first
- create a temporary source env file pointing at local PostgreSQL
- sync the 100 fairy books into the Aliyun database defined in `.env`

## Import Zhihu references

After applying `db/010_zhihu_style_strategy.sql`, you can preview or import Zhihu reference content for the fairy catalog with:

```bash
npm run import:zhihu-refs -- --dry-run --book-limit 5
```

Environment:

- database: loaded from `.env.local` -> `DATABASE_URL_UNPOOLED` by default
- Zhihu search access token: `ZHIHU_OPENAPI_ACCESS_TOKEN`
- search endpoint override: `ZHIHU_OPENAPI_SEARCH_URL`
- optional query param override: `ZHIHU_OPENAPI_SEARCH_QUERY_PARAM`
- optional limit config: `ZHIHU_OPENAPI_SEARCH_LIMIT`, `ZHIHU_OPENAPI_SEARCH_LIMIT_PARAM`

Notes:

- the import script only calls Zhihu `GET /openapi/search/global` and writes the results into `zhihu_story_references`
- the import script does not handle OAuth or token exchange; `ZHIHU_OPENAPI_ACCESS_TOKEN` must be obtained outside this repo
- deprecated app credential vars such as `ZHIHU_OPENAPI_TOKEN` and `ZHIHU_OPENAPI_API_KEY` are no longer accepted because the search endpoint expects a real access token

Behavior:

- queries the `fairy_tale` catalog from `story_books`
- builds up to 3 search keywords per book
- fetches candidate links from Zhihu open search
- fetches each public page and tries to extract long-form正文
- keeps at most 5 active references per book in `zhihu_story_references`
- writes a preview report to `plans/generated/zhihu-reference-import-preview.json`
