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
- 小徽章已对 20 只动物统一升级到增强版细节，继续保持线描主导，但允许少量同色块面补强识别度
- 图谱页会为全部 20 只展示“识别特征”，并与徽章 SVG 的关键结构一一对应，方便在设计联调时直接核对
