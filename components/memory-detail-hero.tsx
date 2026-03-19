import React from "react";
import type { ReactNode } from "react";
import type { PersonalLineDetailView } from "@/lib/story-experience";
import { formatEpisodeCountLabel, replaceEpisodeSequenceNumbersWithChinese } from "@/lib/story-experience-helpers";
import {
  getPersonalLineDailyStatusLabel,
  getPersonalLineGenerationBadgeLabel
} from "@/lib/personal-line-presentation";
import { getStyleBadgeClass } from "@/lib/story-style";

type MemoryDetailHeroProps = {
  line: PersonalLineDetailView;
  actions?: ReactNode;
  generatedTimeLabel?: string | null;
  dailyRuleNotice?: string | null;
};

export function MemoryDetailHero({ line, actions, generatedTimeLabel, dailyRuleNotice }: MemoryDetailHeroProps) {
  const generationBadgeLabel = getPersonalLineGenerationBadgeLabel(line.generationState);

  return (
    <section className="rounded-[30px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.84)] p-6 shadow-[var(--shadow-medium)]">
      <div className="flex flex-wrap items-center gap-2">
        {line.activeCompanionThreadId ? (
          <span className="rounded-full bg-[rgba(255,255,255,0.74)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
            同行已开启
          </span>
        ) : null}
        <span className="rounded-full bg-[var(--accent-moss-light)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-moss)]">
          {getPersonalLineDailyStatusLabel(line.todayGenerated)}
        </span>
        {generationBadgeLabel ? (
          <span className="rounded-full bg-[rgba(255,244,214,0.92)] px-3 py-1.5 text-xs font-semibold text-[var(--apricot)]">
            {generationBadgeLabel}
          </span>
        ) : null}
        {generatedTimeLabel ? (
          <span className="rounded-full bg-[var(--sky-light)] px-3 py-1.5 text-xs font-semibold text-[var(--sky)]">
            今日 {generatedTimeLabel} 更新
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

      <p className="mt-4 text-lm font-semibold tracking-[0.08em] text-[var(--text-muted)] sm:text-base">
        《{line.sourceBookTitle}》
      </p>
      <h1 className="display-font mt-2 text-3xl leading-[1.16] text-[var(--text-primary)] sm:text-[2.75rem]">
        {replaceEpisodeSequenceNumbersWithChinese(line.latestEpisodeTitle ?? line.title)}
      </h1>
      <p className="mt-3 max-w-3xl text-base leading-8 text-[var(--text-secondary)]">
        {line.latestEpisodeExcerpt ?? "你的分身已经走进这本童话，接下来会沿着这条主线继续冒险。"}
      </p>
      {dailyRuleNotice ? (
        <p className="mt-4 max-w-3xl rounded-[20px] bg-[rgba(255,255,255,0.68)] px-4 py-3 text-sm leading-7 text-[var(--text-secondary)]">
          {dailyRuleNotice}
        </p>
      ) : null}

      {actions ? <div className="mt-5 flex flex-wrap gap-3">{actions}</div> : null}
    </section>
  );
}
