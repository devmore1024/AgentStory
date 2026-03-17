# 童话主入口来源目录

当前首页、故事页和发现页的童话主入口，统一改成读取一份锁定的 100 本“来源完整童话目录”。

## 现在的规则

- 主入口只展示 100 本带来源字段的童话
- 每一本都补齐：
  - `source_site`
  - `source_title`
  - `source_url`
  - `source_license`
  - `story_content`
  - `key_scenes`
- 暂时找不到来源的旧童话不会出现在主入口里，但旧 `slug` 直链仍然保留
- 封面策略不跟这次数据补齐联动，继续沿用当前精选图 / 本地回退逻辑
- 热门童话和扩展童话会共用 [fairy-source-story-seeds.ts](/Users/showjoy/devmore/waytoagi/AgentStory/lib/fairy-source-story-seeds.ts) 里的精选内容种子
- 如果某本书暂时没有完整的 `originalSynopsis + storyParagraphs` 手写稿，也可以只补 `key scene seeds`，优先把详情页里的“关键情节”从模板句升级为原故事事件链
- 当前童话目录里所有可访问 `slug` 的“关键情节”都已经覆盖到手写原故事事件链；有些书是完整手写概览加正文，有些书则先只补手写关键情节
- 当某本书没有精选种子时，目录会回退到统一的“原故事概览 / 关键情节 / 正文预览”生成逻辑，但仍保证详情页至少有 4 条关键情节和 2 段可读概览

## 代码位置

- 来源完整目录：[fairy-source-backed-catalog.ts](/Users/showjoy/devmore/waytoagi/AgentStory/lib/fairy-source-backed-catalog.ts)
- 精选故事种子：[fairy-source-story-seeds.ts](/Users/showjoy/devmore/waytoagi/AgentStory/lib/fairy-source-story-seeds.ts)
- 主入口读取与详情读取合并：[story-data.ts](/Users/showjoy/devmore/waytoagi/AgentStory/lib/story-data.ts)
- 故事页 / 发现页过滤：[demo-app.ts](/Users/showjoy/devmore/waytoagi/AgentStory/lib/demo-app.ts)
- 数据入库脚本：[import-source-backed-fairy-catalog.ts](/Users/showjoy/devmore/waytoagi/AgentStory/scripts/import-source-backed-fairy-catalog.ts)

## 后续入库

当数据库准备好后，可以运行导入脚本把这 100 本正式写入 `story_books`。这一步只会补故事正文、来源信息和热度排序，不会主动覆盖已有封面字段。
