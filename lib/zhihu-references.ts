import { sql } from "@/lib/db";
import type { StoryBook } from "@/lib/story-data";

export const MAX_ZHIHU_REFERENCES_PER_BOOK = 5;

export type ZhihuStoryReference = {
  id: string;
  storyBookId: string;
  storyBookSlug: string;
  storyBookTitle: string;
  queryKeyword: string;
  sourceUrl: string;
  sourceType: "answer" | "article";
  title: string;
  authorName: string | null;
  authorHeadline: string | null;
  authorUrl: string | null;
  authorityLevel: number | null;
  excerpt: string | null;
  content: string;
  qualityScore: number;
  fetchedAt: string;
};

export type ZhihuReferencePack = {
  sourceType: "matched" | "fallback" | "fallback_locked";
  referenceBookId: string;
  referenceBookSlug: string;
  referenceBookTitle: string;
  sources: ZhihuStoryReference[];
  metaPatch?: ZhihuThreadMeta;
};

export type ZhihuThreadMeta = {
  zhihuReferenceBookId?: string;
  zhihuReferenceSourceIds?: string[];
};

type ZhihuReferenceRow = {
  id: string;
  story_book_id: string;
  story_book_slug: string;
  story_book_title: string;
  query_keyword: string;
  source_url: string;
  source_type: "answer" | "article";
  title: string;
  author_name: string | null;
  author_headline: string | null;
  author_url: string | null;
  authority_level: number | null;
  excerpt: string | null;
  content: string;
  quality_score: number;
  fetched_at: string;
};

type ZhihuFallbackBookRow = {
  story_book_id: string;
  story_book_slug: string;
  story_book_title: string;
  top_quality_score: number;
};

function hashToInt(input: string) {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function mapReferenceRow(row: ZhihuReferenceRow): ZhihuStoryReference {
  return {
    id: row.id,
    storyBookId: row.story_book_id,
    storyBookSlug: row.story_book_slug,
    storyBookTitle: row.story_book_title,
    queryKeyword: row.query_keyword,
    sourceUrl: row.source_url,
    sourceType: row.source_type,
    title: row.title,
    authorName: row.author_name,
    authorHeadline: row.author_headline,
    authorUrl: row.author_url,
    authorityLevel: row.authority_level,
    excerpt: row.excerpt,
    content: row.content,
    qualityScore: row.quality_score,
    fetchedAt: row.fetched_at
  };
}

function buildMetaPatch(sources: ZhihuStoryReference[]): ZhihuThreadMeta | undefined {
  if (sources.length === 0) {
    return undefined;
  }

  return {
    zhihuReferenceBookId: sources[0].storyBookId,
    zhihuReferenceSourceIds: sources.map((source) => source.id)
  };
}

function buildReferencePack(
  sources: ZhihuStoryReference[],
  sourceType: ZhihuReferencePack["sourceType"],
  metaPatch?: ZhihuThreadMeta
): ZhihuReferencePack | null {
  if (sources.length === 0) {
    return null;
  }

  return {
    sourceType,
    referenceBookId: sources[0].storyBookId,
    referenceBookSlug: sources[0].storyBookSlug,
    referenceBookTitle: sources[0].storyBookTitle,
    sources,
    metaPatch
  };
}

function normalizeZhihuThreadMeta(meta: unknown): ZhihuThreadMeta {
  if (!meta || typeof meta !== "object") {
    return {};
  }

  const candidate = meta as Record<string, unknown>;

  return {
    zhihuReferenceBookId:
      typeof candidate.zhihuReferenceBookId === "string" && candidate.zhihuReferenceBookId.length > 0
        ? candidate.zhihuReferenceBookId
        : undefined,
    zhihuReferenceSourceIds: Array.isArray(candidate.zhihuReferenceSourceIds)
      ? candidate.zhihuReferenceSourceIds.filter((item): item is string => typeof item === "string" && item.length > 0)
      : undefined
  };
}

async function getZhihuReferencesForBookId(storyBookId: string, limit = MAX_ZHIHU_REFERENCES_PER_BOOK) {
  const { rows } = await sql<ZhihuReferenceRow>(
    `
      SELECT
        zsr.id,
        zsr.story_book_id,
        sb.slug AS story_book_slug,
        sb.title AS story_book_title,
        zsr.query_keyword,
        zsr.source_url,
        zsr.source_type,
        zsr.title,
        zsr.author_name,
        zsr.author_headline,
        zsr.author_url,
        zsr.authority_level,
        zsr.excerpt,
        zsr.content,
        zsr.quality_score,
        zsr.fetched_at
      FROM zhihu_story_references zsr
      JOIN story_books sb ON sb.id = zsr.story_book_id
      WHERE zsr.story_book_id = $1
        AND zsr.is_active = TRUE
      ORDER BY zsr.quality_score DESC, zsr.fetched_at DESC, zsr.created_at DESC
      LIMIT ${Math.max(1, limit)}
    `,
    [storyBookId]
  );

  return rows.map(mapReferenceRow);
}

async function getZhihuReferencesByIds(referenceIds: string[]) {
  if (referenceIds.length === 0) {
    return [];
  }

  const placeholders = referenceIds.map((_, index) => `$${index + 1}`).join(", ");
  const { rows } = await sql<ZhihuReferenceRow>(
    `
      SELECT
        zsr.id,
        zsr.story_book_id,
        sb.slug AS story_book_slug,
        sb.title AS story_book_title,
        zsr.query_keyword,
        zsr.source_url,
        zsr.source_type,
        zsr.title,
        zsr.author_name,
        zsr.author_headline,
        zsr.author_url,
        zsr.authority_level,
        zsr.excerpt,
        zsr.content,
        zsr.quality_score,
        zsr.fetched_at
      FROM zhihu_story_references zsr
      JOIN story_books sb ON sb.id = zsr.story_book_id
      WHERE zsr.id IN (${placeholders})
        AND zsr.is_active = TRUE
    `,
    referenceIds
  );

  const referencesById = new Map(rows.map((row) => [row.id, mapReferenceRow(row)]));

  return referenceIds
    .map((referenceId) => referencesById.get(referenceId))
    .filter((reference): reference is ZhihuStoryReference => Boolean(reference));
}

async function getZhihuFallbackBookCandidates(excludeBookId: string) {
  const { rows } = await sql<ZhihuFallbackBookRow>(
    `
      SELECT
        zsr.story_book_id,
        sb.slug AS story_book_slug,
        sb.title AS story_book_title,
        MAX(zsr.quality_score)::int AS top_quality_score
      FROM zhihu_story_references zsr
      JOIN story_books sb ON sb.id = zsr.story_book_id
      WHERE zsr.story_book_id <> $1
        AND zsr.is_active = TRUE
      GROUP BY zsr.story_book_id, sb.slug, sb.title
      ORDER BY top_quality_score DESC, sb.title ASC
    `,
    [excludeBookId]
  );

  return rows;
}

export function pickZhihuFallbackBookId(
  candidates: Array<{ story_book_id: string }>,
  seedText: string
) {
  if (candidates.length === 0) {
    return null;
  }

  return candidates[hashToInt(`zhihu-fallback:${seedText}`) % candidates.length]?.story_book_id ?? null;
}

export async function resolveZhihuReferencePack(params: {
  book: StoryBook;
  threadSeed: string;
  threadMeta?: unknown;
}) {
  const directSources = await getZhihuReferencesForBookId(params.book.id);

  if (directSources.length > 0) {
    return buildReferencePack(directSources, "matched");
  }

  const meta = normalizeZhihuThreadMeta(params.threadMeta);

  if (meta.zhihuReferenceSourceIds?.length) {
    const lockedSources = await getZhihuReferencesByIds(meta.zhihuReferenceSourceIds);
    const lockedPack = buildReferencePack(lockedSources, "fallback_locked", buildMetaPatch(lockedSources));

    if (lockedPack) {
      return lockedPack;
    }
  }

  if (meta.zhihuReferenceBookId) {
    const lockedBookSources = await getZhihuReferencesForBookId(meta.zhihuReferenceBookId);
    const lockedPack = buildReferencePack(
      lockedBookSources,
      "fallback_locked",
      buildMetaPatch(lockedBookSources)
    );

    if (lockedPack) {
      return lockedPack;
    }
  }

  const fallbackCandidates = await getZhihuFallbackBookCandidates(params.book.id);
  const fallbackBookId = pickZhihuFallbackBookId(fallbackCandidates, params.threadSeed);

  if (!fallbackBookId) {
    return null;
  }

  const fallbackSources = await getZhihuReferencesForBookId(fallbackBookId);

  return buildReferencePack(fallbackSources, "fallback", buildMetaPatch(fallbackSources));
}

export async function persistZhihuThreadMeta(threadId: string, metaPatch: ZhihuThreadMeta) {
  await sql(
    `
      UPDATE story_threads
      SET meta = COALESCE(meta, '{}'::jsonb) || $2::jsonb,
          updated_at = NOW()
      WHERE id = $1
    `,
    [threadId, JSON.stringify(metaPatch)]
  );
}
