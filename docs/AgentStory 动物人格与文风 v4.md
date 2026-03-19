# AgentStory 动物人格与文风 v4

> 面向当前实现的动物人格与文风摘要
> 更新日期：2026-03-19

---

## 1. 当前实现范围

- 动物人格固定为 20 个：
  `bear deer fox owl wolf cat rabbit raven lion dog dolphin swan otter squirrel horse hedgehog elephant crane whale falcon`
- 动物人格不再绑定 `童话 / 寓言 / 神话` 分类。
- 书籍分类仍保留在书库层，用于展示和管理，但不再参与人格推荐和文风选择。
- 人格映射版本升级为 `secondme-v4`。

---

## 2. 数据结构变更

### 2.1 `AnimalPersona`

当前实现保留以下核心字段：

- `animalType`
- `animalName`
- `summary`
- `expressionStyle`
- `tendencies`
- `values`
- `recommendedStyles`
- `mappingReason`
- `dimensionScores`

当前实现已移除：

- `recommendedCategories`

### 2.2 `story_preferences`

当前实现统一为：

```json
{
  "styles": ["反套路吐槽风", "寓言风", "黑色幽默风"]
}
```

兼容规则：

- 读取旧数据时允许忽略历史 `categories`
- 新写入数据统一只保存 `styles`

---

## 3. 文风池

### 3.1 常规文风

当前常规文风共 19 个：

- `fairy` 童话风
- `fable` 寓言风
- `epic` 神话史诗风
- `dark` 暗黑风
- `pain` 伤痛文学风
- `light_web` 轻喜剧网感风
- `suspense` 悬疑风
- `healing_daily` 治愈日常风
- `black_humor` 黑色幽默风
- `folklore` 民俗怪谈风
- `growth` 冒险成长风
- `lyrical` 诗性抒情风
- `classical_poetic` 古风诗意风
- `realist` 现实主义风
- `magic_realism` 魔幻现实主义风
- `sci_future` 科幻未来风
- `hotblooded` 热血中二风
- `meta_roast` 反套路吐槽风
- `absurd_comedy` 沙雕搞笑风

### 3.2 特殊文风

- `zhihu` 继续保留为特殊实验风格
- `zhihu` 默认不进入动物人格自动分配池

### 3.3 新增文风约束

- `科幻未来风` 必须允许科技装置、未来背景、系统界面、机械结构、时空工程进入正文。
- `古风诗意风` 强调古典语感和意境，不强绑仙侠。
- `现实主义风` 强调写实、克制、贴近人性。
- `魔幻现实主义风` 允许现实中自然掺入异样与超现实。
- `热血中二风` 强调燃点、宣言感和命运感，但不空喊口号。
- `反套路吐槽风` 允许轻吐槽，但必须留在故事现场里推进情节。
- `沙雕搞笑风` 强调反差和节奏，不走低幼闹剧。

---

## 4. 20 个动物与主文风

| 动物 | 主文风 | 备选文风 |
|------|------|------|
| 熊 `bear` | 治愈日常风 | 童话风、现实主义风 |
| 鹿 `deer` | 诗性抒情风 | 伤痛文学风、古风诗意风 |
| 狐狸 `fox` | 反套路吐槽风 | 寓言风、黑色幽默风 |
| 猫头鹰 `owl` | 科幻未来风 | 悬疑风、现实主义风 |
| 狼 `wolf` | 暗黑风 | 热血中二风、神话史诗风 |
| 猫 `cat` | 诗性抒情风 | 古风诗意风、轻喜剧网感风 |
| 兔子 `rabbit` | 童话风 | 伤痛文学风、古风诗意风 |
| 乌鸦 `raven` | 悬疑风 | 黑色幽默风、反套路吐槽风 |
| 狮子 `lion` | 神话史诗风 | 冒险成长风、古风诗意风 |
| 狗 `dog` | 治愈日常风 | 轻喜剧网感风、沙雕搞笑风 |
| 海豚 `dolphin` | 魔幻现实主义风 | 诗性抒情风、童话风 |
| 天鹅 `swan` | 古风诗意风 | 诗性抒情风、伤痛文学风 |
| 水獭 `otter` | 沙雕搞笑风 | 轻喜剧网感风、治愈日常风 |
| 松鼠 `squirrel` | 轻喜剧网感风 | 沙雕搞笑风、冒险成长风 |
| 马 `horse` | 冒险成长风 | 热血中二风、神话史诗风 |
| 刺猬 `hedgehog` | 现实主义风 | 寓言风、伤痛文学风 |
| 大象 `elephant` | 现实主义风 | 治愈日常风、神话史诗风 |
| 鹤 `crane` | 民俗怪谈风 | 古风诗意风、魔幻现实主义风 |
| 鲸 `whale` | 魔幻现实主义风 | 伤痛文学风、诗性抒情风 |
| 猎鹰 `falcon` | 热血中二风 | 科幻未来风、悬疑风 |

---

## 5. 推荐与生成规则

### 5.1 动物人格映射

- `lib/persona-mapper.ts` 扩展到 20 动物关键词池
- 加入更完整的 MBTI 家族偏置
- 低信号场景使用稳定 hash fallback
- 输出统一为 `secondme-v4`

### 5.2 文风选择

- 短篇和连载文风优先使用 `persona.recommendedStyles`
- 文风选择不再读取 `book.categoryKey`
- 候选文风不足时才回退到全局常规风格池

### 5.3 书籍推荐

- 推荐主要由三部分组成：
  - 人格 cue 关键词命中
  - 书名 / 摘要 / 梗概 / 关键场景文本命中
  - 人气稳定分
- 推荐不再按 `fairy_tale / fable / mythology` 给人格做额外加分

---

## 6. 数据库与回填

- `animal_profiles.animal_type` 约束已扩到 20 个动物
- `story_styles.key` 约束已扩到 20 个 key：19 个常规文风 + `zhihu`
- 已新增回填脚本：
  - [recompute-animal-personas.ts](/Users/showjoy/devmore/waytoagi/AgentStory/scripts/recompute-animal-personas.ts)
- 该脚本会基于 `raw_secondme_profile` 全量重算并回写：
  - `animal_type`
  - `story_preferences.styles`
  - `mapping_reason`
  - `confidence_score`
  - `mapping_version`

---

## 7. 实现备注

- 旧版文档中若仍出现“8 个动物”或“动物人格绑定故事分类”，均视为历史方案。
- 当前代码实现以本文和实际类型定义为准：
  - [animal-personas.ts](/Users/showjoy/devmore/waytoagi/AgentStory/lib/animal-personas.ts)
  - [story-style.ts](/Users/showjoy/devmore/waytoagi/AgentStory/lib/story-style.ts)
  - [persona-mapper.ts](/Users/showjoy/devmore/waytoagi/AgentStory/lib/persona-mapper.ts)
