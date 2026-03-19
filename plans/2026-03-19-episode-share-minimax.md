# 章节级分享图与 MiniMax 生成方案

> 本文件是实现前的决策文档，不是执行记录。
> 目标是把“每篇文章都可分享、首次点击生成分享图、后续复用缓存”的方案定义清楚，供后续实现直接落地。

## 背景

当前 AgentStory 仓库里已经有一套人格卡分享页：

- `/me/share`
- `ShareActions`
- `PersonaSharePoster`

但这套能力还停留在“人格结果页链接分享”，没有真正覆盖故事内容本身。

目前真正会被用户当成“文章”来阅读和传播的内容，主要是：

- `memory` 详情页里的 personal 章节
- `adventure` 详情页里的 companion 章节

这些章节现在都直接渲染在详情页中，没有统一的可分享内容模型，也没有公开分享页、分享图生成链路和缓存复用能力。

这次方案的目标是：

- 让 `memory` / `adventure` 的每篇章节都能点击分享
- 首次点击时生成分享图
- 后续复用已生成的分享链接和分享图
- 分享图通过 MiniMax 文生图能力生成
- 方案收口为可复用的通用分享逻辑，而不是在单页里临时拼接

## 已确认决策

- 首版分享范围只覆盖章节级内容：
  - `personal_episode`
  - `companion_episode`
- 首版不扩到：
  - `/books/[slug]/read`
  - `/me/share`
  - 列表卡级别的整条主线分享
- 参考基线按现有页面交互规范执行，不额外新建 App 内“分享详情”次级页。
- 分享图生成时机采用：
  - 首次点击分享时生成
  - 成功后缓存复用
- 同一章节只保留一个稳定分享链接和一张稳定分享图，不做多版本。
- 分享出去的链接必须指向公开可访问页面，不能直接复用私有的 `memory` 详情链接。
- 分享图采用“两段式”方案：
  - MiniMax 只生成插画背景
  - 标题、摘要、书名等文字由应用端稳定叠加
- 不把中文标题直接交给模型出字，避免文字错误和不可控排版。

## 实现方案

### 1. 统一分享对象

新增一层统一的章节分享数据模型，用来承接页面、API 和生成链路之间的复用：

- `ShareableArticleKind = "personal_episode" | "companion_episode"`
- `EpisodeShareStatus = "pending" | "generating" | "ready" | "failed"`
- `EpisodeSharePayload`

`EpisodeSharePayload` 至少统一包含：

- `episodeId`
- `threadId`
- `kind`
- `title`
- `excerpt`
- `content`
- `bookTitle`
- `bookSlug`
- `styleName`
- `authorDisplayName`
- `shareSlug`
- `shareUrl`
- `shareImageUrl`
- `status`

页面层不再自己拼标题、分享文案和公开链接，而是统一消费这层 share payload。

### 2. 数据库存储

新增表：`story_episode_shares`

建议字段：

- `id`
- `episode_id`，唯一
- `owner_user_id`
- `share_slug`，唯一
- `status`
- `image_path`
- `prompt_text`
- `error_message`
- `generated_at`
- `created_at`
- `updated_at`

固定约束：

- 一个章节只允许对应一条分享记录
- `share_slug` 作为公开访问路径，不允许变更
- 分享图文件路径只保存稳定相对路径，方便切 CDN 和本地文件目录

### 3. 服务端分享域逻辑

新增统一服务端能力，职责固定为：

- 根据 `episodeId` 解析章节
- 判断章节属于 `personal` 还是 `companion`
- 校验当前用户是否有权限发起分享
- 查找或创建对应的分享记录
- 在缺图时启动 MiniMax 生成
- 返回可供页面直接使用的 share payload

权限规则固定为：

- `personal_episode`：
  - 只有该 personal 线程 owner 可以发起分享
- `companion_episode`：
  - 已登录用户可以发起分享
- 外部访问分享页：
  - 不要求登录
  - 只能通过已创建好的 `share_slug` 访问

### 4. API 与公开分享页

新增接口：

- `POST /api/article-shares`
  - 入参：`{ episodeId }`
  - 负责 ensure 分享记录，并在必要时触发生成
- `GET /api/article-shares/[episodeId]`
  - 返回当前章节分享状态
  - 用于前端轮询 `generating` -> `ready`

新增公开分享页：

- `/share/articles/[shareSlug]`

页面职责：

- 公开展示该章节的标题、书名、作者、正文和 CTA
- 支持未登录用户访问
- 作为微信/浏览器/系统分享的落地页
- metadata 与分享图读取同一份分享记录

### 5. 分享图生成链路

MiniMax 接入走服务端 TypeScript 客户端，不依赖本地 Codex skill 路径。

新增环境变量：

- `MINIMAX_API_KEY`
- `MINIMAX_API_HOST`，可选
- `GENERATED_SHARES_DIR`，可选

固定生成参数：

- `model=image-01`
- `response_format=base64`
- `n=1`
- `aspect_ratio=16:9`

prompt 固定从以下信息拼装：

- 章节标题
- 摘要
- 书名
- 风格名
- AgenTales 的童话叙事气质

并显式加入约束：

- `no text`
- `no typography`
- `no watermark`

生成结果写入：

- `public/generated-shares/<shareSlug>.jpeg`

若配置了 `GENERATED_SHARES_DIR`，则优先写入该目录。

### 6. 图文合成与前端接入

最终对外分享图不直接使用 MiniMax 原图，而是新增应用端合成层：

- 以 MiniMax 生成背景图作为底图
- 在应用端稳定叠加标题、摘要、书名和品牌信息
- 输出固定比例的最终分享图

建议通过公开分享页的 `opengraph-image` 路由完成最终图像输出。

前端接入规则固定为：

- `memory` 详情页每个章节卡增加 `分享文章`
- `adventure` 详情页每个章节卡增加 `分享文章`
- 首次点击后进入 `生成中`
- 生成完成后展示：
  - `系统分享`
  - `复制链接`
- 生成失败后展示：
  - `重试生成`

现有 `ShareActions` 抽成通用组件，支持：

- 直接传静态 share payload
- 传异步生成后的 share payload

## 测试与验收

需要覆盖以下验收点：

- personal 章节只能由 owner 发起分享。
- companion 章节可以正常生成分享记录并公开访问。
- 同一章节重复点击分享时，不重复创建记录，不重复生成图片。
- 分享状态能正确经历：
  - `pending`
  - `generating`
  - `ready`
  - `failed`
- 分享页在未登录状态下也能正确访问。
- 若分享图文件丢失或生成失败，公开页仍能用兜底图正常返回，不报 500。
- 章节卡上的分享按钮能正确展示：
  - 初始态
  - 生成中
  - 成功态
  - 失败重试态

建议最少覆盖的测试方向：

- `lib`：
  - share payload 组装
  - 权限校验
  - `share_slug` 查找和缓存复用
  - MiniMax 请求体构造
- `app/api`：
  - 创建分享
  - 重复请求复用
  - 失败状态返回
- `components`：
  - 分享按钮状态切换
  - 复制链接与系统分享分支
- `app/share/articles/[shareSlug]`：
  - 公开访问
  - 缺图兜底

## 默认假设

- “每一篇文章”在本期等同于章节，不包含原故事阅读页和人格卡。
- 首版只做章节级分享入口，不在列表卡上加分享。
- 分享图缓存命中后直接复用，不重新生成新的视觉版本。
- 分享图的文字排版完全由应用端控制，MiniMax 不负责出字。
- 这份方案文档只负责定义决策，不记录实现进度。
