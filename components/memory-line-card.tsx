import React from "react";
import type { ReactNode } from "react";
import { MemoryLineBookPanel } from "@/components/memory-line-book-panel";
import type { PersonalLineBookView } from "@/lib/story-experience";
import type { StoryBook } from "@/lib/story-data";
import { formatEpisodeCountLabel, replaceEpisodeSequenceNumbersWithChinese } from "@/lib/story-experience-helpers";
import {
  getPersonalLineDailyStatusLabel,
  getPersonalLineGenerationBadgeLabel,
  getPersonalLineListNotice
} from "@/lib/personal-line-presentation";
import { getStyleBadgeClass } from "@/lib/story-style";

type MemoryLineCardProps = {
  line: PersonalLineBookView;
  book?: StoryBook | null;
  generatedTimeLabel?: string | null;
  primaryAction: ReactNode;
  secondaryAction?: ReactNode;
  emptyExcerpt?: string;
};

export function MemoryLineCard({
  line,
  book,
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
    <article
      className={`grid items-start gap-4 sm:gap-5 lg:gap-6 ${
        book ? "grid-cols-1 sm:grid-cols-[112px_minmax(0,1fr)] lg:grid-cols-[148px_minmax(0,1fr)] xl:grid-cols-[168px_minmax(0,1fr)]" : "grid-cols-1"
      }`}
    >
      {book ? (
        <div className="hidden sm:block">
          <MemoryLineBookPanel book={book} />
        </div>
      ) : null}

      <section className="min-w-0 rounded-[30px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.88)] p-5 shadow-[var(--shadow-medium)] sm:p-6 lg:p-7">
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
            {formatEpisodeCountLabel(line.episodeCount)}
          </span>
          {line.lockedStyleName ? (
            <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getStyleBadgeClass(line.lockedStyleName)}`}>
              {line.lockedStyleName}
            </span>
          ) : null}
        </div>

        <div className="mt-4 min-w-0">
          {book ? (
            <div className="flex items-center gap-3 sm:hidden" data-testid="memory-line-mobile-book-heading">
              <MemoryLineBookPanel book={book} variant="mobileInline" />
              <p className="min-w-0 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                《{line.sourceBookTitle}》
              </p>
            </div>
          ) : null}

          <p
            className={`text-s font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)] ${
              book ? "hidden sm:block" : ""
            }`}
          >
            《{line.sourceBookTitle}》
          </p>
          <h2
            className="display-font mt-3 text-[clamp(1.95rem,7vw,2.45rem)] leading-[1.12] text-[var(--text-primary)] sm:mt-2 sm:text-[clamp(2.35rem,2vw,3.15rem)] sm:leading-[1.18]"
            data-testid="memory-line-story-title"
          >
            {replaceEpisodeSequenceNumbersWithChinese(line.latestEpisodeTitle ?? line.title)}
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)] sm:text-base sm:leading-8">
            {line.latestEpisodeExcerpt ?? emptyExcerpt}
          </p>
          <p className="mt-5 rounded-[22px] bg-[rgba(255,255,255,0.72)] px-4 py-3 text-sm leading-7 text-[var(--text-secondary)] sm:px-5 sm:text-base sm:leading-8">
            {notice}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {primaryAction}
          {secondaryAction}
        </div>
      </section>
    </article>
  );
}
