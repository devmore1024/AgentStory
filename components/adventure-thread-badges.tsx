import React from "react";
import { ParticipantAvatarStack } from "@/components/participant-avatar-stack";
import type { AdventureParticipantPreview } from "@/lib/story-experience";
import { formatEpisodeProgressLabel, type EpisodeGenerationState } from "@/lib/story-experience-helpers";
import { getStyleBadgeClass } from "@/lib/story-style";

type AdventureThreadBadgesProps = {
  isOwner: boolean;
  isCompleted: boolean;
  generationState: EpisodeGenerationState;
  participants: AdventureParticipantPreview[];
  participantCount: number;
  participantLimit: number;
  episodeCount: number;
  episodeLimit: number;
  lockedStyleName?: string | null;
  variant?: "default" | "listCompact";
};

export function AdventureThreadBadges({
  isOwner,
  isCompleted,
  generationState,
  participants,
  participantCount,
  participantLimit,
  episodeCount,
  episodeLimit,
  lockedStyleName,
  variant = "default"
}: AdventureThreadBadgesProps) {
  const isGenerating = generationState === "queued" || generationState === "running";
  const isCompact = variant === "listCompact";
  const basePillClass = isCompact ? "px-2.5 py-1.5 text-[11px]" : "px-3 py-1.5 text-xs";

  return (
    <div className="flex flex-wrap items-center gap-2" data-testid="adventure-thread-badges">
      {isCompact ? (
        <span
          className="inline-flex items-center gap-2 rounded-full bg-[rgba(245,241,235,0.94)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--text-secondary)]"
          data-testid="adventure-badge-participants"
        >
          <ParticipantAvatarStack
            participants={participants}
            maxVisible={5}
            size="xs"
            testId="adventure-badge-avatar-stack"
          />
          <span>
            <span>{participantCount}/{participantLimit}</span>
            <span className="hidden sm:inline"> 位同行者</span>
          </span>
        </span>
      ) : null}
      {isOwner ? (
        <span
          className={`rounded-full bg-[rgba(255,238,221,0.92)] font-semibold text-[var(--apricot)] ${basePillClass}`}
          data-testid="adventure-badge-owner"
        >
          我发起的
        </span>
      ) : null}
      <span
        className={`rounded-full bg-[var(--accent-moss-light)] font-semibold text-[var(--accent-moss)] ${basePillClass}`}
        data-testid="adventure-badge-status"
      >
        {isCompleted ? "已完结" : "进行中"}
      </span>
      {lockedStyleName ? (
        <span
          className={`rounded-full border font-semibold ${basePillClass} ${getStyleBadgeClass(lockedStyleName)}`}
          data-testid="adventure-badge-style"
        >
          {lockedStyleName}
        </span>
      ) : null}
      {isGenerating ? (
        <span
          className={`rounded-full bg-[rgba(255,244,214,0.92)] font-semibold text-[var(--apricot)] ${basePillClass}`}
          data-testid="adventure-badge-generation"
        >
          生成中
        </span>
      ) : null}
      {generationState === "failed" ? (
        <span
          className={`rounded-full bg-[rgba(255,232,228,0.92)] font-semibold text-[var(--apricot)] ${basePillClass}`}
          data-testid="adventure-badge-generation"
        >
          生成失败
        </span>
      ) : null}
      <span
        className={`rounded-full bg-[var(--apricot-light)] font-semibold text-[var(--apricot)] ${basePillClass}`}
        data-testid="adventure-badge-progress"
      >
        {formatEpisodeProgressLabel(episodeCount, episodeLimit)}
      </span>
    </div>
  );
}
