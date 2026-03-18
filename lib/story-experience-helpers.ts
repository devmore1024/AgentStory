export type AdventureActionState = "continue" | "join" | "watch";
export type StoryFootprintFilter = "owned" | "joined";
export type EpisodeRecordStatus = "queued" | "generating" | "published" | "failed" | null;
export type GenerationJobStatus = "queued" | "running" | "succeeded" | "failed" | null;
export type EpisodeGenerationState = "idle" | "queued" | "running" | "failed";
export type StoryTimelineSourceType =
  | "adventure_episode"
  | "personal_episode"
  | "companion_episode"
  | "bedtime_memory"
  | "episode"
  | "short_story";
export type VisibleStoryTimelineSourceType = Exclude<StoryTimelineSourceType, "bedtime_memory">;

type CompanionThreadGroupInput = {
  sourceBookSlug: string | null;
  sourceBookTitle: string;
  sourceBookCategoryKey: string | null;
};

export type CompanionThreadGroup<T extends CompanionThreadGroupInput> = {
  sourceBookSlug: string | null;
  sourceBookTitle: string;
  sourceBookCategoryKey: string | null;
  threads: T[];
};

type AdventureActionParams = {
  isOwner: boolean;
  isParticipant: boolean;
  isCompleted: boolean;
  isFull: boolean;
};

export function getAdventureActionState(params: AdventureActionParams): AdventureActionState {
  if (params.isCompleted) {
    return "watch";
  }

  if (params.isOwner || params.isParticipant) {
    return "continue";
  }

  return params.isFull ? "watch" : "join";
}

export function getCompanionActionLabel(actionState: AdventureActionState) {
  if (actionState === "continue") {
    return "继续同行";
  }

  if (actionState === "join") {
    return "加入同行";
  }

  return "阅读";
}

export function normalizeStoryFootprintFilter(filter?: string | null): StoryFootprintFilter {
  return filter === "joined" ? "joined" : "owned";
}

export function filterAdventureThreadsByFootprint<T extends { isOwner: boolean; isParticipant: boolean }>(
  threads: T[],
  filter: StoryFootprintFilter
) {
  if (filter === "joined") {
    return threads.filter((thread) => !thread.isOwner && thread.isParticipant);
  }

  return threads.filter((thread) => thread.isOwner);
}

export function getEpisodeGenerationState(
  episodeStatus: EpisodeRecordStatus,
  jobStatus: GenerationJobStatus
): EpisodeGenerationState {
  if (episodeStatus === "failed" || jobStatus === "failed") {
    return "failed";
  }

  if (episodeStatus === "generating" || jobStatus === "running") {
    return "running";
  }

  if (episodeStatus === "queued" || jobStatus === "queued") {
    return "queued";
  }

  return "idle";
}

export function sanitizeCompanionThreadTitle(title: string, sourceBookTitle?: string | null) {
  const trimmed = title.trim();

  if (sourceBookTitle && trimmed.includes("开出的一条冒险线")) {
    return `在《${sourceBookTitle}》里重新相遇`;
  }

  return trimmed
    .replace(/新的冒险正在展开/g, "新的同行正在展开")
    .replace(/开出的一条冒险线/g, "重新相遇")
    .replace(/冒险线/g, "同行")
    .replace(/冒险/g, "同行");
}

export function sanitizePersonalAdventureTitle(title: string, sourceBookTitle?: string | null) {
  const trimmed = title.trim();

  if (sourceBookTitle && trimmed === `我回到《${sourceBookTitle}》里`) {
    return `我在《${sourceBookTitle}》里的冒险`;
  }

  return trimmed
    .replace(/新的回去正在展开/g, "新的冒险正在展开")
    .replace(/准备回去/g, "准备冒险")
    .replace(/正在回去/g, "正在冒险")
    .replace(/第\s*(\d+)\s*次回去/g, "第 $1 次冒险")
    .replace(/我回到《(.+?)》里/g, "我在《$1》里的冒险")
    .replace(/回去线/g, "冒险线");
}

export function hasFreshSecondMeCache(expiresAt: string | null, now = new Date()) {
  if (!expiresAt) {
    return false;
  }

  const expiresAtTime = new Date(expiresAt).getTime();

  if (Number.isNaN(expiresAtTime)) {
    return false;
  }

  return expiresAtTime > now.getTime();
}

export function getCurrentAppDate(timeZone = "Asia/Shanghai", now = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  const parts = formatter.formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Unable to format app date.");
  }

  return `${year}-${month}-${day}`;
}

export function wasGeneratedOnAppDate(
  generatedAt: string | null,
  appDate = getCurrentAppDate(),
  timeZone = "Asia/Shanghai"
) {
  if (!generatedAt) {
    return false;
  }

  const timestamp = new Date(generatedAt);

  if (Number.isNaN(timestamp.getTime())) {
    return false;
  }

  return getCurrentAppDate(timeZone, timestamp) === appDate;
}

export function groupCompanionThreadsByBook<T extends CompanionThreadGroupInput>(threads: T[]) {
  const groups = new Map<string, CompanionThreadGroup<T>>();

  for (const thread of threads) {
    const key = thread.sourceBookSlug ?? `unknown:${thread.sourceBookTitle}`;
    const existing = groups.get(key);

    if (existing) {
      existing.threads.push(thread);
      continue;
    }

    groups.set(key, {
      sourceBookSlug: thread.sourceBookSlug,
      sourceBookTitle: thread.sourceBookTitle,
      sourceBookCategoryKey: thread.sourceBookCategoryKey,
      threads: [thread]
    });
  }

  return Array.from(groups.values());
}

export function isVisibleStoryTimelineSource(
  sourceType: StoryTimelineSourceType
): sourceType is VisibleStoryTimelineSourceType {
  return sourceType !== "bedtime_memory";
}
