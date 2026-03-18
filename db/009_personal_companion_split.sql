BEGIN;

ALTER TABLE story_threads
  ADD COLUMN IF NOT EXISTS thread_kind TEXT NOT NULL DEFAULT 'companion',
  ADD COLUMN IF NOT EXISTS origin_personal_thread_id UUID REFERENCES story_threads(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS origin_episode_id UUID REFERENCES story_episodes(id) ON DELETE SET NULL;

UPDATE story_threads
SET thread_kind = 'companion'
WHERE thread_kind IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'story_threads_thread_kind_check'
  ) THEN
    ALTER TABLE story_threads
      ADD CONSTRAINT story_threads_thread_kind_check
      CHECK (thread_kind IN ('personal', 'companion'));
  END IF;
END $$;

DROP INDEX IF EXISTS idx_story_threads_owner_status;

CREATE INDEX IF NOT EXISTS idx_story_threads_owner_kind_status
  ON story_threads (owner_user_id, thread_kind, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_story_threads_kind_visibility_status
  ON story_threads (thread_kind, visibility, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_story_threads_kind_book_status
  ON story_threads (thread_kind, source_book_id, status, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_story_threads_personal_active_owner_book
  ON story_threads (owner_user_id, source_book_id)
  WHERE thread_kind = 'personal'
    AND status = 'active'
    AND completed_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_story_threads_companion_origin_episode_active
  ON story_threads (origin_episode_id)
  WHERE thread_kind = 'companion'
    AND origin_episode_id IS NOT NULL
    AND status = 'active'
    AND completed_at IS NULL;

ALTER TABLE timeline_items
  DROP CONSTRAINT IF EXISTS timeline_items_source_type_check;

ALTER TABLE timeline_items
  ADD CONSTRAINT timeline_items_source_type_check
  CHECK (source_type IN ('episode', 'short_story', 'adventure_episode', 'personal_episode', 'companion_episode', 'bedtime_memory'));

COMMIT;
