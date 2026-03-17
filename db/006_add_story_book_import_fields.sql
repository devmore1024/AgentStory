BEGIN;

ALTER TABLE story_books
  ADD COLUMN IF NOT EXISTS story_content TEXT,
  ADD COLUMN IF NOT EXISTS source_site TEXT,
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS source_license TEXT,
  ADD COLUMN IF NOT EXISTS source_title TEXT,
  ADD COLUMN IF NOT EXISTS popularity_rank INTEGER;

CREATE INDEX IF NOT EXISTS idx_story_books_category_rank
  ON story_books (category_id, popularity_rank, title);

COMMIT;
