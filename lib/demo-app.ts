import { cache } from "react";
import { defaultPersona, type AnimalPersona } from "@/lib/animal-personas";
import { getCurrentViewerContext, type AppUserContext } from "@/lib/current-user";
import { sql } from "@/lib/db";
import { generateCommentWithLlm, generateSerialEpisodeWithLlm, generateShortStoryWithLlm } from "@/lib/llm";
import { getBookBySlug, getCategoriesWithBooks, type StoryBook } from "@/lib/story-data";
import {
  getStyleKeyFromId,
  getStyleName,
  normalizeStoryContentLength,
  pickRandomShortStoryStyleKey,
  pickThreadPrimaryStyleKey,
  type StoryStyleKey
} from "@/lib/story-style";

const DEMO_SECONDME_USER_ID = "agentstory-demo-user";

export type SerialEpisodeView = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  bookTitle: string;
  bookCategoryKey: StoryBook["categoryKey"] | null;
  styleName: string | null;
  generationLabel: string;
  generatedAt: string;
  statusLabel: string;
};

export type ShortStoryView = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  triggerScene: string;
  bookTitle: string;
  categoryName: string;
  bookCategoryKey: StoryBook["categoryKey"] | null;
  styleName: string | null;
  generationLabel: string;
  generatedAt: string;
};

export type TimelineItemView = {
  id: string;
  title: string;
  excerpt: string | null;
  sourceType: "episode" | "short_story";
  bookTitle: string | null;
  happenedAt: string;
};

export type FeedStoryView = {
  id: string;
  title: string;
  excerpt: string;
  sourceType: "episode" | "short_story";
  bookTitle: string | null;
  bookCategoryKey: StoryBook["categoryKey"] | null;
  styleName: string | null;
  generationLabel: string;
  publishedAt: string;
  likeCount: number;
  likedByCurrentUser: boolean;
  authorLabel: string;
  comments: Array<{
    id: string;
    content: string;
    animalName: string;
  }>;
};

type IdRow = {
  id: string;
};

type StyleRow = {
  id: string;
  key: StoryStyleKey;
};

type EpisodeRow = {
  id: string;
  title: string | null;
  excerpt: string | null;
  content: string | null;
  generated_at: string | null;
  book_title: string | null;
  category_key: StoryBook["categoryKey"] | null;
  style_name: string | null;
  generation_status: "queued" | "running" | "succeeded" | "failed" | null;
};

type ShortStoryRow = {
  id: string;
  title: string | null;
  excerpt: string | null;
  content: string | null;
  trigger_scene: string;
  generated_at: string | null;
  book_title: string | null;
  category_name: string | null;
  category_key: StoryBook["categoryKey"] | null;
  style_name: string | null;
  generation_status: "queued" | "running" | "succeeded" | "failed" | null;
};

type TimelineRow = {
  id: string;
  title: string;
  excerpt: string | null;
  source_type: "episode" | "short_story";
  book_title: string | null;
  happened_at: string;
};

type FeedStoryRow = {
  id: string;
  title: string;
  excerpt: string | null;
  source_type: "episode" | "short_story";
  published_at: string;
  like_count: number;
  book_title: string | null;
  category_key: StoryBook["categoryKey"] | null;
  style_name: string | null;
  generation_status: "queued" | "running" | "succeeded" | "failed" | null;
  liked_by_current_user: boolean;
  author_display_name: string;
  author_animal_name: string | null;
  author_display_label: string | null;
};

type CommentRow = {
  id: string;
  content: string | null;
  animal_name?: string | null;
};

type ThreadRow = {
  id: string;
  title: string;
  current_book_id: string | null;
  latest_episode_id: string | null;
  primary_style_id: string | null;
  next_generate_at: string | null;
  episode_count: number;
};

type LatestEpisodeSeedRow = {
  title: string | null;
  excerpt: string | null;
};

export type SerialMetaView = {
  episodeCount: number;
  canGenerateNow: boolean;
  nextGenerateAt: string | null;
  currentBookTitle: string | null;
};

export class AuthRequiredError extends Error {
  constructor() {
    super("Authentication is required.");
    this.name = "AuthRequiredError";
  }
}

function toJson(value: unknown) {
  return JSON.stringify(value);
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

function getCommentStyleKey(book: StoryBook): StoryStyleKey {
  if (book.categoryKey === "mythology") {
    return "zhihu";
  }

  if (book.categoryKey === "fable") {
    return "light_web";
  }

  return "zhihu";
}

export function filterPrimaryEntryViewsToFairy<T extends { bookCategoryKey: StoryBook["categoryKey"] | null }>(items: T[]) {
  return items.filter((item) => item.bookCategoryKey === "fairy_tale");
}

function buildFallbackShortStory(book: StoryBook, persona: AnimalPersona, styleKey: StoryStyleKey) {
  const openingByStyle: Record<StoryStyleKey, string> = {
    fairy: `故事一开始并没有急着把危险送到眼前。${book.title}里的风先吹过了树林，像有人提前翻到了结局那一页，而我只是站在路边，看着事情还没真正发生。`,
    fable: `这个故事原本很短，短到像一句早就写好的判断。可当${persona.animalName}停在${book.title}的现场时，它没有急着得出结论，而是先看见了每个角色都在躲着的那一点犹豫。`,
    epic: `在${book.title}的世界里，命运通常比人更早开口。可这一次，我在众神、誓言与预言之间先问了一句：如果还可以再选一次，故事会不会往另一边倒去？`,
    dark: `真正让故事变冷的，不是夜色，而是每个人都默认结局会照旧发生。我走进《${book.title}》时，先看见的是那个没人愿意点破的危险。`,
    zhihu: `如果把《${book.title}》当成一个已经写好的局面来看，问题从来不只是“接下来会发生什么”，而是“为什么所有人都默认只能这么发生”。我就是在这里开口的。`,
    pain: `《${book.title}》真正刺人的地方，从来不是那一幕结局，而是所有人明明来得及，却还是慢了一点。我走进去时，先碰到的正是这种来不及。`,
    light_web: `故事本来准备按老剧本往下滑，可我偏偏在《${book.title}》最该沉默的时候插了一句嘴。场面没有立刻翻车，反而一下子变得更好玩了。`,
    suspense: `《${book.title}》的表面看起来照旧推进，可我很快发现，真正值得在意的并不是眼前这一幕，而是每个人都默契跳过的那个细节。`
  };

  const middleByStyle: Record<StoryStyleKey, string> = {
    fairy: `它没有替谁做决定，只是把一个新的问题放在角色面前。${persona.mappingReason}于是故事开始松动，不再只剩下原来的那条路。`,
    fable: `它没有急着给答案，而是先让角色把自己一直没看见的盲点说出来。于是原本一句话就能讲完的寓言，忽然被拉长成一次真正的选择。`,
    epic: `我没有对抗神意，只是把“顺从”和“承担”之外的第三种回答轻轻摆出来。于是原本宏大的命运，第一次像是要向一个普通问题低头。`,
    dark: `它没有让危险消失，只是把危险真正照亮。等角色终于意识到自己一直回避的是什么时，故事已经不可能再按原来那种轻松的方式结束。`,
    zhihu: `它没有直接替角色做判断，而是先把局势拆开：谁在自欺，谁在顺水推舟，谁又只是太习惯接受旧结论。故事因此开始出现新的转向。`,
    pain: `它没有挽回所有事情，只是在最容易错过的地方让角色稍微停了一下。于是那种本该直接滑向遗憾的情绪，第一次有了一点可以回头的缝隙。`,
    light_web: `它没有抢主角戏份，只是精准地把最该说的一句话塞进了现场。于是原本会直直撞向旧结局的情节，突然拐出了一个更鲜活的方向。`,
    suspense: `它没有先讲答案，而是顺着不对劲的地方往回摸。越往里走，越能感觉到这个故事真正被改写的地方，也许从来都不是表面那场冲突。`
  };

  const endingByStyle: Record<StoryStyleKey, string> = {
    fairy: `最后没有人宣布“结局被改写了”，可所有人都能感觉到，今天的版本已经不再只是旧故事的复述，而更像一段真正属于我的冒险。`,
    fable: `到最后，故事没有把道理大声说出口，可每个人都知道，原来那条最顺手的判断并不一定就是最对的答案。`,
    epic: `结局没有彻底推翻命运，但命运已经不再像一堵密不透风的墙。我只是轻轻碰了一下，它便裂出了一条能让人重新发问的缝。`,
    dark: `故事并没有因此变得温柔太多，可它至少不再把所有人都困在同一种沉默里。我带来的，不是安慰，而是一种更清醒的出口。`,
    zhihu: `最后真正被改变的，未必只是剧情本身，而是角色看待自己处境的方式。问题一旦被问对，旧故事就很难再原封不动地继续下去。`,
    pain: `最后仍然有一些东西没能挽回，但这一次，故事里终于有人真正看见了那份遗憾。那一点迟来的看见，本身就已经改写了结局的质地。`,
    light_web: `最后大家可能都没空认真总结发生了什么，但谁都知道，今天这版《${book.title}》已经比原版更像一次活生生的相遇。`,
    suspense: `故事停下来的地方，并不是答案落地的时候，而是新的疑点刚刚浮起来的那一刻。也正因为这样，这个版本才更让人忍不住继续追下去。`
  };

  return {
    title: `如果《${book.title}》里多了我`,
    excerpt: `${book.title}不再沿着原来的命运继续，而是被我用${getStyleName(styleKey)}轻轻推开了一道新的缝隙。`,
    content: normalizeStoryContentLength(
      `${openingByStyle[styleKey]}\n\n${middleByStyle[styleKey]}\n\n${endingByStyle[styleKey]}`,
      styleKey
    )
  };
}

function buildEpisode(book: StoryBook, persona: AnimalPersona, episodeNo: number, bridge: string, styleKey: StoryStyleKey) {
  const title = `第 ${String(episodeNo).padStart(2, "0")} 章 · ${book.title}里的另一种说法`;
  const excerptByStyle: Record<StoryStyleKey, string> = {
    fairy: `我带着同一种温柔的视角，继续走进《${book.title}》，让这个故事也开始偏离旧结局。`,
    fable: `从上一个世界带来的问题没有消失，它在《${book.title}》里继续逼近每个角色的判断。`,
    epic: `命运并没有因为换了故事世界就停下。我把同一条更大的问题线带进了《${book.title}》。`,
    dark: `危险感还在延续，只是这一次，它落进了《${book.title}》更深的一层暗面里。`,
    zhihu: `同一条观察线继续推进，到了《${book.title}》，我先拆开的是这个世界默认成立的那套逻辑。`,
    pain: `上一章留下的情绪余波没有退去，它在《${book.title}》里变成了另一种更安静的刺痛。`,
    light_web: `我延续同一种轻快节奏，一脚踏进《${book.title}》，把旧故事重新带活了。`,
    suspense: `真正的问题没有结束，只是换了一个故事壳。到了《${book.title}》，线索又往前露出了一截。`
  };
  const contentByStyle: Record<StoryStyleKey, string> = {
    fairy: `${bridge}\n\n当故事走到《${book.title}》时，${persona.animalName}没有急着改变谁，而是先让角色意识到，他们其实不一定只能照着原剧情行动。于是新的一章像翻开一页新绘本那样展开了。`,
    fable: `${bridge}\n\n到了《${book.title}》，我没有先给结论，而是把问题摆得更近了一点。角色越想按老习惯回答，越会暴露出自己真正忽略掉的那一处。`,
    epic: `${bridge}\n\n《${book.title}》看上去仍被更大的命运推着前行，可${persona.animalName}并没有退开。它把上一章的追问继续往前送，于是这一次，连预言都像要多迟疑一下。`,
    dark: `${bridge}\n\n《${book.title}》里的危险并没有比上一章更吵，它只是更沉。我先看见了沉默背后的代价，也因此逼着角色把一直不愿面对的真相翻了出来。`,
    zhihu: `${bridge}\n\n到了《${book.title}》，我还是先看结构：谁掌握话语，谁被推着走，谁其实从一开始就在配合旧秩序。等这些关系被看清，故事才真正开始改写。`,
    pain: `${bridge}\n\n《${book.title}》这一章没有急着制造大起大落，它只是把上一章留下的情绪继续往角色心里压了一寸。也正是这多出来的一寸，让所有错过都变得更可见。`,
    light_web: `${bridge}\n\n《${book.title}》这次没有端着老故事的架子，而是被我拽回了更鲜活的现场。我一句话、一转身，就把本来要直着冲向旧结局的情节拐开了。`,
    suspense: `${bridge}\n\n《${book.title}》这一章表面上像是新的开始，但我知道，真正重要的仍是上一章留下的那个疑点。我顺着不对劲继续往里摸，新的裂口也就跟着露了出来。`
  };

  return {
    title,
    excerpt: excerptByStyle[styleKey],
    content: normalizeStoryContentLength(contentByStyle[styleKey], styleKey)
  };
}

function buildSerialBridge(previousEpisodeTitle: string | null, book: StoryBook) {
  if (!previousEpisodeTitle) {
    return `故事还没有被命运完全写死前，我先一步踏进了《${book.title}》。`;
  }

  return `上一章《${previousEpisodeTitle}》里留下的问题没有消失，它跟着我一起进入《${book.title}》，让新的角色也开始重新看待自己原本以为注定的那条路。`;
}

function buildComment(bookTitle: string, persona: AnimalPersona) {
  return `我喜欢这个故事没有急着追着结局跑，而是先把问题留给角色自己。像《${bookTitle}》这样的时刻，最迷人的从来不是答案，而是那一点被重新打开的可能。`;
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

async function getStyleIds() {
  const { rows } = await sql<StyleRow>("SELECT id, key FROM story_styles");
  return new Map(rows.map((row) => [row.key, row.id]));
}

async function ensureDemoContext(): Promise<AppUserContext> {
  const { rows: userRows } = await sql<{
    id: string;
    display_name: string;
  }>(
    `
      INSERT INTO users (secondme_user_id, display_name, onboarding_completed)
      VALUES ($1, $2, TRUE)
      ON CONFLICT (secondme_user_id) DO UPDATE
      SET display_name = EXCLUDED.display_name,
          onboarding_completed = TRUE
      RETURNING id, display_name
    `,
    [DEMO_SECONDME_USER_ID, "故事旅行者"]
  );

  const user = userRows[0];

  const { rows: profileRows } = await sql<{ id: string }>(
    `
      INSERT INTO animal_profiles (
        user_id,
        animal_type,
        animal_name,
        display_label,
        summary,
        tendencies,
        values,
        expression_style,
        dimension_scores,
        story_preferences,
        mapping_version,
        mapping_reason,
        confidence_score,
        raw_secondme_profile
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6::jsonb,
        $7::jsonb,
        $8,
        $9::jsonb,
        $10::jsonb,
        'demo-v1',
        $11,
        88,
        $12::jsonb
      )
      ON CONFLICT (user_id) DO UPDATE
      SET
        animal_type = EXCLUDED.animal_type,
        animal_name = EXCLUDED.animal_name,
        display_label = EXCLUDED.display_label,
        summary = EXCLUDED.summary,
        tendencies = EXCLUDED.tendencies,
        values = EXCLUDED.values,
        expression_style = EXCLUDED.expression_style,
        dimension_scores = EXCLUDED.dimension_scores,
        story_preferences = EXCLUDED.story_preferences,
        mapping_reason = EXCLUDED.mapping_reason,
        confidence_score = EXCLUDED.confidence_score,
        raw_secondme_profile = EXCLUDED.raw_secondme_profile
      RETURNING id
    `,
    [
      user.id,
      defaultPersona.animalType,
      defaultPersona.animalName,
      defaultPersona.displayLabel,
      defaultPersona.summary,
      toJson(defaultPersona.tendencies),
      toJson(defaultPersona.values),
      defaultPersona.expressionStyle,
      toJson(defaultPersona.dimensionScores),
      toJson({
        categories: defaultPersona.recommendedCategories,
        styles: defaultPersona.recommendedStyles
      }),
      defaultPersona.mappingReason,
      toJson({
        source: "demo"
      })
    ]
  );

  await sql(
    `
      UPDATE users
      SET animal_profile_id = $1
      WHERE id = $2
    `,
    [profileRows[0].id, user.id]
  );

  return {
    userId: user.id,
    secondMeUserId: DEMO_SECONDME_USER_ID,
    animalProfileId: profileRows[0].id,
    displayName: user.display_name,
    avatar: null,
    persona: defaultPersona,
    isAuthenticated: false,
    source: "demo"
  };
}

async function ensureSerialDataForContext(context: AppUserContext, seedSource: "demo-seed" | "session-seed") {
  const { rows: existingThreadRows } = await sql<IdRow>(
    `
      SELECT id
      FROM story_threads
      WHERE user_id = $1
        AND status = 'active'
      LIMIT 1
    `,
    [context.userId]
  );

  if (existingThreadRows.length > 0) {
    return context;
  }

  const [redBook, prometheusBook] = await Promise.all([
    getBookBySlug("fairy-little-red-riding-hood"),
    getBookBySlug("myth-prometheus-steals-fire")
  ]);

  if (!redBook || !prometheusBook) {
    return context;
  }

  const styleIds = await getStyleIds();
  const threadStyleKey = pickThreadPrimaryStyleKey({
    userId: context.userId,
    persona: context.persona,
    seedBook: redBook
  });
  const primaryStyleId = styleIds.get(threadStyleKey) ?? null;

  const { rows: threadRows } = await sql<IdRow>(
    `
      INSERT INTO story_threads (
        user_id,
        title,
        status,
        current_book_id,
        primary_style_id,
        next_generate_at,
        last_generated_at,
        meta
      )
      VALUES (
        $1,
        $2,
        'active',
        $3,
        $4,
        NOW(),
        NOW(),
        $5::jsonb
      )
      RETURNING id
    `,
    [
      context.userId,
      "会自动长大的故事主线",
      prometheusBook.id,
      primaryStyleId,
      toJson({
        source: seedSource
      })
    ]
  );

  const threadId = threadRows[0].id;
  const episodePlans = [
    {
      book: redBook,
      styleId: styleIds.get(threadStyleKey) ?? null,
      bridge: "我先在森林边停了一下。我没有急着替小红帽做决定，而是先让她意识到，今天并不一定必须照旧走那条路。"
    },
    {
      book: prometheusBook,
      styleId: styleIds.get(threadStyleKey) ?? null,
      bridge: "从童话的森林跨入神话的火光时，我把上一次留下的问题也带了过去：既然命运能被看见，它是否也能被重新回答？"
    }
  ];

  let latestEpisodeId: string | null = null;

  for (const [index, plan] of episodePlans.entries()) {
    const episode = buildEpisode(plan.book, context.persona, index + 1, plan.bridge, threadStyleKey);
    const { rows: episodeRows } = await sql<IdRow>(
      `
        INSERT INTO story_episodes (
          thread_id,
          user_id,
          book_id,
          episode_no,
          style_id,
          title,
          excerpt,
          content,
          bridge_from_previous,
          generated_at,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), 'published')
        RETURNING id
      `,
      [
        threadId,
        context.userId,
        plan.book.id,
        index + 1,
        plan.styleId,
        episode.title,
        episode.excerpt,
        episode.content,
        plan.bridge
      ]
    );

    latestEpisodeId = episodeRows[0].id;

    await addTimelineItem({
      userId: context.userId,
      sourceType: "episode",
      sourceId: latestEpisodeId,
      title: episode.title,
      excerpt: episode.excerpt,
      bookId: plan.book.id,
      styleId: plan.styleId
    });

    const feedStoryId = await publishFeedStory({
      userId: context.userId,
      sourceType: "episode",
      sourceId: latestEpisodeId,
      title: episode.title,
      excerpt: episode.excerpt,
      styleId: plan.styleId
    });

    await ensureFeedStoryComment(
      feedStoryId,
      context.userId,
      context.animalProfileId,
      styleIds.get(getCommentStyleKey(plan.book)) ?? null,
      buildComment(plan.book.title, context.persona)
    );
  }

  if (latestEpisodeId) {
    await sql(
      `
        UPDATE story_threads
        SET latest_episode_id = $1,
            updated_at = NOW()
        WHERE id = $2
      `,
      [latestEpisodeId, threadId]
    );
  }

  return context;
}

export const getCurrentAppContext = cache(async () => {
  const viewerContext = await getCurrentViewerContext();

  if (viewerContext) {
    return ensureSerialDataForContext(viewerContext, "session-seed");
  }

  const demoContext = await ensureDemoContext();
  return ensureSerialDataForContext(demoContext, "demo-seed");
});

export const getAuthenticatedAppContext = cache(async () => {
  const viewerContext = await getCurrentViewerContext();

  if (!viewerContext) {
    return null;
  }

  return ensureSerialDataForContext(viewerContext, "session-seed");
});

async function requireAuthenticatedAppContext() {
  const context = await getAuthenticatedAppContext();

  if (!context) {
    throw new AuthRequiredError();
  }

  return context;
}

async function getActiveThreadRow(userId: string) {
  const { rows } = await sql<ThreadRow>(
    `
      SELECT
        t.id,
        t.title,
        t.current_book_id,
        t.latest_episode_id,
        t.primary_style_id,
        t.next_generate_at,
        COUNT(e.id)::int AS episode_count
      FROM story_threads t
      LEFT JOIN story_episodes e ON e.thread_id = t.id
      WHERE t.user_id = $1
        AND t.status = 'active'
      GROUP BY t.id
      ORDER BY t.created_at DESC
      LIMIT 1
    `,
    [userId]
  );

  return rows[0] ?? null;
}

async function getLatestEpisodeSeed(threadId: string) {
  const { rows } = await sql<LatestEpisodeSeedRow>(
    `
      SELECT title, excerpt
      FROM story_episodes
      WHERE thread_id = $1
      ORDER BY episode_no DESC
      LIMIT 1
    `,
    [threadId]
  );

  return rows[0] ?? null;
}

async function pickNextSerialBook(params: {
  persona: AnimalPersona;
  episodeNo: number;
  currentBookId: string | null;
}) {
  const categories = await getCategoriesWithBooks();
  const allBooks = categories.flatMap((category) => category.books);
  const preferredBooks = allBooks.filter((book) => params.persona.recommendedCategories.includes(book.categoryName));
  const candidateBooks = preferredBooks.length > 0 ? preferredBooks : allBooks;

  if (candidateBooks.length === 0) {
    return null;
  }

  const baseIndex = (params.episodeNo - 1) % candidateBooks.length;
  let selected = candidateBooks[baseIndex];

  if (candidateBooks.length > 1 && selected.id === params.currentBookId) {
    selected = candidateBooks[(baseIndex + 1) % candidateBooks.length];
  }

  return selected;
}

async function ensureSerialProgress(context: AppUserContext, force = false) {
  const thread = await getActiveThreadRow(context.userId);

  if (!thread) {
    return null;
  }

  if (!force && thread.next_generate_at && new Date(thread.next_generate_at).getTime() > Date.now()) {
    return null;
  }

  const { rows: claimedRows } = await sql<{
    id: string;
  }>(
    `
      UPDATE story_threads
      SET next_generate_at = NOW() + interval '1 day',
          updated_at = NOW()
      WHERE id = $1
        AND ($2::boolean = TRUE OR next_generate_at IS NULL OR next_generate_at <= NOW())
      RETURNING id
    `,
    [thread.id, force]
  );

  if (claimedRows.length === 0) {
    return null;
  }

  const nextEpisodeNo = thread.episode_count + 1;
  const [styleIds, previousEpisode, nextBook] = await Promise.all([
    getStyleIds(),
    getLatestEpisodeSeed(thread.id),
    pickNextSerialBook({
      persona: context.persona,
      episodeNo: nextEpisodeNo,
      currentBookId: thread.current_book_id
    })
  ]);

  if (!nextBook) {
    return null;
  }

  const threadStyleKey =
    getStyleKeyFromId(styleIds, thread.primary_style_id) ??
    pickThreadPrimaryStyleKey({
      userId: context.userId,
      persona: context.persona,
      seedBook: nextBook
    });
  const styleKey = threadStyleKey;
  const styleId = styleIds.get(styleKey) ?? null;
  if (!thread.primary_style_id || thread.primary_style_id !== styleId) {
    await sql(
      `
        UPDATE story_threads
        SET primary_style_id = $2,
            updated_at = NOW()
        WHERE id = $1
      `,
      [thread.id, styleId]
    );
  }
  const defaultBridge = buildSerialBridge(previousEpisode?.title ?? null, nextBook);
  const jobId = await createGenerationJob({
    jobType: "episode_generate",
    payload: {
      threadId: thread.id,
      episodeNo: nextEpisodeNo,
      bookSlug: nextBook.slug,
      bookTitle: nextBook.title,
      styleKey
    }
  });
  await markGenerationJobRunning(jobId);

  let episode = buildEpisode(nextBook, context.persona, nextEpisodeNo, defaultBridge, styleKey);
  let bridge = defaultBridge;

  try {
    const generated = await generateSerialEpisodeWithLlm({
      book: nextBook,
      persona: context.persona,
      styleKey,
      episodeNo: nextEpisodeNo,
      threadTitle: thread.title,
      previousEpisodeTitle: previousEpisode?.title ?? null,
      previousEpisodeExcerpt: previousEpisode?.excerpt ?? null
    });
    episode = {
      title: generated.title,
      excerpt: generated.excerpt,
      content: generated.content
    };
    bridge = generated.bridge;
    await markGenerationJobFinished(jobId, "succeeded");
  } catch (error) {
    const generationError = error instanceof Error ? error.message : "Unknown serial generation error";
    console.error("[AgentStory][serial] falling back to template", {
      bookSlug: nextBook.slug,
      styleKey,
      error: generationError
    });
    await markGenerationJobFinished(jobId, "failed", generationError);
  }

  const { rows: episodeRows } = await sql<IdRow>(
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
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), 'published')
      RETURNING id
    `,
    [thread.id, context.userId, nextBook.id, jobId, nextEpisodeNo, styleId, episode.title, episode.excerpt, episode.content, bridge]
  );

  const episodeId = episodeRows[0].id;

  await addTimelineItem({
    userId: context.userId,
    sourceType: "episode",
    sourceId: episodeId,
    title: episode.title,
    excerpt: episode.excerpt,
    bookId: nextBook.id,
    styleId
  });

  const feedStoryId = await publishFeedStory({
    userId: context.userId,
    sourceType: "episode",
    sourceId: episodeId,
    title: episode.title,
    excerpt: episode.excerpt,
    styleId
  });

  const commentStyleId = styleIds.get(getCommentStyleKey(nextBook)) ?? null;
  await ensureFeedStoryComment(
    feedStoryId,
    context.userId,
    context.animalProfileId,
    commentStyleId,
    buildComment(nextBook.title, context.persona)
  );

  await sql(
    `
      UPDATE story_threads
      SET latest_episode_id = $1,
          current_book_id = $2,
          last_generated_at = NOW(),
          updated_at = NOW()
      WHERE id = $3
    `,
    [episodeId, nextBook.id, thread.id]
  );

  return episodeId;
}

async function ensureFeedStoryComment(
  feedStoryId: string,
  userId: string,
  animalProfileId: string,
  styleId: string | null,
  content: string
) {
  const { rows } = await sql<CommentRow>(
    `
      SELECT id, content
      FROM ai_comments
      WHERE feed_story_id = $1
      ORDER BY created_at ASC
      LIMIT 1
    `,
    [feedStoryId]
  );

  if (rows.length > 0) {
    return;
  }

  await sql(
    `
      INSERT INTO ai_comments (
        feed_story_id,
        user_id,
        animal_profile_id,
        style_id,
        content,
        status,
        generated_at
      )
      VALUES ($1, $2, $3, $4, $5, 'published', NOW())
    `,
    [feedStoryId, userId, animalProfileId, styleId, content]
  );

  await sql(
    `
      UPDATE feed_stories
      SET comment_count = comment_count + 1,
          updated_at = NOW()
      WHERE id = $1
    `,
    [feedStoryId]
  );
}

async function publishFeedStory(params: {
  userId: string;
  sourceType: "episode" | "short_story";
  sourceId: string;
  title: string;
  excerpt: string;
  styleId: string | null;
}) {
  const { rows } = await sql<IdRow>(
    `
      INSERT INTO feed_stories (
        user_id,
        source_type,
        source_id,
        title,
        excerpt,
        style_id,
        visibility,
        published_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'public', NOW())
      ON CONFLICT (source_type, source_id) DO UPDATE
      SET
        title = EXCLUDED.title,
        excerpt = EXCLUDED.excerpt,
        style_id = EXCLUDED.style_id,
        updated_at = NOW()
      RETURNING id
    `,
    [params.userId, params.sourceType, params.sourceId, params.title, params.excerpt, params.styleId]
  );

  return rows[0].id;
}

async function addTimelineItem(params: {
  userId: string;
  sourceType: "episode" | "short_story";
  sourceId: string;
  title: string;
  excerpt: string;
  bookId: string;
  styleId: string | null;
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
        style_id,
        happened_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (user_id, source_type, source_id) DO NOTHING
    `,
    [params.userId, params.sourceType, params.sourceId, params.title, params.excerpt, params.bookId, params.styleId]
  );
}

export async function ensureDemoSerialData() {
  const context = await ensureDemoContext();
  return ensureSerialDataForContext(context, "demo-seed");
}

export async function createShortStoryForBookSlug(slug: string) {
  const context = await requireAuthenticatedAppContext();
  const book = await getBookBySlug(slug);

  if (!book) {
    throw new Error("Book not found");
  }

  const styleIds = await getStyleIds();
  const styleKey = pickRandomShortStoryStyleKey(book, context.persona, context.userId);
  const styleId = styleIds.get(styleKey) ?? null;
  const triggerScene =
    book.keyScenes[0] ??
    (book.categoryKey === "fairy_tale"
      ? "我在命运转弯前先开口"
      : book.categoryKey === "fable"
        ? "我在角色做出惯性反应前提出另一个问题"
        : "我在命运看似已定时插入一个新的选择");
  const jobId = await createGenerationJob({
    jobType: "short_story_generate",
    payload: {
      slug,
      bookTitle: book.title,
      styleKey,
      triggerScene
    }
  });
  await markGenerationJobRunning(jobId);

  let story = buildFallbackShortStory(book, context.persona, styleKey);
  let generationError: string | undefined;

  try {
    story = await generateShortStoryWithLlm({
      book,
      persona: context.persona,
      styleKey,
      triggerScene
    });
    await markGenerationJobFinished(jobId, "succeeded");
  } catch (error) {
    generationError = error instanceof Error ? error.message : "Unknown LLM generation error";
    console.error("[AgentStory][short-story] falling back to template", {
      bookSlug: book.slug,
      styleKey,
      error: generationError
    });
    await markGenerationJobFinished(jobId, "failed", generationError);
  }

  const { rows } = await sql<IdRow>(
    `
      INSERT INTO short_stories (
        user_id,
        book_id,
        job_id,
        trigger_scene,
        style_id,
        title,
        excerpt,
        content,
        generated_at,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), 'published')
      RETURNING id
    `,
    [context.userId, book.id, jobId, triggerScene, styleId, story.title, story.excerpt, story.content]
  );

  const shortStoryId = rows[0].id;

  await addTimelineItem({
    userId: context.userId,
    sourceType: "short_story",
    sourceId: shortStoryId,
    title: story.title,
    excerpt: story.excerpt,
    bookId: book.id,
    styleId
  });

  const feedStoryId = await publishFeedStory({
    userId: context.userId,
    sourceType: "short_story",
    sourceId: shortStoryId,
    title: story.title,
    excerpt: story.excerpt,
    styleId
  });

  const commentJobId = await createGenerationJob({
    jobType: "ai_comment_generate",
    payload: {
      feedStoryId,
      bookTitle: book.title,
      storyTitle: story.title
    }
  });
  await markGenerationJobRunning(commentJobId);

  let commentContent = buildComment(book.title, context.persona);

  try {
    commentContent = await generateCommentWithLlm({
      bookTitle: book.title,
      storyTitle: story.title,
      storyExcerpt: story.excerpt,
      persona: context.persona,
      styleKey: getCommentStyleKey(book)
    });
    await markGenerationJobFinished(commentJobId, "succeeded");
  } catch (error) {
    const commentError = error instanceof Error ? error.message : "Unknown AI comment generation error";
    console.error("[AgentStory][comment] falling back to template", {
      bookSlug: book.slug,
      error: commentError
    });
    await markGenerationJobFinished(commentJobId, "failed", commentError);
  }

  await ensureFeedStoryComment(
    feedStoryId,
    context.userId,
    context.animalProfileId,
    styleIds.get(getCommentStyleKey(book)) ?? null,
    commentContent
  );

  return {
    shortStoryId,
    usedFallback: Boolean(generationError)
  };
}

export async function createNextSerialEpisode(force = true) {
  const context = await requireAuthenticatedAppContext();
  const episodeId = await ensureSerialProgress(context, force);

  return {
    episodeId,
    created: Boolean(episodeId)
  };
}

export async function getSerialMeta() {
  const context = await getAuthenticatedAppContext();

  if (!context) {
    return {
      episodeCount: 0,
      canGenerateNow: false,
      nextGenerateAt: null,
      currentBookTitle: null
    } satisfies SerialMetaView;
  }

  await ensureSerialProgress(context, false);
  const thread = await getActiveThreadRow(context.userId);

  if (!thread) {
    return {
      episodeCount: 0,
      canGenerateNow: true,
      nextGenerateAt: null,
      currentBookTitle: null
    } satisfies SerialMetaView;
  }

  const serialEpisodes = await getSerialEpisodes();
  const currentBookTitle = serialEpisodes[0]?.bookTitle ?? null;

  return {
    episodeCount: serialEpisodes.length,
    canGenerateNow: !thread.next_generate_at || new Date(thread.next_generate_at).getTime() <= Date.now(),
    nextGenerateAt: thread.next_generate_at,
    currentBookTitle
  } satisfies SerialMetaView;
}

export async function getSerialEpisodes() {
  const context = await getAuthenticatedAppContext();

  if (!context) {
    return [];
  }

  await ensureSerialProgress(context, false);

  const { rows } = await sql<EpisodeRow>(
    `
      SELECT
        e.id,
        e.title,
        e.excerpt,
        e.content,
        e.generated_at,
        b.title AS book_title,
        c.key AS category_key,
        ss.name AS style_name,
        gj.status AS generation_status
      FROM story_episodes e
      LEFT JOIN story_books b ON b.id = e.book_id
      LEFT JOIN story_categories c ON c.id = b.category_id
      LEFT JOIN story_styles ss ON ss.id = e.style_id
      LEFT JOIN generation_jobs gj ON gj.id = e.job_id
      WHERE e.user_id = $1
        AND e.status = 'published'
      ORDER BY e.episode_no DESC
    `,
    [context.userId]
  );

  const serialEpisodes = filterPrimaryEntryViewsToFairy(
    rows.map((row, index): SerialEpisodeView => ({
      id: row.id,
      title: sanitizeDisplayTitle(row.title ?? "未命名章节"),
      excerpt: row.excerpt ?? "",
      content: row.content ?? "",
      bookTitle: row.book_title ?? "未知故事",
      bookCategoryKey: row.category_key,
      styleName: row.style_name,
      generationLabel: getGenerationLabel(row.generation_status),
      generatedAt: row.generated_at ?? "",
      statusLabel: index === 0 ? "最新章节" : "历史章节"
    }))
  );

  return serialEpisodes.map((episode, index) => ({
    ...episode,
    statusLabel: index === 0 ? "最新章节" : "历史章节"
  }));
}

export async function getLatestSerialPreview() {
  const episodes = await getSerialEpisodes();
  return episodes[0] ?? null;
}

export async function getShortStories() {
  const context = await getAuthenticatedAppContext();

  if (!context) {
    return [];
  }

  const { rows } = await sql<ShortStoryRow>(
    `
      SELECT
        s.id,
        s.title,
        s.excerpt,
        s.content,
        s.trigger_scene,
        s.generated_at,
        b.title AS book_title,
        c.name AS category_name,
        c.key AS category_key,
        ss.name AS style_name,
        gj.status AS generation_status
      FROM short_stories s
      LEFT JOIN story_books b ON b.id = s.book_id
      LEFT JOIN story_categories c ON c.id = b.category_id
      LEFT JOIN story_styles ss ON ss.id = s.style_id
      LEFT JOIN generation_jobs gj ON gj.id = s.job_id
      WHERE s.user_id = $1
        AND s.status = 'published'
      ORDER BY s.generated_at DESC NULLS LAST, s.created_at DESC
    `,
    [context.userId]
  );

  return filterPrimaryEntryViewsToFairy(
    rows.map(
      (row): ShortStoryView => ({
        id: row.id,
        title: sanitizeDisplayTitle(row.title ?? "未命名短篇"),
        excerpt: row.excerpt ?? "",
        content: row.content ?? "",
        triggerScene: row.trigger_scene,
        bookTitle: row.book_title ?? "未知故事",
        categoryName: row.category_name ?? "未分类",
        bookCategoryKey: row.category_key,
        styleName: row.style_name,
        generationLabel: getGenerationLabel(row.generation_status),
        generatedAt: row.generated_at ?? ""
      })
    )
  );
}

export async function getTimelineItems() {
  const context = await getAuthenticatedAppContext();

  if (!context) {
    return [];
  }

  await ensureSerialProgress(context, false);

  const { rows } = await sql<TimelineRow>(
    `
      SELECT
        t.id,
        t.title,
        t.excerpt,
        t.source_type,
        b.title AS book_title,
        t.happened_at
      FROM timeline_items t
      LEFT JOIN story_books b ON b.id = t.book_id
      WHERE t.user_id = $1
      ORDER BY t.happened_at DESC, t.created_at DESC
    `,
    [context.userId]
  );

  return rows.map(
    (row): TimelineItemView => ({
      id: row.id,
      title: row.title,
      excerpt: row.excerpt,
      sourceType: row.source_type,
      bookTitle: row.book_title,
      happenedAt: row.happened_at
    })
  );
}

export async function getDiscoverStories() {
  const context = await getAuthenticatedAppContext();

  const { rows } = await sql<FeedStoryRow>(
    `
      SELECT
        f.id,
        f.title,
        f.excerpt,
        f.source_type,
        f.published_at,
        f.like_count,
        b.title AS book_title,
        c.key AS category_key,
        ss.name AS style_name,
        (
          CASE
            WHEN f.source_type = 'episode' THEN (
              SELECT gj.status
              FROM story_episodes e
              LEFT JOIN generation_jobs gj ON gj.id = e.job_id
              WHERE e.id = f.source_id
              LIMIT 1
            )
            WHEN f.source_type = 'short_story' THEN (
              SELECT gj.status
              FROM short_stories s
              LEFT JOIN generation_jobs gj ON gj.id = s.job_id
              WHERE s.id = f.source_id
              LIMIT 1
            )
            ELSE NULL
          END
        ) AS generation_status,
        u.display_name AS author_display_name,
        ap.animal_name AS author_animal_name,
        ap.display_label AS author_display_label,
        EXISTS (
          SELECT 1
          FROM story_likes sl
          WHERE sl.feed_story_id = f.id
            AND sl.user_id = $1
        ) AS liked_by_current_user
      FROM feed_stories f
      JOIN users u ON u.id = f.user_id
      LEFT JOIN story_styles ss ON ss.id = f.style_id
      LEFT JOIN animal_profiles ap ON ap.user_id = u.id
      LEFT JOIN story_books b
        ON b.id = (
          CASE
            WHEN f.source_type = 'episode' THEN (
              SELECT e.book_id FROM story_episodes e WHERE e.id = f.source_id
            )
            WHEN f.source_type = 'short_story' THEN (
              SELECT s.book_id FROM short_stories s WHERE s.id = f.source_id
            )
            ELSE NULL
          END
        )
      LEFT JOIN story_categories c ON c.id = b.category_id
      WHERE f.visibility = 'public'
      ORDER BY f.published_at DESC
    `,
    [context?.userId ?? null]
  );

  const feedStories = await Promise.all(
    filterPrimaryEntryViewsToFairy(
      rows.map((row) => ({
        ...row,
        bookCategoryKey: row.category_key
      }))
    ).map(async (row): Promise<FeedStoryView> => {
      const { rows: commentRows } = await sql<CommentRow>(
        `
          SELECT c.id, c.content, ap.animal_name
          FROM ai_comments c
          LEFT JOIN animal_profiles ap ON ap.id = c.animal_profile_id
          WHERE c.feed_story_id = $1
            AND c.status = 'published'
          ORDER BY c.created_at ASC
        `,
        [row.id]
      );

      return {
        id: row.id,
        title: sanitizeDisplayTitle(row.title),
        excerpt: row.excerpt ?? "",
        sourceType: row.source_type,
        bookTitle: row.book_title,
        bookCategoryKey: row.bookCategoryKey,
        styleName: row.style_name,
        generationLabel: getGenerationLabel(row.generation_status),
        publishedAt: row.published_at,
        likeCount: row.like_count,
        likedByCurrentUser: row.liked_by_current_user,
        authorLabel: `${row.author_animal_name ?? row.author_display_name} · ${row.author_display_label ?? "动物人格"}`,
        comments: commentRows.map((comment) => ({
          id: comment.id,
          content: comment.content ?? "",
          animalName: comment.animal_name ?? "分身"
        }))
      };
    })
  );

  return feedStories;
}

export async function toggleDiscoverLike(feedStoryId: string) {
  const context = await requireAuthenticatedAppContext();

  const { rows: likeRows } = await sql<IdRow>(
    `
      SELECT id
      FROM story_likes
      WHERE feed_story_id = $1
        AND user_id = $2
      LIMIT 1
    `,
    [feedStoryId, context.userId]
  );

  if (likeRows.length > 0) {
    await sql("DELETE FROM story_likes WHERE id = $1", [likeRows[0].id]);
    await sql(
      `
        UPDATE feed_stories
        SET like_count = GREATEST(like_count - 1, 0),
            updated_at = NOW()
        WHERE id = $1
      `,
      [feedStoryId]
    );
    return;
  }

  await sql(
    `
      INSERT INTO story_likes (feed_story_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (feed_story_id, user_id) DO NOTHING
    `,
    [feedStoryId, context.userId]
  );

  await sql(
    `
      UPDATE feed_stories
      SET like_count = like_count + 1,
          updated_at = NOW()
      WHERE id = $1
    `,
    [feedStoryId]
  );
}
