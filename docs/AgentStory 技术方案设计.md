# AgentStory 技术方案设计

> 面向 MVP 落地的推荐技术方案
> 更新日期：2026-03-15

---

## 1. 文档目标

这份文档用于把 AgentStory 当前 PRD 转成可执行的技术设计方案，重点回答：

- 首版系统应该如何拆模块
- 前后端与生成链路怎么协作
- 自动连载、短篇、AI 评论如何落地
- SecondMe、动物人格、故事推荐如何串起来
- MVP 阶段怎样控制复杂度

当前仓库尚未进入代码实现阶段，因此本方案采用“推荐架构”写法，优先保证：

- 能快速启动
- 能支撑 MVP
- 能平滑演进到后续版本

---

## 2. 设计目标

### 2.1 MVP 技术目标

- 支撑 `首页 / 故事 / 发现 / 我的` 4 个 Tab
- 支撑 `连载 / 短篇` 双内容形态
- 支撑 SecondMe 登录和动物人格生成
- 支撑每日自动生成连载
- 支撑发现页点赞与 AI 自动评论
- 支撑我的页时间线和人格维度图
- 支撑移动端与桌面端的响应式体验

### 2.2 技术原则

- Web 端优先，架构尽量简单
- Mobile first，但不能只做移动端
- 读写分离按逻辑而不是按物理服务强拆
- 同步链路轻，生成链路异步
- 所有 AI 生成必须可追踪、可回放、可重试
- 推荐结果与动物人格结果必须可解释
- 页面布局、组件尺寸和图表展示必须具备响应式适配能力

---

## 3. 推荐技术栈

由于当前项目还没有既定代码栈，首版建议采用如下组合：

### 3.1 Web / BFF

- `Next.js`
- `React`
- `TypeScript`
- `Tailwind CSS`

推荐原因：

- 前端页面和 BFF API 可放在一个工程内，启动快
- 适合首页、故事详情、发现流、我的页这类偏内容型页面
- 后续如果需要再拆成独立前后端，迁移成本可控
- 对响应式布局、服务端渲染和渐进增强支持成熟

### 3.2 数据层

- `PostgreSQL`
- `Prisma` 或等价 ORM

推荐原因：

- 当前实体关系明确，关系型数据库更适合 MVP
- `AnimalProfile`、`StoryThread`、`StoryEpisode`、`FeedStory` 等对象天然适合关系建模
- `json/jsonb` 可以承载 `storyPreferences`、`dimensionScores`、`meta`

首版建议：

- 数据库可以先使用本地 `PostgreSQL`
- 也可以直接使用托管的 `dev` 数据库
- 不建议直接把测试 / 生产环境和开发共用

### 3.3 缓存与异步任务

- 首期可选：`不使用 Redis`
- 后续增强：`Redis + BullMQ` 或等价队列

推荐原因：

- 自动连载、短篇生成、AI 评论都需要异步能力
- MVP 前期可先用数据库 `jobs` 表承接任务和状态
- 当任务量上升后，再切换到 `Redis + 队列`
- 首页推荐、发现流缓存也可在后期再加

### 3.4 文件与静态资源

- `S3 兼容对象存储`

用于承载：

- 分享图
- 故事封面图
- 生成后的静态卡片资源

### 3.5 AI 与外部能力

- `SecondMe API`
- `LLM 网关层`

推荐做法：

- 不让前端直接调用 SecondMe 或生成模型
- 所有外部 AI 调用统一收口到服务端

---

## 4. 系统模块拆分

首版建议拆成 6 个逻辑模块。

### 4.1 用户与身份模块

职责：

- SecondMe 登录
- 用户信息初始化
- 动物人格生成与刷新

核心对象：

- `User`
- `AnimalProfile`

### 4.2 故事内容模块

职责：

- 故事分类与故事书管理
- 关键情节读取
- 故事详情展示

核心对象：

- `StoryCategory`
- `StoryBook`

### 4.3 生成主链路模块

职责：

- 连载生成
- 短篇生成
- Prompt 拼装
- 风格选择

核心对象：

- `StoryStyle`
- `StoryThread`
- `StoryEpisode`
- `ShortStory`

### 4.4 社区互动模块

职责：

- 发现流投影
- 点赞
- AI 自动评论

核心对象：

- `FeedStory`
- `StoryLike`
- `AIComment`

### 4.5 我的沉淀模块

职责：

- 时间线聚合
- 人格维度图展示
- 我的连载和短篇记录

核心对象：

- `TimelineItem`
- `AnimalProfile.dimensionScores`

### 4.6 调度与任务模块

职责：

- 每日连载生成调度
- AI 评论异步生成
- 重试、失败兜底、任务状态查询

---

## 5. 推荐架构形态

首版推荐采用“单体应用 + 异步 Worker”的结构，而不是一开始上微服务。

在 MVP 前期，Worker 可以先基于数据库任务表轮询运行；当异步量上升后，再升级为 `Redis + 队列`。

### 5.1 架构图

```text
Web App (Next.js)
  ├── 页面层
  ├── BFF API
  └── 管理生成状态轮询

Core App
  ├── Identity Module
  ├── Story Module
  ├── Generation Module
  ├── Feed Module
  └── Timeline Module

Infra
  ├── PostgreSQL
  ├── Generation Jobs Table
  ├── Worker
  ├── Redis (optional, phase 2+)
  ├── Object Storage
  ├── SecondMe API
  └── LLM Provider
```

### 5.2 为什么先不拆微服务

- 当前团队更需要速度而不是复杂治理
- 生成任务虽然异步，但业务边界还没有大到必须拆服务
- MVP 的复杂度主要在链路，而不是在超高并发

### 5.3 为什么首期可以先不用 Redis

- 当前更重要的是先跑通登录、动物人格、首页、故事详情和基础生成链路
- Redis 会让本地环境和部署资源多一层复杂度
- 使用数据库任务表也能支撑首版低频异步任务

首期建议：

- 短篇生成：数据库任务表 + Worker 轮询
- 连载生成：数据库任务表 + cron 调度
- AI 评论：数据库任务表 + 延迟轮询

当出现以下情况时，再补 Redis：

- 任务量明显增加
- 重试和延迟调度变复杂
- 需要更稳定的任务吞吐和监控

### 5.4 为什么前端必须按响应式设计实现

- AgentStory 首页是书架式结构，天然需要同时兼顾手机纵向浏览和桌面大屏陈列
- 我的页有人格维度图和时间线，若只按单端设计，很容易在另一端失真
- 发现页和故事阅读都属于高停留时长页面，需要在平板和桌面端提升可读性

因此首版前端实现应默认支持：

- 手机端
- 平板端
- 桌面端

而不是先只做一个尺寸再被动补适配。

---

## 6. 响应式前端方案

### 6.1 适配策略

首版建议采用：

- `mobile first`
- CSS Grid + Flex 组合布局
- 组件级断点控制
- 内容优先的自适应而不是设备特判

不建议：

- 单独维护移动端和桌面端两套页面
- 通过 JS 大量判断设备后切不同 DOM 结构

### 6.2 断点建议

建议断点：

- `sm`: `640px`
- `md`: `768px`
- `lg`: `1024px`
- `xl`: `1280px`

使用原则：

- `sm` 以下按手机单列布局
- `md` 开始优化平板阅读宽度与卡片密度
- `lg` 开始增强书架陈列、发现流双列和我的页分区
- `xl` 控制最大阅读宽度，避免内容过散

### 6.3 页面级适配规则

首页：

- 手机端以纵向书架分区为主
- 平板和桌面端可增加每组书封面的列数
- 左下角动物人格入口在小屏保持悬浮，在大屏可结合侧边信息区

故事页：

- 阅读正文在桌面端必须限制最大行宽
- 连载与短篇列表在大屏可做双栏信息密度优化

发现页：

- 手机端单列故事流
- 平板和桌面端可两列，但卡片内部保持单列阅读顺序

我的页：

- 手机端人格维度图置于时间线之前，纵向排列
- 大屏可采用“人格区 + 时间线区”的两栏布局

### 6.4 图表与人格维度图适配

人格维度图是 MVP 的重点展示组件，必须具备响应式规则：

- 小屏时优先保证标签清晰和图形完整
- 中屏时允许增加说明文案
- 大屏时允许与人格说明并排展示
- 不允许因为宽度不足而裁切图表

建议：

- 图表容器使用固定纵横比
- 文案说明与图表分离，避免小屏挤压
- 使用 SVG 或 canvas 方案，但前者更利于可访问性和响应式布局

### 6.5 组件级要求

所有核心组件都应具备以下能力：

- 最小可触达尺寸不少于 `44x44`
- 文本在窄屏不溢出
- 书封面卡可自适应列数变化
- CTA 在小屏保持主次明确
- 底部 Tab 在手机端固定，在大屏不强制保留大面积空白

### 6.6 SSR 与前端渲染注意点

响应式实现应优先基于 CSS，而不是等待前端 hydrate 后再判断布局。

原因：

- 首页和故事页首屏更稳定
- 避免 SSR/CSR 不一致
- 降低布局抖动

因此建议：

- 布局切换优先用 Tailwind 断点类
- 仅在必要时用客户端逻辑处理复杂交互
- 不依赖 `window.innerWidth` 决定核心信息结构

---

## 7. 核心数据流

### 6.1 登录与动物人格生成

```text
前端登录
→ 服务端校验 SecondMe 身份
→ 拉取 SecondMe 性格展示结果
→ 调用动物映射规则生成 AnimalProfile
→ 写入 User / AnimalProfile
→ 返回动物人格给前端
```

### 6.2 首页读取

```text
前端请求首页
→ 读取 User + AnimalProfile
→ 读取当前连载状态
→ 读取推荐故事
→ 读取分类书架内容
→ 聚合返回 /api/home
```

### 6.3 自动连载生成

```text
调度器扫描 active StoryThread
→ 为待生成用户创建 episode job
→ Worker 拉取 thread 上下文 + AnimalProfile + StoryBook
→ 选择 style + scene + bridge
→ 调用 LLM 生成章节
→ 写入 StoryEpisode
→ 更新 StoryThread.latestEpisodeId / nextGenerateAt
→ 投影到 TimelineItem
→ 可选投影到 FeedStory
```

### 6.4 手动短篇生成

```text
用户点击“进入故事”
→ 创建 ShortStory(job=queued)
→ Worker 读取 AnimalProfile + StoryBook + triggerScene
→ 拼装 prompt
→ 生成短篇内容
→ 更新 ShortStory(status=published)
→ 投影到 TimelineItem
→ 可选投影到 FeedStory
```

### 6.5 AI 自动评论

```text
用户浏览发现页 / 点赞
→ 创建 AI comment job
→ Worker 读取当前用户 AnimalProfile + 目标 FeedStory
→ 生成评论
→ 写入 AIComment
→ 更新 FeedStory.commentCount
```

---

## 8. 关键服务设计

### 7.1 Identity Service

职责：

- 用户注册/登录态同步
- SecondMe 结果拉取
- 动物人格初始化与刷新

关键方法建议：

- `getOrCreateUserFromSecondMe()`
- `buildAnimalProfile()`
- `regenerateAnimalProfile()`

### 7.2 Recommendation Service

职责：

- 基于动物人格推荐故事书
- 推荐当前连载的下一本书或下一情节点

首版建议：

- 规则优先，不上复杂召回模型
- 规则输入来自：
  - `animalType`
  - `dimensionScores`
  - `storyPreferences`
  - `StoryBook.keyScenes`

### 7.3 Generation Service

职责：

- 统一处理连载、短篇、评论三类生成
- 统一拼装 Prompt
- 统一保存生成日志

建议拆分：

- `generateEpisode()`
- `generateShortStory()`
- `generateAIComment()`

### 7.4 Feed Projection Service

职责：

- 把 `StoryEpisode` / `ShortStory` 投影为 `FeedStory`
- 统一控制发现页展示对象

这样做的好处：

- 发现页不直接耦合多个源表
- 过滤公开范围和排序更简单

### 7.5 Timeline Projection Service

职责：

- 把章节和短篇统一投影到 `TimelineItem`

这样做的好处：

- 我的页查询更简单
- 避免前端自己拼多个列表

---

## 9. Prompt 与生成编排

### 8.1 Prompt 来源

生成链路需要组合以下输入：

- `AnimalProfile`
- `StoryBook`
- `StoryStyle`
- 业务场景片段
- 上下文摘要

对应文档：

- [AgentStory 动物映射规则](/Users/showjoy/devmore/waytoagi/AgentStory/docs/AgentStory%20%E5%8A%A8%E7%89%A9%E6%98%A0%E5%B0%84%E8%A7%84%E5%88%99.md)
- [AgentStory 故事风格规范](/Users/showjoy/devmore/waytoagi/AgentStory/docs/AgentStory%20%E6%95%85%E4%BA%8B%E9%A3%8E%E6%A0%BC%E8%A7%84%E8%8C%83.md)
- [AgentStory 首版风格配置表](/Users/showjoy/devmore/waytoagi/AgentStory/docs/AgentStory%20%E9%A6%96%E7%89%88%E9%A3%8E%E6%A0%BC%E9%85%8D%E7%BD%AE%E8%A1%A8.md)
- [AgentStory Prompt 配置表](/Users/showjoy/devmore/waytoagi/AgentStory/docs/AgentStory%20Prompt%20%E9%85%8D%E7%BD%AE%E8%A1%A8.md)

### 8.2 编排建议

连载章节：

- 读取当前线程上下文
- 选择主风格
- 生成“上一章摘要 + 本章目标 + 风格片段 + 动物人格片段”
- 落地章节正文和摘要

短篇：

- 不依赖长上下文
- 重点突出单次切入点和风格辨识度

AI 评论：

- 只生成短文本
- 控制字数和同质化
- 必须带有动物人格差异

### 8.3 生成日志建议

建议单独记录生成日志表，至少保存：

- 任务类型
- 输入 prompt 摘要
- 版本号
- 模型名
- 生成时间
- 输出状态
- 错误信息

首版即使不做单独表，也应保留可追踪日志。

---

## 10. 异步任务设计

首版建议优先采用数据库任务表，后续再升级为独立队列。

### 10.1 首期推荐方案

建议增加一张：

- `generation_jobs`

建议字段：

- `id`
- `jobType`
- `status`
- `payload`
- `attemptCount`
- `maxAttempts`
- `runAt`
- `startedAt`
- `finishedAt`
- `lastError`
- `createdAt`
- `updatedAt`

`jobType` 首版建议：

- `episode_generate`
- `short_story_generate`
- `ai_comment_generate`

`status` 首版建议：

- `queued`
- `running`
- `succeeded`
- `failed`

Worker 轮询逻辑建议：

1. 扫描 `runAt <= now()` 且 `status = queued`
2. 抢占任务并更新为 `running`
3. 执行业务逻辑
4. 写回 `succeeded / failed`
5. 若可重试，则递增 `attemptCount` 并重置 `runAt`

### 10.2 Episode Queue

如果后续接入 Redis，对应迁移为 `Episode Queue`。

用于每日连载生成。

任务内容建议：

- `threadId`
- `userId`
- `bookId`
- `styleId`
- `generateDate`

### 10.3 ShortStory Queue

如果后续接入 Redis，对应迁移为 `ShortStory Queue`。

用于用户主动触发的短篇生成。

任务内容建议：

- `shortStoryId`
- `userId`
- `bookId`
- `triggerScene`

### 10.4 AIComment Queue

如果后续接入 Redis，对应迁移为 `AIComment Queue`。

用于发现页 AI 评论生成。

任务内容建议：

- `feedStoryId`
- `userId`
- `trigger`

### 10.5 重试策略

建议：

- LLM 超时可重试 `2-3` 次
- 外部依赖失败与内容校验失败分开处理
- 失败后状态置为 `failed`
- 前端允许看到“稍后再来看看”

---

## 11. 缓存策略

### 11.1 适合缓存的内容

- 首页书架分类和封面列表
- 故事书详情
- 当前连载入口摘要
- 发现页第一页故事流

### 11.2 不建议强缓存的内容

- 用户动物人格结果
- 任务状态
- AI 评论生成结果

### 11.3 缓存原则

- 缓存只做性能优化，不做唯一真实来源
- 用户个性化结果优先以数据库为准

---

## 12. 一致性与状态机

### 12.1 连载状态

`StoryThread.status`

- `draft`
- `active`
- `paused`
- `completed`

### 12.2 生成内容状态

`StoryEpisode.status`
`ShortStory.status`
`AIComment.status`

- `queued`
- `generating`
- `published`
- `failed`

### 12.3 投影时机

只有在内容进入 `published` 后，才允许：

- 写入 `TimelineItem`
- 写入 `FeedStory`
- 计入前台可见列表

---

## 13. 内容质量与安全兜底

### 13.1 首版质量控制

生成后建议进行轻量校验：

- 是否为空
- 是否过短
- 是否重复上一章
- 是否脱离故事类别
- 是否出现明显不合规内容

### 13.2 失败兜底

若连载生成失败：

- 保持上一章仍可读
- 首页显示“正在准备下一章”

若短篇生成失败：

- 返回 job failed
- 前端提示稍后重试

若 AI 评论失败：

- 不阻断发现页主流程
- 评论区允许为空

---

## 14. 可观测性

首版建议至少补这三类观测：

### 14.1 业务指标

- 动物人格生成成功率
- 连载生成成功率
- 短篇生成成功率
- AI 评论生成成功率

### 14.2 任务指标

- 各队列积压数
- 平均生成耗时
- 失败重试次数

### 14.3 用户行为指标

- 首页浏览
- 连载阅读
- 短篇触发
- 点赞
- 评论生成触发
- 我的页维度图曝光
- 响应式断点分布
- 各断点核心页面停留时长
- 各断点首屏渲染性能

---

## 15. 推荐数据库表草案

基于当前文档，首版建议至少包含：

- `users`
- `animal_profiles`
- `story_categories`
- `story_books`
- `story_styles`
- `story_threads`
- `story_episodes`
- `short_stories`
- `timeline_items`
- `feed_stories`
- `story_likes`
- `ai_comments`

可选但首期强烈建议：

- `generation_jobs`

后续增强可加：

- `generation_logs`

---

## 16. MVP 实施顺序

### Phase 1

- 用户登录
- AnimalProfile 生成
- 首页书架读取
- 故事详情页读取
- 首页与故事详情页响应式骨架
- `generation_jobs` 表和基础 Worker 跑通

### Phase 2

- ShortStory 异步生成
- StoryThread / StoryEpisode 自动生成
- TimelineItem 投影
- 我的页维度图响应式适配

### Phase 3

- FeedStory 投影
- 点赞
- AIComment 异步生成
- 发现页与故事列表大屏适配

### Phase 4

- 生成质量优化
- 缓存优化
- 任务监控与告警
- 视任务规模决定是否接入 Redis

---

## 17. 关键技术决策

### 17.1 为什么推荐 Web + BFF 一体化

- 仓库当前还没有进入工程实现
- 一体化更适合快速启动 MVP
- 页面与接口联调成本更低

### 17.2 为什么推荐“单体 + Worker”

- 自动连载和短篇需要异步任务
- 但业务还没复杂到必须拆微服务
- 单体应用更利于当前阶段快速迭代

### 17.3 为什么前期推荐“数据库 jobs 表”而不是直接上 Redis

- 更少依赖，更快启动
- 更适合当前文档阶段和 MVP 低频异步量
- 对开发同学更容易观察和排查
- 后续升级到 Redis 队列时，任务模型仍可复用

### 17.4 为什么推荐规则驱动推荐

- 首版内容量小
- 动物人格与故事映射本来就有明确规则
- 规则更容易解释，也更利于调优

### 17.5 为什么响应式必须进入技术方案而不是只留在设计规范里

- 首页书架和我的页维度图都直接影响产品理解
- 如果技术方案里不提前约束，开发阶段很容易只完成单尺寸页面
- 响应式会影响组件结构、图表实现、缓存策略和首屏渲染方式

---

## 18. 风险与对策

| 风险 | 影响 | 对策 |
|------|------|------|
| 连载生成慢 | 首页和故事页体验下降 | 异步任务化，前台只读状态和已发布内容 |
| 连载跨书逻辑过乱 | 用户看不懂主线 | 先用 `StoryThread.meta` 保存清晰桥接摘要 |
| 评论生成太频繁 | 社区内容噪音大 | 为 AI 评论增加触发频率限制 |
| 动物人格和推荐脱节 | 用户不信任系统 | 推荐服务只使用可解释规则输入 |
| 前台查询过重 | 首页和我的页变慢 | Feed 和 Timeline 都使用投影表 |
| 大屏和小屏体验断裂 | 产品感知不一致 | 组件从一开始按响应式设计，关键页面做断点验收 |
| 首期基础设施过重 | 启动成本高 | 开发期先用托管 dev DB 或本地 DB，异步先用 jobs 表 |

---

## 19. 响应式验收口径

MVP 至少按以下口径验收：

- 首页在手机和桌面都能清楚看出“书架 + 当前推荐 + 动物人格入口”
- 故事详情页在桌面端阅读宽度舒适，在手机端 CTA 不拥挤
- 发现页在小屏单列可读，在大屏不会变成信息过散的瀑布流
- 我的页的人格维度图在手机和平板都完整可读
- 不出现横向滚动、不出现关键 CTA 被折叠、不出现图表裁切

---

## 20. 推荐后续文档

如果继续往实现推进，下一步最适合补这 3 份：

1. `AgentStory 字段级接口规范`
2. `AgentStory 数据库 Schema 草案`
3. `AgentStory 任务队列与生成状态规范`
4. `AgentStory 响应式页面实现规范`
