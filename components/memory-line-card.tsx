import React from "react";
import type { ReactNode } from "react";
import type { PersonalLineBookView } from "@/lib/story-experience";
import {
  getPersonalLineDailyStatusLabel,
  getPersonalLineGenerationBadgeLabel,
  getPersonalLineListNotice
} from "@/lib/personal-line-presentation";
import { getStyleBadgeClass } from "@/lib/story-style";

type MemoryLineCardProps = {
  line: PersonalLineBookView;
  generatedTimeLabel?: string | null;
  primaryAction: ReactNode;
  secondaryAction?: ReactNode;
  emptyExcerpt?: string;
};

export function MemoryLineCard({
  line,
  generatedTimeLabel,
  primaryAction,
  secondaryAction,
  emptyExcerpt
}: MemoryLineCardProps) {
  const generationBadgeLabel = getPersonalLineGenerationBadgeLabel(line.generationState);
  const notice = getPersonalLineListNotice({
    todayGenerated: line.todayGenerated,
    generationState: line.generationState,
    generatedTimeLabel,
    isCompleted: line.isCompleted
  });

  return (
    <article className="rounded-[30px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.86)] p-6 shadow-[var(--shadow-medium)]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[var(--accent-moss-light)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-moss)]">
          {getPersonalLineDailyStatusLabel(line.todayGenerated, line.isCompleted)}
        </span>
        {generationBadgeLabel ? (
          <span className="rounded-full bg-[rgba(255,244,214,0.92)] px-3 py-1.5 text-xs font-semibold text-[var(--apricot)]">
            {generationBadgeLabel}
          </span>
        ) : null}
        <span className="rounded-full bg-[rgba(255,255,255,0.74)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
          共 {line.episodeCount} 章
        </span>
        {line.lockedStyleName ? (
          <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getStyleBadgeClass(line.lockedStyleName)}`}>
            {line.lockedStyleName}
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        <p className="text-s font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">《{line.sourceBookTitle}》</p>
        <h2 className="display-font mt-2 text-2xl text-[var(--text-primary)]">{line.latestEpisodeTitle ?? line.title}</h2>
        <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{line.latestEpisodeExcerpt ?? emptyExcerpt}</p>
        <p className="mt-4 rounded-[20px] bg-[rgba(255,255,255,0.68)] px-4 py-3 text-sm leading-7 text-[var(--text-secondary)]">
          {notice}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {primaryAction}
        {secondaryAction}
      </div>
    </article>
  );
}
