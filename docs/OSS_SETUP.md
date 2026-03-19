# 阿里云 OSS 上传配置指南

本项目支持将生成的图片和音频文件上传到阿里云 OSS，实现内容持久化存储。

## 📋 前置条件

- 阿里云账号
- 已创建 OSS Bucket：`agentravel`
- 获取 AccessKey ID 和 AccessKey Secret

## 🔑 获取 AccessKey

1. 登录 [阿里云控制台](https://console.aliyun.com/)
2. 进入 **RAM 访问控制** → **用户**
3. 点击用户名 → **创建 AccessKey**
4. 获取 **AccessKeyId** 和 **AccessKeySecret**

> ⚠️ AccessKeySecret 只显示一次，请妥善保管

## ⚙️ 环境变量配置

### 开发环境（.env.local）

```bash
# 阿里云 OSS 配置
ALIYUN_OSS_ACCESS_KEY_ID=your_access_key_id
ALIYUN_OSS_ACCESS_KEY_SECRET=your_access_key_secret
ALIYUN_OSS_BUCKET=agentravel
ALIYUN_OSS_REGION=oss-cn-hongkong
```

### 生产环境（Vercel / 云服务）

在部署平台的环境变量设置中添加：

```
ALIYUN_OSS_ACCESS_KEY_ID = your_access_key_id
ALIYUN_OSS_ACCESS_KEY_SECRET = your_access_key_secret
ALIYUN_OSS_BUCKET = agentravel
ALIYUN_OSS_REGION = oss-cn-hongkong
```

## 📦 文件上传规则

### 图片存储

- **路径**：`images/{journalId}/{style}-{timestamp}.png`
- **示例**：`images/cmluv181s70002l504/journal-1740841200000.png`

### 故事封面 CDN

- **封面前缀**：`story/`
- **示例**：`${NEXT_PUBLIC_ASSET_PREFIX}/story/generated-covers/fairy-cinderella.jpeg`
- **回退封面**：`${NEXT_PUBLIC_ASSET_PREFIX}/story/covers/fairy-cinderella`
- **前缀来源**：优先使用 `NEXT_PUBLIC_ASSET_PREFIX`，路径规则保持 `story/` + 原封面路径不变；如果未配置，才会退回到封面专用前缀或 OSS 推导地址。

### 音频存储

- **路径**：`audios/{journalId}/{timestamp}.mp3`
- **示例**：`audios/cmluv181s70002l504/1740841200000.mp3`

## 🔄 工作流程

```
用户生成图片
  ↓
后端调用 Jimeng API
  ↓
下载生成的图片
  ↓
上传到阿里云 OSS
  ↓
保存 OSS URL 到数据库
  ↓
前端显示 OSS 中的图片
```

## ✅ 功能特性

- ✅ 自动上传：生成内容后立即上传
- ✅ 优雅降级：未配置 OSS 凭证时使用原始 URL
- ✅ 错误恢复：上传失败时保留原始 URL，不中断流程
- ✅ 完整记录：保存上传状态到数据库（success/failed/skipped）

## 📊 数据库字段

`generatedContent` JSON 字段包含：

```json
{
  "type": "journal|film|stamp|watercolor",
  "style": "journal|film|stamp|watercolor",
  "data": {
    "url": "https://agentravel.oss-cn-hongkong.aliyuncs.com/images/...",
    "originalUrl": "https://p3-dreamina-sign.byteimg.com/...",
    "ossUploadStatus": "success|failed|skipped",
    "prompt": "..."
  },
  "generatedAt": "2026-03-01T10:00:00.000Z"
}
```

## 🚨 常见问题

### 1. 上传失败但仍然能看到图片？

这是正常的。系统会先使用原始 URL，如果 OSS 上传失败则保留原始 URL。

### 2. 如何检查上传状态？

查看数据库 `journal.generatedContent` 字段中的 `ossUploadStatus`：
- `success` - 已上传到 OSS
- `failed` - 上传失败，使用原始 URL
- `skipped` - 跳过上传（未配置凭证）

### 3. OSS 凭证泄露怎么办？

在阿里云控制台删除该 AccessKey，创建新的 AccessKey，然后更新环境变量。

## 📝 相关文件

- `src/lib/oss-upload.ts` - OSS 上传服务
- `src/app/api/journals/[id]/generate/route.ts` - 生成 API（集成上传）

## 🔐 安全建议

- ✅ 不要在代码中硬编码 AccessKey
- ✅ 使用环境变量存储凭证
- ✅ 定期轮换 AccessKey
- ✅ 为该 AccessKey 设置最小权限策略（仅写入 agentravel bucket）
