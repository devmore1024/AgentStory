# AgentStory 数据结构草案

> 面向产品与研发协同的数据对象草案
> 更新日期：2026-03-15

---

## 1. 说明

本草案用于统一 AgentStory 的核心数据对象理解，便于后续数据库设计、接口定义和前后端协作。

当前以产品语义为主，不绑定具体 ORM 或数据库实现，但默认适合关系型数据库 + JSON 扩展字段的实现方式。

---

## 2. 核心实体总览

建议首版包含以下核心实体：

- `User`
- `AnimalProfile`
- `StoryCategory`
- `StoryBook`
- `StoryStyle`
- `StoryThread`
- `StoryEpisode`
- `ShortStory`
- `TimelineItem`
- `FeedStory`
- `StoryLike`
- `AIComment`

---

## 3. 实体定义

### 3.1 User

用于表示 AgentStory 中的用户主体。

建议字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 用户主键 |
| secondmeUserId | string | SecondMe 用户 ID |
| displayName | string | 展示名称 |
| avatar | string | 用户头像 |
| animalProfileId | string | 当前绑定的动物人格 ID |
| onboardingCompleted | boolean | 是否完成首次引导 |
| createdAt | datetime | 创建时间 |
| updatedAt | datetime | 更新时间 |

### 3.2 AnimalProfile

用于表示用户的专属动物代表与人格展示。

建议字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 动物人格主键 |
| userId | string | 所属用户 |
| animalType | string | 动物类型，首版固定为 bear / deer / fox / owl / wolf / cat / rabbit / raven |
| animalName | string | 展示名称 |
| summary | string | 一句话人格摘要 |
| tendencies | json | 倾向标签数组 |
| values | json | 价值观说明 |
| expressionStyle | string | 表达风格说明 |
| dimensionScores | json | 人格维度分值，建议包含 warmth / action / thinking / expression |
| storyPreferences | json | 偏好的故事题材和角色类型 |
| mappingVersion | string | 映射规则版本，如 v1 |
| mappingReason | string | 映射原因说明 |
| confidenceScore | integer | 置信度，建议 0-100 |
| shareCardImage | string | 分享图地址，可选 |
| rawSecondMeProfile | json | 原始性格展示结果 |
| createdAt | datetime | 创建时间 |
| updatedAt | datetime | 更新时间 |

### 3.3 StoryCategory

用于表示故事分类。

建议字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 分类主键 |
| key | string | 固定值：fairy_tale / fable / mythology |
| name | string | 中文名称：童话 / 寓言 / 神话 |
| sortOrder | integer | 排序 |

### 3.4 StoryBook

用于表示一本可浏览、可进入的故事书。

建议字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 故事书主键 |
| categoryId | string | 所属分类 |
| title | string | 书名 |
| slug | string | 稳定路由标识 |
| coverImage | string | 封面图 |
| summary | text | 故事简介 |
| keyScenes | json | 关键情节列表 |
| originalSynopsis | text | 原故事背景摘要 |
| publicDomain | boolean | 是否为公版故事 |
| isActive | boolean | 是否启用 |
| createdAt | datetime | 创建时间 |
| updatedAt | datetime | 更新时间 |

### 3.5 StoryStyle

用于表示故事生成风格。

建议字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 风格主键 |
| key | string | 风格标识，如 fairy / dark / zhihu / pain |
| name | string | 风格名称 |
| description | text | 风格说明 |
| tone | string | 语气 |
| pace | string | 节奏 |
| emotionLevel | integer | 情绪浓度，建议 1-5 |
| metaphorLevel | integer | 意象密度，建议 1-5 |
| isActive | boolean | 是否启用 |
| createdAt | datetime | 创建时间 |
| updatedAt | datetime | 更新时间 |

### 3.6 StoryThread

用于表示用户的自动连载主线。

建议字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 连载主线主键 |
| userId | string | 所属用户 |
| title | string | 连载标题 |
| status | string | draft / active / paused / completed |
| currentBookId | string | 当前推进中的故事书 |
| latestEpisodeId | string | 最近一章 ID |
| primaryStyleId | string | 主风格 |
| nextGenerateAt | datetime | 下一次生成时间 |
| lastGeneratedAt | datetime | 最近生成时间 |
| meta | json | 连载扩展信息 |
| createdAt | datetime | 创建时间 |
| updatedAt | datetime | 更新时间 |

### 3.7 StoryEpisode

用于表示连载中的单章内容。

建议字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 章节主键 |
| threadId | string | 所属连载 |
| userId | string | 所属用户 |
| bookId | string | 本章关联的故事书 |
| episodeNo | integer | 章节序号 |
| styleId | string | 本章使用的主风格 |
| title | string | 章节标题 |
| excerpt | text | 章节摘要 |
| content | longtext | 正文内容 |
| bridgeFromPrevious | text | 与上一章的衔接说明 |
| generatedAt | datetime | 生成时间 |
| status | string | queued / generating / published / failed |
| createdAt | datetime | 创建时间 |
| updatedAt | datetime | 更新时间 |

### 3.8 ShortStory

用于表示用户手动触发的一次性短篇。

建议字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 短篇主键 |
| userId | string | 所属用户 |
| bookId | string | 触发的故事书 |
| triggerScene | string | 切入情节 |
| styleId | string | 本篇使用的主风格 |
| title | string | 短篇标题 |
| excerpt | text | 短篇摘要 |
| content | longtext | 正文内容 |
| status | string | queued / generating / published / failed |
| generatedAt | datetime | 生成时间 |
| createdAt | datetime | 创建时间 |
| updatedAt | datetime | 更新时间 |

### 3.9 TimelineItem

用于表示“我的”页中的时间线沉淀，统一承载连载与短篇。

建议字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 时间线项主键 |
| userId | string | 所属用户 |
| sourceType | string | episode / short_story |
| sourceId | string | 对应章节或短篇 ID |
| title | string | 展示标题 |
| excerpt | text | 展示摘要 |
| bookId | string | 对应故事书 |
| styleId | string | 对应风格 |
| happenedAt | datetime | 发生/生成时间 |
| createdAt | datetime | 创建时间 |

### 3.10 FeedStory

用于表示进入发现页公开流的故事卡对象。

建议字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | Feed 主键 |
| userId | string | 作者用户 |
| sourceType | string | episode / short_story |
| sourceId | string | 对应源内容 |
| title | string | 展示标题 |
| excerpt | text | 展示摘要 |
| styleId | string | 主风格 |
| coverImage | string | 封面图，可选 |
| visibility | string | public / followers / private |
| likeCount | integer | 点赞数缓存 |
| commentCount | integer | 评论数缓存 |
| publishedAt | datetime | 发布时间 |
| createdAt | datetime | 创建时间 |
| updatedAt | datetime | 更新时间 |

### 3.11 StoryLike

用于表示故事点赞。

建议字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 点赞主键 |
| feedStoryId | string | 对应发现页故事 |
| userId | string | 点赞用户 |
| createdAt | datetime | 创建时间 |

建议约束：

- `feedStoryId + userId` 唯一

### 3.12 AIComment

用于表示由用户分身自动生成的评论。

建议字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 评论主键 |
| feedStoryId | string | 对应发现页故事 |
| userId | string | 评论所属用户 |
| animalProfileId | string | 使用的动物人格 |
| styleId | string | 评论风格，可选 |
| content | text | 评论内容 |
| status | string | queued / generating / published / failed |
| generatedAt | datetime | 生成时间 |
| createdAt | datetime | 创建时间 |
| updatedAt | datetime | 更新时间 |

---

## 4. 实体关系

建议关系如下：

- 一个 `User` 对应一个当前 `AnimalProfile`
- 一个 `StoryCategory` 下有多本 `StoryBook`
- 一个 `StoryStyle` 可被多条连载、章节、短篇和评论引用
- 一个 `User` 有一条或多条 `StoryThread`
- 一个 `StoryThread` 下有多条 `StoryEpisode`
- 一个 `User` 可生成多篇 `ShortStory`
- 一个 `User` 的 `TimelineItem` 来自 `StoryEpisode` 或 `ShortStory`
- 一个 `FeedStory` 绑定一条公开的章节或短篇
- 一个 `FeedStory` 有多条 `AIComment`
- 一个 `FeedStory` 有多条 `StoryLike`

---

## 5. 推荐与生成所需扩展字段

为了支持后续推荐和生成，建议保留以下扩展字段：

### AnimalProfile.storyPreferences

建议内容：

- 偏好故事分类
- 偏好角色类型
- 偏好情节冲突类型
- 偏好表达风格
- 偏好故事风格

### AnimalProfile.dimensionScores

建议内容：

- `warmth`
- `action`
- `thinking`
- `expression`

### StoryBook.keyScenes

建议内容：

- 关键节点标题
- 节点简介
- 是否适合自动连载
- 是否适合短篇切入

### StoryThread.meta

建议内容：

- 当前主线摘要
- 跨书跳转记录
- 主角关系摘要
- 生成策略版本
- 风格切换记录

---

## 6. 状态枚举建议

### AnimalProfile.animalType

首版固定枚举：

- `bear`
- `deer`
- `fox`
- `owl`
- `wolf`
- `cat`
- `rabbit`
- `raven`

### AnimalProfile.mappingVersion

- `v1`

### StoryThread.status

- `draft`
- `active`
- `paused`
- `completed`

### StoryEpisode.status

- `queued`
- `generating`
- `published`
- `failed`

### ShortStory.status

- `queued`
- `generating`
- `published`
- `failed`

### AIComment.status

- `queued`
- `generating`
- `published`
- `failed`

---

## 7. 首版接口层关注点

虽然本文件不是接口文档，但首版设计应重点支持以下数据读写：

- 当前用户信息与动物人格读取
- 首页推荐故事读取
- 故事书列表与详情读取
- 连载列表与章节读取
- 短篇列表与内容读取
- 发现页故事流读取
- 点赞写入
- AI 评论生成与读取
- 我的时间线读取

---

## 8. 首版实现建议

为了降低复杂度，首版可以采用以下策略：

- `StoryCategory` 使用固定枚举，不做后台编辑
- `FeedStory` 作为发现页的独立投影对象，避免前台直接拼接多个内容源
- `TimelineItem` 作为我的页的独立投影对象，降低查询复杂度
- `likeCount` 和 `commentCount` 可以做缓存字段
- `rawSecondMeProfile` 保留原始结果，便于后续迭代动物映射策略
- `AnimalProfile.animalType` 建议先作为固定枚举实现，范围见 [AgentStory MVP 动物类型范围](/Users/showjoy/devmore/waytoagi/AgentStory/docs/AgentStory%20MVP%20%E5%8A%A8%E7%89%A9%E7%B1%BB%E5%9E%8B%E8%8C%83%E5%9B%B4.md)
- `mappingVersion`、`mappingReason`、`confidenceScore` 建议与动物结果一同落库，规则见 [AgentStory 动物映射规则](/Users/showjoy/devmore/waytoagi/AgentStory/docs/AgentStory%20%E5%8A%A8%E7%89%A9%E6%98%A0%E5%B0%84%E8%A7%84%E5%88%99.md)
- `dimensionScores` 建议直接复用动物映射阶段的四维结果，用于我的页维度图展示

---

## 9. 待后续细化

当前尚未细化的部分：

- 动物代表映射规则
- MVP 动物类型扩容规则
- 故事推荐打分规则
- 故事风格选择规则
- 连载跨书跳转规则
- 评论触发时机与频率限制
- 内容公开范围与审核策略
