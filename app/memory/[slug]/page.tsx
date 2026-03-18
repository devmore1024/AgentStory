import React from "react";
import type { Route } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { publishCompanionFromPersonalAction, startOrOpenPersonalLineAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { MemoryDetailHero } from "@/components/memory-detail-hero";
import { PageBackButton } from "@/components/page-back-button";
import { StateCard } from "@/components/state-card";
import { StoryGenerationWatcher } from "@/components/story-generation-watcher";
import { SubmitButton } from "@/components/submit-button";
import {
  getPersonalLineDetailPrimaryAction,
  getPersonalLineDetailRuleNotice,
  hasPersonalLineFailed,
  isPersonalLineGenerating
} from "@/lib/personal-line-presentation";
import { formatAppTime } from "@/lib/story-experience-helpers";
import { getAuthenticatedAppContext, getPersonalLineDetail } from "@/lib/story-experience";

export const dynamic = "force-dynamic";

export default async function MemoryDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [line, currentContext] = await Promise.all([getPersonalLineDetail(slug, { ensureToday: true }), getAuthenticatedAppContext()]);

  if (!line) {
    if (currentContext) {
      redirect(`/books/${slug}/enter` as Route);
    }

    notFound();
  }

  const latestPublishedEpisode = line.episodes.at(-1) ?? null;
  const canPublishCompanion = Boolean(latestPublishedEpisode?.id) && !line.activeCompanionThreadId;
  const isGenerating = isPersonalLineGenerating(line.generationState);
  const hasFailedGeneration = hasPersonalLineFailed(line.generationState);
  const shouldShowWaitingState = line.episodes.length === 0 && !isGenerating && !hasFailedGeneration;
  const generatedTimeLabel = line.todayGenerated ? formatAppTime(line.latestEpisodeGeneratedAt) : null;
  const dailyRuleNotice = getPersonalLineDetailRuleNotice({
    todayGenerated: line.todayGenerated,
    generatedTimeLabel,
    isCompleted: line.isCompleted
  });
  const primaryAction = currentContext
    ? getPersonalLineDetailPrimaryAction({
        sourceBookSlug: slug,
        latestEpisodeId: line.latestEpisodeId,
        latestPublishedEpisodeId: latestPublishedEpisode?.id ?? null,
        todayGenerated: line.todayGenerated,
        generationState: line.generationState,
        isCompleted: line.isCompleted
      })
    : null;

  return (
    <AppShell activeTab="memory">
      <StoryGenerationWatcher threadId={line.threadId} active={isGenerating} />
      <div className="grid gap-6">
        <PageBackButton fallbackHref="/memory" title="冒险故事" />

        <MemoryDetailHero
          line={line}
          generatedTimeLabel={generatedTimeLabel}
          dailyRuleNotice={dailyRuleNotice}
          actions={
            <>
              {primaryAction ? (
                primaryAction.kind === "pending" ? (
                  <div className="inline-flex min-h-11 items-center rounded-full bg-[rgba(95,127,98,0.14)] px-5 py-3 text-sm font-semibold text-[var(--accent-moss)]">
                    {primaryAction.label}
                  </div>
                ) : primaryAction.kind === "form" ? (
                  <form action={startOrOpenPersonalLineAction}>
                    <input type="hidden" name="slug" value={slug} />
                    <SubmitButton idleLabel={primaryAction.label} pendingLabel={primaryAction.pendingLabel} />
                  </form>
                ) : (
                  <a
                    href={primaryAction.href}
                    className="inline-flex min-h-11 items-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-[var(--shadow-small)]"
                  >
                    {primaryAction.label}
                  </a>
                )
              ) : null}

              {canPublishCompanion ? (
                <form action={publishCompanionFromPersonalAction}>
                  <input type="hidden" name="originEpisodeId" value={latestPublishedEpisode?.id ?? ""} />
                  <SubmitButton idleLabel="开始同行" pendingLabel="正在公开..." kind="secondary" />
                </form>
              ) : line.activeCompanionThreadId ? (
                <Link
                  href={`/adventure/${line.activeCompanionThreadId}` as Route}
                  className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-default)] px-5 py-3 text-sm font-semibold text-[var(--text-secondary)]"
                >
                  去看同行故事
                </Link>
              ) : null}

              
            </>
          }
        />

        {isGenerating ? (
          <StateCard
            eyebrow="生成中"
            title={line.latestEpisodeTitle ?? "这一章正在生成中"}
            description={
              line.latestEpisodeExcerpt ??
              "新的冒险已经入队，页面会自动刷新。你可以先留在这里等它写完，也可以稍后回来。"
            }
          />
        ) : null}

        {hasFailedGeneration ? (
          <StateCard
            eyebrow="生成失败"
            title={line.latestEpisodeTitle ?? "这一章暂时卡住了"}
            description={line.latestEpisodeExcerpt ?? "这次生成没有成功落下来，你可以立刻重新试一次。"}
          />
        ) : null}

        {line.episodes.length > 0 ? (
          <div className="grid gap-4">
            {line.episodes
              .slice()
              .reverse()
              .map((episode) => (
                <article
                  key={episode.id}
                  id={`episode-${episode.id}`}
                  className="scroll-mt-24 rounded-[28px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.86)] p-6 shadow-[var(--shadow-medium)]"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[var(--accent-moss-light)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-moss)]">
                      第 {episode.episodeNo} 章
                    </span>
                    <span className="rounded-full bg-[rgba(255,255,255,0.75)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                      由 {episode.authorDisplayName} 写下
                    </span>
                    {episode.styleName ? (
                      <span className="rounded-full bg-[rgba(255,255,255,0.75)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                        {episode.styleName}
                      </span>
                    ) : null}
                  </div>
                  <h2 className="display-font mt-4 text-3xl text-[var(--text-primary)]">{episode.title}</h2>
                  <p className="mt-3 text-base leading-8 text-[var(--text-secondary)]">{episode.excerpt}</p>
                  <div className="mt-4 rounded-[22px] bg-[rgba(255,255,255,0.68)] p-4">
                    <p className="whitespace-pre-line text-sm leading-7 text-[var(--text-secondary)]">{episode.content}</p>
                  </div>
                </article>
              ))}
          </div>
        ) : shouldShowWaitingState ? (
          <StateCard
            eyebrow="等待第一段"
            title="这条冒险线还没有真正落下第一篇"
            description="分身已经替你进去了，等第一段内容写完后，这里就会开始按顺序保留整条主线。"
          />
        ) : null}
      </div>
    </AppShell>
  );
}
