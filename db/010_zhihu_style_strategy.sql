BEGIN;

ALTER TABLE story_styles
  DROP CONSTRAINT IF EXISTS story_styles_key_check;

ALTER TABLE story_styles
  ADD CONSTRAINT story_styles_key_check
  CHECK (
    key IN (
      'fairy',
      'fable',
      'epic',
      'dark',
      'zhihu',
      'pain',
      'light_web',
      'suspense',
      'healing_daily',
      'black_humor',
      'folklore',
      'growth',
      'lyrical'
    )
  );

INSERT INTO story_styles (key, name, description, tone, pace, emotion_level, metaphor_level, is_active)
VALUES
  ('healing_daily', '治愈日常风', '适合关系修复、细节见人的温柔故事。', '温柔', '舒缓', 3, 2, TRUE),
  ('black_humor', '黑色幽默风', '适合带荒诞反差与冷面幽默的故事。', '辛辣', '中速', 3, 2, TRUE),
  ('folklore', '民俗怪谈风', '适合旧规矩、异闻和民间传说气质。', '幽深', '中速', 3, 4, TRUE),
  ('growth', '冒险成长风', '适合强调选择、试错与向前走的故事。', '昂扬', '中快', 3, 2, TRUE),
  ('lyrical', '诗性抒情风', '适合画面感强、带余韵和情绪回声的故事。', '柔和', '舒缓', 4, 5, TRUE)
ON CONFLICT (key) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  tone = EXCLUDED.tone,
  pace = EXCLUDED.pace,
  emotion_level = EXCLUDED.emotion_level,
  metaphor_level = EXCLUDED.metaphor_level,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

CREATE TABLE IF NOT EXISTS zhihu_story_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_book_id UUID NOT NULL REFERENCES story_books(id) ON DELETE CASCADE,
  query_keyword TEXT NOT NULL,
  source_url TEXT NOT NULL UNIQUE,
  source_type TEXT NOT NULL CHECK (source_type IN ('answer', 'article')),
  title TEXT NOT NULL,
  author_name TEXT,
  author_headline TEXT,
  author_url TEXT,
  authority_level INTEGER,
  excerpt TEXT,
  content TEXT NOT NULL,
  quality_score INTEGER NOT NULL DEFAULT 0,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zhihu_story_references_book_quality
  ON zhihu_story_references (story_book_id, is_active, quality_score DESC, fetched_at DESC);

DROP TRIGGER IF EXISTS set_updated_at_zhihu_story_references ON zhihu_story_references;

CREATE TRIGGER set_updated_at_zhihu_story_references
BEFORE UPDATE ON zhihu_story_references
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
