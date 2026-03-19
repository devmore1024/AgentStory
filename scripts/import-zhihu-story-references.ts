import { mkdir, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

type ZhihuImportModule = typeof import("../lib/zhihu-import");
type ZhihuSearchCandidate = import("../lib/zhihu-import").ZhihuSearchCandidate;
type ZhihuImportRuntimeModule = typeof import("../lib/zhihu-import-runtime");

const {
  ZHIHU_IMPORT_USER_AGENT,
  buildZhihuSearchRequest,
  buildZhihuSearchKeywords,
  dedupeAndSortZhihuCandidates,
  extractZhihuContentFromHtml,
  normalizeZhihuSearchCandidates,
  scoreZhihuSearchCandidate
} = (await import(new URL("../lib/zhihu-import.ts", import.meta.url).href)) as ZhihuImportModule;
const {
  ZHIHU_OPENAPI_RUNTIME_ENV_KEYS,
  buildZhihuSearchFailureMessage,
  resolveZhihuSearchAccessToken
} = (await import(new URL("../lib/zhihu-import-runtime.ts", import.meta.url).href)) as ZhihuImportRuntimeModule;

const require = createRequire(import.meta.url);

type QueryResult<T> = {
  rows: T[];
};

type DatabaseClient = {
  query<T>(queryText: string, values?: readonly unknown[]): Promise<QueryResult<T>>;
  connect(): Promise<void>;
  end(): Promise<void>;
};

const { Client } = require("pg") as {
  Client: new (config: { connectionString: string }) => DatabaseClient;
};

type ParsedArgs = {
  dryRun: boolean;
  envFile: string;
  envKey: string;
  bookLimit: number;
  bookSlug?: string;
  searchUrl?: string;
};

type FairyBookRow = {
  id: string;
  title: string;
  slug: string;
  source_title: string | null;
};

type PersistedReference = {
  queryKeyword: string;
  sourceType: "answer" | "article";
  title: string;
  authorName: string | null;
  authorHeadline: string | null;
  authorityLevel: number | null;
  excerpt: string | null;
  content: string;
  sourceUrl: string;
  qualityScore: number;
};

type SearchPreview = {
  queryKeyword: string;
  sourceUrl: string;
  title: string;
  sourceType: "answer" | "article";
  authorityLevel: number | null;
  qualityScore: number;
  hasContent: boolean;
};

function parseArgs(argv: readonly string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    dryRun: false,
    envFile: ".env.local",
    envKey: "DATABASE_URL_UNPOOLED",
    bookLimit: 5
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    const next = argv[index + 1];

    if (current === "--dry-run") {
      parsed.dryRun = true;
      continue;
    }

    if (!next) {
      throw new Error(`Missing value for ${current}.`);
    }

    if (current === "--env-file") {
      parsed.envFile = next;
      index += 1;
      continue;
    }

    if (current === "--env-key") {
      parsed.envKey = next;
      index += 1;
      continue;
    }

    if (current === "--book-limit") {
      parsed.bookLimit = Number.parseInt(next, 10);
      index += 1;
      continue;
    }

    if (current === "--book-slug") {
      parsed.bookSlug = next;
      index += 1;
      continue;
    }

    if (current === "--search-url") {
      parsed.searchUrl = next;
      index += 1;
      continue;
    }

    throw new Error(`Unsupported argument: ${current}.`);
  }

  return parsed;
}

function readEnvValue(envFilePath: string, key: string) {
  const absolutePath = path.resolve(envFilePath);
  const fileContents = readFileSync(absolutePath, "utf8");

  for (const rawLine of fileContents.split(/\r?\n/u)) {
    const trimmed = rawLine.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = rawLine.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const candidateKey = rawLine.slice(0, separatorIndex).trim();

    if (candidateKey !== key) {
      continue;
    }

    const value = rawLine.slice(separatorIndex + 1).trim();

    if (!value) {
      throw new Error(`Missing value for ${key} in ${absolutePath}.`);
    }

    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      return value.slice(1, -1);
    }

    return value;
  }

  throw new Error(`Missing ${key} in ${absolutePath}.`);
}

function readOptionalRuntimeEnv(primaryKey: string, fallbackEnvFile: string, fallbackKey = primaryKey) {
  const direct = process.env[primaryKey]?.trim();

  if (direct) {
    return direct;
  }

  try {
    return readEnvValue(fallbackEnvFile, fallbackKey);
  } catch {
    return null;
  }
}

function getZhihuSearchUrl(args: ParsedArgs) {
  return (
    args.searchUrl ??
    process.env.ZHIHU_OPENAPI_SEARCH_URL ??
    "https://openapi.zhihu.com/openapi/search/global"
  );
}

function assignOptionalRuntimeEnv(key: string) {
  const resolved =
    process.env[key] ??
    readOptionalRuntimeEnv(key, ".env.local", key) ??
    readOptionalRuntimeEnv(key, ".env", key);

  if (resolved !== null && resolved !== undefined) {
    process.env[key] = resolved;
  }
}

function trimHttpErrorBody(value: string) {
  return value.replace(/\s+/gu, " ").trim().slice(0, 240);
}

async function fetchZhihuSearchPayload(searchUrl: string, accessToken: string, queryKeyword: string) {
  const request = buildZhihuSearchRequest(searchUrl, queryKeyword, {
    accessToken,
    searchQueryParam: process.env.ZHIHU_OPENAPI_SEARCH_QUERY_PARAM ?? "keyword",
    searchLimitParam: process.env.ZHIHU_OPENAPI_SEARCH_LIMIT_PARAM ?? "limit",
    searchLimit: process.env.ZHIHU_OPENAPI_SEARCH_LIMIT ?? "10"
  });

  const response = await fetch(request.url, {
    headers: request.headers
  });

  if (!response.ok) {
    const details = trimHttpErrorBody(await response.text());
    throw new Error(buildZhihuSearchFailureMessage({ queryKeyword, status: response.status, details }));
  }

  return response.json();
}

async function fetchZhihuPageHtml(sourceUrl: string) {
  const response = await fetch(sourceUrl, {
    headers: {
      "User-Agent": ZHIHU_IMPORT_USER_AGENT
    }
  });

  if (!response.ok) {
    throw new Error(`Zhihu page fetch failed: ${response.status} ${sourceUrl}`);
  }

  return response.text();
}

async function loadFairyBooks(client: DatabaseClient, args: ParsedArgs) {
  const values: Array<string | number> = [];
  const conditions = ["c.key = 'fairy_tale'"];

  if (args.bookSlug) {
    values.push(args.bookSlug);
    conditions.push(`b.slug = $${values.length}`);
  }

  values.push(args.bookLimit);

  const { rows } = await client.query<FairyBookRow>(
    `
      SELECT
        b.id,
        b.title,
        b.slug,
        b.source_title
      FROM story_books b
      JOIN story_categories c ON c.id = b.category_id
      WHERE ${conditions.join(" AND ")}
      ORDER BY b.popularity_rank ASC NULLS LAST, b.title ASC
      LIMIT $${values.length}
    `,
    values
  );

  return rows;
}

async function selectReferencesForBook(searchUrl: string, accessToken: string, book: FairyBookRow) {
  const previews: SearchPreview[] = [];
  const collected: PersistedReference[] = [];

  for (const queryKeyword of buildZhihuSearchKeywords({
    title: book.title,
    slug: book.slug,
    sourceTitle: book.source_title
  })) {
    let candidates: ZhihuSearchCandidate[] = [];

    try {
      candidates = normalizeZhihuSearchCandidates(
        await fetchZhihuSearchPayload(searchUrl, accessToken, queryKeyword),
        queryKeyword
      );
    } catch (error) {
      previews.push({
        queryKeyword,
        sourceUrl: "",
        title: `SEARCH_FAILED: ${error instanceof Error ? error.message : String(error)}`,
        sourceType: "answer",
        authorityLevel: null,
        qualityScore: 0,
        hasContent: false
      });
      continue;
    }

    for (const candidate of candidates) {
      let content: string | null = null;

      try {
        content = extractZhihuContentFromHtml(await fetchZhihuPageHtml(candidate.sourceUrl));
      } catch {
        content = null;
      }

      previews.push({
        queryKeyword,
        sourceUrl: candidate.sourceUrl,
        title: candidate.title,
        sourceType: candidate.sourceType,
        authorityLevel: candidate.authorityLevel,
        qualityScore: candidate.qualityScore,
        hasContent: Boolean(content)
      });

      if (!content) {
        continue;
      }

      collected.push({
        queryKeyword,
        sourceType: candidate.sourceType,
        title: candidate.title,
        authorName: candidate.authorName,
        authorHeadline: candidate.authorHeadline,
        authorityLevel: candidate.authorityLevel,
        excerpt: candidate.excerpt,
        content,
        sourceUrl: candidate.sourceUrl,
        qualityScore: scoreZhihuSearchCandidate({
          title: candidate.title,
          excerpt: content.slice(0, 240),
          authorityLevel: candidate.authorityLevel,
          sourceUrl: candidate.sourceUrl
        })
      });
    }
  }

  return {
    previews,
    references: dedupeAndSortZhihuCandidates(
      collected.map((reference) => ({
        queryKeyword: reference.queryKeyword,
        sourceType: reference.sourceType,
        title: reference.title,
        excerpt: reference.excerpt,
        sourceUrl: reference.sourceUrl,
        authorName: reference.authorName,
        authorHeadline: reference.authorHeadline,
        authorityLevel: reference.authorityLevel,
        qualityScore: reference.qualityScore
      })),
      5
    ).map((candidate) => {
      const full = collected.find((reference) => reference.sourceUrl === candidate.sourceUrl);

      if (!full) {
        throw new Error(`Missing collected reference for ${candidate.sourceUrl}`);
      }

      return full;
    })
  };
}

async function persistBookReferences(client: DatabaseClient, bookId: string, references: PersistedReference[]) {
  await client.query(
    `
      UPDATE zhihu_story_references
      SET is_active = FALSE,
          updated_at = NOW()
      WHERE story_book_id = $1
    `,
    [bookId]
  );

  for (const reference of references) {
    await client.query(
      `
        INSERT INTO zhihu_story_references (
          story_book_id,
          query_keyword,
          source_url,
          source_type,
          title,
          author_name,
          author_headline,
          authority_level,
          excerpt,
          content,
          quality_score,
          fetched_at,
          last_verified_at,
          is_active
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          NOW(),
          NOW(),
          TRUE
        )
        ON CONFLICT (source_url) DO UPDATE
        SET
          story_book_id = EXCLUDED.story_book_id,
          query_keyword = EXCLUDED.query_keyword,
          source_type = EXCLUDED.source_type,
          title = EXCLUDED.title,
          author_name = EXCLUDED.author_name,
          author_headline = EXCLUDED.author_headline,
          authority_level = EXCLUDED.authority_level,
          excerpt = EXCLUDED.excerpt,
          content = EXCLUDED.content,
          quality_score = EXCLUDED.quality_score,
          last_verified_at = NOW(),
          is_active = TRUE,
          updated_at = NOW()
      `,
      [
        bookId,
        reference.queryKeyword,
        reference.sourceUrl,
        reference.sourceType,
        reference.title,
        reference.authorName,
        reference.authorHeadline,
        reference.authorityLevel,
        reference.excerpt,
        reference.content,
        reference.qualityScore
      ]
    );
  }
}

async function writePreviewReport(payload: unknown) {
  const outputDir = path.join(process.cwd(), "plans", "generated");

  await mkdir(outputDir, { recursive: true });
  await writeFile(
    path.join(outputDir, "zhihu-reference-import-preview.json"),
    JSON.stringify(payload, null, 2),
    "utf8"
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  for (const key of ZHIHU_OPENAPI_RUNTIME_ENV_KEYS) {
    assignOptionalRuntimeEnv(key);
  }

  const accessToken = resolveZhihuSearchAccessToken(process.env);
  const searchUrl = getZhihuSearchUrl(args);
  const connectionString = readEnvValue(args.envFile, args.envKey);
  const client = new Client({ connectionString });

  await client.connect();

  try {
    const books = await loadFairyBooks(client, args);
    const preview = [];

    for (const book of books) {
      const result = await selectReferencesForBook(searchUrl, accessToken, book);

      preview.push({
        slug: book.slug,
        title: book.title,
        selectedCount: result.references.length,
        selectedReferences: result.references.map((reference) => ({
          queryKeyword: reference.queryKeyword,
          title: reference.title,
          sourceUrl: reference.sourceUrl,
          qualityScore: reference.qualityScore
        })),
        previews: result.previews
      });

      if (!args.dryRun) {
        await persistBookReferences(client, book.id, result.references);
      }
    }

    await writePreviewReport({
      generatedAt: new Date().toISOString(),
      dryRun: args.dryRun,
      searchUrl,
      bookCount: books.length,
      books: preview
    });

    console.log(
      `[zhihu-import] processed ${books.length} book(s)${args.dryRun ? " in dry-run mode" : ""}. Preview: plans/generated/zhihu-reference-import-preview.json`
    );
  } finally {
    await client.end();
  }
}

void main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[zhihu-import] ${message}`);
  process.exitCode = 1;
});
