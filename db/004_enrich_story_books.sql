BEGIN;

UPDATE story_books AS b
SET key_scenes = CASE
  WHEN c.key = 'fairy_tale' AND b.slug ~ '(little-red-riding-hood|wolf-and-the-seven-kids|three-little-pigs|goldilocks-and-the-three-bears)' THEN
    jsonb_build_array(
      '《' || b.title || '》里危险第一次敲门的时刻',
      '分身提前识破伪装或轻信带来的裂缝',
      '故事从被动受困改写成主动试探与反击'
    )
  WHEN c.key = 'fairy_tale' AND b.slug ~ '(magic-lamp|ali-baba|jack-and-the-beanstalk|fisherman-and-the-goldfish|golden-goose|twelve-months)' THEN
    jsonb_build_array(
      '《' || b.title || '》里奇迹第一次显灵的瞬间',
      '分身和主角重新谈判愿望背后的代价',
      '原本单向兑现的奇遇被改写成一次选择'
    )
  WHEN c.key = 'fairy_tale' AND b.slug ~ '(sleeping-beauty|snow-white|cinderella|beauty-and-the-beast|little-mermaid|rapunzel|bluebeard)' THEN
    jsonb_build_array(
      '《' || b.title || '》里命运最沉默也最关键的一夜',
      '分身先于旧剧情问出了角色真正不敢回答的问题',
      '故事从等待拯救改写成彼此看见与选择'
    )
  WHEN c.key = 'fairy_tale' AND b.slug ~ '(ugly-duckling|little-match-girl|steadfast-tin-soldier|wild-swans|thumbelina|snow-queen)' THEN
    jsonb_build_array(
      '《' || b.title || '》里孤独感最强烈的节点',
      '分身陪主角把痛苦翻译成一次新的决定',
      '原本带着伤口前行的童话出现了回望与回应'
    )
  WHEN c.key = 'fairy_tale' THEN
    jsonb_build_array(
      '《' || b.title || '》里命运开始拐弯的入口',
      '分身第一次和主角说出不同于原剧情的话',
      '旧童话被轻轻推向新的版本'
    )
  WHEN c.key = 'fable' AND b.slug ~ '(crow-and-the-fox|fox-and-the-grapes|the-lion-and-the-mouse|wolf-and-the-lamb|the-farmer-and-the-viper|the-fox-borrowing-the-tigers-might)' THEN
    jsonb_build_array(
      '《' || b.title || '》里角色最确信自己判断的那一刻',
      '分身先看见了奉承、偏见或力量关系中的盲区',
      '一句本该直接给出寓意的话被展开成新的选择题'
    )
  WHEN c.key = 'fable' AND b.slug ~ '(tortoise-and-the-hare|the-ant-and-the-grasshopper|waiting-by-a-tree-stump|mend-the-fold-after-losing-sheep|the-foolish-old-man-who-moved-the-mountains)' THEN
    jsonb_build_array(
      '《' || b.title || '》里习惯和结果即将碰撞的瞬间',
      '分身把角色原本不愿面对的代价提前摆上台面',
      '原本简短的因果被改写成更长的成长回路'
    )
  WHEN c.key = 'fable' AND b.slug ~ '(self-contradiction|drawing-legs-on-a-snake|covering-ones-ears-while-stealing-a-bell|returning-the-pearl-and-keeping-the-box|the-man-of-zheng-buys-shoes)' THEN
    jsonb_build_array(
      '《' || b.title || '》里荒唐逻辑最完整的一刻',
      '分身插入一个无法被自欺轻易绕过的问题',
      '角色不得不重新理解自己一直坚持的做法'
    )
  WHEN c.key = 'fable' THEN
    jsonb_build_array(
      '《' || b.title || '》里习惯性判断即将发生的瞬间',
      '分身插入一个更难回答的问题',
      '角色不得不重新理解自己原来的做法'
    )
  WHEN c.key = 'mythology' AND b.slug ~ '(prometheus|pandora|persephone|orpheus|psyche|change-flies-to-the-moon|the-cowherd-and-the-weaver-girl)' THEN
    jsonb_build_array(
      '《' || b.title || '》里禁令、爱与代价同时逼近的时刻',
      '分身在失去发生之前试着改写角色的回答方式',
      '神话从注定受罚转向一次更有人性的抉择'
    )
  WHEN c.key = 'mythology' AND b.slug ~ '(perseus|theseus|achilles|odysseus|heracles|atalanta|the-trojan-horse|nezha|houyi|yu-controls-the-flood|the-yellow-emperor-battles-chiyou|thor)' THEN
    jsonb_build_array(
      '《' || b.title || '》里英雄必须出手的临界点',
      '分身在预言、战斗或试炼之间打开另一种策略',
      '原本只靠勇武推进的神话多了一层判断与代价'
    )
  WHEN c.key = 'mythology' AND b.slug ~ '(nuwa|pangu|kuafu|jingwei|xingtian|gonggong|shennong|cangjie|odin|fenrir)' THEN
    jsonb_build_array(
      '《' || b.title || '》里天地秩序开始震动的节点',
      '分身第一次站在神意与执念之间提出不同解释',
      '原本宏大的神话被推开一条更贴近人的裂缝'
    )
  WHEN c.key = 'mythology' THEN
    jsonb_build_array(
      '《' || b.title || '》里命运开始显形的节点',
      '分身第一次与关键角色站到同一个问题面前',
      '原本不可更改的神话被推开一道新的裂缝'
    )
  ELSE b.key_scenes
END
FROM story_categories AS c
WHERE b.category_id = c.id
  AND (b.key_scenes IS NULL OR b.key_scenes = '[]'::jsonb);

COMMIT;
