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

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  mocks.getCurrentViewerContext.mockResolvedValue(createViewerContext());
  mocks.isMissingRelationError.mockReturnValue(false);
});

describe("story-experience recovery", () => {
  it("expires running episode jobs that have timed out", async () => {
    const executed: string[] = [];

    mocks.sql.mockImplementation(async (query: string) => {
      const normalized = normalizeSql(query);
      executed.push(normalized);

      if (normalized.startsWith("SELECT gj.id AS job_id, e.id AS episode_id, gj.started_at")) {
        return {
          rows: [
            {
              job_id: "job-1",
              episode_id: "episode-1",
              started_at: "2026-03-18T09:45:00.000Z"
            }
          ]
        };
      }

      if (normalized.startsWith("UPDATE story_episodes SET title = $2")) {
        return { rows: [] };
      }

      if (normalized.startsWith("UPDATE generation_jobs SET status = $2")) {
        return { rows: [] };
      }

      throw new Error(`Unhandled SQL: ${normalized}`);
    });

    const { expireStaleEpisodeGenerationJobs } = await import("@/lib/story-experience");
    const expiredCount = await expireStaleEpisodeGenerationJobs(new Date("2026-03-18T10:00:01.000Z"));

    expect(expiredCount).toBe(1);
    expect(executed.some((query) => query.startsWith("UPDATE story_episodes SET title = $2"))).toBe(true);
    expect(executed.some((query) => query.startsWith("UPDATE generation_jobs SET status = $2"))).toBe(true);
  });

  it("does not enqueue a new episode when viewing a completed personal line with ensureToday", async () => {
    const executed: string[] = [];

    mocks.sql.mockImplementation(async (query: string) => {
      const normalized = normalizeSql(query);
      executed.push(normalized);

      if (normalized.startsWith("SELECT owner_user_id, source_book_id, locked_style_id, thread_kind")) {
        return { rows: [] };
      }

      if (normalized.startsWith("SELECT thread_id, user_id, role FROM story_thread_participants")) {
        return { rows: [] };
      }

      if (normalized.startsWith("SELECT user_id, memory_date, source_secondme_context FROM bedtime_memories")) {
        return { rows: [] };
      }

      if (normalized.startsWith("SELECT gj.id AS job_id, e.id AS episode_id, gj.started_at")) {
        return { rows: [] };
      }

      if (normalized.includes("FROM story_threads t JOIN users owner ON owner.id = t.owner_user_id JOIN story_books sb ON sb.id = t.source_book_id")) {
        return {
          rows: [
            {
              id: "thread-1",
              thread_kind: "personal",
              title: "我在《睡美人》里的冒险",
              status: "completed",
              completed_at: "2026-03-18T09:00:00.000Z",
              participant_limit: 1,
              episode_limit: 1,
              source_book_title: "睡美人",
              source_book_slug: "fairy-sleeping-beauty",
              source_book_category_key: "fairy_tale",
              locked_style_name: "童话风",
              locked_style_key: "fairy",
              owner_display_name: "迪西",
              latest_episode_id: "episode-1",
              latest_episode_title: "第 01 次冒险 · 《睡美人》",
              latest_episode_excerpt: "故事已经收尾。",
              latest_episode_content: "故事内容",
              latest_episode_generated_at: "2026-03-17T10:00:00.000Z",
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
              origin_personal_thread_id: null,
              origin_episode_id: null
            }
          ]
        };
      }

      if (normalized.startsWith("SELECT e.id, e.episode_no, e.title")) {
        return {
          rows: [
            {
              id: "episode-1",
              episode_no: 1,
              title: "第 01 次冒险 · 《睡美人》",
              excerpt: "故事已经收尾。",
              content: "故事内容",
              generated_at: "2026-03-17T10:00:00.000Z",
              author_display_name: "迪西",
              style_name: "童话风"
            }
          ]
        };
      }

      if (normalized.includes("FROM story_threads WHERE origin_episode_id = $1")) {
        return { rows: [] };
      }

      throw new Error(`Unhandled SQL: ${normalized}`);
    });

    const { getPersonalLineDetail } = await import("@/lib/story-experience");
    const detail = await getPersonalLineDetail("fairy-sleeping-beauty", { ensureToday: true });

    expect(detail?.isCompleted).toBe(true);
    expect(executed.some((query) => query.includes("INSERT INTO generation_jobs"))).toBe(false);
  });
});
