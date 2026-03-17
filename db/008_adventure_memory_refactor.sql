BEGIN;

ALTER TABLE story_threads
  ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS source_book_id UUID REFERENCES story_books(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS locked_style_id UUID REFERENCES story_styles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS participant_limit INTEGER NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS joiner_limit INTEGER NOT NULL DEFAULT 4,
  ADD COLUMN IF NOT EXISTS episode_limit INTEGER NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

UPDATE story_threads
SET owner_user_id = user_id
WHERE owner_user_id IS NULL;

UPDATE story_threads
SET source_book_id = current_book_id
WHERE source_book_id IS NULL
  AND current_book_id IS NOT NULL;

UPDATE story_threads AS t
SET source_book_id = seeded.book_id
FROM (
  SELECT DISTINCT ON (thread_id)
    thread_id,
    book_id
  FROM story_episodes
  WHERE book_id IS NOT NULL
  ORDER BY thread_id, episode_no ASC
) AS seeded
WHERE t.source_book_id IS NULL
  AND seeded.thread_id = t.id;

UPDATE story_threads
SET locked_style_id = primary_style_id
WHERE locked_style_id IS NULL
  AND primary_style_id IS NOT NULL;

ALTER TABLE story_threads
  ALTER COLUMN owner_user_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'story_threads_visibility_check'
  ) THEN
    ALTER TABLE story_threads
      ADD CONSTRAINT story_threads_visibility_check
      CHECK (visibility IN ('public', 'private'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS story_thread_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES story_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'participant')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT story_thread_participants_thread_user_key UNIQUE (thread_id, user_id)
);

INSERT INTO story_thread_participants (thread_id, user_id, role)
SELECT id, owner_user_id, 'owner'
FROM story_threads
ON CONFLICT (thread_id, user_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS bedtime_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  memory_date DATE NOT NULL,
  job_id UUID REFERENCES generation_jobs(id) ON DELETE SET NULL,
  title TEXT,
  excerpt TEXT,
  content TEXT,
  source_secondme_context JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL CHECK (status IN ('queued', 'generating', 'published', 'failed')),
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bedtime_memories_user_date_key UNIQUE (user_id, memory_date)
);

CREATE TABLE IF NOT EXISTS secondme_context_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  secondme_user_id TEXT NOT NULL UNIQUE,
  user_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  shades JSONB NOT NULL DEFAULT '[]'::jsonb,
  soft_memory JSONB NOT NULL DEFAULT '[]'::jsonb,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'fresh' CHECK (status IN ('fresh', 'stale')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE timeline_items
  DROP CONSTRAINT IF EXISTS timeline_items_source_type_check;

ALTER TABLE timeline_items
  ADD CONSTRAINT timeline_items_source_type_check
  CHECK (source_type IN ('episode', 'short_story', 'adventure_episode', 'bedtime_memory'));

CREATE INDEX IF NOT EXISTS idx_story_threads_owner_status
  ON story_threads (owner_user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_story_threads_source_book_status
  ON story_threads (source_book_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_story_thread_participants_user_joined
  ON story_thread_participants (user_id, joined_at DESC);

CREATE INDEX IF NOT EXISTS idx_bedtime_memories_user_date
  ON bedtime_memories (user_id, memory_date DESC);

CREATE INDEX IF NOT EXISTS idx_secondme_context_cache_user_expiry
  ON secondme_context_cache (secondme_user_id, expires_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_story_thread_participants'
  ) THEN
    CREATE TRIGGER set_updated_at_story_thread_participants
    BEFORE UPDATE ON story_thread_participants
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_bedtime_memories'
  ) THEN
    CREATE TRIGGER set_updated_at_bedtime_memories
    BEFORE UPDATE ON bedtime_memories
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_secondme_context_cache'
  ) THEN
    CREATE TRIGGER set_updated_at_secondme_context_cache
    BEFORE UPDATE ON secondme_context_cache
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

COMMIT;
