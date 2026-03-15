BEGIN;

INSERT INTO story_categories (key, name, sort_order)
VALUES
  ('fairy_tale', '童话', 1),
  ('fable', '寓言', 2),
  ('mythology', '神话', 3)
ON CONFLICT (key) DO UPDATE
SET
  name = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order;

INSERT INTO story_styles (key, name, description, tone, pace, emotion_level, metaphor_level, is_active)
VALUES
  ('fairy', '童话风', '适合温暖、治愈、带轻奇想的故事。', '温柔', '舒缓', 3, 3, TRUE),
  ('fable', '寓言风', '适合结构紧凑、带选择意味的故事。', '克制', '紧凑', 2, 3, TRUE),
  ('epic', '神话史诗风', '适合神话、命运、宏大转折。', '庄严', '中速', 4, 4, TRUE),
  ('dark', '暗黑风', '适合危险、真相、代价等内容。', '冷峻', '中快', 4, 3, TRUE),
  ('zhihu', '知乎风', '适合分析感强、现代阅读习惯的内容。', '清醒', '中速', 2, 2, TRUE),
  ('pain', '伤痛文学风', '适合遗憾、离别、错过类短篇。', '伤感', '舒缓', 5, 4, TRUE),
  ('light_web', '轻喜剧网感风', '适合轻快、易分享、对话感强的内容。', '轻松', '快', 2, 1, TRUE),
  ('suspense', '悬疑风', '适合钩子、线索、留白式推进。', '悬疑', '中快', 3, 3, TRUE)
ON CONFLICT (key) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  tone = EXCLUDED.tone,
  pace = EXCLUDED.pace,
  emotion_level = EXCLUDED.emotion_level,
  metaphor_level = EXCLUDED.metaphor_level,
  is_active = EXCLUDED.is_active;

COMMIT;
