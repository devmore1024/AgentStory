import pg from "pg";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const { Client } = pg;
const require = createRequire(import.meta.url);
const {
  PRIMARY_SOURCE_BACKED_FAIRY_BOOK_COUNT,
  validatePrimarySourceBackedFairyBooks
} = require("../lib/fairy-book-sync.ts") as typeof import("../lib/fairy-book-sync");

type FairyBookSyncRow = import("../lib/fairy-book-sync").FairyBookSyncRow;
type DatabaseClient = InstanceType<typeof Client>;

type ParsedArgs = {
  dryRun: boolean;
  sourceEnvFile: string;
  sourceEnvKey: string;
  targetEnvFile: string;
  targetEnvKey: string;
};

type SourceFairyBookRow = {
  category_key: string;
  category_name: string;
  category_sort_order: number;
  title: string;
  slug: string;
  cover_image: string | null;
  summary: string;
  key_scenes: unknown;
  original_synopsis: string | null;
  story_content: string | null;
  source_site: string | null;
  source_url: string | null;
  source_license: string | null;
  source_title: string | null;
  popularity_rank: number | null;
  public_domain: boolean;
  is_active: boolean;
};

const STORY_CATEGORY_REQUIRED_COLUMNS = ["id", "key", "name", "sort_order"] as const;
const TARGET_STORY_BOOK_REQUIRED_COLUMNS = [
  "category_id",
  "title",
  "slug",
  "cover_image",
  "summary",
  "key_scenes",
  "original_synopsis",
  "story_content",
  "source_site",
  "source_url",
  "source_license",
  "source_title",
  "popularity_rank",
  "public_domain",
  "is_active",
  "updated_at"
] as const;
const SOURCE_STORY_BOOK_REQUIRED_COLUMNS = TARGET_STORY_BOOK_REQUIRED_COLUMNS;

function parseArgs(argv: readonly string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    dryRun: false,
    sourceEnvFile: ".env.local",
    sourceEnvKey: "DATABASE_URL",
    targetEnvFile: ".env",
    targetEnvKey: "DATABASE_URL_UNPOOLED"
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

    if (current === "--source-env-file") {
      parsed.sourceEnvFile = next;
      index += 1;
      continue;
    }

    if (current === "--source-env-key") {
      parsed.sourceEnvKey = next;
      index += 1;
      continue;
    }

    if (current === "--target-env-file") {
      parsed.targetEnvFile = next;
      index += 1;
      continue;
    }

    if (current === "--target-env-key") {
      parsed.targetEnvKey = next;
      index += 1;
      continue;
    }

    throw new Error(`Unsupported argument: ${current}.`);
  }

  return parsed;
}

function readEnvValue(envFilePath: string, key: string) {
  const absolutePath = resolve(envFilePath);
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

async function getTableColumns(client: DatabaseClient, tableName: string) {
  const { rows } = await client.query<{ column_name: string }>(
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
    `,
    [tableName]
  );

  return new Set(rows.map((row: { column_name: string }) => row.column_name));
}

async function assertRequiredColumns(client: DatabaseClient, tableName: string, columns: readonly string[]) {
  const actualColumns = await getTableColumns(client, tableName);
  const missingColumns = columns.filter((column) => !actualColumns.has(column));

  if (missingColumns.length > 0) {
    throw new Error(`Table ${tableName} is missing required columns: ${missingColumns.join(", ")}.`);
  }
}

function normalizeSourceBookRow(row: SourceFairyBookRow): FairyBookSyncRow {
  return {
    categoryKey: row.category_key,
    categoryName: row.category_name,
    categorySortOrder: row.category_sort_order,
    title: row.title,
    slug: row.slug,
    coverImage: row.cover_image,
    summary: row.summary,
    keyScenes: Array.isArray(row.key_scenes) ? row.key_scenes.filter((value): value is string => typeof value === "string") : [],
    originalSynopsis: row.original_synopsis,
    storyContent: row.story_content,
    sourceSite: row.source_site,
    sourceUrl: row.source_url,
    sourceLicense: row.source_license,
    sourceTitle: row.source_title,
    popularityRank: row.popularity_rank,
    publicDomain: row.public_domain,
    isActive: row.is_active
  };
}

async function loadSourceBackedFairyBooks(sourceClient: DatabaseClient) {
  await assertRequiredColumns(sourceClient, "story_categories", STORY_CATEGORY_REQUIRED_COLUMNS);
  await assertRequiredColumns(sourceClient, "story_books", SOURCE_STORY_BOOK_REQUIRED_COLUMNS);

  const { rows } = await sourceClient.query<SourceFairyBookRow>(
    `
      SELECT
        c.key AS category_key,
        c.name AS category_name,
        c.sort_order AS category_sort_order,
        b.title,
        b.slug,
        b.cover_image,
        b.summary,
        b.key_scenes,
        b.original_synopsis,
        b.story_content,
        b.source_site,
        b.source_url,
        b.source_license,
        b.source_title,
        b.popularity_rank,
        b.public_domain,
        b.is_active
      FROM story_books b
      JOIN story_categories c ON c.id = b.category_id
      WHERE c.key = 'fairy_tale'
        AND b.popularity_rank BETWEEN 1 AND $1
      ORDER BY b.popularity_rank ASC
    `,
    [PRIMARY_SOURCE_BACKED_FAIRY_BOOK_COUNT]
  );

  return validatePrimarySourceBackedFairyBooks(rows.map(normalizeSourceBookRow));
}

async function ensureFairyCategory(targetClient: DatabaseClient, firstBook: FairyBookSyncRow) {
  await assertRequiredColumns(targetClient, "story_categories", STORY_CATEGORY_REQUIRED_COLUMNS);
  await assertRequiredColumns(targetClient, "story_books", TARGET_STORY_BOOK_REQUIRED_COLUMNS);

  const { rows } = await targetClient.query<{ id: string }>(
    `
      INSERT INTO story_categories (key, name, sort_order)
      VALUES ($1, $2, $3)
      ON CONFLICT (key) DO UPDATE
      SET
        name = EXCLUDED.name,
        sort_order = EXCLUDED.sort_order
      RETURNING id
    `,
    [firstBook.categoryKey, firstBook.categoryName, firstBook.categorySortOrder]
  );

  const categoryId = rows[0]?.id;

  if (!categoryId) {
    throw new Error("Failed to create or load target fairy_tale category.");
  }

  return categoryId;
}

async function upsertFairyBooks(targetClient: DatabaseClient, categoryId: string, books: readonly FairyBookSyncRow[]) {
  for (const book of books) {
    await targetClient.query(
      `
        INSERT INTO story_books (
          category_id,
          title,
          slug,
          cover_image,
          summary,
          key_scenes,
          original_synopsis,
          story_content,
          source_site,
          source_url,
          source_license,
          source_title,
          popularity_rank,
          public_domain,
          is_active
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6::jsonb,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12,
          $13,
          $14,
          $15
        )
        ON CONFLICT (slug) DO UPDATE
        SET
          category_id = EXCLUDED.category_id,
          title = EXCLUDED.title,
          summary = EXCLUDED.summary,
          key_scenes = EXCLUDED.key_scenes,
          original_synopsis = EXCLUDED.original_synopsis,
          story_content = EXCLUDED.story_content,
          source_site = EXCLUDED.source_site,
          source_url = EXCLUDED.source_url,
          source_license = EXCLUDED.source_license,
          source_title = EXCLUDED.source_title,
          popularity_rank = EXCLUDED.popularity_rank,
          public_domain = EXCLUDED.public_domain,
          is_active = EXCLUDED.is_active,
          cover_image = COALESCE(story_books.cover_image, EXCLUDED.cover_image),
          updated_at = NOW()
      `,
      [
        categoryId,
        book.title,
        book.slug,
        book.coverImage,
        book.summary,
        JSON.stringify(book.keyScenes),
        book.originalSynopsis,
        book.storyContent,
        book.sourceSite,
        book.sourceUrl,
        book.sourceLicense,
        book.sourceTitle,
        book.popularityRank,
        book.publicDomain,
        book.isActive
      ]
    );
  }
}

async function verifyTargetFairyBooks(targetClient: DatabaseClient, slugs: readonly string[]) {
  const { rows } = await targetClient.query<{ synced_count: string }>(
    `
      SELECT COUNT(*)::text AS synced_count
      FROM story_books b
      JOIN story_categories c ON c.id = b.category_id
      WHERE c.key = 'fairy_tale'
        AND b.slug = ANY($1::text[])
    `,
    [slugs]
  );

  return Number(rows[0]?.synced_count ?? "0");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const sourceConnectionString = readEnvValue(args.sourceEnvFile, args.sourceEnvKey);
  const targetConnectionString = readEnvValue(args.targetEnvFile, args.targetEnvKey);
  const sourceClient = new Client({ connectionString: sourceConnectionString });
  const targetClient = new Client({ connectionString: targetConnectionString });

  await sourceClient.connect();
  await targetClient.connect();

  try {
    const books = await loadSourceBackedFairyBooks(sourceClient);
    const firstBook = books[0];
    const lastBook = books.at(-1);

    console.info(
      `[fairy-book-sync] Loaded ${books.length} source-backed fairy books from ${resolve(args.sourceEnvFile)} (${firstBook?.slug} -> ${lastBook?.slug}).`
    );

    if (args.dryRun) {
      console.info("[fairy-book-sync] Dry run only. No target writes were performed.");
      return;
    }

    await targetClient.query("BEGIN");

    try {
      const categoryId = await ensureFairyCategory(targetClient, books[0]);
      await upsertFairyBooks(targetClient, categoryId, books);

      const syncedCount = await verifyTargetFairyBooks(
        targetClient,
        books.map((book) => book.slug)
      );

      if (syncedCount !== PRIMARY_SOURCE_BACKED_FAIRY_BOOK_COUNT) {
        throw new Error(
          `Target verification failed. Expected ${PRIMARY_SOURCE_BACKED_FAIRY_BOOK_COUNT} synced books, found ${syncedCount}.`
        );
      }

      await targetClient.query("COMMIT");
      console.info(
        `[fairy-book-sync] Synced fairy_tale category and ${syncedCount} story_books rows into ${resolve(args.targetEnvFile)}.`
      );
    } catch (error) {
      await targetClient.query("ROLLBACK");
      throw error;
    }
  } finally {
    await Promise.all([sourceClient.end(), targetClient.end()]);
  }
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[fairy-book-sync] ${message}`);
  process.exitCode = 1;
});
