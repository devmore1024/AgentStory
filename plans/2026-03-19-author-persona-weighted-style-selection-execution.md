# 作者人格优先的稳定选风方案执行记录

日期：2026-03-19

## 已完成

- `lib/story-style.ts`
  - 将短篇与 personal 首次选风改为“先稳定选来源桶，再稳定选桶内风格”的加权策略
  - 权重为作者人格 `80%`、书本分类 `20%`
  - personal 选风 seed 纳入 `userId + book.slug + animalType`
  - 短篇选风 seed 纳入 `userId + book.slug`
  - 保留数据库 `style_id` 可持久化兜底

- `lib/story-experience.ts`
  - personal 首次建线走新的稳定加权选风
  - 已锁定 personal 线程继续沿用原锁定风格
  - `publishCompanionFromPersonal` 优先继承 personal 已锁定风格
  - 若老数据缺少线程锁风，但 origin 章节已有 `style_id`，也继续继承该风格

- `lib/demo-app.ts`
  - demo 短篇继续复用 `story-style` 的统一规则，避免展示链路与真实链路分叉

## 已补测试

- `tests/story-style.test.ts`
  - 稳定加权选风
  - 人格优先命中率
  - 分类池小比例影响
  - 可持久化风格兜底

- `tests/story-experience-personal-style-selection.test.ts`
  - personal 初次建线选风
  - 已锁定 personal 线程续写不换风格

- `tests/demo-app.test.ts`
  - demo 短篇选风与共享规则一致
