import React from "react";
import type { ReactNode } from "react";
import type { PersonalLineDetailView } from "@/lib/story-experience";

type MemoryDetailHeroProps = {
  line: PersonalLineDetailView;
  actions?: ReactNode;
};

export function MemoryDetailHero({ line, actions }: MemoryDetailHeroProps) {
  return (
    <section className="rounded-[30px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.84)] p-6 shadow-[var(--shadow-medium)]">
      <div className="flex flex-wrap items-center gap-2">
        {line.activeCompanionThreadId ? (
          <span className="rounded-full bg-[rgba(255,255,255,0.74)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
            同行已开启
          </span>
        ) : null}
        <span className="rounded-full bg-[var(--accent-moss-light)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-moss)]">
          {line.todayGenerated ? "今日已更新" : "等待今天续写"}
        </span>
        <span className="rounded-full bg-[rgba(255,255,255,0.74)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
          共 {line.episodeCount} 章
        </span>
        {line.lockedStyleName ? (
          <span className="rounded-full bg-[rgba(255,255,255,0.74)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
            {line.lockedStyleName}
          </span>
        ) : null}
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">《{line.sourceBookTitle}》</p>
      <h1 className="display-font mt-2 text-4xl text-[var(--text-primary)]">{line.latestEpisodeTitle ?? line.title}</h1>
      <p className="mt-3 max-w-3xl text-base leading-8 text-[var(--text-secondary)]">
        {line.latestEpisodeExcerpt ?? "你的分身已经走进这本童话，接下来会沿着这条 personal 主线继续冒险。"}
      </p>

      {actions ? <div className="mt-5 flex flex-wrap gap-3">{actions}</div> : null}
    </section>
  );
}
