# Database Bootstrap

AgentStory first-pass PostgreSQL schema and seed files.

## Files

- `001_init_schema.sql`: core tables, indexes, constraints, triggers
- `002_seed_base.sql`: base categories and story styles
- `003_seed_story_books.sql`: first-batch story book catalog (99 books)
- `004_enrich_story_books.sql`: batch-enrich `key_scenes` for the first 99 books
- `005_assign_cover_images.sql`: assign stable local cover URLs for the first 99 books
- `006_assign_png_cover_images.sql`: point covers to static PNG files served from `images/covers`

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
psql -h 127.0.0.1 -U YOUR_PG_USER -d agentstory_dev -f db/006_assign_png_cover_images.sql
```

## Notes

- This schema assumes PostgreSQL and uses `pgcrypto` for `gen_random_uuid()`.
- Async jobs are modeled with `generation_jobs` so Redis is not required in phase 1.
- `004_enrich_story_books.sql` is idempotent and only fills books whose `key_scenes` is empty.
- `005_assign_cover_images.sql` is idempotent and points `cover_image` to dynamic local SVG covers served by the app.
- `006_assign_png_cover_images.sql` updates all active books to use the generated PNG covers from `images/covers`.
