import { describe, expect, it } from "vitest";
import {
  PRIMARY_SOURCE_BACKED_FAIRY_BOOK_COUNT,
  type FairyBookSyncRow,
  validatePrimarySourceBackedFairyBooks
} from "@/lib/fairy-book-sync";

function buildFairyBook(rank: number, overrides: Partial<FairyBookSyncRow> = {}): FairyBookSyncRow {
  return {
    categoryKey: "fairy_tale",
    categoryName: "童话",
    categorySortOrder: 1,
    title: `童话 ${rank}`,
    slug: `fairy-book-${rank}`,
    coverImage: null,
    summary: `这是第 ${rank} 本童话的摘要。`,
    keyScenes: [`开场 ${rank}`, `转折 ${rank}`, `结尾 ${rank}`],
    originalSynopsis: `这是第 ${rank} 本童话的原故事概览。`,
    storyContent: `这是第 ${rank} 本童话的正文内容，足够被当作主入口故事使用。`,
    sourceSite: "Project Gutenberg",
    sourceUrl: `https://example.com/fairy-${rank}`,
    sourceLicense: "Public Domain",
    sourceTitle: `Fairy Tale ${rank}`,
    popularityRank: rank,
    publicDomain: true,
    isActive: true,
    ...overrides
  };
}

describe("validatePrimarySourceBackedFairyBooks", () => {
  it("accepts exactly 100 ranked fairy books and returns them sorted by popularity rank", () => {
    const books = Array.from({ length: PRIMARY_SOURCE_BACKED_FAIRY_BOOK_COUNT }, (_, index) =>
      buildFairyBook(PRIMARY_SOURCE_BACKED_FAIRY_BOOK_COUNT - index)
    );

    const validated = validatePrimarySourceBackedFairyBooks(books);

    expect(validated).toHaveLength(PRIMARY_SOURCE_BACKED_FAIRY_BOOK_COUNT);
    expect(validated[0]?.popularityRank).toBe(1);
    expect(validated.at(-1)?.popularityRank).toBe(PRIMARY_SOURCE_BACKED_FAIRY_BOOK_COUNT);
  });

  it("rejects rows when a popularity rank is missing or duplicated", () => {
    const books = Array.from({ length: PRIMARY_SOURCE_BACKED_FAIRY_BOOK_COUNT }, (_, index) => buildFairyBook(index + 1));
    books[19] = buildFairyBook(21, { slug: "fairy-book-duplicate-rank" });

    expect(() => validatePrimarySourceBackedFairyBooks(books)).toThrow("Expected fairy book rank 20");
  });

  it("rejects non-fairy rows and incomplete source metadata", () => {
    const books = Array.from({ length: PRIMARY_SOURCE_BACKED_FAIRY_BOOK_COUNT }, (_, index) => buildFairyBook(index + 1));
    books[0] = buildFairyBook(1, { categoryKey: "fable" });

    expect(() => validatePrimarySourceBackedFairyBooks(books)).toThrow("does not belong to fairy_tale");

    books[0] = buildFairyBook(1, { sourceUrl: null });

    expect(() => validatePrimarySourceBackedFairyBooks(books)).toThrow("has an invalid source URL");
  });
});
