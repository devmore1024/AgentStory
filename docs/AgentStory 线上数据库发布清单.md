# AgentStory 线上数据库发布清单

> 面向阿里云 RDS 的可复用发布流程
> 更新日期：2026-03-19

---

## 1. 适用范围

这份清单用于把本地已经验证过的数据库结构或种子变更，安全同步到线上阿里云 PostgreSQL。

当前仓库默认约定：

- 线上目标库从 [`.env`](/Users/showjoy/devmore/waytoagi/AgentStory/.env) 的 `DATABASE_URL_UNPOOLED` 读取
- 本地开发库从 [`.env.local`](/Users/showjoy/devmore/waytoagi/AgentStory/.env.local) 读取
- 生产变更优先使用 `psql -f db/*.sql`
- TypeScript 回填脚本统一通过 [ts-strip-loader.mjs](/Users/showjoy/devmore/waytoagi/AgentStory/scripts/ts-strip-loader.mjs) 运行

---

## 2. 发布前检查

### 2.1 确认目标库

先确认 `.env` 指向的是线上阿里云库，不是本地库：

```bash
node - <<'NODE'
const fs = require('fs');
const content = fs.readFileSync('.env', 'utf8');
for (const line of content.split(/\r?\n/)) {
  if (line.startsWith('DATABASE_URL_UNPOOLED=')) {
    const value = line.slice('DATABASE_URL_UNPOOLED='.length).trim();
    const url = new URL(value);
    console.log({
      host: url.hostname,
      port: url.port || '(default)',
      database: url.pathname.replace(/^\//, '')
    });
  }
}
NODE
```

### 2.2 看线上当前状态

建议至少查这三类信息：

- 当前约束是否已经存在
- 当前 `story_styles` 数据是否齐全
- 当前 `animal_profiles.mapping_version` 是什么

示例：

```bash
node - <<'NODE'
const fs = require('fs');
const { Client } = require('pg');

function readEnv(file) {
  const out = {};
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    out[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return out;
}

(async () => {
  const env = readEnv('.env');
  const client = new Client({ connectionString: env.DATABASE_URL_UNPOOLED, ssl: false });
  await client.connect();
  console.log((await client.query(\"SELECT key, name FROM story_styles ORDER BY key;\")).rows);
  console.log((await client.query(\"SELECT COALESCE(mapping_version, '<null>') AS mapping_version, COUNT(*)::int AS count FROM animal_profiles GROUP BY 1 ORDER BY 1;\")).rows);
  await client.end();
})();
NODE
```

---

## 3. 发布前备份

如果改动会影响线上已有数据，先导出快照。

建议最少备份：

- `animal_profiles`
- `story_styles`
- 相关约束定义

示例：

```bash
mkdir -p output/db-backups
node - <<'NODE'
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function readEnv(file) {
  const out = {};
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    out[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return out;
}

(async () => {
  const env = readEnv('.env');
  const client = new Client({ connectionString: env.DATABASE_URL_UNPOOLED, ssl: false });
  await client.connect();

  const animalProfiles = await client.query('SELECT * FROM animal_profiles ORDER BY created_at ASC;');
  const storyStyles = await client.query('SELECT * FROM story_styles ORDER BY key ASC;');
  const constraints = await client.query(\"SELECT conname, pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conname IN ('animal_profiles_animal_type_check', 'story_styles_key_check') ORDER BY conname;\");

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const target = path.join('output', 'db-backups', `aliyun-pre-release-${timestamp}.json`);
  fs.writeFileSync(target, JSON.stringify({
    exportedAt: new Date().toISOString(),
    animalProfiles: animalProfiles.rows,
    storyStyles: storyStyles.rows,
    constraints: constraints.rows
  }, null, 2));

  console.log(target);
  await client.end();
})();
NODE
```

---

## 4. 执行 SQL migration

从 `.env` 读取线上 `DATABASE_URL_UNPOOLED`，再执行目标 migration：

```bash
DB_URL=$(node - <<'NODE'
const fs = require('fs');
for (const line of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = line.indexOf('=');
  if (idx === -1) continue;
  if (line.slice(0, idx).trim() === 'DATABASE_URL_UNPOOLED') {
    process.stdout.write(line.slice(idx + 1).trim());
    break;
  }
}
NODE
)

psql "$DB_URL" -v ON_ERROR_STOP=1 -1 -f db/011_expand_persona_style_pool.sql
```

说明：

- `-1` 会把整份 SQL 包进单事务
- `ON_ERROR_STOP=1` 会在 SQL 出错时立刻停下

---

## 5. 执行回填脚本

如果 migration 只是改了约束和种子，但线上已有用户画像还要升级，就继续跑回填。

当前仓库推荐命令：

```bash
DB_URL=$(node - <<'NODE'
const fs = require('fs');
for (const line of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = line.indexOf('=');
  if (idx === -1) continue;
  if (line.slice(0, idx).trim() === 'DATABASE_URL_UNPOOLED') {
    process.stdout.write(line.slice(idx + 1).trim());
    break;
  }
}
NODE
)

DATABASE_URL="$DB_URL" \
node --experimental-strip-types --loader ./scripts/ts-strip-loader.mjs scripts/recompute-animal-personas.ts
```

适用场景：

- `animal_profiles` 结构仍兼容，但推荐风格、映射版本或人格逻辑发生变化
- 需要把老数据从旧版 `mapping_version` 升到新版

---

## 6. 发布后校验

至少确认以下四件事：

1. 线上约束已经切到新版本
2. `story_styles` 行数正确
3. `animal_profiles.mapping_version` 已更新
4. `story_preferences` 结构符合当前实现

示例：

```bash
node - <<'NODE'
const fs = require('fs');
const { Client } = require('pg');

function readEnv(file) {
  const out = {};
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    out[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return out;
}

(async () => {
  const env = readEnv('.env');
  const client = new Client({ connectionString: env.DATABASE_URL_UNPOOLED, ssl: false });
  await client.connect();

  console.log((await client.query(\"SELECT COUNT(*)::int AS count FROM story_styles;\")).rows);
  console.log((await client.query(\"SELECT animal_type, mapping_version, COUNT(*)::int AS count FROM animal_profiles GROUP BY animal_type, mapping_version ORDER BY animal_type, mapping_version;\")).rows);
  console.log((await client.query(\"SELECT id, jsonb_object_keys(story_preferences) AS pref_key FROM animal_profiles ORDER BY id;\")).rows);

  await client.end();
})();
NODE
```

---

## 7. 这次 20 动物 / 文风 v4 发布的实际顺序

这次线上变更实际执行顺序如下：

1. 检查 `.env` 是否指向阿里云 `agentstory`
2. 查询线上当前约束、`story_styles` 和 `mapping_version`
3. 导出 `animal_profiles` / `story_styles` / 约束快照到 `output/db-backups/`
4. 执行 [011_expand_persona_style_pool.sql](/Users/showjoy/devmore/waytoagi/AgentStory/db/011_expand_persona_style_pool.sql)
5. 执行 [recompute-animal-personas.ts](/Users/showjoy/devmore/waytoagi/AgentStory/scripts/recompute-animal-personas.ts)
6. 复查约束、style 数量、`story_preferences` 结构和 `secondme-v4` 覆盖情况

---

## 8. 注意事项

- 尽量使用 `DATABASE_URL_UNPOOLED`，避免池化代理影响长事务和 `psql` 体验。
- 线上回填前先确认脚本是否真的只更新目标表，不要把本地测试假设直接带到生产。
- 如果脚本依赖 `@/` 路径别名，不要直接裸跑，统一走 [ts-strip-loader.mjs](/Users/showjoy/devmore/waytoagi/AgentStory/scripts/ts-strip-loader.mjs)。
- 如果是大批量回填，建议先做只读 dry run 或先限定样本用户。
