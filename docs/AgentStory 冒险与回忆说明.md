# AgentStory 冒险优先说明

更新日期：2026-03-17

## 1. 主导航

- 首页：`/`
- 冒险：`/adventure`
- 我的：`/me`

兼容跳转：

- `/story` -> `/adventure`
- `/story?tab=short` -> `/memory`
- `/discover` -> `/adventure`

当前阶段：

- `回忆` 已暂时下线，主导航不再展示
- `/memory` 保留为兼容提示页，不再生成或展示睡前故事
- 历史回忆数据仍保留在数据库中，但不会出现在当前 UI

## 2. 冒险

冒险是公开的共享副本。

- 用户从书详情点击“进入冒险”时，总是创建一条新的副本
- 同一本书的创建者如果已有未完结副本，入口会改成“继续冒险”
- 其他用户只能在冒险页或冒险详情页里加入别人的副本
- 一条冒险最多 `1` 位创建者 + `4` 位加入者
- 一条冒险最多生成 `10` 篇，达到后自动完结
- 首篇生成时锁定风格，后续所有篇章沿用同一风格

## 3. 回忆状态

回忆功能当前处于 dormant 状态。

- 路由：`/memory` 仅用于承接旧链接和提示下线状态
- 不再主动生成、读取或展示回忆内容
- `bedtime_memories` 表与 LLM 生成链路保留，后续可重新接回
- 历史回忆不会进入“我的”页时间线或统计

## 4. SecondMe 缓存

故事生成不再每次实时请求 SecondMe。

- 首次无缓存时，请求 `user/info`、`user/shades`、`user/softmemory`
- 成功后写入 `secondme_context_cache`
- 缓存有效期固定为成功拉取后的 `24` 小时
- 24 小时内再次生成冒险时，直接使用数据库缓存
- 缓存过期后，首次生成会重新拉取并刷新缓存
- 拉取失败但旧缓存存在时，可继续使用旧缓存兜底

## 5. 关键表

- `story_threads`：共享冒险线程
- `story_thread_participants`：冒险参与者
- `story_episodes`：冒险章节
- `bedtime_memories`：每日回忆
- `secondme_context_cache`：SecondMe 24 小时缓存
- `timeline_items`：我的页时间线
