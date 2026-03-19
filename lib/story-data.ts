import { cache } from "react";
import type { AnimalPersona } from "@/lib/animal-personas";
import { resolveCoverAsset } from "@/lib/cover-assets";
import { sql } from "@/lib/db";
import { expandedFairyCatalogBySlug } from "@/lib/fairy-catalog-expansion";
import { getCuratedFairyKeyScenes } from "@/lib/fairy-source-story-seeds";
import {
  getSourceBackedFairyBook,
  sourceBackedFairyCatalog
} from "@/lib/fairy-source-backed-catalog";
import { isStoryCoverFallbackSrc } from "@/lib/story-cover-cdn";

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
  return !isStoryCoverFallbackSrc(resolveCoverAsset(book).src, book.slug);
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

type StoryBookOptionalColumnAvailability = {
  storyContent: boolean;
  sourceSite: boolean;
  sourceTitle: boolean;
  sourceUrl: boolean;
  sourceLicense: boolean;
  popularityRank: boolean;
};

export function getStoryBookOptionalSelectClauses(columns: StoryBookOptionalColumnAvailability) {
  return {
    storyContent: columns.storyContent ? "b.story_content" : "NULL::text AS story_content",
    sourceSite: columns.sourceSite ? "b.source_site" : "NULL::text AS source_site",
    sourceTitle: columns.sourceTitle ? "b.source_title" : "NULL::text AS source_title",
    sourceUrl: columns.sourceUrl ? "b.source_url" : "NULL::text AS source_url",
    sourceLicense: columns.sourceLicense ? "b.source_license" : "NULL::text AS source_license",
    popularityRank: columns.popularityRank ? "b.popularity_rank" : "NULL::int AS popularity_rank"
  } as const;
}

const getStoryBookOptionalColumnAvailability = cache(async () => {
  const { rows } = await sql<{ column_name: string }>(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'story_books'
      AND column_name = ANY(ARRAY[
        'story_content',
        'source_site',
        'source_title',
        'source_url',
        'source_license',
        'popularity_rank'
      ])
  `);

  const presentColumns = new Set(rows.map((row) => row.column_name));

  return {
    storyContent: presentColumns.has("story_content"),
    sourceSite: presentColumns.has("source_site"),
    sourceTitle: presentColumns.has("source_title"),
    sourceUrl: presentColumns.has("source_url"),
    sourceLicense: presentColumns.has("source_license"),
    popularityRank: presentColumns.has("popularity_rank")
  } satisfies StoryBookOptionalColumnAvailability;
});

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
    keyScenes: getCuratedFairyKeyScenes(book.slug) ?? [],
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
  const selectClauses = getStoryBookOptionalSelectClauses(await getStoryBookOptionalColumnAvailability());

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
        ${selectClauses.storyContent},
        ${selectClauses.sourceSite},
        ${selectClauses.sourceTitle},
        ${selectClauses.sourceUrl},
        ${selectClauses.sourceLicense},
        ${selectClauses.popularityRank}
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
  const selectClauses = getStoryBookOptionalSelectClauses(await getStoryBookOptionalColumnAvailability());

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
        ${selectClauses.storyContent},
        ${selectClauses.sourceSite},
        ${selectClauses.sourceTitle},
        ${selectClauses.sourceUrl},
        ${selectClauses.sourceLicense},
        ${selectClauses.popularityRank}
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

export async function getBooksBySlugs(slugs: readonly string[]) {
  const uniqueSlugs = Array.from(new Set(slugs.map((slug) => slug.trim()).filter(Boolean)));

  if (uniqueSlugs.length === 0) {
    return new Map<string, StoryBook>();
  }

  const selectClauses = getStoryBookOptionalSelectClauses(await getStoryBookOptionalColumnAvailability());
  const placeholders = uniqueSlugs.map((_, index) => `$${index + 1}`).join(", ");

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
        ${selectClauses.storyContent},
        ${selectClauses.sourceSite},
        ${selectClauses.sourceTitle},
        ${selectClauses.sourceUrl},
        ${selectClauses.sourceLicense},
        ${selectClauses.popularityRank}
      FROM story_books b
      JOIN story_categories c ON c.id = b.category_id
      WHERE b.slug IN (${placeholders})
        AND b.is_active = TRUE
    `,
    uniqueSlugs
  );

  const booksBySlug = new Map<string, StoryBook>();

  for (const row of rows) {
    if (!row.slug) {
      continue;
    }

    booksBySlug.set(row.slug, mergeSourceBackedFairyBook(hydrateBaseBook(row)));
  }

  for (const slug of uniqueSlugs) {
    if (booksBySlug.has(slug)) {
      continue;
    }

    const sourceBacked = createSourceBackedRuntimeBook(slug);

    if (sourceBacked) {
      booksBySlug.set(slug, sourceBacked);
      continue;
    }

    const expanded = expandedFairyCatalogBySlug.get(slug);

    if (expanded) {
      booksBySlug.set(slug, createExpandedFairyCatalogBook(expanded));
    }
  }

  return booksBySlug;
}

export const getCategoryTotals = cache(async () => {
  const categories = await getCategoriesWithBooks();

  return categories.map((category) => ({
    key: category.key,
    name: category.name,
    count: category.books.length
  }));
});

const personaBookCueKeywords: Record<AnimalPersona["animalType"], string[]> = {
  bear: ["守护", "陪伴", "归来", "守夜", "家", "照顾", "保护", "重逢", "winter", "home"],
  deer: ["月", "雪", "海", "玫瑰", "夜莺", "眼泪", "相遇", "失而复得", "moon", "gentle"],
  fox: ["计谋", "审判", "骗局", "偷", "试探", "规则", "狐狸", "贼", "judge", "clever"],
  owl: ["预言", "机关", "谜题", "真相", "结构", "图书馆", "系统", "星图", "logic", "signal"],
  wolf: ["狼", "追猎", "火", "誓言", "禁地", "冲突", "夺回", "对抗", "hunt", "battle"],
  cat: ["窗", "房间", "镜子", "月光", "秘密", "独处", "礼服", "舞会", "velvet", "quiet"],
  rabbit: ["梦", "森林", "误入", "钟声", "洞穴", "轻声", "奇遇", "白兔", "dream", "wonder"],
  raven: ["乌鸦", "影子", "倒影", "代价", "秘密", "谎言", "回声", "黑羽", "shadow", "truth"],
  lion: ["王", "王座", "荣耀", "加冕", "太阳", "远征", "誓师", "旷野", "crown", "glory"],
  dog: ["朋友", "同行", "家门", "等待", "信件", "厨房", "篝火", "回来", "friend", "loyal"],
  dolphin: ["海面", "潮", "呼吸", "盐", "波纹", "梦游", "岛", "水光", "ocean", "current"],
  swan: ["湖", "羽毛", "舞步", "白纱", "月色", "湖心", "离歌", "倒影", "swan", "grace"],
  otter: ["滑倒", "误会", "翻车", "水花", "笑场", "闹剧", "接梗", "手忙脚乱", "chaos", "splash"],
  squirrel: ["种子", "树枝", "行李", "小路", "临时起意", "藏宝", "偷听", "忙碌", "quick", "stash"],
  horse: ["长路", "旅途", "原野", "奔跑", "渡口", "启程", "驿站", "远方", "journey", "gallop"],
  hedgehog: ["门口", "冬夜", "手套", "沉默", "刺", "硬壳", "认真", "缩回去", "quiet", "boundary"],
  elephant: ["记忆", "远年", "旧信", "家族", "河流", "迁徙", "祖辈", "重量", "memory", "ancestral"],
  crane: ["旧俗", "河滩", "香灰", "钟声", "禁忌", "长桥", "夜雾", "纸灯", "ritual", "mist"],
  whale: ["深海", "巨浪", "回声", "沉没", "港口", "鲸歌", "潮汐", "深夜", "deep", "echo"],
  falcon: ["高塔", "俯冲", "目标", "天幕", "箭", "引擎", "战线", "侦测", "strike", "target"]
};

function countMatchedCueKeywords(text: string, keywords: string[]) {
  return keywords.reduce((total, keyword) => (text.includes(keyword.toLowerCase()) ? total + 1 : total), 0);
}

function getPopularityStabilityScore(popularityRank: number | null) {
  if (popularityRank == null) {
    return 0;
  }

  if (popularityRank <= 10) {
    return 3;
  }

  if (popularityRank <= 30) {
    return 2;
  }

  if (popularityRank <= 60) {
    return 1;
  }

  return 0;
}

export const getRecommendedBooksForPersona = cache(async (persona: AnimalPersona, limit = 6) => {
  const categories = await getCategoriesWithBooks();
  const books = categories.flatMap((category) => category.books);

  const scored = books
    .map((book) => {
      const searchableText = [
        book.slug,
        book.title,
        book.summary,
        book.originalSynopsis ?? "",
        book.keyScenes.join(" ")
      ]
        .join(" ")
        .toLowerCase();
      const cueMatchCount = countMatchedCueKeywords(searchableText, personaBookCueKeywords[persona.animalType]);
      const styleAffinityScore = persona.recommendedStyles.reduce((score, styleLabel) => {
        if (styleLabel === "暗黑风" && /夜|影|禁忌|惩罚|狼|黑/i.test(searchableText)) {
          return score + 1;
        }

        if (styleLabel === "童话风" && /森林|魔法|王子|公主|小屋|精灵/i.test(searchableText)) {
          return score + 1;
        }

        if (styleLabel === "悬疑风" && /谜|秘密|消失|门|锁|真相/i.test(searchableText)) {
          return score + 1;
        }

        if (styleLabel === "现实主义风" && /家庭|生活|工作|日子|村子|家人/i.test(searchableText)) {
          return score + 1;
        }

        if (styleLabel === "科幻未来风" && /机器|装置|系统|未来|星|引擎|时空/i.test(searchableText)) {
          return score + 1;
        }

        return score;
      }, 0);
      const score = cueMatchCount * 3 + styleAffinityScore + getPopularityStabilityScore(book.popularityRank);

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
