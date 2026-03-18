import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { continueAdventureAction, joinAdventureAction } from "@/app/actions";
import { AdventureThreadBadges } from "@/components/adventure-thread-badges";
import { AppShell } from "@/components/app-shell";
import { PageBackButton } from "@/components/page-back-button";
import { StateCard } from "@/components/state-card";
import { StoryGenerationWatcher } from "@/components/story-generation-watcher";
import { getAdventureThreadDetail, getAuthenticatedAppContext } from "@/lib/story-experience";

export const dynamic = "force-dynamic";

export default async function AdventureThreadPage({
  params
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  const [thread, currentContext] = await Promise.all([getAdventureThreadDetail(threadId), getAuthenticatedAppContext()]);

  if (!thread) {
    notFound();
  }

  const isGenerating = thread.generationState === "queued" || thread.generationState === "running";
  const hasFailedGeneration = thread.generationState === "failed";
  const shouldShowWaitingState = thread.episodes.length === 0 && !isGenerating && !hasFailedGeneration;

  return (
    <AppShell activeTab="adventure">
      <StoryGenerationWatcher threadId={thread.id} active={isGenerating} />
      <div className="grid gap-6">
        <PageBackButton fallbackHref="/adventure" title="同行故事" />

        <section className="rounded-[30px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.84)] p-6 shadow-[var(--shadow-medium)]">
          <AdventureThreadBadges
            isOwner={thread.isOwner}
            isCompleted={thread.isCompleted}
            generationState={thread.generationState}
            participantCount={thread.participantCount}
            participantLimit={thread.participantLimit}
            episodeCount={thread.episodeCount}
            episodeLimit={thread.episodeLimit}
          />

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            《{thread.sourceBookTitle}》里的同行故事
          </p>
          <h1 className="display-font mt-2 text-4xl text-[var(--text-primary)]">{thread.title}</h1>
          <p className="mt-3 max-w-3xl text-base leading-8 text-[var(--text-secondary)]">
            {thread.lockedStyleName
              ? `这段同行已经定下 ${thread.lockedStyleName} 的气质。后面的人会沿着同一种感觉继续走，直到故事自然走完。`
              : "这段同行还在等第一篇替它慢慢定下整体气质。"}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {currentContext ? (
              thread.actionState === "continue" ? (
                isGenerating ? (
                  <div className="inline-flex min-h-11 items-center rounded-full bg-[rgba(95,127,98,0.14)] px-5 py-3 text-sm font-semibold text-[var(--accent-moss)]">
                    这一章正在生成中
                  </div>
                ) : (
                  <form action={continueAdventureAction}>
                    <input type="hidden" name="threadId" value={thread.id} />
                    <button
                      type="submit"
                      className="inline-flex min-h-11 items-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-[var(--shadow-small)]"
                    >
                      {hasFailedGeneration ? "重新生成这一段" : "继续同行"}
                    </button>
                  </form>
                )
              ) : thread.actionState === "join" ? (
                <form action={joinAdventureAction}>
                  <input type="hidden" name="threadId" value={thread.id} />
                  <button
                    type="submit"
                    className="inline-flex min-h-11 items-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-[var(--shadow-small)]"
                  >
                    加入同行
                  </button>
                </form>
              ) : null
            ) : (
              <Link
                href="/me?auth=required"
                className="inline-flex min-h-11 items-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-[var(--shadow-small)]"
              >
                登录后加入同行
              </Link>
            )}

            <Link
              href="/adventure"
              className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-default)] px-5 py-3 text-sm font-semibold text-[var(--text-secondary)]"
            >
              返回同行广场
            </Link>
          </div>
        </section>

        {isGenerating ? (
          <StateCard
            eyebrow="生成中"
            title={thread.latestEpisodeTitle ?? "新的篇章正在生成"}
            description={
              thread.latestEpisodeExcerpt ??
              "这一段冒险已经入队，页面会自动刷新。你可以先留在这里等它写完，也可以稍后回来。"
            }
          />
        ) : null}

        {hasFailedGeneration ? (
          <StateCard
            eyebrow="生成失败"
            title={thread.latestEpisodeTitle ?? "这一段冒险暂时卡住了"}
            description={thread.latestEpisodeExcerpt ?? "这次生成没有成功落下来，你可以立刻再试一次。"}
          />
        ) : null}

        {thread.episodes.length > 0 ? (
          <div className="grid gap-4">
            {thread.episodes.map((episode) => (
              <article
                key={episode.id}
                className="rounded-[28px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.86)] p-6 shadow-[var(--shadow-medium)]"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[var(--accent-moss-light)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-moss)]">
                    第 {episode.episodeNo} 章
                  </span>
                  <span className="rounded-full bg-[rgba(255,255,255,0.75)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                    由 {episode.authorDisplayName} 继续写下去
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
                  <p className="text-sm leading-7 text-[var(--text-secondary)] whitespace-pre-line">{episode.content}</p>
                </div>
              </article>
            ))}
          </div>
        ) : shouldShowWaitingState ? (
          <StateCard
            eyebrow="等待第一段"
            title="这段同行还没有真正落下第一篇"
            description="故事已经留出了入口，接下来只差第一位走进去的人，把它推进到能被别人读见的那一步。"
          />
        ) : null}
      </div>
    </AppShell>
  );
}
