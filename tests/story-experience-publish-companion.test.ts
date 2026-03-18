import { beforeEach, describe, expect, it, vi } from "vitest";

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

function createViewerContext() {
  return {
    userId: "user-1",
    secondMeUserId: "secondme-user-1",
    animalProfileId: "animal-profile-1",
    displayName: "迪西",
    avatar: null,
    persona: {
      animalType: "fox",
      animalName: "狐狸",
      displayLabel: "狐狸",
      summary: "谨慎而敏锐。",
      expressionStyle: "克制",
      tendencies: ["观察"],
      values: ["诚实"],
      recommendedCategories: ["fairy_tale"],
      recommendedStyles: ["童话风"],
      dimensionScores: {
        warmth: 75,
        action: 60,
        thinking: 88,
        expression: 55
      },
      mappingReason: "测试画像"
    },
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

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  mocks.getCurrentViewerContext.mockResolvedValue(createViewerContext());
  mocks.getBookBySlug.mockResolvedValue(createBook());
  mocks.isMissingRelationError.mockReturnValue(false);
});

describe("story-experience companion publishing", () => {
  it("reuses an existing active companion thread for the same origin episode", async () => {
    const executed: SqlCall[] = [];

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

      if (normalized.includes("FROM story_threads WHERE origin_episode_id = $1")) {
        return { rows: [{ id: "companion-existing-1" }] };
      }

      throw new Error(`Unhandled SQL: ${normalized}`);
    });

    const { publishCompanionFromPersonal } = await import("@/lib/story-experience");
    const result = await publishCompanionFromPersonal("origin-episode-1");

    expect(result).toEqual({
      threadId: "companion-existing-1",
      episodeId: null
    });
    expect(mocks.getBookBySlug).not.toHaveBeenCalled();
    expect(executed.some((call) => call.query.includes("INSERT INTO story_threads"))).toBe(false);
    expect(executed.some((call) => call.query.includes("INSERT INTO story_episodes"))).toBe(false);
  });

  it("publishes the current personal chapter directly into a new companion thread without queuing generation", async () => {
    const executed: SqlCall[] = [];

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

      if (normalized.includes("FROM story_threads WHERE origin_episode_id = $1")) {
        return { rows: [] };
      }

      if (normalized.includes("FROM story_episodes e JOIN story_threads t ON t.id = e.thread_id")) {
        return {
          rows: [
            {
              personal_thread_id: "personal-thread-1",
              personal_thread_title: "我在《睡美人》里的冒险",
              source_book_id: "book-1",
              source_book_slug: "fairy-sleeping-beauty",
              source_book_title: "睡美人",
              locked_style_id: "style-1",
              locked_style_key: "fairy",
              origin_episode_id: "origin-episode-1",
              origin_episode_title: "第 01 次冒险 · 《睡美人》",
              origin_episode_excerpt: "我再次走进荆棘围起的城堡。",
              origin_episode_generated_at: "2026-03-18T10:00:00.000Z"
            }
          ]
        };
      }

      if (normalized === "SELECT id, key FROM story_styles") {
        return {
          rows: [{ id: "style-1", key: "fairy" }]
        };
      }

      if (normalized.includes("INSERT INTO story_threads")) {
        return {
          rows: [{ id: "companion-thread-1" }]
        };
      }

      if (normalized.includes("INSERT INTO story_thread_participants")) {
        return { rows: [] };
      }

      if (normalized.includes("INSERT INTO story_episodes") && normalized.includes("FROM story_episodes e")) {
        return {
          rows: [{ id: "companion-episode-1", generated_at: "2026-03-18T10:00:00.000Z" }]
        };
      }

      if (normalized.startsWith("UPDATE story_threads SET latest_episode_id = $2")) {
        return { rows: [] };
      }

      if (normalized.includes("INSERT INTO timeline_items")) {
        return { rows: [] };
      }

      throw new Error(`Unhandled SQL: ${normalized}`);
    });

    const { publishCompanionFromPersonal } = await import("@/lib/story-experience");
    const result = await publishCompanionFromPersonal("origin-episode-1");

    expect(result).toEqual({
      threadId: "companion-thread-1",
      episodeId: "companion-episode-1"
    });

    expect(executed.some((call) => call.query.includes("INSERT INTO generation_jobs"))).toBe(false);

    const episodeInsert = executed.find(
      (call) => call.query.includes("INSERT INTO story_episodes") && call.query.includes("FROM story_episodes e")
    );

    expect(episodeInsert?.values).toEqual(["companion-thread-1", "book-1", 1, "style-1", "origin-episode-1"]);

    const threadUpdate = executed.find((call) => call.query.startsWith("UPDATE story_threads SET latest_episode_id = $2"));
    expect(threadUpdate?.values).toEqual([
      "companion-thread-1",
      "companion-episode-1",
      "book-1",
      "2026-03-18T10:00:00.000Z"
    ]);

    const timelineInsert = executed.find((call) => call.query.includes("INSERT INTO timeline_items"));
    expect(timelineInsert?.values).toEqual([
      "user-1",
      "companion_episode",
      "companion-episode-1",
      "第 01 次冒险 · 《睡美人》",
      "我再次走进荆棘围起的城堡。",
      "book-1"
    ]);
  });

  it("continues a copied companion thread from chapter two with adventure_continue mode", async () => {
    const executed: SqlCall[] = [];

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

      if (normalized.includes("FROM story_threads t") && normalized.includes("t.thread_kind = 'companion'") && normalized.includes("WHERE t.id = $1")) {
        return {
          rows: [
            {
              id: "companion-thread-1",
              thread_kind: "companion",
              title: "迪西在《睡美人》里重新相遇",
              status: "active",
              completed_at: null,
              participant_limit: 5,
              episode_limit: 10,
              source_book_title: "睡美人",
              source_book_slug: "fairy-sleeping-beauty",
              source_book_category_key: "fairy_tale",
              locked_style_name: "童话风",
              locked_style_key: "fairy",
              owner_display_name: "迪西",
              latest_episode_id: "companion-episode-1",
              latest_episode_title: "第 01 次冒险 · 《睡美人》",
              latest_episode_excerpt: "我再次走进荆棘围起的城堡。",
              latest_episode_content: "故事内容",
              latest_episode_generated_at: "2026-03-18T10:00:00.000Z",
              latest_episode_no: 1,
              latest_episode_status: "published",
              latest_episode_job_status: "succeeded",
              latest_episode_job_error: null,
              participant_count: 1,
              episode_count: 1,
              is_owner: true,
              is_participant: true,
              source_book_id: "book-1",
              locked_style_id: "style-1",
              origin_personal_thread_id: "personal-thread-1",
              origin_episode_id: "origin-episode-1"
            }
          ]
        };
      }

      if (normalized === "SELECT id, key FROM story_styles") {
        return {
          rows: [{ id: "style-1", key: "fairy" }]
        };
      }

      if (normalized.includes("INSERT INTO generation_jobs")) {
        return {
          rows: [{ id: "job-1" }]
        };
      }

      if (normalized.includes("INSERT INTO story_episodes") && normalized.includes("VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL, NULL, 'queued')")) {
        return {
          rows: [{ id: "companion-episode-2" }]
        };
      }

      if (normalized.startsWith("UPDATE story_threads SET latest_episode_id = $2")) {
        return { rows: [] };
      }

      throw new Error(`Unhandled SQL: ${normalized}`);
    });

    const { continueAdventure } = await import("@/lib/story-experience");
    const result = await continueAdventure("companion-thread-1");

    expect(result).toEqual({
      threadId: "companion-thread-1",
      created: true,
      episodeId: "companion-episode-2"
    });

    const jobInsert = executed.find((call) => call.query.includes("INSERT INTO generation_jobs"));
    expect(String(jobInsert?.values[1])).toContain('"episodeNo":2');
    expect(String(jobInsert?.values[1])).toContain('"mode":"adventure_continue"');

    const queuedEpisodeInsert = executed.find(
      (call) => call.query.includes("INSERT INTO story_episodes") && call.query.includes("VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL, NULL, 'queued')")
    );
    expect(queuedEpisodeInsert?.values.slice(0, 6)).toEqual([
      "companion-thread-1",
      "user-1",
      "book-1",
      "job-1",
      2,
      "style-1"
    ]);
  });
});
