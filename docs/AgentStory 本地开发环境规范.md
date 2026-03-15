# AgentStory 本地开发环境规范

> 面向 MVP 启动阶段的本地环境约定
> 更新日期：2026-03-15

---

## 1. 目标

这份文档用于约定 AgentStory 在本地开发阶段的基础环境，确保前端、后端、生成任务和数据链路都能在开发机上跑通。

首版目标是：

- 先用开发环境完成 MVP 联调
- 不阻塞数据库和云资源申请
- 从第一天开始保留向测试 / 生产环境迁移的结构

---

## 2. 本地环境范围

MVP 开发环境默认包含：

- `PostgreSQL`，可本地也可托管 `dev`
- `Redis`，首期可选
- 本地应用服务
- 本地 Worker
- 本地静态资源目录或本地对象存储占位
- 本地 `.env.local`

---

## 3. 推荐基础组件

### 3.1 数据库

- `PostgreSQL 15+`

用途：

- 用户
- 动物人格
- 故事书
- 连载 / 短篇
- 时间线
- 发现流
- 点赞 / AI 评论

首期推荐优先级：

1. 托管 `dev` 数据库
2. 本地 `PostgreSQL`

两者都可以，但建议：

- 只用开发专库
- 不与测试 / 生产混用
- migration 和 seed 仍按正式规范执行

### 3.2 缓存与队列

- `Redis 7+`，首期可选

用途：

- 任务队列
- 任务状态
- 首页和发现页轻缓存

首期若不接 Redis，建议改用：

- `generation_jobs` 表
- Worker 轮询任务
- cron 或定时脚本推进连载生成

### 3.3 运行时

- `Node.js 20+`
- `pnpm` 或 `npm`

### 3.4 本地资源存储

MVP 阶段可先用两种方式之一：

- 项目内本地静态目录
- 本地对象存储兼容方案

首版更推荐先用本地静态目录占位，后续再迁对象存储。

---

## 4. 推荐目录与进程形态

开发阶段建议至少跑 2 到 3 个进程：

1. Web / BFF
2. Worker
3. PostgreSQL / Redis

若首期不用 Redis，则最少只需要：

1. Web / BFF
2. Worker
3. PostgreSQL

推荐形态：

```text
AgentStory
├── apps/web
├── apps/worker
├── packages/shared
├── prisma
├── scripts
└── docs
```

如果首版不做 monorepo，也至少保证：

- Web 与 Worker 的入口分开
- 配置文件统一
- 数据模型统一

---

## 5. 环境变量规范

本地环境统一使用：

- `.env.example`
- `.env.local`

建议首版至少包含这些变量：

```bash
NODE_ENV=development

DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/agentstory_dev
REDIS_URL=

APP_URL=http://localhost:3000

SECONDME_BASE_URL=
SECONDME_APP_ID=
SECONDME_APP_SECRET=

LLM_BASE_URL=
LLM_API_KEY=
LLM_MODEL=

STORAGE_MODE=local
LOCAL_UPLOAD_DIR=./storage/uploads

QUEUE_PREFIX=agentstory
CRON_ENABLE=true
JOB_DRIVER=db
```

规则：

- 不把任何本地连接信息硬编码到代码
- `.env.example` 只放变量名和示例
- `.env.local` 不提交版本库

---

## 6. 本地数据库约定

### 6.1 数据库名

建议开发数据库名：

- `agentstory_dev`

如需测试隔离，可再加：

- `agentstory_test`

### 6.2 数据库初始化原则

- 所有表结构通过 migration 管理
- 禁止手工改表作为长期方案
- seed 数据单独管理

### 6.3 本地数据分层

建议本地至少准备三类数据：

- 基础分类数据
- 故事书种子数据
- 风格与动物人格种子数据

---

## 7. Redis 与 jobs 表约定

### 7.1 首期默认方案

首期建议优先使用数据库任务表：

- `generation_jobs`

用于承载：

- `episode_generate`
- `short_story_generate`
- `ai_comment_generate`

建议约束：

- Worker 通过 `runAt + status` 轮询
- 失败和重试信息必须可观察
- 任务状态不允许只存在内存中

### 7.2 若接入 Redis

Redis 用于：

- `Episode Queue`
- `ShortStory Queue`
- `AIComment Queue`
- 轻量缓存

建议约束：

- 所有队列统一加 `QUEUE_PREFIX`
- 开发环境允许清空队列
- Redis 只作为任务和缓存层，不替代数据库结果存储

---

## 8. 本地资源存储约定

MVP 可先使用：

- `storage/uploads`
- `public/covers`
- `public/share-cards`

用途划分建议：

- `public/covers`：故事书封面静态资源
- `storage/uploads`：运行时生成资源
- `public/share-cards`：分享卡占位资源

规则：

- 路径通过配置读取
- 不在代码里拼死绝对路径
- 后续迁对象存储时只替换 storage adapter

---

## 9. 本地启动顺序

推荐顺序：

1. 启动 PostgreSQL
2. 如使用 Redis，则启动 Redis
3. 执行 migration
4. 执行 seed
5. 启动 Web / BFF
6. 启动 Worker

建议对应脚本：

```bash
pnpm db:migrate
pnpm db:seed
pnpm dev
pnpm worker:dev
```

如果后面接入 monorepo，可进一步拆成：

```bash
pnpm dev:web
pnpm dev:worker
```

---

## 10. Seed 数据建议

本地 seed 至少应包含：

### 10.1 故事分类

- 童话
- 寓言
- 神话

### 10.2 故事书

每类至少 3 本，占位即可。

### 10.3 风格配置

- `fairy`
- `fable`
- `epic`
- `dark`
- `zhihu`
- `pain`
- `light_web`
- `suspense`

### 10.4 动物人格示例

可准备 2 到 3 个本地测试用户，每人带不同 `AnimalProfile`，便于验证：

- 首页推荐
- 我的页维度图
- 发现页 AI 评论气质

---

## 11. 本地开发工作流

推荐日常流程：

1. 拉取最新代码
2. 对齐 `.env.local`
3. 执行 migration
4. 执行 seed
5. 启动 web
6. 启动 worker
7. 验证首页、故事、发现、我的四大链路

建议每次新增实体或字段时：

- 先改 schema
- 再补 migration
- 再补 seed
- 最后更新文档

---

## 12. 响应式本地调试要求

因为 AgentStory 技术方案已明确要求响应式设计，本地调试阶段必须同时覆盖：

- 手机窄屏
- 平板中屏
- 桌面宽屏

建议最低检查宽度：

- `390px`
- `768px`
- `1280px`

本地验收至少检查：

- 首页书架是否断行合理
- 故事详情页正文宽度是否舒适
- 发现页卡片是否出现横向滚动
- 我的页人格维度图是否完整可读

---

## 13. 本地日志与调试建议

开发环境建议至少分开看三类日志：

- Web 请求日志
- Worker 任务日志
- 生成链路日志

关键日志字段建议包含：

- `userId`
- `threadId`
- `shortStoryId`
- `feedStoryId`
- `jobId`
- `status`
- `durationMs`

---

## 14. 本地阶段的边界

开发阶段先不强求：

- Redis
- 正式对象存储
- 多环境部署编排
- 高可用任务系统
- 生产级监控告警

数据库可以直接先用托管 `dev` 环境，不要求必须本地化。

但需要从第一天预留：

- 环境变量抽象
- storage adapter 抽象
- queue prefix 抽象
- migration / seed 规范

---

## 15. 建议后续动作

在本地环境规范确定后，最适合继续补的文档是：

1. `AgentStory 数据库 Schema 草案`
2. `AgentStory 本地初始化脚本约定`
3. `AgentStory 字段级接口规范`
