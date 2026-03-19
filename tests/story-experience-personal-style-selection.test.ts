import { beforeEach, describe, expect, it, vi } from "vitest";
import { animalPersonas } from "@/lib/animal-personas";
import { pickPersistableThreadPrimaryStyleKey } from "@/lib/story-style";

const mocks = vi.hoisted(() => ({
  sql: vi.fn(),
  isMissingRelationError: vi.fn(() => false),
  getCurrentViewerContext: vi.fn(),
  getViewerContextByUserId: vi.fn(),
  getBookBySlug: vi.fn(),
  generateAdventureEpisodeWithLlm: vi.fn(),
  generateBedtimeMemoryWithLlm: vi.fn(),
  generatePersonalEpisodeWithLlm: vi.fn(),
  getCachedSecondMeStoryContext: vi.fn(),
  getStoredSecondMeStoryContext: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  sql: mocks.sql,
  isMissingRelationError: mocks.isMissingRelationError
}));

vi.mock("@/lib/current-user", () => ({
  getCurrentViewerContext: mocks.getCurrentViewerContext,
  getViewerContextByUserId: mocks.getViewerContextByUserId
}));

vi.mock("@/lib/story-data", () => ({
  getBookBySlug: mocks.getBookBySlug
}));

vi.mock("@/lib/llm", () => ({
  generateAdventureEpisodeWithLlm: mocks.generateAdventureEpisodeWithLlm,
  generateBedtimeMemoryWithLlm: mocks.generateBedtimeMemoryWithLlm,
  generatePersonalEpisodeWithLlm: mocks.generatePersonalEpisodeWithLlm
}));

vi.mock("@/lib/secondme-story-context", () => ({
  getCachedSecondMeStoryContext: mocks.getCachedSecondMeStoryContext,
  getStoredSecondMeStoryContext: mocks.getStoredSecondMeStoryContext
}));

type SqlCall = {
  query: string;
  values: ReadonlyArray<string | number | boolean | null>;
};

function normalizeSql(query: string) {
  return query.replace(/\s+/g, " ").trim();
}

function createViewerContext(userId = "user-1") {
  return {
    userId,
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
    keyScenes: [],
    storyContent: null,
    sourceSite: null,
    sourceTitle: null,
    sourceUrl: null,
    sourceLicense: null,
    popularityRank: 4
  };
}

const persistedStyleIds = new Map([
  ["fairy", "style-fairy"],
  ["black_humor", "style-black-humor"],
  ["light_web", "style-light-web"],
  ["growth", "style-growth"]
]);

function findUserWithNonFairyWeightedThreadStyle(book = createBook()) {
  for (let index = 0; index < 500; index += 1) {
    const userId = `user-${index}`;
    const styleKey = pickPersistableThreadPrimaryStyleKey({
      userId,
      persona: animalPersonas.fox,
      seedBook: book,
      styleIds: persistedStyleIds
    });

    if (styleKey && styleKey !== "fairy") {
      return userId;
    }
  }

  throw new Error("Failed to find a non-fairy weighted style user.");
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  mocks.getCurrentViewerContext.mockResolvedValue(createViewerContext());
  mocks.getCachedSecondMeStoryContext.mockResolvedValue({ id: "story-context-1" });
  mocks.getBookBySlug.mockResolvedValue(createBook());
  mocks.isMissingRelationError.mockReturnValue(false);
});

describe("story-experience personal style selection", () => {
  it("uses the weighted initial style when creating a new personal line", async () => {
    const executed: SqlCall[] = [];
    const viewerContext = createViewerContext();
    const book = createBook();
    const expectedStyleKey = pickPersistableThreadPrimaryStyleKey({
      userId: viewerContext.userId,
      persona: viewerContext.persona,
      seedBook: book,
      styleIds: persistedStyleIds
    });

    mocks.sql.mockImplementation(async (query: string, values: ReadonlyArray<string | number | boolean | null> = []) => {
      const normalized = normalizeSql(query);
      executed.push({ query: normalized, values });

      if (normalized.startsWith("SELECT owner_user_id, source_book_id, locked_style_id, thread_kind")) {
        return { rows: [] };
      }

      if (normalized.startsWith("SELECT thread_id, user_id, role FROM story_thread_participants")) {
        return { rows: [] };
      }

      if (normalized.startsWith("SELECT user_id, memory_date, source_secondme_context FROM bedtime_memories")) {
        return { rows: [] };
      }

      if (normalized.startsWith("SELECT id FROM story_books WHERE slug = $1")) {
        return { rows: [{ id: "book-1" }] };
      }

      if (normalized.includes("WHERE t.owner_user_id = $1") && normalized.includes("AND sb.slug = $2") && normalized.includes("t.thread_kind = 'personal'")) {
        return { rows: [] };
      }

      if (normalized === "SELECT id, key FROM story_styles") {
        return {
          rows: [
            { id: "style-fairy", key: "fairy" },
            { id: "style-black-humor", key: "black_humor" },
            { id: "style-light-web", key: "light_web" },
            { id: "style-growth", key: "growth" }
          ]
        };
      }

      if (normalized.includes("INSERT INTO story_threads")) {
        return {
          rows: [{ id: "personal-thread-1" }]
        };
      }

      if (normalized.includes("INSERT INTO story_thread_participants")) {
        return { rows: [] };
      }

      if (normalized.includes("WHERE t.id = $1") && normalized.includes("AND t.owner_user_id = $2") && normalized.includes("t.thread_kind = 'personal'")) {
        return {
          rows: [
            {
              id: "personal-thread-1",
              thread_kind: "personal",
              title: "我在《睡美人》里的冒险",
              status: "active",
              completed_at: null,
              participant_limit: 1,
              episode_limit: 999999,
              source_book_title: "睡美人",
              source_book_slug: "fairy-sleeping-beauty",
              source_book_category_key: "fairy_tale",
              locked_style_name: expectedStyleKey === "fairy" ? "童话风" : expectedStyleKey === "black_humor" ? "黑色幽默风" : "轻喜剧网感风",
              locked_style_key: expectedStyleKey,
              owner_display_name: "迪西",
              latest_episode_id: null,
              latest_episode_title: null,
              latest_episode_excerpt: null,
              latest_episode_content: null,
              latest_episode_generated_at: null,
              latest_episode_no: null,
              latest_episode_status: "queued",
              latest_episode_job_status: "queued",
              latest_episode_job_error: null,
              participant_count: 1,
              episode_count: 0,
              is_owner: true,
              is_participant: true,
              source_book_id: "book-1",
              locked_style_id: expectedStyleKey ? persistedStyleIds.get(expectedStyleKey) ?? null : null,
              origin_personal_thread_id: null,
              origin_episode_id: null,
              meta: null
            }
          ]
        };
      }

      if (normalized.includes("INSERT INTO generation_jobs")) {
        return {
          rows: [{ id: "job-1" }]
        };
      }

      if (normalized.includes("INSERT INTO story_episodes") && normalized.includes("VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL, NULL, 'queued')")) {
        return {
          rows: [{ id: "episode-1" }]
        };
      }

      if (normalized.startsWith("UPDATE story_threads SET latest_episode_id = $2")) {
        return { rows: [] };
      }

      throw new Error(`Unhandled SQL: ${normalized}`);
    });

    const { startOrOpenPersonalLine } = await import("@/lib/story-experience");
    const result = await startOrOpenPersonalLine(book.slug);

    expect(result).toEqual({
      threadId: "personal-thread-1",
      episodeId: "episode-1",
      slug: book.slug
    });

    const threadInsert = executed.find((call) => call.query.includes("INSERT INTO story_threads"));
    const jobInsert = executed.find((call) => call.query.includes("INSERT INTO generation_jobs"));

    expect(threadInsert?.values[4]).toBe(expectedStyleKey ? persistedStyleIds.get(expectedStyleKey) ?? null : null);
    expect(JSON.parse(String(jobInsert?.values[1]))).toMatchObject({
      styleKey: expectedStyleKey,
      mode: "personal_start"
    });
  });

  it("keeps an existing locked personal style instead of reselecting on continue", async () => {
    const executed: SqlCall[] = [];
    const book = createBook();
    const userId = findUserWithNonFairyWeightedThreadStyle(book);

    mocks.getCurrentViewerContext.mockResolvedValue(createViewerContext(userId));
    mocks.sql.mockImplementation(async (query: string, values: ReadonlyArray<string | number | boolean | null> = []) => {
      const normalized = normalizeSql(query);
      executed.push({ query: normalized, values });

      if (normalized.startsWith("SELECT owner_user_id, source_book_id, locked_style_id, thread_kind")) {
        return { rows: [] };
      }

      if (normalized.startsWith("SELECT thread_id, user_id, role FROM story_thread_participants")) {
        return { rows: [] };
      }

      if (normalized.startsWith("SELECT user_id, memory_date, source_secondme_context FROM bedtime_memories")) {
        return { rows: [] };
      }

      if (normalized.startsWith("SELECT id FROM story_books WHERE slug = $1")) {
        return { rows: [{ id: "book-1" }] };
      }

      if (normalized.includes("WHERE t.owner_user_id = $1") && normalized.includes("AND sb.slug = $2") && normalized.includes("t.thread_kind = 'personal'")) {
        return {
          rows: [
            {
              id: "personal-thread-1",
              thread_kind: "personal",
              title: "我在《睡美人》里的冒险",
              status: "active",
              completed_at: null,
              participant_limit: 1,
              episode_limit: 999999,
              source_book_title: "睡美人",
              source_book_slug: "fairy-sleeping-beauty",
              source_book_category_key: "fairy_tale",
              locked_style_name: "童话风",
              locked_style_key: "fairy",
              owner_display_name: "迪西",
              latest_episode_id: null,
              latest_episode_title: null,
              latest_episode_excerpt: null,
              latest_episode_content: null,
              latest_episode_generated_at: null,
              latest_episode_no: null,
              latest_episode_status: "queued",
              latest_episode_job_status: "queued",
              latest_episode_job_error: null,
              participant_count: 1,
              episode_count: 0,
              is_owner: true,
              is_participant: true,
              source_book_id: "book-1",
              locked_style_id: "style-fairy",
              origin_personal_thread_id: null,
              origin_episode_id: null,
              meta: null
            }
          ]
        };
      }

      if (normalized === "SELECT id, key FROM story_styles") {
        return {
          rows: [
            { id: "style-fairy", key: "fairy" },
            { id: "style-black-humor", key: "black_humor" },
            { id: "style-light-web", key: "light_web" },
            { id: "style-growth", key: "growth" }
          ]
        };
      }

      if (normalized.includes("INSERT INTO generation_jobs")) {
        return {
          rows: [{ id: "job-1" }]
        };
      }

      if (normalized.includes("INSERT INTO story_episodes") && normalized.includes("VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL, NULL, 'queued')")) {
        return {
          rows: [{ id: "episode-1" }]
        };
      }

      if (normalized.startsWith("UPDATE story_threads SET latest_episode_id = $2")) {
        return { rows: [] };
      }

      throw new Error(`Unhandled SQL: ${normalized}`);
    });

    const { startOrOpenPersonalLine } = await import("@/lib/story-experience");
    const result = await startOrOpenPersonalLine(book.slug);

    expect(result).toEqual({
      threadId: "personal-thread-1",
      episodeId: "episode-1",
      slug: book.slug
    });

    const jobInsert = executed.find((call) => call.query.includes("INSERT INTO generation_jobs"));

    expect(
      pickPersistableThreadPrimaryStyleKey({
        userId,
        persona: animalPersonas.fox,
        seedBook: book,
        styleIds: persistedStyleIds
      })
    ).not.toBe("fairy");
    expect(JSON.parse(String(jobInsert?.values[1]))).toMatchObject({
      styleKey: "fairy",
      mode: "personal_start"
    });
    expect(executed.some((call) => call.query.startsWith("UPDATE story_threads SET locked_style_id = $2"))).toBe(false);
  });
});
