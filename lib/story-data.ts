import { cache } from "react";
import type { AnimalPersona } from "@/lib/animal-personas";
import { resolveCoverAsset } from "@/lib/cover-assets";
import { sql } from "@/lib/db";
import { expandedFairyCatalogBySlug } from "@/lib/fairy-catalog-expansion";
import {
  getSourceBackedFairyBook,
  sourceBackedFairyCatalog
} from "@/lib/fairy-source-backed-catalog";

export type StoryBook = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  originalSynopsis: string | null;
  coverImage: string | null;
  categoryKey: "fairy_tale" | "fable" | "mythology";
  categoryName: string;
  keyScenes: string[];
  storyContent: string | null;
  sourceSite: string | null;
  sourceTitle: string | null;
  sourceUrl: string | null;
  sourceLicense: string | null;
  popularityRank: number | null;
};

export type StoryBookDetail = StoryBook;

export type StoryCategory = {
  id: string;
  key: "fairy_tale" | "fable" | "mythology";
  name: string;
  sortOrder: number;
  books: StoryBook[];
};

export function getHomepageFairyShelfFromCategories(categories: StoryCategory[]) {
  return categories.find((category) => category.key === "fairy_tale") ?? null;
}

export function hasIllustratedCoverForShelf(
  book: Pick<StoryBook, "slug" | "coverImage" | "title" | "categoryKey" | "summary" | "originalSynopsis">
) {
  return resolveCoverAsset(book).src !== `/covers/${book.slug}`;
}

export function sortVisibleFairyShelfBooks<T extends StoryBook>(books: T[]) {
  return books
    .filter((book) => hasIllustratedCoverForShelf(book))
    .sort((a, b) => {
      const rankDiff = (a.popularityRank ?? Number.MAX_SAFE_INTEGER) - (b.popularityRank ?? Number.MAX_SAFE_INTEGER);

      if (rankDiff !== 0) {
        return rankDiff;
      }

      return a.title.localeCompare(b.title, "zh-CN");
    });
}

type RawBookRow = {
  id: string | null;
  title: string | null;
  slug: string | null;
  summary: string | null;
  original_synopsis: string | null;
  cover_image: string | null;
  key_scenes: unknown;
  story_content: string | null;
  source_site: string | null;
  source_title: string | null;
  source_url: string | null;
  source_license: string | null;
  popularity_rank: number | null;
  category_id: string;
  category_key: StoryCategory["key"];
  category_name: string;
  sort_order: number;
};

function normalizeKeyScenes(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function hydrateBaseBook(row: RawBookRow): StoryBook {
  return {
    id: row.id ?? "",
    title: row.title ?? "",
    slug: row.slug ?? "",
    summary: row.summary ?? "",
    originalSynopsis: row.original_synopsis,
    coverImage: row.cover_image,
    categoryKey: row.category_key,
    categoryName: row.category_name,
    keyScenes: normalizeKeyScenes(row.key_scenes),
    storyContent: row.story_content,
    sourceSite: row.source_site,
    sourceTitle: row.source_title,
    sourceUrl: row.source_url,
    sourceLicense: row.source_license,
    popularityRank: row.popularity_rank
  };
}

function createExpandedFairyCatalogBook(book: {
  title: string;
  slug: string;
  summary: string;
}): StoryBook {
  return {
    id: `runtime-${book.slug}`,
    title: book.title,
    slug: book.slug,
    summary: book.summary,
    originalSynopsis: book.summary,
    coverImage: null,
    categoryKey: "fairy_tale",
    categoryName: "童话",
    keyScenes: [],
    storyContent: null,
    sourceSite: null,
    sourceTitle: null,
    sourceUrl: null,
    sourceLicense: null,
    popularityRank: null
  };
}

function createSourceBackedRuntimeBook(slug: string): StoryBook | null {
  const sourceBacked = getSourceBackedFairyBook(slug);

  if (!sourceBacked) {
    return null;
  }

  return {
    id: `runtime-${sourceBacked.slug}`,
    title: sourceBacked.displayTitleZh,
    slug: sourceBacked.slug,
    summary: sourceBacked.summary,
    originalSynopsis: sourceBacked.originalSynopsis,
    coverImage: null,
    categoryKey: "fairy_tale",
    categoryName: "童话",
    keyScenes: sourceBacked.keyScenes,
    storyContent: sourceBacked.storyContentZh,
    sourceSite: sourceBacked.sourceSite,
    sourceTitle: sourceBacked.sourceTitle,
    sourceUrl: sourceBacked.sourceUrl,
    sourceLicense: sourceBacked.sourceLicense,
    popularityRank: sourceBacked.popularityRank
  };
}

function mergeSourceBackedFairyBook(book: StoryBook): StoryBook {
  if (book.categoryKey !== "fairy_tale") {
    return book;
  }

  const sourceBacked = getSourceBackedFairyBook(book.slug);

  if (!sourceBacked) {
    return book;
  }

  return {
    ...book,
    title: sourceBacked.displayTitleZh,
    summary: book.summary.trim() ? book.summary : sourceBacked.summary,
    originalSynopsis: book.originalSynopsis ?? sourceBacked.originalSynopsis,
    keyScenes: book.keyScenes.length > 0 ? book.keyScenes : sourceBacked.keyScenes,
    storyContent: book.storyContent ?? sourceBacked.storyContentZh,
    sourceSite: book.sourceSite ?? sourceBacked.sourceSite,
    sourceTitle: book.sourceTitle ?? sourceBacked.sourceTitle,
    sourceUrl: book.sourceUrl ?? sourceBacked.sourceUrl,
    sourceLicense: book.sourceLicense ?? sourceBacked.sourceLicense,
    popularityRank: book.popularityRank ?? sourceBacked.popularityRank
  };
}

function sortCategoryBooks(categoryKey: StoryCategory["key"], books: StoryBook[]) {
  if (categoryKey === "fairy_tale") {
    return [...books].sort((a, b) => {
      const rankDiff = (a.popularityRank ?? Number.MAX_SAFE_INTEGER) - (b.popularityRank ?? Number.MAX_SAFE_INTEGER);

      if (rankDiff !== 0) {
        return rankDiff;
      }

      return a.title.localeCompare(b.title, "zh-CN");
    });
  }

  return [...books].sort((a, b) => a.title.localeCompare(b.title, "zh-CN"));
}

function deriveKeyScenes(book: {
  title: string;
  categoryKey: StoryBook["categoryKey"];
  slug: string;
  originalSynopsis: string | null;
}) {
  const title = book.title;
  const synopsis = book.originalSynopsis ?? "";
  const slugText = book.slug.replace(/-/g, " ");
  const signals = `${title} ${synopsis} ${slugText}`;

  if (book.categoryKey === "fairy_tale") {
    if (/狼|wolf|forest|woods|red riding hood/i.test(signals)) {
      return [`《${title}》里最危险的岔路口`, "分身第一次察觉危险并提前开口", "原本注定的相遇开始偏离旧结局"];
    }

    if (/magic|神灯|fairy|仙女|witch|女巫/i.test(signals)) {
      return [`《${title}》里愿望第一次失控的瞬间`, "分身和关键角色交换一个新的条件", "故事从奇迹转向代价与选择"];
    }

    return [`《${title}》里命运开始拐弯的入口`, "分身第一次和主角说出不同于原剧情的话", "旧童话被轻轻推向新的版本"];
  }

  if (book.categoryKey === "fable") {
    if (/fox|狐狸|crow|乌鸦|lion|狮子|wolf|狼/i.test(signals)) {
      return [`《${title}》里角色最自信的那一刻`, "分身先看见了角色忽略掉的判断盲区", "原本一句话的寓言被展开成新的选择题"];
    }

    return [`《${title}》里习惯性判断即将发生的瞬间`, "分身插入一个更难回答的问题", "角色不得不重新理解自己原来的做法"];
  }

  if (/zeus|宙斯|athena|雅典娜|prometheus|普罗米修斯|hades|冥王/i.test(signals)) {
    return [`《${title}》里神意第一次压到凡人身上的时刻`, "分身在预言与命令之间打开另一种解释", "故事从注定走向可以被重新回答的命运"];
  }

  return [`《${title}》里命运开始显形的节点`, "分身第一次与关键角色站到同一个问题面前", "原本不可更改的神话被推开一道新的裂缝"];
}

export function getResolvedKeyScenes(book: StoryBook) {
  return book.keyScenes.length > 0 ? book.keyScenes : deriveKeyScenes(book);
}

export function getResolvedStoryParagraphs(book: StoryBook) {
  const content = book.storyContent?.trim();

  if (content) {
    return content
      .split(/\n{2,}/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [book.originalSynopsis ?? book.summary];
}

type CoverAssetInput = Pick<StoryBook, "slug" | "coverImage"> &
  Partial<Pick<StoryBook, "title" | "categoryKey" | "originalSynopsis" | "summary">>;

export function getResolvedCoverImage(book: CoverAssetInput) {
  return resolveCoverAsset(book).src;
}

export function getResolvedCoverAsset(book: CoverAssetInput) {
  return resolveCoverAsset(book);
}

export const getCategoriesWithBooks = cache(async (): Promise<StoryCategory[]> => {
  const { rows } = await sql<RawBookRow>(
    `
      SELECT
        c.id AS category_id,
        c.key AS category_key,
        c.name AS category_name,
        c.sort_order,
        b.id,
        b.title,
        b.slug,
        b.summary,
        b.original_synopsis,
        b.cover_image,
        b.key_scenes,
        b.story_content,
        b.source_site,
        b.source_title,
        b.source_url,
        b.source_license,
        b.popularity_rank
      FROM story_categories c
      LEFT JOIN story_books b
        ON b.category_id = c.id
       AND b.is_active = TRUE
      ORDER BY c.sort_order ASC, b.title COLLATE "C" ASC
    `
  );

  const categories = new Map<string, StoryCategory>();

  for (const row of rows) {
    if (!categories.has(row.category_id)) {
      categories.set(row.category_id, {
        id: row.category_id,
        key: row.category_key,
        name: row.category_name,
        sortOrder: row.sort_order,
        books: []
      });
    }

    if (row.id) {
      categories.get(row.category_id)?.books.push(mergeSourceBackedFairyBook(hydrateBaseBook(row)));
    }
  }

  const fairyCategory = Array.from(categories.values()).find((category) => category.key === "fairy_tale");

  if (fairyCategory) {
    const fairyBooksBySlug = new Map(
      fairyCategory.books.map((book) => [book.slug, mergeSourceBackedFairyBook(book)])
    );

    fairyCategory.books = sourceBackedFairyCatalog
      .filter((book) => book.isVisibleInPrimaryEntry)
      .map((book) => fairyBooksBySlug.get(book.slug) ?? createSourceBackedRuntimeBook(book.slug))
      .filter((book): book is StoryBook => book !== null);
  }

  return Array.from(categories.values()).map((category) => ({
    ...category,
    books: sortCategoryBooks(category.key, category.books)
  }));
});

export const getHomepageFairyShelf = cache(async () => {
  const categories = await getCategoriesWithBooks();
  return getHomepageFairyShelfFromCategories(categories);
});

export const getBookBySlug = cache(async (slug: string): Promise<StoryBook | null> => {
  const { rows } = await sql<RawBookRow>(
    `
      SELECT
        c.id AS category_id,
        c.key AS category_key,
        c.name AS category_name,
        c.sort_order,
        b.id,
        b.title,
        b.slug,
        b.summary,
        b.original_synopsis,
        b.cover_image,
        b.key_scenes,
        b.story_content,
        b.source_site,
        b.source_title,
        b.source_url,
        b.source_license,
        b.popularity_rank
      FROM story_books b
      JOIN story_categories c ON c.id = b.category_id
      WHERE b.slug = $1
        AND b.is_active = TRUE
      LIMIT 1
    `,
    [slug]
  );

  const row = rows[0];

  if (!row) {
    const sourceBacked = createSourceBackedRuntimeBook(slug);

    if (sourceBacked) {
      return sourceBacked;
    }

    const expanded = expandedFairyCatalogBySlug.get(slug);

    if (!expanded) {
      return null;
    }

    return createExpandedFairyCatalogBook(expanded);
  }

  return mergeSourceBackedFairyBook(hydrateBaseBook(row));
});

export const getCategoryTotals = cache(async () => {
  const categories = await getCategoriesWithBooks();

  return categories.map((category) => ({
    key: category.key,
    name: category.name,
    count: category.books.length
  }));
});

export const getRecommendedBooksForPersona = cache(async (persona: AnimalPersona, limit = 6) => {
  const categories = await getCategoriesWithBooks();
  const books = categories.flatMap((category) => category.books);

  const scored = books
    .map((book) => {
      let score = 0;

      if (persona.recommendedCategories.includes(book.categoryName)) {
        score += 10;
      }

      if (persona.animalType === "wolf" && book.categoryKey === "mythology") {
        score += 3;
      }

      if (persona.animalType === "rabbit" && book.categoryKey === "fairy_tale") {
        score += 3;
      }

      if (persona.animalType === "owl" && book.categoryKey !== "fairy_tale") {
        score += 2;
      }

      if (persona.animalType === "fox" && /fox|wolf|crow|lion|judge|trial|盗|贼/i.test(`${book.slug} ${book.title}`)) {
        score += 2;
      }

      if (persona.animalType === "deer" && /moon|rose|nightingale|mermaid|雪|月|海/i.test(`${book.slug} ${book.title}`)) {
        score += 2;
      }

      return {
        book,
        score
      };
    })
    .sort((a, b) => b.score - a.score || a.book.title.localeCompare(b.book.title, "zh-CN"))
    .slice(0, limit)
    .map((item) => item.book);

  return scored;
});
