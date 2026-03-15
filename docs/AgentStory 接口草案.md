# AgentStory 接口草案

> 面向前后端协作的首版接口草案
> 更新日期：2026-03-15

---

## 1. 说明

本草案用于统一 AgentStory 首版前后端接口边界，覆盖登录后用户读取、首页推荐、故事系统、发现页互动和我的页沉淀等核心链路。

当前以能力边界和输入输出形状为主，不绑定具体框架实现。

建议接口风格：

- JSON API
- 统一鉴权
- 统一返回 `success / data / error`

---

## 2. 统一返回格式

### 成功响应

```json
{
  "success": true,
  "data": {}
}
```

### 失败响应

```json
{
  "success": false,
  "error": {
    "code": "story_generate_failed",
    "message": "这段故事暂时没有回应你"
  }
}
```

---

## 3. 账号与动物人格

### 3.1 获取当前用户信息

`GET /api/me`

用途：

- 获取当前登录用户基础信息
- 用于首页、我的页和全局状态初始化

返回建议：

```json
{
  "success": true,
  "data": {
    "id": "user_001",
    "displayName": "Alice",
    "avatar": "https://...",
    "animalProfileId": "animal_001",
    "onboardingCompleted": true
  }
}
```

补充说明：

- `animalProfileId` 对应的动物详情需通过 `GET /api/me/animal-profile` 获取
- `animalType` 的首版枚举范围以 [AgentStory MVP 动物类型范围](/Users/showjoy/devmore/waytoagi/AgentStory/docs/AgentStory%20MVP%20%E5%8A%A8%E7%89%A9%E7%B1%BB%E5%9E%8B%E8%8C%83%E5%9B%B4.md) 为准

### 3.2 获取当前动物人格

`GET /api/me/animal-profile`

用途：

- 获取专属动物代表
- 首页左下角入口展示
- 我的页展示

返回建议：

```json
{
  "success": true,
  "data": {
    "id": "animal_001",
    "animalType": "fox",
    "animalName": "狐狸",
    "summary": "你会先观察，再决定什么时候进入故事。",
    "mappingReason": "你更擅长先观察局势，再判断什么时候靠近，所以你的分身更像一只狐狸。",
    "mappingVersion": "v1",
    "confidenceScore": 86,
    "displayLabel": "动物人格",
    "tendencies": ["机敏", "好奇", "会判断"],
    "values": ["保持余地", "理解局势", "寻找转机"],
    "expressionStyle": "轻快但有判断力",
    "dimensionScores": {
      "warmth": 58,
      "action": 71,
      "thinking": 82,
      "expression": 66
    },
    "storyPreferences": {
      "preferredCategories": ["fable", "fairy_tale"],
      "preferredStyles": ["zhihu", "fable", "light_web"],
      "preferredRoleTypes": ["观察者", "试探者"],
      "preferredConflictTypes": ["规则博弈", "误解反转"]
    }
  }
}
```

补充说明：

- `mappingReason` 用于人格卡中的“为什么是这个动物”说明
- `confidenceScore` 首版可保留给前端和调试，不要求主界面直接展示
- `displayLabel` 用于前端统一展示“动物人格”文案
- `dimensionScores` 用于我的页或人格卡中的维度图展示
- 映射逻辑基线见 [AgentStory 动物映射规则](/Users/showjoy/devmore/waytoagi/AgentStory/docs/AgentStory%20%E5%8A%A8%E7%89%A9%E6%98%A0%E5%B0%84%E8%A7%84%E5%88%99.md)

### 3.3 重新生成动物人格

`POST /api/me/animal-profile/regenerate`

用途：

- 在动物人格获取失败或需要刷新时重新生成

请求建议：

```json
{
  "force": true
}
```

---

## 4. 首页与故事书

### 4.1 获取首页数据

`GET /api/home`

用途：

- 一次性拉取首页所需内容

返回建议包含：

- 当前用户动物入口摘要
- 今日自动推荐故事
- 当前连载入口
- 书架分类与封面书列表

### 4.2 获取书架分类

`GET /api/story-categories`

用途：

- 获取童话 / 寓言 / 神话分类

### 4.3 获取故事书列表

`GET /api/story-books`

查询参数建议：

- `category`
- `limit`
- `cursor`

用途：

- 分类浏览
- 首页查看更多
- 发现故事库

### 4.4 获取故事书详情

`GET /api/story-books/:bookId`

用途：

- 进入故事详情页

返回建议包含：

- 基础信息
- 关键情节
- 原故事背景摘要
- 当前用户与该书的关联状态

---

## 5. 故事系统

### 5.1 获取当前连载主线

`GET /api/story/thread/current`

用途：

- 故事 Tab 默认进入连载页
- 首页显示当前正在推进的故事

### 5.2 获取连载章节列表

`GET /api/story/thread/:threadId/episodes`

查询参数建议：

- `limit`
- `cursor`

用途：

- 获取连载章节列表
- 支持历史章节分页

### 5.3 获取单章详情

`GET /api/story/episodes/:episodeId`

用途：

- 阅读单章完整正文

### 5.4 获取短篇列表

`GET /api/story/short-stories`

查询参数建议：

- `limit`
- `cursor`

### 5.5 获取单篇短篇详情

`GET /api/story/short-stories/:shortStoryId`

### 5.6 手动进入一本书生成短篇

`POST /api/story/short-stories`

用途：

- 用户在故事详情页点击 `进入故事`
- 手动触发一篇短篇生成

请求建议：

```json
{
  "bookId": "book_001",
  "triggerScene": "wolf_meets_red_riding_hood"
}
```

返回建议：

- 任务状态
- 生成中的短篇 ID

### 5.7 获取故事时间线

`GET /api/story/timeline`

用途：

- 我的页故事时间线

---

## 6. 发现页与互动

### 6.1 获取发现页故事流

`GET /api/feed/stories`

查询参数建议：

- `type`：`all / episode / short_story`
- `cursor`
- `limit`

用途：

- 获取发现页公开故事流

### 6.2 获取故事卡详情

`GET /api/feed/stories/:feedStoryId`

用途：

- 获取故事卡详情与评论预览

### 6.3 点赞故事

`POST /api/feed/stories/:feedStoryId/like`

用途：

- 用户点赞公开故事

### 6.4 取消点赞

`DELETE /api/feed/stories/:feedStoryId/like`

### 6.5 获取 AI 评论列表

`GET /api/feed/stories/:feedStoryId/comments`

用途：

- 查看评论区

### 6.6 触发 AI 评论生成

`POST /api/feed/stories/:feedStoryId/comments/generate`

用途：

- 用户浏览或互动后触发评论生成
- 也可由系统异步触发

请求建议：

```json
{
  "trigger": "view"
}
```

---

## 7. 我的页与分享

### 7.1 获取我的页汇总数据

`GET /api/me/dashboard`

用途：

- 拉取我的页所需聚合信息

返回建议包含：

- 动物人格摘要
- 人格维度图数据
- 时间线预览
- 连载记录预览
- 短篇记录预览

### 7.2 获取分享卡片数据

`GET /api/me/share-card`

用途：

- 获取动物人格卡或故事卡分享数据

---

## 8. 异步任务相关接口

### 8.1 查询短篇生成状态

`GET /api/jobs/short-stories/:jobId`

### 8.2 查询评论生成状态

`GET /api/jobs/comments/:jobId`

### 8.3 查询连载最新生成状态

`GET /api/jobs/thread/:threadId/latest`

用途：

- 前端轮询生成中的内容
- 展示“正在生成”或“已完成”

---

## 9. 建议的前端读取顺序

### 首页

1. `GET /api/me`
2. `GET /api/me/animal-profile`
3. `GET /api/home`

### 故事 Tab

1. `GET /api/story/thread/current`
2. `GET /api/story/thread/:threadId/episodes`
3. `GET /api/story/short-stories`

### 发现页

1. `GET /api/feed/stories`
2. 展开评论时 `GET /api/feed/stories/:feedStoryId/comments`

### 我的页

1. `GET /api/me/dashboard`
2. `GET /api/story/timeline`

---

## 10. 待后续补充

当前尚未细化：

- 鉴权失败与刷新 token 策略
- 评论触发频率限制
- 分页游标格式
- 生成任务的事件流或 SSE 方案
- 后台管理接口
