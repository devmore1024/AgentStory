import { beforeEach, describe, expect, it, vi } from "vitest";
import { animalPersonas } from "@/lib/animal-personas";
import { pickPersistableShortStoryStyleKey } from "@/lib/story-style";

const mocks = vi.hoisted(() => ({
  sql: vi.fn(),
  getCurrentViewerContext: vi.fn(),
  getBookBySlug: vi.fn(),
  getCategoriesWithBooks: vi.fn(),
  generateCommentWithLlm: vi.fn(),
  generateSerialEpisodeWithLlm: vi.fn(),
  generateShortStoryWithLlm: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  sql: mocks.sql
}));

vi.mock("@/lib/current-user", () => ({
  getCurrentViewerContext: mocks.getCurrentViewerContext
}));

vi.mock("@/lib/story-data", () => ({
  getBookBySlug: mocks.getBookBySlug,
  getCategoriesWithBooks: mocks.getCategoriesWithBooks
}));

vi.mock("@/lib/llm", () => ({
  generateCommentWithLlm: mocks.generateCommentWithLlm,
  generateSerialEpisodeWithLlm: mocks.generateSerialEpisodeWithLlm,
  generateShortStoryWithLlm: mocks.generateShortStoryWithLlm
}));

import { createShortStoryForBookSlug, filterPrimaryEntryViewsToFairy } from "@/lib/demo-app";

type SqlCall = {
  query: string;
  values: ReadonlyArray<string | number | boolean | null>;
};

function normalizeSql(query: string) {
  return query.replace(/\s+/g, " ").trim();
}

function createViewerContext() {
  return {
    userId: "user-1",
    secondMeUserId: "secondme-user-1",
    animalProfileId: "animal-profile-1",
    displayName: "迪西",
    avatar: null,
    persona: animalPersonas.fox,
    isAuthenticated: true,
    source: "secondme" as const
  };
}

function createBook() {
  return {
    id: "book-1",
    title: "睡美人",
    slug: "fairy-sleeping-beauty",
    summary: "一个关于沉睡与重逢的童话。",
    originalSynopsis: "很久以前，公主沉睡在荆棘围起的城堡里。",
    coverImage: null,
    categoryKey: "fairy_tale" as const,
    categoryName: "童话",
    keyScenes: ["我在命运转弯前先开口"],
    storyContent: null,
    sourceSite: null,
    sourceTitle: null,
    sourceUrl: null,
    sourceLicense: null,
    popularityRank: 4
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getCurrentViewerContext.mockResolvedValue(createViewerContext());
  mocks.getBookBySlug.mockResolvedValue(createBook());
  mocks.getCategoriesWithBooks.mockResolvedValue([]);
  mocks.generateShortStoryWithLlm.mockRejectedValue(new Error("llm unavailable"));
  mocks.generateCommentWithLlm.mockResolvedValue("自动评论");
  mocks.generateSerialEpisodeWithLlm.mockResolvedValue({
    title: "示例章节",
    excerpt: "示例摘要",
    content: "示例内容",
    bridge: "示例桥段"
  });
});

describe("demo-app primary entry filters", () => {
  it("keeps only source-backed fairy tale items for main entry views", () => {
    const filtered = filterPrimaryEntryViewsToFairy([
      {
        id: "1",
        bookCategoryKey: "fairy_tale" as const,
        bookSlug: "fairy-little-red-riding-hood",
        title: "童话"
      },
      {
        id: "2",
        bookCategoryKey: "fairy_tale" as const,
        bookSlug: "fairy-maid-maleen",
        title: "隐藏童话"
      },
      { id: "3", bookCategoryKey: "fable" as const, bookSlug: "fable-the-crow-and-the-fox", title: "寓言" },
      { id: "4", bookCategoryKey: "mythology" as const, bookSlug: "myth-prometheus-steals-fire", title: "神话" },
      { id: "5", bookCategoryKey: null, bookSlug: null, title: "未知" }
    ]);

    expect(filtered).toEqual([
      {
        id: "1",
        bookCategoryKey: "fairy_tale",
        bookSlug: "fairy-little-red-riding-hood",
        title: "童话"
      }
    ]);
  });

  it("uses the shared weighted short-story style rule when creating demo stories", async () => {
    const executed: SqlCall[] = [];
    const viewerContext = createViewerContext();
    const book = createBook();
    const styleIds = new Map([
      ["fairy", "style-fairy"],
      ["light_web", "style-light-web"]
    ]);
    const expectedStyleKey = pickPersistableShortStoryStyleKey({
      book,
      persona: viewerContext.persona,
      seedText: viewerContext.userId,
      styleIds
    });

    mocks.sql.mockImplementation(async (query: string, values: ReadonlyArray<string | number | boolean | null> = []) => {
      const normalized = normalizeSql(query);
      executed.push({ query: normalized, values });

      if (normalized === "SELECT id, key FROM story_styles") {
        return {
          rows: [
            { id: "style-fairy", key: "fairy" },
            { id: "style-light-web", key: "light_web" }
          ]
        };
      }

      if (normalized.startsWith("SELECT id FROM story_threads WHERE user_id = $1 AND status = 'active' LIMIT 1")) {
        return {
          rows: [{ id: "thread-1" }]
        };
      }

      if (normalized.includes("INSERT INTO generation_jobs")) {
        return {
          rows: [{ id: "job-1" }]
        };
      }

      if (normalized.startsWith("UPDATE generation_jobs SET status = 'running'")) {
        return { rows: [] };
      }

      if (normalized.startsWith("UPDATE generation_jobs SET status = $2")) {
        return { rows: [] };
      }

      if (normalized.includes("INSERT INTO short_stories")) {
        return {
          rows: [{ id: "short-story-1" }]
        };
      }

      if (normalized.includes("INSERT INTO timeline_items")) {
        return { rows: [] };
      }

      if (normalized.includes("INSERT INTO feed_stories")) {
        return {
          rows: [{ id: "feed-story-1" }]
        };
      }

      if (normalized.startsWith("SELECT id, content FROM ai_comments")) {
        return { rows: [] };
      }

      if (normalized.includes("INSERT INTO ai_comments")) {
        return { rows: [] };
      }

      if (normalized.startsWith("UPDATE feed_stories SET comment_count = comment_count + 1")) {
        return { rows: [] };
      }

      throw new Error(`Unhandled SQL: ${normalized}`);
    });

    await createShortStoryForBookSlug(book.slug);

    const jobInsert = executed.find((call) => call.query.includes("INSERT INTO generation_jobs"));
    const storyInsert = executed.find((call) => call.query.includes("INSERT INTO short_stories"));

    expect(JSON.parse(String(jobInsert?.values[1]))).toMatchObject({
      styleKey: expectedStyleKey
    });
    expect(storyInsert?.values[4]).toBe(expectedStyleKey ? styleIds.get(expectedStyleKey) ?? null : null);
  });
});
