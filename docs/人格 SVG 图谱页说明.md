# 人格 SVG 图谱页说明

## 页面入口

- 路由：`/me/personas`
- 默认父页面：`/me`
- 页面顶部统一使用 `PageBackButton`

## 页面用途

- 集中预览当前 20 种动物人格的两层 SVG 资产
- 左侧展示简略徽章 SVG，右侧展示详细头像 SVG
- 方便在设计联调、分享页调整和后续导出图开发时快速对照

## 相关组件

- `components/persona-badge.tsx`
- `components/persona-portrait.tsx`
- `components/persona-svg-gallery.tsx`

## 当前实现约定

- 详细 SVG 统一使用 `128 x 128` 视口
- 每种人格保留对应的轮廓语言和配色，不再复用同一套几何模板
- 动画仅保留轻微浮动、眨眼和局部摆动，并对 `prefers-reduced-motion` 提供降级
- 本轮优先修复 `lion`、`hedgehog`、`horse`、`elephant`、`swan`、`crane` 的小徽章识别度
- 图谱页会为上述 6 只补充“识别特征”说明，方便在设计联调时直接核对
