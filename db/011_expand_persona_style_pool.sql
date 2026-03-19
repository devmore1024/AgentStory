BEGIN;

ALTER TABLE animal_profiles
  DROP CONSTRAINT IF EXISTS animal_profiles_animal_type_check;

ALTER TABLE animal_profiles
  ADD CONSTRAINT animal_profiles_animal_type_check
  CHECK (
    animal_type IN (
      'bear',
      'deer',
      'fox',
      'owl',
      'wolf',
      'cat',
      'rabbit',
      'raven',
      'lion',
      'dog',
      'dolphin',
      'swan',
      'otter',
      'squirrel',
      'horse',
      'hedgehog',
      'elephant',
      'crane',
      'whale',
      'falcon'
    )
  );

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
      'lyrical',
      'classical_poetic',
      'realist',
      'magic_realism',
      'sci_future',
      'hotblooded',
      'meta_roast',
      'absurd_comedy'
    )
  );

INSERT INTO story_styles (key, name, description, tone, pace, emotion_level, metaphor_level, is_active)
VALUES
  ('classical_poetic', '古风诗意风', '适合古典语感、景物意境和留白感更强的故事。', '雅致', '舒缓', 4, 5, TRUE),
  ('realist', '现实主义风', '适合强调真实处境、人性反应和克制表达的故事。', '克制', '中速', 3, 2, TRUE),
  ('magic_realism', '魔幻现实主义风', '适合现实中自然渗入异样和超现实纹理的故事。', '平静', '中速', 4, 4, TRUE),
  ('sci_future', '科幻未来风', '适合带未来背景、科技装置和系统规则的故事。', '冷静', '中快', 3, 4, TRUE),
  ('hotblooded', '热血中二风', '适合高燃宣言、命运对抗和强行动感的故事。', '高燃', '快', 4, 2, TRUE),
  ('meta_roast', '反套路吐槽风', '适合带聪明吐槽、拆套路和反转感的故事。', '机敏', '中快', 3, 2, TRUE),
  ('absurd_comedy', '沙雕搞笑风', '适合荒诞反差、无厘头节奏和喜剧连锁反应的故事。', '夸张', '快', 3, 1, TRUE)
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

UPDATE animal_profiles
SET
  story_preferences = jsonb_build_object(
    'styles',
    CASE
      WHEN jsonb_typeof(story_preferences -> 'styles') = 'array' THEN story_preferences -> 'styles'
      ELSE '[]'::jsonb
    END
  ),
  updated_at = NOW();

COMMIT;
