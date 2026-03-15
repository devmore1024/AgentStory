# AgentStory Design System

> AgentStory 视觉系统基线
> 参考 `docs/design-system.md` 的结构整理
> 更新日期：2026-03-15

---

## 1. Design Direction

AgentStory 的首版视觉方向定义为：

- 像可以翻开的儿童书架
- 像一张属于你的动物人格故事卡
- 像围绕故事展开的轻阅读社区

整体风格关键词：

- 温暖
- 绘本感
- 纸张感
- 收藏感
- 手绘插画感
- 轻社区

明确避免：

- 赛博 AI 发光风
- 深色奇幻游戏风
- 低幼早教 App 风
- 纯工具化数据面板风
- 强恋爱互动小说风

参考来源以 [AgentStory 视觉风格参考调研](/Users/showjoy/devmore/waytoagi/AgentStory/docs/AgentStory%20%E8%A7%86%E8%A7%89%E9%A3%8E%E6%A0%BC%E5%8F%82%E8%80%83%E8%B0%83%E7%A0%94.md) 为准。

---

## 2. Color System

首版配色以“纸张米色 + 木架浅棕 + 苔藓绿 + 故事点缀色”为核心。

### Core Colors

| Token | Hex | 用途 |
|-------|-----|------|
| Accent Moss | `#5f7f62` | 主强调色，按钮、链接、选中态 |
| Accent Moss Hover | `#4f6e53` | 主强调色 hover / press |
| Accent Moss Light | `#e7efe6` | 浅强调底色 |
| Wood | `#c59b6d` | 书架木色、装饰条、暖色点缀 |
| Wood Deep | `#a97a4e` | 木色加深，边缘和阴影辅助 |

### Text Colors

| Token | Hex | 用途 |
|-------|-----|------|
| Text Primary | `#2d251d` | 主标题、正文 |
| Text Secondary | `#5c5045` | 次级正文、辅助说明 |
| Text Muted | `#8b7d70` | 标签、状态、占位说明 |
| Text On Accent | `#fffdf8` | 主按钮文字 |

### Background Colors

| Token | Hex | 用途 |
|-------|-----|------|
| Background Page | `#f7f1e8` | 页面主背景，纸张感底色 |
| Background Warm | `#f2e7d8` | 大区块浅暖底色 |
| Background Card | `#fffaf3` | 卡片、弹层、书籍详情卡 |
| Background Shelf | `#ecd7bd` | 书架板面背景 |
| Background Hover | `#f1e7da` | hover / skeleton 高亮 |

### Border Colors

| Token | Hex | 用途 |
|-------|-----|------|
| Border Default | `#dccbb5` | 普通边框 |
| Border Light | `#eadfce` | 轻边框、分割线 |
| Border Strong | `#bfa688` | 强边框、封面描边 |

### Decorative Colors

| Token | Hex | 用途 |
|-------|-----|------|
| Berry | `#b85c5c` | 情绪型点缀、角标、标签 |
| Berry Light | `#f7e3e1` | Berry 浅底 |
| Sky | `#86a9c9` | 发现页、神话类辅助色 |
| Sky Light | `#e8f0f7` | Sky 浅底 |
| Apricot | `#d9925b` | CTA 辅助色、章节更新点缀 |
| Apricot Light | `#f8eadf` | Apricot 浅底 |
| Plum Brown | `#7a5b55` | 深色文字装饰和图形辅助 |

### Story Category Colors

| Category | Hex | 用途 |
|----------|-----|------|
| Fairy Tale | `#d9925b` | 童话分类标签 |
| Fable | `#5f7f62` | 寓言分类标签 |
| Mythology | `#86a9c9` | 神话分类标签 |

### Data Visualization (人格维度图)

用于 `温度 / 行动力 / 思考力 / 表达感` 四维图。

| Token | Hex | 用途 |
|-------|-----|------|
| radarWarmth | `#e29a6c` | 温度 |
| radarAction | `#c96b5c` | 行动力 |
| radarThinking | `#6d8fb0` | 思考力 |
| radarExpression | `#7c9a6b` | 表达感 |
| radarFill | `rgba(95, 127, 98, 0.16)` | 维度图填充 |
| radarStroke | `#5f7f62` | 维度图边线 |
| radarGrid | `#d8c7b2` | 网格线 |

---

## 3. Typography

AgentStory 的字体需要同时满足两个目标：

- 有文学和故事感
- 依然适合现代 App 的长时间阅读

| Role | Font Family | Weights | Usage |
|------|-------------|---------|-------|
| Display | `Fraunces` | 500, 600 | 品牌名、主标题、章节标题、书名 |
| Body | `Nunito Sans` | 400, 500, 600, 700 | 正文、按钮、Tab、标签、说明文字 |
| Accent Hand | `Caveat` | 500, 600 | 局部人格卡签名感文案、分享卡点缀 |

使用建议：

- `Fraunces` 只用于重点标题，不用于大段正文
- `Nunito Sans` 作为主要 UI 和正文承载字体
- `Caveat` 仅作少量点缀，不要大面积使用

字号建议：

| Role | Size | Line Height |
|------|------|-------------|
| Hero Title | `36px` | `1.15` |
| Page Title | `28px` | `1.2` |
| Section Title | `22px` | `1.25` |
| Card Title | `18px` | `1.3` |
| Body | `16px` | `1.65` |
| Small Body | `14px` | `1.6` |
| Caption | `12px` | `1.5` |

---

## 4. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| Small | `10px` | 标签、输入框、小按钮 |
| Default | `16px` | 卡片、按钮、列表项 |
| Large | `24px` | 人格卡、书详情大卡、底部面板 |
| XL | `32px` | 首页大推荐卡、模态容器 |
| Full | `9999px` | 胶囊标签、头像、浮动入口 |

设计原则：

- AgentStory 圆角要偏柔和，但不要像纯萌宠 App 那样过圆
- 书封面卡片可使用更克制的 `16px`
- 人格卡和推荐卡可使用更柔和的 `24px` 到 `32px`

---

## 5. Shadows

使用暖棕色阴影和低饱和绿阴影混合，不使用纯黑阴影。

| Token | Value | 用途 |
|-------|-------|------|
| Shadow Small | `0 2px 8px rgba(93, 71, 49, 0.08)` | 普通卡片 |
| Shadow Medium | `0 8px 24px rgba(93, 71, 49, 0.12)` | 推荐卡、书详情卡 |
| Shadow Large | `0 16px 40px rgba(93, 71, 49, 0.14)` | 人格卡、弹层 |
| Shelf Shadow | `0 6px 18px rgba(169, 122, 78, 0.18)` | 书架和封面悬浮感 |

原则：

- 阴影要像纸张和木架上的自然投影
- 不做科技感发光阴影
- 交互反馈优先使用位移和轻微放大，而不是重阴影暴涨

---

## 6. Gradients

### Page Background Gradient

用于大背景：

```text
#f7f1e8 → #f4eadc → #fbf6ef
```

建议：

- 首页、我的页主背景可使用浅纸张渐变
- 发现页可减弱渐变，增强内容可读性

### Accent Story Gradient

用于主推荐卡、CTA 装饰：

```text
#5f7f62 → #86a9c9
```

表达“自然 + 故事世界”的温柔过渡。

### Personality Card Gradient

用于动物人格卡背景：

```text
#fff8ef → #f5eadb → #e7efe6
```

让人格卡兼具纸张感与轻柔情绪感。

---

## 7. Texture & Illustration

### Texture

AgentStory 首版建议加入轻微材质，而不是完全平面：

- 纸张细颗粒
- 书封面描边
- 木架浅纹理
- 卡片边缘微弱压印感

原则：

- 材质必须克制，不能影响文字可读性
- 纹理只用于大面背景或插画区域
- 图表和正文区尽量保持干净

### Illustration

插画语言建议：

- 手绘感
- 柔和轮廓
- 低攻击性表情
- 色块大于线稿复杂度

不建议：

- 3D 写实动物
- 赛博拟物机器人形象
- 过度 Q 版幼儿化比例

---

## 8. Motion / Animation

### Entry Animations

| Name | Duration | Effect |
|------|----------|--------|
| `page-fade-up` | `0.55s` | `translateY(18px) → 0` + fade |
| `card-rise` | `0.45s` | `translateY(12px) → 0` + fade |
| `book-pop` | `0.28s` | `scale(0.98 → 1)` + subtle lift |
| `soft-reveal` | `0.4s` | opacity `0 → 1` |

### Stagger

- 书架封面和故事卡建议使用 `0.06s` 到 `0.1s` 递增

### Interaction Feedback

| Interaction | Effect |
|-------------|--------|
| Hover | `translateY(-2px)` + `scale(1.01)` |
| Press | `scale(0.985)` |
| Card Open | `fade + rise` |
| Floating Animal Button | 轻微呼吸动效，周期 `3s` 到 `4s` |

### Reduced Motion

- 遵守 `prefers-reduced-motion`
- 呼吸动效、浮动动效、书封面轻弹需可关闭

---

## 9. Component Specifications

### Button

| Variant | Background | Text | Border |
|---------|------------|------|--------|
| Primary | `Accent Moss` | `Text On Accent` | none |
| Primary Hover | `Accent Moss Hover` | `Text On Accent` | none |
| Secondary | `Accent Moss Light` | `Accent Moss` | none |
| Warm | `Apricot Light` | `Apricot` | none |
| Ghost | `transparent` | `Text Secondary` | `Border Default` |

样式建议：

- 圆角：`16px`
- 高度：`44px` 起
- 字重：`600`
- 不使用过度锐利的直角按钮

### Story Book Card

- 背景：`Background Card`
- 描边：`Border Strong`
- 圆角：`16px`
- 阴影：`Shelf Shadow`
- 比例：更接近真实书本，建议 `3:4`
- Hover：轻微上浮 + 封面亮度提升

### Personality Card

- 背景：`Personality Card Gradient`
- 圆角：`24px`
- 边框：`1px solid Border Light`
- 阴影：`Shadow Large`
- 允许局部手写体点缀

### Story Feed Card

- 背景：`Background Card`
- 圆角：`20px`
- 边框：`Border Light`
- 阴影：`Shadow Small`
- 内容密度比书封面卡高，但仍保持留白

### Tab Bar

- 背景：`rgba(255, 250, 243, 0.88)` + blur
- 上边框：`Border Light`
- 激活态：`Accent Moss`
- 非激活态：`Text Muted`

### Floating Animal Persona Entry

- 形状：圆形或圆角胶囊
- 背景：`Background Card`
- 描边：`Border Strong`
- 阴影：`Shadow Medium`
- 动效：低频轻呼吸，不持续跳动

### Tag / Badge

| Variant | Background | Text |
|---------|------------|------|
| Fairy | `Apricot Light` | `Apricot` |
| Fable | `Accent Moss Light` | `Accent Moss` |
| Myth | `Sky Light` | `Sky` |
| Mood | `Berry Light` | `Berry` |

### Input / Search

- 背景：`Background Card`
- 边框：`Border Default`
- 圆角：`16px`
- Focus：`Accent Moss`
- 占位：`Text Muted`

### Personality Dimension Chart

- 默认形式：`四维雷达图`
- 线条：`radarStroke`
- 填充：`radarFill`
- 网格：`radarGrid`
- 标签文字：`Text Secondary`
- 说明文案应放在图下方，而不是图内堆字

不建议：

- 用高复杂度 BI 图表
- 加太多刻度数字
- 做成 dashboard 风格

---

## 10. Layout Rules

### Page Width

- Mobile first
- 主阅读内容建议 `max-width: 720px`
- 首页书架和发现流可允许更宽容器，但内容需保持聚焦

### Spacing Scale

| Token | Value |
|-------|-------|
| XS | `4px` |
| SM | `8px` |
| MD | `12px` |
| LG | `16px` |
| XL | `24px` |
| XXL | `32px` |
| XXXL | `48px` |

### Layout Principles

- 首页先情绪后信息
- 故事页先内容后操作
- 发现页先故事后互动
- 我的页先人格后时间线

---

## 11. Platform Rules

### Web

- 优先将颜色、半径、阴影、渐变定义为 CSS variables
- 书封面卡、人格卡、维度图用统一 token，不做页面级随意变色
- 维度图的 4 个颜色必须固定，不能按主题随意漂移

### Mobile

- 首屏必须一眼看见“书”或“动物人格”，不能先看到复杂数据
- 底部 Tab 保持稳定，不用实验性浮动导航
- 人格维度图在移动端优先保证可读，而不是追求复杂动画

---

## 12. First Build Priority

如果只做第一版高优先视觉资产，建议先完成：

1. 首页书架卡片体系
2. 动物人格卡视觉体系
3. 我的页人格维度图样式
4. 故事流卡片体系
5. 底部 Tab 与按钮规范

---

## 13. Notes

这份设计系统是 AgentStory 的首版方向文档，不等同于最终前端代码实现。

后续如果进入真实 UI 实施，建议继续补两类文档：

- `AgentStory 视觉组件规范`
- `AgentStory 高保真页面样式稿`
