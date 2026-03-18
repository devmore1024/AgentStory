export const PRIMARY_SOURCE_BACKED_FAIRY_BOOK_COUNT = 100;

export type FairyBookSyncRow = {
  categoryKey: string;
  categoryName: string;
  categorySortOrder: number;
  title: string;
  slug: string;
  coverImage: string | null;
  summary: string;
  keyScenes: readonly string[];
  originalSynopsis: string | null;
  storyContent: string | null;
  sourceSite: string | null;
  sourceUrl: string | null;
  sourceLicense: string | null;
  sourceTitle: string | null;
  popularityRank: number | null;
  publicDomain: boolean;
  isActive: boolean;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function validatePrimarySourceBackedFairyBooks(rows: readonly FairyBookSyncRow[]) {
  if (rows.length !== PRIMARY_SOURCE_BACKED_FAIRY_BOOK_COUNT) {
    throw new Error(
      `Expected ${PRIMARY_SOURCE_BACKED_FAIRY_BOOK_COUNT} primary-entry fairy books, received ${rows.length}.`
    );
  }

  const sorted = [...rows].sort((left, right) => {
    const leftRank = left.popularityRank ?? Number.MAX_SAFE_INTEGER;
    const rightRank = right.popularityRank ?? Number.MAX_SAFE_INTEGER;
    return leftRank - rightRank;
  });

  const seenSlugs = new Set<string>();

  sorted.forEach((row, index) => {
    const expectedRank = index + 1;

    if (row.categoryKey !== "fairy_tale") {
      throw new Error(`Book ${row.slug} does not belong to fairy_tale.`);
    }

    if (!isNonEmptyString(row.categoryName)) {
      throw new Error(`Book ${row.slug} is missing category name.`);
    }

    if (!Number.isInteger(row.categorySortOrder)) {
      throw new Error(`Book ${row.slug} has invalid category sort order.`);
    }

    if (!isNonEmptyString(row.title) || !isNonEmptyString(row.slug) || !isNonEmptyString(row.summary)) {
      throw new Error(`Book ${row.slug || "<unknown>"} is missing required text fields.`);
    }

    if (row.popularityRank !== expectedRank) {
      throw new Error(`Expected fairy book rank ${expectedRank}, received ${row.popularityRank ?? "null"}.`);
    }

    if (seenSlugs.has(row.slug)) {
      throw new Error(`Duplicate fairy book slug detected: ${row.slug}.`);
    }

    if (!Array.isArray(row.keyScenes) || row.keyScenes.length < 3 || row.keyScenes.some((scene) => !isNonEmptyString(scene))) {
      throw new Error(`Book ${row.slug} is missing readable key scenes.`);
    }

    if (!isNonEmptyString(row.storyContent)) {
      throw new Error(`Book ${row.slug} is missing story content.`);
    }

    if (!isNonEmptyString(row.sourceSite) || !isNonEmptyString(row.sourceTitle) || !isNonEmptyString(row.sourceLicense)) {
      throw new Error(`Book ${row.slug} is missing source metadata.`);
    }

    if (!isNonEmptyString(row.sourceUrl) || !row.sourceUrl.startsWith("https://")) {
      throw new Error(`Book ${row.slug} has an invalid source URL.`);
    }

    seenSlugs.add(row.slug);
  });

  return sorted;
}
