import { afterEach, describe, expect, it, vi } from "vitest";
import type { StoryBook } from "@/lib/story-data";

const sqlMock = vi.fn();

vi.mock("@/lib/db", () => ({
  sql: sqlMock
}));

function createBook(overrides: Partial<StoryBook> = {}): StoryBook {
  return {
    id: "book-current",
    title: "小红帽",
    slug: "fairy-little-red-riding-hood",
    summary: "摘要",
    originalSynopsis: "梗概",
    coverImage: null,
    categoryKey: "fairy_tale",
    categoryName: "童话",
    keyScenes: [],
    storyContent: null,
    sourceSite: null,
    sourceTitle: null,
    sourceUrl: null,
    sourceLicense: null,
    popularityRank: null,
    ...overrides
  };
}

function createReferenceRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "ref-1",
    story_book_id: "book-current",
    story_book_slug: "fairy-little-red-riding-hood",
    story_book_title: "小红帽",
    query_keyword: "小红帽",
    source_url: "https://www.zhihu.com/question/1/answer/2",
    source_type: "answer",
    title: "为什么小红帽总是会走进那片森林",
    author_name: "答主 A",
    author_headline: "童话研究者",
    author_url: "https://www.zhihu.com/people/test-a",
    authority_level: 4,
    excerpt: "摘要",
    content: "正文内容",
    quality_score: 91,
    fetched_at: "2026-03-18T12:00:00.000Z",
    ...overrides
  };
}

afterEach(() => {
  sqlMock.mockReset();
  vi.resetModules();
});

describe("zhihu reference selection", () => {
  it("picks a fallback book deterministically from candidates", async () => {
    const { pickZhihuFallbackBookId } = await import("@/lib/zhihu-references");
    const candidates = [{ story_book_id: "book-a" }, { story_book_id: "book-b" }, { story_book_id: "book-c" }];

    expect(pickZhihuFallbackBookId(candidates, "thread-1")).toBe(pickZhihuFallbackBookId(candidates, "thread-1"));
  });

  it("returns current-book references when the current fairy tale already has zhihu material", async () => {
    sqlMock.mockImplementation(async (query: string) => {
      if (query.includes("WHERE zsr.story_book_id = $1")) {
        return {
          rows: [createReferenceRow()]
        };
      }

      throw new Error(`Unexpected query: ${query}`);
    });

    const { resolveZhihuReferencePack } = await import("@/lib/zhihu-references");
    const pack = await resolveZhihuReferencePack({
      book: createBook(),
      threadSeed: "thread-1"
    });

    expect(pack).toMatchObject({
      sourceType: "matched",
      referenceBookId: "book-current",
      referenceBookTitle: "小红帽"
    });
    expect(pack?.sources).toHaveLength(1);
    expect(pack?.metaPatch).toBeUndefined();
  });

  it("reuses locked source ids before selecting a new fallback book", async () => {
    sqlMock.mockImplementation(async (query: string, values?: ReadonlyArray<string | number | boolean | null>) => {
      if (query.includes("WHERE zsr.story_book_id = $1")) {
        return {
          rows: values?.[0] === "book-current" ? [] : [createReferenceRow({
            id: "ref-fallback-1",
            story_book_id: "book-fallback",
            story_book_slug: "fairy-sleeping-beauty",
            story_book_title: "睡美人"
          })]
        };
      }

      if (query.includes("WHERE zsr.id IN")) {
        return {
          rows: [createReferenceRow({
            id: "ref-fallback-1",
            story_book_id: "book-fallback",
            story_book_slug: "fairy-sleeping-beauty",
            story_book_title: "睡美人"
          })]
        };
      }

      throw new Error(`Unexpected query: ${query}`);
    });

    const { resolveZhihuReferencePack } = await import("@/lib/zhihu-references");
    const pack = await resolveZhihuReferencePack({
      book: createBook(),
      threadSeed: "thread-2",
      threadMeta: {
        zhihuReferenceSourceIds: ["ref-fallback-1"]
      }
    });

    expect(pack).toMatchObject({
      sourceType: "fallback_locked",
      referenceBookId: "book-fallback",
      referenceBookTitle: "睡美人",
      metaPatch: {
        zhihuReferenceBookId: "book-fallback",
        zhihuReferenceSourceIds: ["ref-fallback-1"]
      }
    });
  });

  it("falls back to another fairy tale and records the chosen source ids", async () => {
    sqlMock.mockImplementation(async (query: string, values?: ReadonlyArray<string | number | boolean | null>) => {
      if (query.includes("WHERE zsr.story_book_id = $1")) {
        return {
          rows: values?.[0] === "book-current"
            ? []
            : [createReferenceRow({
                id: "ref-fallback-2",
                story_book_id: "book-fallback-2",
                story_book_slug: "fairy-snow-white",
                story_book_title: "白雪公主"
              })]
        };
      }

      if (query.includes("GROUP BY zsr.story_book_id")) {
        return {
          rows: [{
            story_book_id: "book-fallback-2",
            story_book_slug: "fairy-snow-white",
            story_book_title: "白雪公主",
            top_quality_score: 95
          }]
        };
      }

      throw new Error(`Unexpected query: ${query}`);
    });

    const { resolveZhihuReferencePack } = await import("@/lib/zhihu-references");
    const pack = await resolveZhihuReferencePack({
      book: createBook(),
      threadSeed: "thread-3"
    });

    expect(pack).toMatchObject({
      sourceType: "fallback",
      referenceBookId: "book-fallback-2",
      referenceBookTitle: "白雪公主",
      metaPatch: {
        zhihuReferenceBookId: "book-fallback-2",
        zhihuReferenceSourceIds: ["ref-fallback-2"]
      }
    });
  });
});
