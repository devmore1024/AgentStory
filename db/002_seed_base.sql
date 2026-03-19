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
  ('suspense', '悬疑风', '适合钩子、线索、留白式推进。', '悬疑', '中快', 3, 3, TRUE),
  ('healing_daily', '治愈日常风', '适合关系修复、细节见人的温柔故事。', '温柔', '舒缓', 3, 2, TRUE),
  ('black_humor', '黑色幽默风', '适合带荒诞反差与冷面幽默的故事。', '辛辣', '中速', 3, 2, TRUE),
  ('folklore', '民俗怪谈风', '适合旧规矩、异闻和民间传说气质。', '幽深', '中速', 3, 4, TRUE),
  ('growth', '冒险成长风', '适合强调选择、试错与向前走的故事。', '昂扬', '中快', 3, 2, TRUE),
  ('lyrical', '诗性抒情风', '适合画面感强、带余韵和情绪回声的故事。', '柔和', '舒缓', 4, 5, TRUE),
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
  is_active = EXCLUDED.is_active;

COMMIT;
