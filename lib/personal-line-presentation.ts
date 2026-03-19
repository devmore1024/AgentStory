import type { EpisodeGenerationState } from "@/lib/story-experience-helpers";

export type PersonalLineActionView =
  | {
      kind: "link";
      label: string;
      href: string;
    }
  | {
      kind: "form";
      label: string;
      pendingLabel: string;
    }
  | {
      kind: "pending";
      label: string;
    };

type PersonalLineActionInput = {
  sourceBookSlug: string;
  latestEpisodeId: string | null;
  latestPublishedEpisodeId?: string | null;
  todayGenerated: boolean;
  generationState: EpisodeGenerationState;
  isCompleted?: boolean;
};

export function isPersonalLineGenerating(generationState: EpisodeGenerationState) {
  return generationState === "queued" || generationState === "running";
}

export function hasPersonalLineFailed(generationState: EpisodeGenerationState) {
  return generationState === "failed";
}

export function getPersonalLineDailyStatusLabel(todayGenerated: boolean, isCompleted = false) {
  if (isCompleted) {
    return "已结束";
  }

  return todayGenerated ? "今日已更新" : "等待今天续写";
}

export function getPersonalLineGenerationBadgeLabel(generationState: EpisodeGenerationState) {
  if (isPersonalLineGenerating(generationState)) {
    return "生成中";
  }

  if (hasPersonalLineFailed(generationState)) {
    return "生成失败";
  }

  return null;
}

export function getPersonalLineListNotice(params: {
  todayGenerated: boolean;
  generationState: EpisodeGenerationState;
  generatedTimeLabel?: string | null;
  isCompleted?: boolean;
}) {
  if (params.isCompleted) {
    return "这条冒险已经走到结尾了。你可以回看整段故事，但它不会再继续往前长。";
  }

  if (params.todayGenerated) {
    return params.generatedTimeLabel
      ? `今日已更新，冒险线每天只会继续一章，明天再来看下一章。`
      : "今天这一章已经更新，冒险线每天只会继续一章，明天再来看下一章。";
  }

  if (isPersonalLineGenerating(params.generationState)) {
    return "这一章已经开始生成，进入后会自动刷新。";
  }

  if (hasPersonalLineFailed(params.generationState)) {
    return "这一章暂时卡住了，重新触发后会继续往前写。";
  }

  return "今天还没续写，进入后会开始生成下一章。";
}

export function getPersonalLineDetailRuleNotice(params: {
  todayGenerated: boolean;
  generatedTimeLabel?: string | null;
  isCompleted?: boolean;
}) {
  if (params.isCompleted || !params.todayGenerated) {
    return null;
  }

  return params.generatedTimeLabel
    ? `今日已更新。冒险线每天只会继续一章，明天再回来，会看到下一章继续长出来。`
    : "今天这一章已经更新。冒险线每天只会继续一章，明天再回来，会看到下一章继续长出来。";
}

function buildEpisodeAnchorHref(sourceBookSlug: string, episodeId: string | null) {
  return episodeId ? `/memory/${sourceBookSlug}#episode-${episodeId}` : `/memory/${sourceBookSlug}`;
}

export function getPersonalLineListPrimaryAction(params: PersonalLineActionInput): PersonalLineActionView {
  if (params.isCompleted) {
    return {
      kind: "link",
      label: "阅读冒险",
      href: buildEpisodeAnchorHref(params.sourceBookSlug, params.latestEpisodeId)
    };
  }

  if (isPersonalLineGenerating(params.generationState)) {
    return {
      kind: "link",
      label: "查看生成进度",
      href: `/memory/${params.sourceBookSlug}`
    };
  }

  if (hasPersonalLineFailed(params.generationState)) {
    return {
      kind: "form",
      label: "重新生成这一章",
      pendingLabel: "正在重新生成这一章..."
    };
  }

  if (params.todayGenerated) {
    return {
      kind: "link",
      label: "今日故事",
      href: buildEpisodeAnchorHref(params.sourceBookSlug, params.latestEpisodeId)
    };
  }

  return {
    kind: "form",
    label: "继续冒险",
    pendingLabel: "正在回到故事里冒险..."
  };
}

export function getPersonalLineDetailPrimaryAction(params: PersonalLineActionInput): PersonalLineActionView {
  if (params.isCompleted) {
    return {
      kind: "link",
      label: "阅读冒险",
      href: buildEpisodeAnchorHref(params.sourceBookSlug, params.latestPublishedEpisodeId ?? params.latestEpisodeId)
    };
  }

  if (isPersonalLineGenerating(params.generationState)) {
    return {
      kind: "pending",
      label: "这一章正在生成中"
    };
  }

  if (hasPersonalLineFailed(params.generationState)) {
    return {
      kind: "form",
      label: "重新生成这一章",
      pendingLabel: "正在重新生成这一章..."
    };
  }

  if (params.todayGenerated) {
    return {
      kind: "link",
      label: "今日故事",
      href: buildEpisodeAnchorHref(params.sourceBookSlug, params.latestPublishedEpisodeId ?? params.latestEpisodeId)
    };
  }

  return {
    kind: "form",
    label: "继续冒险",
    pendingLabel: "正在回到故事里冒险..."
  };
}
