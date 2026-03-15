BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  secondme_user_id TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  avatar TEXT,
  animal_profile_id UUID,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE animal_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  animal_type TEXT NOT NULL CHECK (
    animal_type IN ('bear', 'deer', 'fox', 'owl', 'wolf', 'cat', 'rabbit', 'raven')
  ),
  animal_name TEXT NOT NULL,
  display_label TEXT NOT NULL DEFAULT '动物人格',
  summary TEXT NOT NULL,
  tendencies JSONB NOT NULL DEFAULT '[]'::jsonb,
  values JSONB NOT NULL DEFAULT '[]'::jsonb,
  expression_style TEXT,
  dimension_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  story_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  mapping_version TEXT NOT NULL DEFAULT 'v1',
  mapping_reason TEXT,
  confidence_score INTEGER CHECK (confidence_score BETWEEN 0 AND 100),
  share_card_image TEXT,
  raw_secondme_profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users
  ADD CONSTRAINT users_animal_profile_id_fkey
  FOREIGN KEY (animal_profile_id) REFERENCES animal_profiles(id) ON DELETE SET NULL;

CREATE TABLE story_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE CHECK (key IN ('fairy_tale', 'fable', 'mythology')),
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL
);

CREATE TABLE story_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES story_categories(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  cover_image TEXT,
  summary TEXT NOT NULL,
  key_scenes JSONB NOT NULL DEFAULT '[]'::jsonb,
  original_synopsis TEXT,
  public_domain BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE story_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE CHECK (
    key IN ('fairy', 'fable', 'epic', 'dark', 'zhihu', 'pain', 'light_web', 'suspense')
  ),
  name TEXT NOT NULL,
  description TEXT,
  tone TEXT,
  pace TEXT,
  emotion_level SMALLINT CHECK (emotion_level BETWEEN 1 AND 5),
  metaphor_level SMALLINT CHECK (metaphor_level BETWEEN 1 AND 5),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL CHECK (
    job_type IN ('episode_generate', 'short_story_generate', 'ai_comment_generate')
  ),
  status TEXT NOT NULL CHECK (
    status IN ('queued', 'running', 'succeeded', 'failed')
  ),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  run_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE story_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  current_book_id UUID REFERENCES story_books(id) ON DELETE SET NULL,
  latest_episode_id UUID,
  primary_style_id UUID REFERENCES story_styles(id) ON DELETE SET NULL,
  next_generate_at TIMESTAMPTZ,
  last_generated_at TIMESTAMPTZ,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE story_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES story_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES story_books(id) ON DELETE SET NULL,
  job_id UUID REFERENCES generation_jobs(id) ON DELETE SET NULL,
  episode_no INTEGER NOT NULL CHECK (episode_no > 0),
  style_id UUID REFERENCES story_styles(id) ON DELETE SET NULL,
  title TEXT,
  excerpt TEXT,
  content TEXT,
  bridge_from_previous TEXT,
  generated_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('queued', 'generating', 'published', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT story_episodes_thread_episode_no_key UNIQUE (thread_id, episode_no)
);

ALTER TABLE story_threads
  ADD CONSTRAINT story_threads_latest_episode_id_fkey
  FOREIGN KEY (latest_episode_id) REFERENCES story_episodes(id) ON DELETE SET NULL;

CREATE TABLE short_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES story_books(id) ON DELETE SET NULL,
  job_id UUID REFERENCES generation_jobs(id) ON DELETE SET NULL,
  trigger_scene TEXT NOT NULL,
  style_id UUID REFERENCES story_styles(id) ON DELETE SET NULL,
  title TEXT,
  excerpt TEXT,
  content TEXT,
  status TEXT NOT NULL CHECK (status IN ('queued', 'generating', 'published', 'failed')),
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE timeline_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('episode', 'short_story')),
  source_id UUID NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  book_id UUID REFERENCES story_books(id) ON DELETE SET NULL,
  style_id UUID REFERENCES story_styles(id) ON DELETE SET NULL,
  happened_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT timeline_items_user_source_key UNIQUE (user_id, source_type, source_id)
);

CREATE TABLE feed_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('episode', 'short_story')),
  source_id UUID NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  style_id UUID REFERENCES story_styles(id) ON DELETE SET NULL,
  cover_image TEXT,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (
    visibility IN ('public', 'followers', 'private')
  ),
  like_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT feed_stories_source_key UNIQUE (source_type, source_id)
);

CREATE TABLE story_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_story_id UUID NOT NULL REFERENCES feed_stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT story_likes_feed_story_id_user_id_key UNIQUE (feed_story_id, user_id)
);

CREATE TABLE ai_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_story_id UUID NOT NULL REFERENCES feed_stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  animal_profile_id UUID REFERENCES animal_profiles(id) ON DELETE SET NULL,
  job_id UUID REFERENCES generation_jobs(id) ON DELETE SET NULL,
  style_id UUID REFERENCES story_styles(id) ON DELETE SET NULL,
  content TEXT,
  status TEXT NOT NULL CHECK (status IN ('queued', 'generating', 'published', 'failed')),
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_story_books_category_active
  ON story_books (category_id, is_active, created_at DESC);

CREATE INDEX idx_generation_jobs_status_run_at
  ON generation_jobs (status, run_at);

CREATE INDEX idx_story_threads_user_status
  ON story_threads (user_id, status, created_at DESC);

CREATE INDEX idx_story_episodes_thread_episode_no
  ON story_episodes (thread_id, episode_no DESC);

CREATE INDEX idx_short_stories_user_generated_at
  ON short_stories (user_id, generated_at DESC);

CREATE INDEX idx_timeline_items_user_happened_at
  ON timeline_items (user_id, happened_at DESC);

CREATE INDEX idx_feed_stories_visibility_published_at
  ON feed_stories (visibility, published_at DESC);

CREATE INDEX idx_ai_comments_feed_story_created_at
  ON ai_comments (feed_story_id, created_at DESC);

CREATE TRIGGER set_updated_at_users
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_animal_profiles
BEFORE UPDATE ON animal_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_story_books
BEFORE UPDATE ON story_books
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_story_styles
BEFORE UPDATE ON story_styles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_generation_jobs
BEFORE UPDATE ON generation_jobs
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_story_threads
BEFORE UPDATE ON story_threads
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_story_episodes
BEFORE UPDATE ON story_episodes
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_short_stories
BEFORE UPDATE ON short_stories
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_feed_stories
BEFORE UPDATE ON feed_stories
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_ai_comments
BEFORE UPDATE ON ai_comments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
