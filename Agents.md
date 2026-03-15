# SecondMe 集成项目

## 应用信息

- **App Name**: AgentStory
- **Client ID**: 74dbc0c7-***

# Development Rules

## Workflow
1. Understand the task
2. Plan implementation
3. Implement full feature
4. Add tests
5. Update documentation

## Code Style
- Use TypeScript
- Avoid any
- Prefer functional components

## Testing
Always add tests for new features.

## API 文档

开发时请参考官方文档（从 `.secondme/state.json` 的 `docs` 字段读取）：

| 文档 | 链接 |
|------|------|
| 快速入门 | https://develop-docs.second.me/zh/docs |
| OAuth2 认证 | https://develop-docs.second.me/zh/docs/authentication/oauth2 |
| API 参考 | https://develop-docs.second.me/zh/docs/api-reference/secondme |
| 错误码 | https://develop-docs.second.me/zh/docs/errors |

## 关键信息

- API 基础 URL: https://app.mindos.com/gate/lab
- OAuth 授权 URL: https://go.second.me/oauth/
- Access Token 有效期: 2 小时
- Refresh Token 有效期: 30 天

> 所有 API 端点配置请参考 `.secondme/state.json` 中的 `api` 和 `docs` 字段

## 已选模块

- auth - OAuth 认证（必选）
- profile - 用户信息展示
- chat - 聊天功能
- act - 结构化动作判断（返回 JSON）
- voice - 已记录，待 SDK 支持

## 权限列表 (Scopes)

| 权限 | 说明 | 状态 |
|------|------|------|
| `identity` | 用户基础信息 | 已授权 |
| `profile` | 用户资料与兴趣标签 | 已授权 |
| `chat` | 聊天与结构化动作 | 已授权 |
| `voice` | 语音功能 | 已授权（待支持） |

## API 响应格式

所有 SecondMe API 响应遵循统一格式：

```json
{
  "code": 0,
  "data": { ... }
}
```

前端代码必须从 `data` 字段提取实际数据。

## 技术栈

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Prisma (SQLite)
- 运行端口: 3000


