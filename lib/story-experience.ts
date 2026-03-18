import { cache } from "react";
import { getCurrentViewerContext, getViewerContextByUserId, type AppUserContext } from "@/lib/current-user";
import { isMissingRelationError, sql } from "@/lib/db";
import { generateAdventureEpisodeWithLlm, generateBedtimeMemoryWithLlm, generatePersonalEpisodeWithLlm } from "@/lib/llm";
import {
  getCachedSecondMeStoryContext,
  getStoredSecondMeStoryContext,
  type SecondMeStoryContext
} from "@/lib/secondme-story-context";
import {
  getStyleKeyFromId,
  getStyleName,
  normalizeStoryContentLength,
  pickThreadPrimaryStyleKey,
  type StoryStyleKey
} from "@/lib/story-style";
import { getBookBySlug, type StoryBook } from "@/lib/story-data";
import {
  getAdventureActionState,
  getCompanionActionLabel,
  getCurrentAppDate,
  getEpisodeGenerationState,
  groupCompanionThreadsByBook,
  isEpisodeGenerationMode,
  isVisibleStoryTimelineSource,
  planPersonalEpisodeEnqueue,
  sanitizeCompanionThreadTitle,
  sanitizePersonalAdventureTitle,
  wasGeneratedOnAppDate,
  type EpisodeGenerationMode,
  type EpisodeGenerationState,
  type EpisodeRecordStatus,
  type GenerationJobStatus,
  type StoryTimelineSourceType,
  type VisibleStoryTimelineSourceType,
  type AdventureActionState,
  type CompanionThreadGroup
} from "@/lib/story-experience-helpers";

export type AdventureThreadView = {
  id: string;
  threadKind: "companion";
  title: string;
  sourceBookTitle: string;
  sourceBookSlug: string | null;
  sourceBookCategoryKey: StoryBook["categoryKey"] | null;
  lockedStyleName: string | null;
  episodeCount: number;
  episodeLimit: number;
  participantCount: number;
  participantLimit: number;
  ownerDisplayName: string;
  latestEpisodeTitle: string | null;
  latestEpisodeExcerpt: string | null;
  latestEpisodeContent: string | null;
  latestEpisodeNo: number;
  latestEpisodeGeneratedAt: string | null;
  latestEpisodeStatus: EpisodeRecordStatus;
  latestEpisodeJobStatus: GenerationJobStatus;
  latestEpisodeError: string | null;
  generationState: EpisodeGenerationState;
  isOwner: boolean;
  isParticipant: boolean;
  isCompleted: boolean;
  isFull: boolean;
  isJoinable: boolean;
  actionState: AdventureActionState;
  actionLabel: string;
  originPersonalThreadId: string | null;
  originEpisodeId: string | null;
};

export type AdventureEpisodeView = {
  id: string;
  episodeNo: number;
  title: string;
  excerpt: string;
  content: string;
  generatedAt: string | null;
  authorDisplayName: string;
  styleName: string | null;
};

export type AdventureThreadDetailView = AdventureThreadView & {
  episodes: AdventureEpisodeView[];
};

export type PersonalLineBookView = {
  threadId: string;
  threadKind: "personal";
  title: string;
  sourceBookTitle: string;
  sourceBookSlug: string;
  sourceBookCategoryKey: StoryBook["categoryKey"] | null;
  lockedStyleName: string | null;
  latestEpisodeId: string | null;
  latestEpisodeTitle: string | null;
  latestEpisodeExcerpt: string | null;
  latestEpisodeGeneratedAt: string | null;
  latestEpisodeStatus: EpisodeRecordStatus;
  latestEpisodeJobStatus: GenerationJobStatus;
  latestEpisodeError: string | null;
  generationState: EpisodeGenerationState;
  episodeCount: number;
  todayGenerated: boolean;
};

export type PersonalLineDetailView = PersonalLineBookView & {
  episodes: AdventureEpisodeView[];
  activeCompanionThreadId: string | null;
};

export type CompanionSquareGroupView = CompanionThreadGroup<AdventureThreadView>;

export type BedtimeMemoryView = {
  id: string;
  memoryDate: string;
  title: string;
  excerpt: string;
  content: string;
  generatedAt: string | null;
  generationLabel: string;
};

export type StoryTimelineItemView = {
  id: string;
  sourceType: VisibleStoryTimelineSourceType;
  title: string;
  excerpt: string | null;
  bookTitle: string | null;
  happenedAt: string;
};

export type AdventurePreviewView = {
  title: string;
  bookTitle: string;
  bookSlug: string | null;
  excerpt: string;
  statusLabel: string;
};

export type MyStoryStatsView = {
  ownedAdventureCount: number;
  joinedAdventureCount: number;
};

type IdRow = {
  id: string;
};

type StoryCategoryIdRow = {
  id: string;
};

type StyleRow = {
  id: string;
  key: StoryStyleKey;
};

type AdventureThreadRow = {
  id: string;
  thread_kind: "personal" | "companion";
  title: string;
  status: "active" | "completed" | "paused" | "draft";
  completed_at: string | null;
  participant_limit: number;
  episode_limit: number;
  source_book_title: string | null;
  source_book_slug: string | null;
  source_book_category_key: StoryBook["categoryKey"] | null;
  locked_style_name: string | null;
  locked_style_key: StoryStyleKey | null;
  owner_display_name: string;
  latest_episode_id: string | null;
  latest_episode_title: string | null;
  latest_episode_excerpt: string | null;
  latest_episode_content: string | null;
  latest_episode_generated_at: string | null;
  latest_episode_no: number | null;
  latest_episode_status: EpisodeRecordStatus;
  latest_episode_job_status: GenerationJobStatus;
  latest_episode_job_error: string | null;
  participant_count: number;
  episode_count: number;
  is_owner: boolean;
  is_participant: boolean;
  source_book_id: string | null;
  locked_style_id: string | null;
  origin_personal_thread_id: string | null;
  origin_episode_id: string | null;
};

type AdventureEpisodeRow = {
  id: string;
  episode_no: number;
  title: string | null;
  excerpt: string | null;
  content: string | null;
  generated_at: string | null;
  author_display_name: string;
  style_name: string | null;
};

type GenerationJobRow = {
  id: string;
  payload: Record<string, unknown>;
  attempt_count: number;
  max_attempts: number;
};

type EpisodeGenerationPayload = {
  threadId: string;
  episodeNo: number;
  bookSlug: string;
  bookTitle: string;
  styleKey: StoryStyleKey;
  mode: EpisodeGenerationMode;
  triggerUserId: string;
  sourceBookId: string;
};

type BedtimeMemoryRow = {
  id: string;
  memory_date: string;
  title: string | null;
  excerpt: string | null;
  content: string | null;
  generated_at: string | null;
  generation_status: "queued" | "running" | "succeeded" | "failed" | null;
};

type TimelineRow = {
  id: string;
  source_type: StoryTimelineSourceType;
  title: string;
  excerpt: string | null;
  book_title: string | null;
  happened_at: string;
};

type AdventureCountRow = {
  personal_count: number;
  companion_count: number;
};

type PreviewRow = {
  title: string | null;
  excerpt: string | null;
  generated_at: string | null;
  book_title: string | null;
  book_slug: string | null;
};

export class AuthRequiredError extends Error {
  constructor() {
    super("Authentication is required.");
    this.name = "AuthRequiredError";
  }
}

export class StoryExperienceMigrationError extends Error {
  constructor() {
    super("Story experience schema is not ready. Please run db/008_adventure_memory_refactor.sql and db/009_personal_companion_split.sql first.");
    this.name = "StoryExperienceMigrationError";
  }
}

export async function getStoryExperienceSchemaStatus() {
  return {
    ready: await isStoryExperienceSchemaReady()
  };
}

function toJson(value: unknown) {
  return JSON.stringify(value);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function sanitizeDisplayTitle(title: string) {
  return title
    .replace(/^(童话风|寓言风|神话史诗风|暗黑风|知乎风|伤痛文学风|轻喜剧网感风|悬疑风)里的/, "")
    .replace(/的(童话风|寓言风|神话史诗风|暗黑风|知乎风|伤痛文学风|轻喜剧网感风|悬疑风)$/, "")
    .trim();
}

function getGenerationLabel(status: "queued" | "running" | "succeeded" | "failed" | null) {
  if (status === "succeeded") {
    return "LLM 生成";
  }

  if (status === "failed") {
    return "模板兜底";
  }

  if (status === "queued" || status === "running") {
    return "生成中";
  }

  return "种子内容";
}

function buildAdventureThreadTitle(book: StoryBook, ownerDisplayName: string) {
  return `${ownerDisplayName}在《${book.title}》里重新相遇`;
}

function buildPersonalThreadTitle(book: StoryBook) {
  return `我在《${book.title}》里的冒险`;
}

function buildAdventureFallbackEpisode(params: {
  book: StoryBook;
  persona: AppUserContext["persona"];
  styleKey: StoryStyleKey;
  episodeNo: number;
  previousEpisodeTitle?: string | null;
}) {
  const previousLead = params.previousEpisodeTitle
    ? `上一回《${params.previousEpisodeTitle}》留下的余波还在，我再次回到《${params.book.title}》时，先看见故事已经悄悄偏离了原来的轨道。`
    : `第一次踏进《${params.book.title}》时，我没有急着争抢主角的位置，而是先站在命运最容易被忽略的缝隙旁边。`;
  const middle = `我带着${params.persona.animalName}式的判断和迟疑往前走，让这个故事里原本应该照旧发生的一幕，忽然多出了一种别的可能。`;
  const ending = `于是第 ${params.episodeNo} 篇冒险没有把结局说死，只把一道新的门缝留在月光里，等下一位参与者或者未来的我继续把它推开。`;

  return {
    title: `第 ${String(params.episodeNo).padStart(2, "0")} 篇 · 《${params.book.title}》里的再相遇`,
    excerpt: `我沿着${getStyleName(params.styleKey)}继续靠近《${params.book.title}》，让这段同行里的故事再一次慢慢偏离原作。`,
    content: normalizeStoryContentLength(`${previousLead}\n\n${middle}\n\n${ending}`, params.styleKey)
  };
}

function buildPersonalFallbackEpisode(params: {
  book: StoryBook;
  persona: AppUserContext["persona"];
  styleKey: StoryStyleKey;
  episodeNo: number;
  previousEpisodeTitle?: string | null;
}) {
  const previousLead = params.previousEpisodeTitle
    ? `昨天留在《${params.book.title}》里的那一点回声还没有散去，我带着《${params.previousEpisodeTitle}》留下的余韵，又慢慢回到故事里，沿着同一条路继续冒险。`
    : `第一次回到《${params.book.title}》里冒险时，我没有急着改写谁的命运，只是想看看长大后的自己，会怎样再次靠近这个故事。`;
  const middle = `我带着${params.persona.animalName}式的直觉和迟疑往前走，让那些小时候读过去的情节，在今天这一次靠近里露出了新的纹理。`;
  const ending = `于是第 ${params.episodeNo} 次冒险没有急着把答案说完，只把一个新的停顿轻轻留在夜里，等明天的我再回来续上。`;

  return {
    title: `第 ${String(params.episodeNo).padStart(2, "0")} 次冒险 · 《${params.book.title}》`,
    excerpt: `我沿着${getStyleName(params.styleKey)}回到《${params.book.title}》里继续冒险，让这本童话和现在的自己再靠近一点。`,
    content: normalizeStoryContentLength(`${previousLead}\n\n${middle}\n\n${ending}`, params.styleKey)
  };
}

function buildBedtimeMemoryFallback(params: {
  persona: AppUserContext["persona"];
  currentDate: string;
}) {
  return {
    title: `${params.currentDate} 的枕边回忆`,
    excerpt: `夜色替我把今天没来得及说完的话慢慢收拢，变成一篇只属于睡前的温柔回忆。`,
    content: normalizeStoryContentLength(
      `夜里安静下来以后，我才重新摸到今天真正留在心里的那一点触感。它不轰烈，也不急着给答案，只像一盏被轻轻调暗的灯，让我终于能看清自己白天来不及看见的情绪。\n\n我想起那些差一点就被日程和噪音盖过去的小事。它们并不伟大，却像细小的星屑一样停在身上，让我知道今天并不是徒然经过，而是实实在在地留下了痕迹。\n\n等这篇回忆写完，夜也更深了一点。我把它放在枕边，像把今天温柔地叠好，留给明天醒来之前的自己。`,
      "fairy",
      220,
      520
    )
  };
}

async function createGenerationJob(params: {
  jobType: "episode_generate" | "short_story_generate" | "ai_comment_generate";
  payload: Record<string, unknown>;
}) {
  const { rows } = await sql<IdRow>(
    `
      INSERT INTO generation_jobs (job_type, status, payload)
      VALUES ($1, 'queued', $2::jsonb)
      RETURNING id
    `,
    [params.jobType, toJson(params.payload)]
  );

  return rows[0].id;
}

async function isStoryExperienceSchemaReady() {
  try {
    await sql(
      "SELECT owner_user_id, source_book_id, locked_style_id, thread_kind, origin_personal_thread_id, origin_episode_id FROM story_threads LIMIT 1"
    );
    await sql("SELECT thread_id, user_id, role FROM story_thread_participants LIMIT 1");
    await sql("SELECT user_id, memory_date, source_secondme_context FROM bedtime_memories LIMIT 1");
    return true;
  } catch (error) {
    if (isMissingRelationError(error)) {
      return false;
    }

    throw error;
  }
}

async function requireStoryExperienceSchema() {
  const isReady = await isStoryExperienceSchemaReady();

  if (!isReady) {
    throw new StoryExperienceMigrationError();
  }
}

async function markGenerationJobRunning(jobId: string) {
  await sql(
    `
      UPDATE generation_jobs
      SET status = 'running',
          started_at = NOW(),
          updated_at = NOW()
      WHERE id = $1
    `,
    [jobId]
  );
}

async function markGenerationJobFinished(jobId: string, status: "succeeded" | "failed", lastError?: string) {
  await sql(
    `
      UPDATE generation_jobs
      SET status = $2,
          finished_at = NOW(),
          updated_at = NOW(),
          last_error = $3
      WHERE id = $1
    `,
    [jobId, status, lastError ?? null]
  );
}

async function claimQueuedEpisodeGenerationJob(threadId?: string | null) {
  const { rows } = await sql<GenerationJobRow>(
    `
      WITH next_job AS (
        SELECT id, payload, attempt_count, max_attempts
        FROM generation_jobs
        WHERE job_type = 'episode_generate'
          AND status = 'queued'
          AND run_at <= NOW()
          AND ($1::text IS NULL OR payload->>'threadId' = $1)
        ORDER BY run_at ASC, created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      )
      UPDATE generation_jobs gj
      SET status = 'running',
          started_at = NOW(),
          attempt_count = gj.attempt_count + 1,
          updated_at = NOW()
      FROM next_job
      WHERE gj.id = next_job.id
      RETURNING gj.id, gj.payload, gj.attempt_count, gj.max_attempts
    `,
    [threadId ?? null]
  );

  return rows[0] ?? null;
}

async function requeueGenerationJob(jobId: string, payload: Record<string, unknown>) {
  await sql(
    `
      UPDATE generation_jobs
      SET status = 'queued',
          payload = $2::jsonb,
          started_at = NULL,
          finished_at = NULL,
          last_error = NULL,
          run_at = NOW(),
          updated_at = NOW()
      WHERE id = $1
    `,
    [jobId, toJson(payload)]
  );
}

function parseEpisodeGenerationPayload(payload: Record<string, unknown>): EpisodeGenerationPayload | null {
  const threadId = typeof payload.threadId === "string" ? payload.threadId : null;
  const episodeNo = typeof payload.episodeNo === "number" ? payload.episodeNo : null;
  const bookSlug = typeof payload.bookSlug === "string" ? payload.bookSlug : null;
  const bookTitle = typeof payload.bookTitle === "string" ? payload.bookTitle : null;
  const styleKey = typeof payload.styleKey === "string" ? payload.styleKey : null;
  const mode = typeof payload.mode === "string" ? payload.mode : null;
  const triggerUserId = typeof payload.triggerUserId === "string" ? payload.triggerUserId : null;
  const sourceBookId = typeof payload.sourceBookId === "string" ? payload.sourceBookId : null;

  if (
    !threadId ||
    typeof episodeNo !== "number" ||
    !bookSlug ||
    !bookTitle ||
    !styleKey ||
    !isEpisodeGenerationMode(mode) ||
    !triggerUserId ||
    !sourceBookId
  ) {
    return null;
  }

  return {
    threadId,
    episodeNo,
    bookSlug,
    bookTitle,
    styleKey: styleKey as StoryStyleKey,
    mode,
    triggerUserId,
    sourceBookId
  };
}

function buildAdventureGenerationPlaceholder(episodeNo: number) {
  return {
    title: `第 ${String(episodeNo).padStart(2, "0")} 章正在生成`,
    excerpt: "新的冒险已经被触发，故事正在把这一章慢慢写出来。"
  };
}

function buildAdventureGenerationFailure(episodeNo: number) {
  return {
    title: `第 ${String(episodeNo).padStart(2, "0")} 章暂时卡住了`,
    excerpt: "这一章冒险暂时生成失败了，你可以再试一次，让故事从这里继续往前走。"
  };
}

async function getStyleIds() {
  const { rows } = await sql<StyleRow>("SELECT id, key FROM story_styles");
  return new Map(rows.map((row) => [row.key, row.id]));
}

async function ensurePersistedStoryBookId(book: StoryBook) {
  if (isUuid(book.id)) {
    return book.id;
  }

  const { rows: existingRows } = await sql<IdRow>(
    `
      SELECT id
      FROM story_books
      WHERE slug = $1
        AND is_active = TRUE
      LIMIT 1
    `,
    [book.slug]
  );

  if (existingRows[0]) {
    return existingRows[0].id;
  }

  const { rows: categoryRows } = await sql<StoryCategoryIdRow>(
    `
      SELECT id
      FROM story_categories
      WHERE key = $1
      LIMIT 1
    `,
    [book.categoryKey]
  );

  if (!categoryRows[0]) {
    throw new Error(`Story category "${book.categoryKey}" is missing.`);
  }

  const { rows: insertRows } = await sql<IdRow>(
    `
      INSERT INTO story_books (
        category_id,
        title,
        slug,
        cover_image,
        summary,
        key_scenes,
        original_synopsis,
        public_domain,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, TRUE, TRUE)
      ON CONFLICT (slug) DO UPDATE
      SET title = EXCLUDED.title,
          summary = EXCLUDED.summary,
          original_synopsis = COALESCE(story_books.original_synopsis, EXCLUDED.original_synopsis),
          key_scenes = CASE
            WHEN jsonb_array_length(story_books.key_scenes) = 0 THEN EXCLUDED.key_scenes
            ELSE story_books.key_scenes
          END,
          updated_at = NOW()
      RETURNING id
    `,
    [
      categoryRows[0].id,
      book.title,
      book.slug,
      book.coverImage,
      book.summary,
      toJson(book.keyScenes),
      book.originalSynopsis
    ]
  );

  return insertRows[0].id;
}

async function addTimelineItem(params: {
  userId: string;
  sourceType: "adventure_episode" | "personal_episode" | "companion_episode" | "bedtime_memory";
  sourceId: string;
  title: string;
  excerpt: string;
  bookId?: string | null;
}) {
  await sql(
    `
      INSERT INTO timeline_items (
        user_id,
        source_type,
        source_id,
        title,
        excerpt,
        book_id,
        happened_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (user_id, source_type, source_id) DO NOTHING
    `,
    [params.userId, params.sourceType, params.sourceId, params.title, params.excerpt, params.bookId ?? null]
  );
}

function mapAdventureThreadRow(row: AdventureThreadRow): AdventureThreadView {
  const participantCount = row.participant_count ?? 0;
  const episodeCount = row.episode_count ?? 0;
  const participantLimit = row.participant_limit ?? 5;
  const episodeLimit = row.episode_limit ?? 10;
  const generationState = getEpisodeGenerationState(row.latest_episode_status, row.latest_episode_job_status);
  const isCompleted = row.status === "completed" || Boolean(row.completed_at) || episodeCount >= episodeLimit;
  const isFull = participantCount >= participantLimit;
  const actionState = getAdventureActionState({
    isOwner: row.is_owner,
    isParticipant: row.is_participant,
    isCompleted,
    isFull
  });
  const isJoinable = !row.is_owner && !row.is_participant && !isCompleted && !isFull;

  return {
    id: row.id,
    threadKind: "companion",
    title: sanitizeCompanionThreadTitle(row.title, row.source_book_title),
    sourceBookTitle: row.source_book_title ?? "未知故事",
    sourceBookSlug: row.source_book_slug,
    sourceBookCategoryKey: row.source_book_category_key,
    lockedStyleName: row.locked_style_name,
    episodeCount,
    episodeLimit,
    participantCount,
    participantLimit,
    ownerDisplayName: row.owner_display_name,
    latestEpisodeTitle: row.latest_episode_title ? sanitizeDisplayTitle(row.latest_episode_title) : null,
    latestEpisodeExcerpt: row.latest_episode_excerpt,
    latestEpisodeContent: row.latest_episode_content,
    latestEpisodeNo: row.latest_episode_no ?? 0,
    latestEpisodeGeneratedAt: row.latest_episode_generated_at,
    latestEpisodeStatus: row.latest_episode_status,
    latestEpisodeJobStatus: row.latest_episode_job_status,
    latestEpisodeError: row.latest_episode_job_error,
    generationState,
    isOwner: row.is_owner,
    isParticipant: row.is_participant,
    isCompleted,
    isFull,
    isJoinable,
    actionState,
    actionLabel: getCompanionActionLabel(actionState),
    originPersonalThreadId: row.origin_personal_thread_id,
    originEpisodeId: row.origin_episode_id
  };
}

function mapPersonalLineBookRow(row: AdventureThreadRow, appDate = getCurrentAppDate()): PersonalLineBookView {
  const generationState = getEpisodeGenerationState(row.latest_episode_status, row.latest_episode_job_status);

  return {
    threadId: row.id,
    threadKind: "personal",
    title: sanitizePersonalAdventureTitle(row.title, row.source_book_title),
    sourceBookTitle: row.source_book_title ?? "未知故事",
    sourceBookSlug: row.source_book_slug ?? "",
    sourceBookCategoryKey: row.source_book_category_key,
    lockedStyleName: row.locked_style_name,
    latestEpisodeId: row.latest_episode_id,
    latestEpisodeTitle: row.latest_episode_title
      ? sanitizePersonalAdventureTitle(sanitizeDisplayTitle(row.latest_episode_title), row.source_book_title)
      : null,
    latestEpisodeExcerpt: row.latest_episode_excerpt,
    latestEpisodeGeneratedAt: row.latest_episode_generated_at,
    latestEpisodeStatus: row.latest_episode_status,
    latestEpisodeJobStatus: row.latest_episode_job_status,
    latestEpisodeError: row.latest_episode_job_error,
    generationState,
    episodeCount: row.episode_count ?? 0,
    todayGenerated: wasGeneratedOnAppDate(row.latest_episode_generated_at, appDate)
  };
}

async function getAdventureThreadRow(threadId: string, currentUserId: string | null) {
  const { rows } = await sql<AdventureThreadRow>(
    `
      SELECT
        t.id,
        t.thread_kind,
        t.title,
        t.status,
        t.completed_at,
        t.participant_limit,
        t.episode_limit,
        sb.title AS source_book_title,
        sb.slug AS source_book_slug,
        c.key AS source_book_category_key,
        ls.name AS locked_style_name,
        ls.key AS locked_style_key,
        owner.display_name AS owner_display_name,
        t.latest_episode_id,
        e.title AS latest_episode_title,
        e.excerpt AS latest_episode_excerpt,
        e.content AS latest_episode_content,
        e.generated_at AS latest_episode_generated_at,
        e.episode_no AS latest_episode_no,
        e.status AS latest_episode_status,
        gj.status AS latest_episode_job_status,
        gj.last_error AS latest_episode_job_error,
        participants.participant_count,
        episodes.episode_count,
        EXISTS (
          SELECT 1
          FROM story_thread_participants sp
          WHERE sp.thread_id = t.id
            AND sp.user_id = $2
            AND sp.role = 'owner'
        ) AS is_owner,
        EXISTS (
          SELECT 1
          FROM story_thread_participants sp
          WHERE sp.thread_id = t.id
            AND sp.user_id = $2
        ) AS is_participant,
        t.source_book_id,
        t.locked_style_id,
        t.origin_personal_thread_id,
        t.origin_episode_id
      FROM story_threads t
      JOIN users owner ON owner.id = t.owner_user_id
      LEFT JOIN story_books sb ON sb.id = t.source_book_id
      LEFT JOIN story_categories c ON c.id = sb.category_id
      LEFT JOIN story_styles ls ON ls.id = t.locked_style_id
      LEFT JOIN story_episodes e ON e.id = t.latest_episode_id
      LEFT JOIN generation_jobs gj ON gj.id = e.job_id
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS participant_count
        FROM story_thread_participants sp
        WHERE sp.thread_id = t.id
      ) AS participants ON TRUE
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS episode_count
        FROM story_episodes se
        WHERE se.thread_id = t.id
          AND se.status = 'published'
      ) AS episodes ON TRUE
      WHERE t.id = $1
        AND t.thread_kind = 'companion'
        AND t.visibility = 'public'
      LIMIT 1
    `,
    [threadId, currentUserId]
  );

  return rows[0] ?? null;
}

async function getPersonalThreadRowBySlug(slug: string, currentUserId: string | null) {
  if (!currentUserId) {
    return null;
  }

  const { rows } = await sql<AdventureThreadRow>(
    `
      SELECT
        t.id,
        t.thread_kind,
        t.title,
        t.status,
        t.completed_at,
        t.participant_limit,
        t.episode_limit,
        sb.title AS source_book_title,
        sb.slug AS source_book_slug,
        c.key AS source_book_category_key,
        ls.name AS locked_style_name,
        ls.key AS locked_style_key,
        owner.display_name AS owner_display_name,
        t.latest_episode_id,
        e.title AS latest_episode_title,
        e.excerpt AS latest_episode_excerpt,
        e.content AS latest_episode_content,
        e.generated_at AS latest_episode_generated_at,
        e.episode_no AS latest_episode_no,
        e.status AS latest_episode_status,
        gj.status AS latest_episode_job_status,
        gj.last_error AS latest_episode_job_error,
        participants.participant_count,
        episodes.episode_count,
        TRUE AS is_owner,
        TRUE AS is_participant,
        t.source_book_id,
        t.locked_style_id,
        t.origin_personal_thread_id,
        t.origin_episode_id
      FROM story_threads t
      JOIN users owner ON owner.id = t.owner_user_id
      JOIN story_books sb ON sb.id = t.source_book_id
      LEFT JOIN story_categories c ON c.id = sb.category_id
      LEFT JOIN story_styles ls ON ls.id = t.locked_style_id
      LEFT JOIN story_episodes e ON e.id = t.latest_episode_id
      LEFT JOIN generation_jobs gj ON gj.id = e.job_id
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS participant_count
        FROM story_thread_participants sp
        WHERE sp.thread_id = t.id
      ) AS participants ON TRUE
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS episode_count
        FROM story_episodes se
        WHERE se.thread_id = t.id
          AND se.status = 'published'
      ) AS episodes ON TRUE
      WHERE t.owner_user_id = $1
        AND sb.slug = $2
        AND t.thread_kind = 'personal'
        AND t.status = 'active'
        AND t.completed_at IS NULL
      ORDER BY COALESCE(e.generated_at, e.created_at, t.updated_at, t.created_at) DESC
      LIMIT 1
    `,
    [currentUserId, slug]
  );

  return rows[0] ?? null;
}

async function getPersonalThreadRowById(threadId: string, currentUserId: string | null) {
  if (!currentUserId) {
    return null;
  }

  const { rows } = await sql<AdventureThreadRow>(
    `
      SELECT
        t.id,
        t.thread_kind,
        t.title,
        t.status,
        t.completed_at,
        t.participant_limit,
        t.episode_limit,
        sb.title AS source_book_title,
        sb.slug AS source_book_slug,
        c.key AS source_book_category_key,
        ls.name AS locked_style_name,
        ls.key AS locked_style_key,
        owner.display_name AS owner_display_name,
        t.latest_episode_id,
        e.title AS latest_episode_title,
        e.excerpt AS latest_episode_excerpt,
        e.content AS latest_episode_content,
        e.generated_at AS latest_episode_generated_at,
        e.episode_no AS latest_episode_no,
        e.status AS latest_episode_status,
        gj.status AS latest_episode_job_status,
        gj.last_error AS latest_episode_job_error,
        participants.participant_count,
        episodes.episode_count,
        TRUE AS is_owner,
        TRUE AS is_participant,
        t.source_book_id,
        t.locked_style_id,
        t.origin_personal_thread_id,
        t.origin_episode_id
      FROM story_threads t
      JOIN users owner ON owner.id = t.owner_user_id
      JOIN story_books sb ON sb.id = t.source_book_id
      LEFT JOIN story_categories c ON c.id = sb.category_id
      LEFT JOIN story_styles ls ON ls.id = t.locked_style_id
      LEFT JOIN story_episodes e ON e.id = t.latest_episode_id
      LEFT JOIN generation_jobs gj ON gj.id = e.job_id
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS participant_count
        FROM story_thread_participants sp
        WHERE sp.thread_id = t.id
      ) AS participants ON TRUE
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS episode_count
        FROM story_episodes se
        WHERE se.thread_id = t.id
          AND se.status = 'published'
      ) AS episodes ON TRUE
      WHERE t.id = $1
        AND t.owner_user_id = $2
        AND t.thread_kind = 'personal'
      LIMIT 1
    `,
    [threadId, currentUserId]
  );

  return rows[0] ?? null;
}

async function getActiveCompanionThreadIdByOriginEpisode(originEpisodeId: string) {
  const { rows } = await sql<IdRow>(
    `
      SELECT id
      FROM story_threads
      WHERE origin_episode_id = $1
        AND thread_kind = 'companion'
        AND status = 'active'
        AND completed_at IS NULL
      LIMIT 1
    `,
    [originEpisodeId]
  );

  return rows[0]?.id ?? null;
}

async function getThreadEpisodes(threadId: string) {
  const { rows } = await sql<AdventureEpisodeRow>(
    `
      SELECT
        e.id,
        e.episode_no,
        e.title,
        e.excerpt,
        e.content,
        e.generated_at,
        u.display_name AS author_display_name,
        ss.name AS style_name
      FROM story_episodes e
      JOIN users u ON u.id = e.user_id
      LEFT JOIN story_styles ss ON ss.id = e.style_id
      WHERE e.thread_id = $1
        AND e.status = 'published'
      ORDER BY e.episode_no ASC
    `,
    [threadId]
  );

  return rows.map(
    (row): AdventureEpisodeView => ({
      id: row.id,
      episodeNo: row.episode_no,
      title: sanitizeDisplayTitle(row.title ?? "未命名冒险"),
      excerpt: row.excerpt ?? "",
      content: row.content ?? "",
      generatedAt: row.generated_at,
      authorDisplayName: row.author_display_name,
      styleName: row.style_name
    })
  );
}

async function requireAuthenticatedStoryContext() {
  const context = await getAuthenticatedAppContext();

  if (!context) {
    throw new AuthRequiredError();
  }

  return context;
}

async function requireSecondMeStoryContext() {
  const secondMeContext = await getCachedSecondMeStoryContext();

  if (!secondMeContext) {
    throw new AuthRequiredError();
  }

  return secondMeContext;
}

async function getStoryContextForUserId(userId: string) {
  const context = await getViewerContextByUserId(userId);

  if (!context) {
    throw new Error("Queued adventure trigger user is missing its viewer context.");
  }

  const secondMeContext = await getStoredSecondMeStoryContext(context.secondMeUserId);

  if (!secondMeContext) {
    throw new Error("Queued adventure trigger user is missing cached SecondMe context.");
  }

  return {
    context,
    secondMeContext
  };
}

async function getLatestAdventureSeed(threadId: string) {
  const { rows } = await sql<{
    title: string | null;
    excerpt: string | null;
  }>(
    `
      SELECT title, excerpt
      FROM story_episodes
      WHERE thread_id = $1
        AND status = 'published'
      ORDER BY episode_no DESC
      LIMIT 1
    `,
    [threadId]
  );

  return rows[0] ?? null;
}

async function getAdventureSeedByEpisodeId(episodeId: string | null) {
  if (!episodeId) {
    return null;
  }

  const { rows } = await sql<{
    title: string | null;
    excerpt: string | null;
  }>(
    `
      SELECT title, excerpt
      FROM story_episodes
      WHERE id = $1
        AND status = 'published'
      LIMIT 1
    `,
    [episodeId]
  );

  return rows[0] ?? null;
}

async function enqueueAdventureEpisodeGeneration(params: {
  threadId: string;
  userId: string;
  bookId: string;
  book: StoryBook;
  styleId: string | null;
  styleKey: StoryStyleKey;
  episodeNo: number;
  mode: EpisodeGenerationMode;
  existingEpisodeId?: string | null;
  existingJobId?: string | null;
}) {
  const placeholder = buildAdventureGenerationPlaceholder(params.episodeNo);
  const payload = {
    threadId: params.threadId,
    episodeNo: params.episodeNo,
    bookSlug: params.book.slug,
    bookTitle: params.book.title,
    styleKey: params.styleKey,
    mode: params.mode,
    triggerUserId: params.userId,
    sourceBookId: params.bookId
  } satisfies EpisodeGenerationPayload;
  const jobId =
    params.existingJobId ??
    (await createGenerationJob({
      jobType: "episode_generate",
      payload
    }));

  if (params.existingJobId) {
    await requeueGenerationJob(jobId, payload);
  }

  const episodeId = params.existingEpisodeId
    ? params.existingEpisodeId
    : await insertQueuedAdventureEpisode({
        threadId: params.threadId,
        userId: params.userId,
        bookId: params.bookId,
        jobId,
        episodeNo: params.episodeNo,
        styleId: params.styleId,
        title: placeholder.title,
        excerpt: placeholder.excerpt
      });

  if (params.existingEpisodeId) {
    await requeueAdventureEpisode({
      episodeId,
      userId: params.userId,
      jobId,
      styleId: params.styleId,
      title: placeholder.title,
      excerpt: placeholder.excerpt
    });
  }

  await updateThreadForPendingEpisode({
    threadId: params.threadId,
    episodeId,
    bookId: params.bookId
  });

  return {
    jobId,
    episodeId
  };
}

export async function processQueuedAdventureGenerationJobs(options?: {
  threadId?: string;
  limit?: number;
}) {
  const limit = Math.max(1, Math.min(options?.limit ?? 1, 5));
  const processedThreadIds: string[] = [];
  let processed = 0;

  while (processed < limit) {
    const claimed = await claimQueuedEpisodeGenerationJob(options?.threadId ?? null);

    if (!claimed) {
      break;
    }

    const payload = parseEpisodeGenerationPayload(claimed.payload);

    if (!payload) {
      await markGenerationJobFinished(claimed.id, "failed", "Invalid episode generation payload.");
      processed += 1;
      continue;
    }

    const { rows: episodeRows } = await sql<{
      id: string;
      title: string | null;
      excerpt: string | null;
    }>(
      `
        SELECT id, title, excerpt
        FROM story_episodes
        WHERE job_id = $1
        LIMIT 1
      `,
      [claimed.id]
    );

    const episodeRow = episodeRows[0];

    if (!episodeRow) {
      await markGenerationJobFinished(claimed.id, "failed", "Queued episode placeholder not found.");
      processed += 1;
      continue;
    }

    try {
      await markAdventureEpisodeGenerating(episodeRow.id);

      const [book, triggerContext] = await Promise.all([
        getBookBySlug(payload.bookSlug),
        getStoryContextForUserId(payload.triggerUserId)
      ]);

      if (!book) {
        throw new Error("Episode source book not found.");
      }

      if (payload.mode === "personal_start" || payload.mode === "personal_continue") {
        const threadRow = await getPersonalThreadRowById(payload.threadId, payload.triggerUserId);

        if (!threadRow) {
          throw new Error("Personal thread not found.");
        }

        const previousEpisode = await getLatestAdventureSeed(payload.threadId);
        const episode = await generatePersonalEpisodeWithLlm({
          book,
          persona: triggerContext.context.persona,
          secondMeContext: triggerContext.secondMeContext,
          styleKey: payload.styleKey,
          episodeNo: payload.episodeNo,
          threadTitle: threadRow.title,
          previousEpisodeTitle: previousEpisode?.title ?? null,
          previousEpisodeExcerpt: previousEpisode?.excerpt ?? null,
          authorDisplayName: triggerContext.context.displayName
        });

        await publishQueuedAdventureEpisode({
          episodeId: episodeRow.id,
          userId: triggerContext.context.userId,
          jobId: claimed.id,
          styleId: threadRow.locked_style_id,
          title: episode.title,
          excerpt: episode.excerpt,
          content: episode.content
        });

        await updateAdventureThreadAfterEpisode({
          threadId: payload.threadId,
          episodeId: episodeRow.id,
          bookId: payload.sourceBookId,
          episodeNo: payload.episodeNo,
          episodeLimit: null
        });

        await addTimelineItem({
          userId: triggerContext.context.userId,
          sourceType: "personal_episode",
          sourceId: episodeRow.id,
          title: episode.title,
          excerpt: episode.excerpt,
          bookId: payload.sourceBookId
        });
      } else {
        const threadRow = await getAdventureThreadRow(payload.threadId, payload.triggerUserId);

        if (!threadRow) {
          throw new Error("Adventure thread not found.");
        }

        const previousEpisode =
          payload.mode === "companion_publish"
            ? await getAdventureSeedByEpisodeId(threadRow.origin_episode_id)
            : await getLatestAdventureSeed(payload.threadId);
        const participantCount = threadRow.participant_count ?? 1;
        const episode = await generateAdventureEpisodeWithLlm({
          book,
          persona: triggerContext.context.persona,
          secondMeContext: triggerContext.secondMeContext,
          styleKey: payload.styleKey,
          episodeNo: payload.episodeNo,
          threadTitle: threadRow.title,
          previousEpisodeTitle: previousEpisode?.title ?? null,
          previousEpisodeExcerpt: previousEpisode?.excerpt ?? null,
          authorDisplayName: triggerContext.context.displayName,
          participantCount
        });

        await publishQueuedAdventureEpisode({
          episodeId: episodeRow.id,
          userId: triggerContext.context.userId,
          jobId: claimed.id,
          styleId: threadRow.locked_style_id,
          title: episode.title,
          excerpt: episode.excerpt,
          content: episode.content
        });

        await updateAdventureThreadAfterEpisode({
          threadId: payload.threadId,
          episodeId: episodeRow.id,
          bookId: payload.sourceBookId,
          episodeNo: payload.episodeNo,
          episodeLimit: threadRow.episode_limit
        });

        await addTimelineItem({
          userId: triggerContext.context.userId,
          sourceType: "companion_episode",
          sourceId: episodeRow.id,
          title: episode.title,
          excerpt: episode.excerpt,
          bookId: payload.sourceBookId
        });
      }

      await markGenerationJobFinished(claimed.id, "succeeded");
      processedThreadIds.push(payload.threadId);
    } catch (error) {
      const generationError = error instanceof Error ? error.message : "Unknown adventure generation error";
      const failedPlaceholder = buildAdventureGenerationFailure(payload.episodeNo);

      await failAdventureEpisode({
        episodeId: episodeRow.id,
        title: failedPlaceholder.title,
        excerpt: failedPlaceholder.excerpt
      });
      await markGenerationJobFinished(claimed.id, "failed", generationError);
      processedThreadIds.push(payload.threadId);
    }

    processed += 1;
  }

  return {
    processed,
    threadIds: processedThreadIds
  };
}

async function ensureThreadOwnerParticipant(threadId: string, userId: string) {
  await sql(
    `
      INSERT INTO story_thread_participants (thread_id, user_id, role)
      VALUES ($1, $2, 'owner')
      ON CONFLICT (thread_id, user_id) DO NOTHING
    `,
    [threadId, userId]
  );
}

async function ensurePersonalThreadEpisode(params: {
  thread: AdventureThreadRow;
  context: AppUserContext;
}) {
  const bookSlug = params.thread.source_book_slug;

  if (!params.thread.source_book_id || !bookSlug) {
    throw new Error("Personal thread is missing its source book.");
  }

  const book = await getBookBySlug(bookSlug);

  if (!book) {
    throw new Error("Personal source book not found.");
  }

  const styleIds = await getStyleIds();
  const lockedStyleKey =
    params.thread.locked_style_key ??
    getStyleKeyFromId(styleIds, params.thread.locked_style_id) ??
    pickThreadPrimaryStyleKey({
      userId: params.context.userId,
      persona: params.context.persona,
      seedBook: book
    });
  const styleId = styleIds.get(lockedStyleKey) ?? params.thread.locked_style_id;

  if (!params.thread.locked_style_id && styleId) {
    await sql(
      `
        UPDATE story_threads
        SET locked_style_id = $2,
            primary_style_id = COALESCE(primary_style_id, $2),
            updated_at = NOW()
        WHERE id = $1
      `,
      [params.thread.id, styleId]
    );
  }

  const queuePlan = planPersonalEpisodeEnqueue({
    latestEpisodeId: params.thread.latest_episode_id,
    latestEpisodeNo: params.thread.latest_episode_no,
    latestEpisodeGeneratedAt: params.thread.latest_episode_generated_at,
    latestEpisodeStatus: params.thread.latest_episode_status,
    latestEpisodeJobStatus: params.thread.latest_episode_job_status,
    episodeCount: params.thread.episode_count,
    appDate: getCurrentAppDate()
  });

  if (queuePlan.action === "use_existing") {
    return {
      threadId: params.thread.id,
      episodeId: queuePlan.episodeId,
      created: false
    };
  }

  const { episodeId } = await enqueueAdventureEpisodeGeneration({
    threadId: params.thread.id,
    userId: params.context.userId,
    bookId: params.thread.source_book_id,
    book,
    styleId,
    styleKey: lockedStyleKey,
    episodeNo: queuePlan.episodeNo,
    mode: queuePlan.mode,
    existingEpisodeId: queuePlan.reuseLatestEpisodeId
  });

  return {
    threadId: params.thread.id,
    episodeId,
    created: true
  };
}

async function insertAdventureEpisode(params: {
  threadId: string;
  userId: string;
  bookId: string;
  jobId?: string | null;
  episodeNo: number;
  styleId: string | null;
  title: string;
  excerpt: string;
  content: string;
  generatedAt?: string | null;
}) {
  const { rows } = await sql<IdRow>(
    `
      INSERT INTO story_episodes (
        thread_id,
        user_id,
        book_id,
        job_id,
        episode_no,
        style_id,
        title,
        excerpt,
        content,
        generated_at,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10::timestamptz, NOW()), 'published')
      RETURNING id
    `,
    [
      params.threadId,
      params.userId,
      params.bookId,
      params.jobId ?? null,
      params.episodeNo,
      params.styleId,
      params.title,
      params.excerpt,
      params.content,
      params.generatedAt ?? null
    ]
  );

  return rows[0].id;
}

async function clonePublishedEpisodeIntoThread(params: {
  threadId: string;
  originEpisodeId: string;
  sourceBookId: string;
  fallbackStyleId: string | null;
  episodeNo: number;
}) {
  const { rows } = await sql<{
    id: string;
    generated_at: string | null;
  }>(
    `
      INSERT INTO story_episodes (
        thread_id,
        user_id,
        book_id,
        job_id,
        episode_no,
        style_id,
        title,
        excerpt,
        content,
        bridge_from_previous,
        generated_at,
        status
      )
      SELECT
        $1,
        e.user_id,
        COALESCE(e.book_id, $2),
        NULL,
        $3,
        COALESCE(e.style_id, $4),
        e.title,
        e.excerpt,
        e.content,
        e.bridge_from_previous,
        COALESCE(e.generated_at, NOW()),
        'published'
      FROM story_episodes e
      WHERE e.id = $5
        AND e.status = 'published'
      RETURNING id, generated_at
    `,
    [params.threadId, params.sourceBookId, params.episodeNo, params.fallbackStyleId, params.originEpisodeId]
  );

  const row = rows[0];

  if (!row) {
    throw new Error("Published origin episode could not be copied into companion thread.");
  }

  return {
    episodeId: row.id,
    generatedAt: row.generated_at
  };
}

async function insertQueuedAdventureEpisode(params: {
  threadId: string;
  userId: string;
  bookId: string;
  jobId: string;
  episodeNo: number;
  styleId: string | null;
  title: string;
  excerpt: string;
}) {
  const { rows } = await sql<IdRow>(
    `
      INSERT INTO story_episodes (
        thread_id,
        user_id,
        book_id,
        job_id,
        episode_no,
        style_id,
        title,
        excerpt,
        content,
        generated_at,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL, NULL, 'queued')
      RETURNING id
    `,
    [params.threadId, params.userId, params.bookId, params.jobId, params.episodeNo, params.styleId, params.title, params.excerpt]
  );

  return rows[0].id;
}

async function requeueAdventureEpisode(params: {
  episodeId: string;
  userId: string;
  jobId: string;
  styleId: string | null;
  title: string;
  excerpt: string;
}) {
  await sql(
    `
      UPDATE story_episodes
      SET user_id = $2,
          job_id = $3,
          style_id = $4,
          title = $5,
          excerpt = $6,
          content = NULL,
          generated_at = NULL,
          status = 'queued',
          updated_at = NOW()
      WHERE id = $1
    `,
    [params.episodeId, params.userId, params.jobId, params.styleId, params.title, params.excerpt]
  );
}

async function markAdventureEpisodeGenerating(episodeId: string) {
  await sql(
    `
      UPDATE story_episodes
      SET status = 'generating',
          updated_at = NOW()
      WHERE id = $1
    `,
    [episodeId]
  );
}

async function publishQueuedAdventureEpisode(params: {
  episodeId: string;
  userId: string;
  jobId: string;
  styleId: string | null;
  title: string;
  excerpt: string;
  content: string;
}) {
  await sql(
    `
      UPDATE story_episodes
      SET user_id = $2,
          job_id = $3,
          style_id = $4,
          title = $5,
          excerpt = $6,
          content = $7,
          generated_at = NOW(),
          status = 'published',
          updated_at = NOW()
      WHERE id = $1
    `,
    [params.episodeId, params.userId, params.jobId, params.styleId, params.title, params.excerpt, params.content]
  );
}

async function failAdventureEpisode(params: {
  episodeId: string;
  title: string;
  excerpt: string;
}) {
  await sql(
    `
      UPDATE story_episodes
      SET title = $2,
          excerpt = $3,
          content = NULL,
          generated_at = NULL,
          status = 'failed',
          updated_at = NOW()
      WHERE id = $1
    `,
    [params.episodeId, params.title, params.excerpt]
  );
}

async function updateThreadForPendingEpisode(params: {
  threadId: string;
  episodeId: string;
  bookId: string;
}) {
  await sql(
    `
      UPDATE story_threads
      SET latest_episode_id = $2,
          current_book_id = $3,
          status = 'active',
          completed_at = NULL,
          updated_at = NOW()
      WHERE id = $1
    `,
    [params.threadId, params.episodeId, params.bookId]
  );
}

async function updateAdventureThreadAfterEpisode(params: {
  threadId: string;
  episodeId: string;
  bookId: string;
  episodeNo: number;
  episodeLimit?: number | null;
}) {
  const isCompleted = typeof params.episodeLimit === "number" && params.episodeNo >= params.episodeLimit;

  await sql(
    `
      UPDATE story_threads
      SET latest_episode_id = $2,
          current_book_id = $3,
          last_generated_at = NOW(),
          status = $4,
          completed_at = CASE WHEN $5::boolean THEN NOW() ELSE completed_at END,
          updated_at = NOW()
      WHERE id = $1
    `,
    [params.threadId, params.episodeId, params.bookId, isCompleted ? "completed" : "active", isCompleted]
  );
}

export const getAuthenticatedAppContext = cache(async () => {
  return getCurrentViewerContext();
});

export async function getLatestPersonalLinePreview() {
  const context = await getAuthenticatedAppContext();

  if (!context) {
    return null;
  }

  if (!(await isStoryExperienceSchemaReady())) {
    return null;
  }

  const { rows } = await sql<PreviewRow>(
    `
      SELECT
        e.title,
        e.excerpt,
        e.generated_at,
        b.title AS book_title,
        b.slug AS book_slug
      FROM story_episodes e
      JOIN story_threads t ON t.id = e.thread_id
      JOIN story_thread_participants p ON p.thread_id = t.id
      LEFT JOIN story_books b ON b.id = e.book_id
      WHERE p.user_id = $1
        AND t.thread_kind = 'personal'
        AND e.status = 'published'
      ORDER BY e.generated_at DESC NULLS LAST, e.created_at DESC
      LIMIT 1
    `,
    [context.userId]
  );

  const row = rows[0];

  if (!row) {
    return null;
  }

  return {
    title: sanitizePersonalAdventureTitle(sanitizeDisplayTitle(row.title ?? "新的回去正在展开"), row.book_title),
    bookTitle: row.book_title ?? "未知故事",
    bookSlug: row.book_slug,
    excerpt: row.excerpt ?? "",
    statusLabel: "正在冒险"
  } satisfies AdventurePreviewView;
}

export async function getLatestAdventurePreview() {
  return getLatestPersonalLinePreview();
}

export async function getPersonalLineBooks() {
  const currentContext = await getAuthenticatedAppContext();

  if (!currentContext) {
    return [];
  }

  if (!(await isStoryExperienceSchemaReady())) {
    return [];
  }

  const { rows } = await sql<AdventureThreadRow>(
    `
      SELECT
        t.id,
        t.thread_kind,
        t.title,
        t.status,
        t.completed_at,
        t.participant_limit,
        t.episode_limit,
        sb.title AS source_book_title,
        sb.slug AS source_book_slug,
        c.key AS source_book_category_key,
        ls.name AS locked_style_name,
        ls.key AS locked_style_key,
        owner.display_name AS owner_display_name,
        t.latest_episode_id,
        e.title AS latest_episode_title,
        e.excerpt AS latest_episode_excerpt,
        e.content AS latest_episode_content,
        e.generated_at AS latest_episode_generated_at,
        e.episode_no AS latest_episode_no,
        e.status AS latest_episode_status,
        gj.status AS latest_episode_job_status,
        gj.last_error AS latest_episode_job_error,
        participants.participant_count,
        episodes.episode_count,
        TRUE AS is_owner,
        TRUE AS is_participant,
        t.source_book_id,
        t.locked_style_id,
        t.origin_personal_thread_id,
        t.origin_episode_id
      FROM story_threads t
      JOIN users owner ON owner.id = t.owner_user_id
      JOIN story_books sb ON sb.id = t.source_book_id
      LEFT JOIN story_categories c ON c.id = sb.category_id
      LEFT JOIN story_styles ls ON ls.id = t.locked_style_id
      LEFT JOIN story_episodes e ON e.id = t.latest_episode_id
      LEFT JOIN generation_jobs gj ON gj.id = e.job_id
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS participant_count
        FROM story_thread_participants sp
        WHERE sp.thread_id = t.id
      ) AS participants ON TRUE
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS episode_count
        FROM story_episodes se
        WHERE se.thread_id = t.id
          AND se.status = 'published'
      ) AS episodes ON TRUE
      WHERE t.owner_user_id = $1
        AND t.thread_kind = 'personal'
        AND t.status = 'active'
        AND t.completed_at IS NULL
      ORDER BY COALESCE(e.generated_at, e.created_at, t.updated_at, t.created_at) DESC
    `,
    [currentContext.userId]
  );

  return rows.map((row) => mapPersonalLineBookRow(row));
}

export async function getAdventureThreads() {
  const currentContext = await getAuthenticatedAppContext();

  if (!(await isStoryExperienceSchemaReady())) {
    return [];
  }

  const { rows } = await sql<AdventureThreadRow>(
    `
      SELECT
        t.id,
        t.thread_kind,
        t.title,
        t.status,
        t.completed_at,
        t.participant_limit,
        t.episode_limit,
        sb.title AS source_book_title,
        sb.slug AS source_book_slug,
        c.key AS source_book_category_key,
        ls.name AS locked_style_name,
        ls.key AS locked_style_key,
        owner.display_name AS owner_display_name,
        t.latest_episode_id,
        e.title AS latest_episode_title,
        e.excerpt AS latest_episode_excerpt,
        e.content AS latest_episode_content,
        e.generated_at AS latest_episode_generated_at,
        e.episode_no AS latest_episode_no,
        e.status AS latest_episode_status,
        gj.status AS latest_episode_job_status,
        gj.last_error AS latest_episode_job_error,
        participants.participant_count,
        episodes.episode_count,
        EXISTS (
          SELECT 1
          FROM story_thread_participants sp
          WHERE sp.thread_id = t.id
            AND sp.user_id = $1
            AND sp.role = 'owner'
        ) AS is_owner,
        EXISTS (
          SELECT 1
          FROM story_thread_participants sp
          WHERE sp.thread_id = t.id
            AND sp.user_id = $1
        ) AS is_participant,
        t.source_book_id,
        t.locked_style_id,
        t.origin_personal_thread_id,
        t.origin_episode_id
      FROM story_threads t
      JOIN users owner ON owner.id = t.owner_user_id
      LEFT JOIN story_books sb ON sb.id = t.source_book_id
      LEFT JOIN story_categories c ON c.id = sb.category_id
      LEFT JOIN story_styles ls ON ls.id = t.locked_style_id
      LEFT JOIN story_episodes e ON e.id = t.latest_episode_id
      LEFT JOIN generation_jobs gj ON gj.id = e.job_id
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS participant_count
        FROM story_thread_participants sp
        WHERE sp.thread_id = t.id
      ) AS participants ON TRUE
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS episode_count
        FROM story_episodes se
        WHERE se.thread_id = t.id
          AND se.status = 'published'
      ) AS episodes ON TRUE
      WHERE t.thread_kind = 'companion'
        AND t.visibility = 'public'
        AND t.status = 'active'
        AND t.completed_at IS NULL
      ORDER BY COALESCE(e.generated_at, e.created_at, t.updated_at, t.created_at) DESC
    `,
    [currentContext?.userId ?? null]
  );

  return rows
    .map((row) => mapAdventureThreadRow(row))
    .filter((thread) => !thread.isCompleted && (thread.isJoinable || thread.isOwner || thread.isParticipant));
}

export async function getCompanionSquareGroups() {
  const threads = await getAdventureThreads();
  return groupCompanionThreadsByBook(threads) satisfies CompanionSquareGroupView[];
}

export async function getAdventureThreadDetail(threadId: string) {
  const currentContext = await getAuthenticatedAppContext();

  if (!(await isStoryExperienceSchemaReady())) {
    return null;
  }

  const row = await getAdventureThreadRow(threadId, currentContext?.userId ?? null);

  if (!row) {
    return null;
  }

  const [thread, episodes] = await Promise.all([Promise.resolve(mapAdventureThreadRow(row)), getThreadEpisodes(threadId)]);

  return {
    ...thread,
    episodes
  } satisfies AdventureThreadDetailView;
}

export async function getPersonalLineForBookSlug(slug: string) {
  const currentContext = await getAuthenticatedAppContext();

  if (!currentContext) {
    return null;
  }

  if (!(await isStoryExperienceSchemaReady())) {
    return null;
  }

  const row = await getPersonalThreadRowBySlug(slug, currentContext.userId);

  if (!row) {
    return null;
  }

  return mapPersonalLineBookRow(row);
}

export async function getOwnedAdventureForBookSlug(slug: string) {
  return getPersonalLineForBookSlug(slug);
}

export async function getPersonalLineDetail(slug: string, options?: { ensureToday?: boolean }) {
  const context = await getAuthenticatedAppContext();

  if (!context) {
    return null;
  }

  if (!(await isStoryExperienceSchemaReady())) {
    return null;
  }

  let row = await getPersonalThreadRowBySlug(slug, context.userId);

  if (!row) {
    return null;
  }

  if (options?.ensureToday && !wasGeneratedOnAppDate(row.latest_episode_generated_at)) {
    await requireSecondMeStoryContext();
    await ensurePersonalThreadEpisode({
      thread: row,
      context
    });
    row = await getPersonalThreadRowBySlug(slug, context.userId);
  }

  if (!row) {
    return null;
  }

  const [episodes, activeCompanionThreadId] = await Promise.all([
    getThreadEpisodes(row.id),
    row.latest_episode_id ? getActiveCompanionThreadIdByOriginEpisode(row.latest_episode_id) : Promise.resolve(null)
  ]);

  return {
    ...mapPersonalLineBookRow(row),
    episodes,
    activeCompanionThreadId
  } satisfies PersonalLineDetailView;
}

export async function startOrOpenPersonalLine(slug: string) {
  await requireStoryExperienceSchema();
  const context = await requireAuthenticatedStoryContext();
  await requireSecondMeStoryContext();
  const book = await getBookBySlug(slug);

  if (!book) {
    throw new Error("Book not found.");
  }

  const sourceBookId = await ensurePersistedStoryBookId(book);
  let thread = await getPersonalThreadRowBySlug(slug, context.userId);

  if (!thread) {
    const styleIds = await getStyleIds();
    const styleKey = pickThreadPrimaryStyleKey({
      userId: context.userId,
      persona: context.persona,
      seedBook: book
    });
    const styleId = styleIds.get(styleKey) ?? null;
    const { rows: threadRows } = await sql<IdRow>(
      `
        INSERT INTO story_threads (
          user_id,
          owner_user_id,
          title,
          status,
          current_book_id,
          source_book_id,
          latest_episode_id,
          primary_style_id,
          locked_style_id,
          next_generate_at,
          last_generated_at,
          participant_limit,
          joiner_limit,
          episode_limit,
          visibility,
          thread_kind,
          meta
        )
        VALUES (
          $1,
          $2,
          $3,
          'active',
          $4,
          $4,
          NULL,
          $5,
          $5,
          NULL,
          NULL,
          1,
          0,
          999999,
          'private',
          'personal',
          $6::jsonb
        )
        RETURNING id
      `,
      [
        context.userId,
        context.userId,
        buildPersonalThreadTitle(book),
        sourceBookId,
        styleId,
        toJson({
          source: "personal-line-v1",
          sourceBookSlug: book.slug
        })
      ]
    );

    await ensureThreadOwnerParticipant(threadRows[0].id, context.userId);
    thread = await getPersonalThreadRowById(threadRows[0].id, context.userId);
  }

  if (!thread) {
    throw new Error("Personal thread could not be created.");
  }

  const result = await ensurePersonalThreadEpisode({
    thread,
    context
  });

  return {
    threadId: result.threadId,
    episodeId: result.episodeId,
    slug
  };
}

export async function createAdventureForBookSlug(slug: string) {
  return startOrOpenPersonalLine(slug);
}

export async function publishCompanionFromPersonal(originEpisodeId: string) {
  await requireStoryExperienceSchema();
  const context = await requireAuthenticatedStoryContext();

  const existingThreadId = await getActiveCompanionThreadIdByOriginEpisode(originEpisodeId);

  if (existingThreadId) {
    return {
      threadId: existingThreadId,
      episodeId: null as string | null
    };
  }

  const { rows } = await sql<{
    personal_thread_id: string;
    personal_thread_title: string;
    source_book_id: string;
    source_book_slug: string;
    source_book_title: string;
    locked_style_id: string | null;
    locked_style_key: StoryStyleKey | null;
    origin_episode_id: string;
    origin_episode_title: string | null;
    origin_episode_excerpt: string | null;
    origin_episode_generated_at: string | null;
  }>(
    `
      SELECT
        t.id AS personal_thread_id,
        t.title AS personal_thread_title,
        t.source_book_id,
        sb.slug AS source_book_slug,
        sb.title AS source_book_title,
        t.locked_style_id,
        ls.key AS locked_style_key,
        e.id AS origin_episode_id,
        e.title AS origin_episode_title,
        e.excerpt AS origin_episode_excerpt,
        e.generated_at AS origin_episode_generated_at
      FROM story_episodes e
      JOIN story_threads t ON t.id = e.thread_id
      JOIN story_books sb ON sb.id = t.source_book_id
      LEFT JOIN story_styles ls ON ls.id = t.locked_style_id
      WHERE e.id = $1
        AND e.status = 'published'
        AND t.owner_user_id = $2
        AND t.thread_kind = 'personal'
        AND t.status = 'active'
      LIMIT 1
    `,
    [originEpisodeId, context.userId]
  );

  const origin = rows[0];

  if (!origin) {
    throw new Error("Personal origin episode not found.");
  }

  const book = await getBookBySlug(origin.source_book_slug);

  if (!book) {
    throw new Error("Companion source book not found.");
  }

  const styleIds = await getStyleIds();
  const lockedStyleKey =
    origin.locked_style_key ??
    getStyleKeyFromId(styleIds, origin.locked_style_id) ??
    pickThreadPrimaryStyleKey({
      userId: context.userId,
      persona: context.persona,
      seedBook: book
    });
  const styleId = styleIds.get(lockedStyleKey) ?? origin.locked_style_id;
  const threadTitle = buildAdventureThreadTitle(book, context.displayName);
  const { rows: threadRows } = await sql<IdRow>(
    `
      INSERT INTO story_threads (
        user_id,
        owner_user_id,
        title,
        status,
        current_book_id,
        source_book_id,
        latest_episode_id,
        primary_style_id,
        locked_style_id,
        next_generate_at,
        last_generated_at,
        participant_limit,
        joiner_limit,
        episode_limit,
        visibility,
        thread_kind,
        origin_personal_thread_id,
        origin_episode_id,
        meta
      )
      VALUES (
        $1,
        $2,
        $3,
        'active',
        $4,
        $4,
        NULL,
        $5,
        $5,
        NULL,
        NULL,
        5,
        4,
        10,
        'public',
        'companion',
        $6,
        $7,
        $8::jsonb
      )
      RETURNING id
    `,
    [
      context.userId,
      context.userId,
      threadTitle,
      origin.source_book_id,
      styleId,
      origin.personal_thread_id,
      origin.origin_episode_id,
      toJson({
        source: "companion-from-personal-v1",
        sourceBookSlug: book.slug
      })
    ]
  );

  const threadId = threadRows[0].id;
  await ensureThreadOwnerParticipant(threadId, context.userId);

  const { episodeId, generatedAt } = await clonePublishedEpisodeIntoThread({
    threadId,
    originEpisodeId: origin.origin_episode_id,
    sourceBookId: origin.source_book_id,
    fallbackStyleId: styleId,
    episodeNo: 1
  });

  await sql(
    `
      UPDATE story_threads
      SET latest_episode_id = $2,
          current_book_id = $3,
          last_generated_at = COALESCE($4::timestamptz, NOW()),
          status = 'active',
          completed_at = NULL,
          updated_at = NOW()
      WHERE id = $1
    `,
    [threadId, episodeId, origin.source_book_id, generatedAt ?? origin.origin_episode_generated_at]
  );

  await addTimelineItem({
    userId: context.userId,
    sourceType: "companion_episode",
    sourceId: episodeId,
    title: origin.origin_episode_title ?? "新的同行已经开始",
    excerpt: origin.origin_episode_excerpt ?? "这一章已经被公开成同行故事，后面的人会从这里继续往前走。",
    bookId: origin.source_book_id
  });

  return {
    threadId,
    episodeId
  };
}

export async function joinAdventure(threadId: string) {
  await requireStoryExperienceSchema();
  const context = await requireAuthenticatedStoryContext();
  const thread = await getAdventureThreadRow(threadId, context.userId);

  if (!thread) {
    throw new Error("Adventure thread not found.");
  }

  const mapped = mapAdventureThreadRow(thread);

  if (mapped.isOwner || mapped.isParticipant || mapped.isCompleted || mapped.isFull) {
    return {
      threadId,
      joined: false
    };
  }

  await sql(
    `
      INSERT INTO story_thread_participants (thread_id, user_id, role)
      VALUES ($1, $2, 'participant')
      ON CONFLICT (thread_id, user_id) DO NOTHING
    `,
    [threadId, context.userId]
  );

  return {
    threadId,
    joined: true
  };
}

export async function continueAdventure(threadId: string) {
  await requireStoryExperienceSchema();
  const context = await requireAuthenticatedStoryContext();
  const thread = await getAdventureThreadRow(threadId, context.userId);

  if (!thread) {
    throw new Error("Adventure thread not found.");
  }

  const threadView = mapAdventureThreadRow(thread);

  if ((!threadView.isOwner && !threadView.isParticipant) || threadView.isCompleted) {
    return {
      threadId,
      created: false,
      episodeId: null as string | null
    };
  }

  const bookSlug = thread.source_book_slug;

  if (!thread.source_book_id || !bookSlug) {
    throw new Error("Adventure thread is missing its source book.");
  }

  const book = await getBookBySlug(bookSlug);

  if (!book) {
    throw new Error("Adventure source book not found.");
  }

  const styleIds = await getStyleIds();
  const lockedStyleKey =
    thread.locked_style_key ??
    getStyleKeyFromId(styleIds, thread.locked_style_id) ??
    pickThreadPrimaryStyleKey({
      userId: thread.id,
      persona: context.persona,
      seedBook: book
    });
  const styleId = styleIds.get(lockedStyleKey) ?? thread.locked_style_id;

  if (!thread.locked_style_id && styleId) {
    await sql(
      `
        UPDATE story_threads
        SET locked_style_id = $2,
            primary_style_id = COALESCE(primary_style_id, $2),
            updated_at = NOW()
        WHERE id = $1
      `,
      [threadId, styleId]
    );
  }

  const nextEpisodeNo = threadView.episodeCount + 1;

  if (threadView.generationState === "queued" || threadView.generationState === "running") {
    return {
      threadId,
      created: false,
      episodeId: thread.latest_episode_id
    };
  }

  if (threadView.generationState === "failed" && thread.latest_episode_id) {
    const { episodeId } = await enqueueAdventureEpisodeGeneration({
      threadId,
      userId: context.userId,
      bookId: thread.source_book_id,
      book,
      styleId,
      styleKey: lockedStyleKey,
      episodeNo: thread.latest_episode_no ?? nextEpisodeNo,
      mode: thread.latest_episode_no && thread.latest_episode_no <= 1 ? "companion_publish" : "adventure_continue",
      existingEpisodeId: thread.latest_episode_id,
      existingJobId: null
    });

    return {
      threadId,
      created: true,
      episodeId
    };
  }

  if (nextEpisodeNo > threadView.episodeLimit) {
    await sql(
      `
        UPDATE story_threads
        SET status = 'completed',
            completed_at = COALESCE(completed_at, NOW()),
            updated_at = NOW()
        WHERE id = $1
      `,
      [threadId]
    );

    return {
      threadId,
      created: false,
      episodeId: null as string | null
    };
  }

  const { episodeId } = await enqueueAdventureEpisodeGeneration({
    threadId,
    userId: context.userId,
    bookId: thread.source_book_id,
    book,
    styleId,
    styleKey: lockedStyleKey,
    episodeNo: nextEpisodeNo,
    mode: "adventure_continue"
  });

  return {
    threadId,
    created: true,
    episodeId
  };
}

export async function getMyCompanionThreads() {
  const context = await getAuthenticatedAppContext();

  if (!context) {
    return [];
  }

  if (!(await isStoryExperienceSchemaReady())) {
    return [];
  }

  const { rows } = await sql<AdventureThreadRow>(
    `
      SELECT
        t.id,
        t.thread_kind,
        t.title,
        t.status,
        t.completed_at,
        t.participant_limit,
        t.episode_limit,
        sb.title AS source_book_title,
        sb.slug AS source_book_slug,
        c.key AS source_book_category_key,
        ls.name AS locked_style_name,
        ls.key AS locked_style_key,
        owner.display_name AS owner_display_name,
        t.latest_episode_id,
        e.title AS latest_episode_title,
        e.excerpt AS latest_episode_excerpt,
        e.content AS latest_episode_content,
        e.generated_at AS latest_episode_generated_at,
        e.episode_no AS latest_episode_no,
        participants.participant_count,
        episodes.episode_count,
        EXISTS (
          SELECT 1
          FROM story_thread_participants sp
          WHERE sp.thread_id = t.id
            AND sp.user_id = $1
            AND sp.role = 'owner'
        ) AS is_owner,
        EXISTS (
          SELECT 1
          FROM story_thread_participants sp
          WHERE sp.thread_id = t.id
            AND sp.user_id = $1
        ) AS is_participant,
        t.source_book_id,
        t.locked_style_id,
        t.origin_personal_thread_id,
        t.origin_episode_id
      FROM story_threads t
      JOIN users owner ON owner.id = t.owner_user_id
      LEFT JOIN story_books sb ON sb.id = t.source_book_id
      LEFT JOIN story_categories c ON c.id = sb.category_id
      LEFT JOIN story_styles ls ON ls.id = t.locked_style_id
      LEFT JOIN story_episodes e ON e.id = t.latest_episode_id
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS participant_count
        FROM story_thread_participants sp
        WHERE sp.thread_id = t.id
      ) AS participants ON TRUE
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS episode_count
        FROM story_episodes se
        WHERE se.thread_id = t.id
          AND se.status = 'published'
      ) AS episodes ON TRUE
      WHERE t.thread_kind = 'companion'
        AND (t.owner_user_id = $1 OR EXISTS (
          SELECT 1
          FROM story_thread_participants sp
          WHERE sp.thread_id = t.id
            AND sp.user_id = $1
        ))
      ORDER BY COALESCE(e.generated_at, t.created_at) DESC
    `,
    [context.userId]
  );

  return rows.map((row) => mapAdventureThreadRow(row));
}

export async function ensureTodayBedtimeMemory() {
  await requireStoryExperienceSchema();
  const context = await requireAuthenticatedStoryContext();
  const memoryDate = getCurrentAppDate();

  const { rows: existingRows } = await sql<{ id: string }>(
    `
      SELECT id
      FROM bedtime_memories
      WHERE user_id = $1
        AND memory_date = $2::date
      LIMIT 1
    `,
    [context.userId, memoryDate]
  );

  if (existingRows[0]) {
    return existingRows[0].id;
  }

  const secondMeContext = await requireSecondMeStoryContext();
  const jobId = await createGenerationJob({
    jobType: "short_story_generate",
    payload: {
      memoryDate,
      mode: "bedtime_memory"
    }
  });
  await markGenerationJobRunning(jobId);

  let memory = buildBedtimeMemoryFallback({
    persona: context.persona,
    currentDate: memoryDate
  });

  try {
    memory = await generateBedtimeMemoryWithLlm({
      persona: context.persona,
      secondMeContext,
      memoryDate
    });
    await markGenerationJobFinished(jobId, "succeeded");
  } catch (error) {
    const generationError = error instanceof Error ? error.message : "Unknown bedtime memory generation error";
    await markGenerationJobFinished(jobId, "failed", generationError);
  }

  const { rows } = await sql<IdRow>(
    `
      INSERT INTO bedtime_memories (
        user_id,
        memory_date,
        job_id,
        title,
        excerpt,
        content,
        source_secondme_context,
        status,
        generated_at
      )
      VALUES (
        $1,
        $2::date,
        $3,
        $4,
        $5,
        $6,
        $7::jsonb,
        'published',
        NOW()
      )
      ON CONFLICT (user_id, memory_date) DO NOTHING
      RETURNING id
    `,
    [
      context.userId,
      memoryDate,
      jobId,
      memory.title,
      memory.excerpt,
      memory.content,
      toJson({
        userInfo: secondMeContext.userInfo,
        shades: secondMeContext.shades,
        softMemory: secondMeContext.softMemory,
        source: secondMeContext.source,
        fetchedAt: secondMeContext.fetchedAt
      })
    ]
  );

  if (!rows[0]) {
    const { rows: fallbackRows } = await sql<IdRow>(
      `
        SELECT id
        FROM bedtime_memories
        WHERE user_id = $1
          AND memory_date = $2::date
        LIMIT 1
      `,
      [context.userId, memoryDate]
    );

    return fallbackRows[0]?.id ?? null;
  }

  await addTimelineItem({
    userId: context.userId,
    sourceType: "bedtime_memory",
    sourceId: rows[0].id,
    title: memory.title,
    excerpt: memory.excerpt
  });

  return rows[0].id;
}

export async function getDailyMemories(options?: { ensureToday?: boolean }) {
  const context = await getAuthenticatedAppContext();

  if (!context) {
    return [];
  }

  if (!(await isStoryExperienceSchemaReady())) {
    return [];
  }

  if (options?.ensureToday) {
    await ensureTodayBedtimeMemory();
  }

  const { rows } = await sql<BedtimeMemoryRow>(
    `
      SELECT
        m.id,
        TO_CHAR(m.memory_date, 'YYYY-MM-DD') AS memory_date,
        m.title,
        m.excerpt,
        m.content,
        m.generated_at,
        gj.status AS generation_status
      FROM bedtime_memories m
      LEFT JOIN generation_jobs gj ON gj.id = m.job_id
      WHERE m.user_id = $1
        AND m.status = 'published'
      ORDER BY m.memory_date DESC, m.created_at DESC
    `,
    [context.userId]
  );

  return rows.map(
    (row): BedtimeMemoryView => ({
      id: row.id,
      memoryDate: row.memory_date,
      title: sanitizeDisplayTitle(row.title ?? "未命名回忆"),
      excerpt: row.excerpt ?? "",
      content: row.content ?? "",
      generatedAt: row.generated_at,
      generationLabel: getGenerationLabel(row.generation_status)
    })
  );
}

export async function getStoryTimelineItems() {
  const context = await getAuthenticatedAppContext();

  if (!context) {
    return [];
  }

  if (!(await isStoryExperienceSchemaReady())) {
    return [];
  }

  const { rows } = await sql<TimelineRow>(
    `
      SELECT
        t.id,
        t.source_type,
        t.title,
        t.excerpt,
        b.title AS book_title,
        t.happened_at
      FROM timeline_items t
      LEFT JOIN story_books b ON b.id = t.book_id
      WHERE t.user_id = $1
      ORDER BY t.happened_at DESC, t.created_at DESC
    `,
    [context.userId]
  );

  const visibleRows = rows.filter(
    (row): row is TimelineRow & { source_type: VisibleStoryTimelineSourceType } =>
      isVisibleStoryTimelineSource(row.source_type)
  );

  return visibleRows.map(
    (row): StoryTimelineItemView => ({
      id: row.id,
      sourceType: row.source_type,
      title:
        row.source_type === "personal_episode" || row.source_type === "episode"
          ? sanitizePersonalAdventureTitle(sanitizeDisplayTitle(row.title), row.book_title)
          : sanitizeDisplayTitle(row.title),
      excerpt: row.excerpt,
      bookTitle: row.book_title,
      happenedAt: row.happened_at
    })
  );
}

export async function getMyStoryStats() {
  const context = await getAuthenticatedAppContext();

  if (!context) {
    return {
      ownedAdventureCount: 0,
      joinedAdventureCount: 0
    } satisfies MyStoryStatsView;
  }

  if (!(await isStoryExperienceSchemaReady())) {
    return {
      ownedAdventureCount: 0,
      joinedAdventureCount: 0
    } satisfies MyStoryStatsView;
  }
  const { rows: adventureCountRows } = await sql<AdventureCountRow>(
    `
      SELECT
        COUNT(*) FILTER (
          WHERE owner_user_id = $1
            AND thread_kind = 'personal'
            AND status = 'active'
            AND completed_at IS NULL
        )::int AS personal_count,
        COUNT(*) FILTER (
          WHERE thread_kind = 'companion'
            AND (
              owner_user_id = $1
              OR id IN (
                SELECT thread_id
                FROM story_thread_participants
                WHERE user_id = $1
              )
            )
        )::int AS companion_count
      FROM story_threads
    `,
    [context.userId]
  );

  return {
    ownedAdventureCount: adventureCountRows[0]?.personal_count ?? 0,
    joinedAdventureCount: adventureCountRows[0]?.companion_count ?? 0
  } satisfies MyStoryStatsView;
}
