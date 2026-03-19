import React from "react";
import { formatEpisodeProgressLabel, type EpisodeGenerationState } from "@/lib/story-experience-helpers";

type AdventureThreadBadgesProps = {
  isOwner: boolean;
  isCompleted: boolean;
  generationState: EpisodeGenerationState;
  participantCount: number;
  participantLimit: number;
  episodeCount: number;
  episodeLimit: number;
};

export function AdventureThreadBadges({
  isOwner,
  isCompleted,
  generationState,
  participantCount,
  participantLimit,
  episodeCount,
  episodeLimit
}: AdventureThreadBadgesProps) {
  const isGenerating = generationState === "queued" || generationState === "running";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isOwner ? (
        <span className="rounded-full bg-[rgba(255,238,221,0.92)] px-3 py-1.5 text-xs font-semibold text-[var(--apricot)]">
          我发起的
        </span>
      ) : null}
      <span className="rounded-full bg-[var(--accent-moss-light)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-moss)]">
        {isCompleted ? "已完结" : "进行中"}
      </span>
      {isGenerating ? (
        <span className="rounded-full bg-[rgba(255,244,214,0.92)] px-3 py-1.5 text-xs font-semibold text-[var(--apricot)]">
          生成中
        </span>
      ) : null}
      {generationState === "failed" ? (
        <span className="rounded-full bg-[rgba(255,232,228,0.92)] px-3 py-1.5 text-xs font-semibold text-[var(--apricot)]">
          生成失败
        </span>
      ) : null}
      <span className="rounded-full bg-[var(--sky-light)] px-3 py-1.5 text-xs font-semibold text-[var(--sky)]">
        {participantCount}/{participantLimit} 人
      </span>
      <span className="rounded-full bg-[var(--apricot-light)] px-3 py-1.5 text-xs font-semibold text-[var(--apricot)]">
        {formatEpisodeProgressLabel(episodeCount, episodeLimit)}
      </span>
    </div>
  );
}
