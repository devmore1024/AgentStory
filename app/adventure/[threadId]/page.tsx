import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { continueAdventureAction, joinAdventureAction } from "@/app/actions";
import { AdventureThreadBadges } from "@/components/adventure-thread-badges";
import { AppShell } from "@/components/app-shell";
import { PageBackButton } from "@/components/page-back-button";
import { ParticipantAvatar, ParticipantAvatarStack } from "@/components/participant-avatar-stack";
import { StateCard } from "@/components/state-card";
import { StoryDetailBookSidebar } from "@/components/story-detail-book-sidebar";
import { StoryGenerationWatcher } from "@/components/story-generation-watcher";
import { SubmitButton } from "@/components/submit-button";
import { formatEpisodeOrdinal, replaceEpisodeSequenceNumbersWithChinese } from "@/lib/story-experience-helpers";
import { getAdventureThreadDetail, getAuthenticatedAppContext } from "@/lib/story-experience";
import { getBookBySlug } from "@/lib/story-data";
import { getStyleBadgeClass } from "@/lib/story-style";

export const dynamic = "force-dynamic";

function getThreadParticipantSummary(thread: Awaited<ReturnType<typeof getAdventureThreadDetail>>) {
  if (!thread) {
    return "";
  }

  const names = thread.participants.map((participant) => participant.displayName).filter(Boolean);
  const [firstName, secondName] = names.length > 0 ? names : [thread.ownerDisplayName];

  if (thread.participantCount <= 1) {
    return `${firstName ?? thread.ownerDisplayName} 先走了进去，正在等下一位同行者加入。`;
  }

  if (thread.participantCount === 2) {
    return `${firstName ?? thread.ownerDisplayName} 和 ${secondName ?? "另一位同行者"}已经一起把这段故事往前推了一步。`;
  }

  return `${firstName ?? thread.ownerDisplayName}、${secondName ?? "另一位同行者"}和另外 ${
    thread.participantCount - 2
  } 位同行者已经一起把这段故事推进到这里。`;
}

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

  const sourceBook = thread.sourceBookSlug ? await getBookBySlug(thread.sourceBookSlug) : null;
  const isGenerating = thread.generationState === "queued" || thread.generationState === "running";
  const hasFailedGeneration = thread.generationState === "failed";
  const shouldShowWaitingState = thread.episodes.length === 0 && !isGenerating && !hasFailedGeneration;
  const hasBookSidebar = Boolean(sourceBook);
  const latestEpisodeAuthor = thread.episodes.at(-1)?.authorDisplayName ?? thread.ownerDisplayName;
  const remainingParticipantSlots = Math.max(thread.participantLimit - thread.participantCount, 0);

  return (
    <AppShell activeTab="adventure">
      <StoryGenerationWatcher threadId={thread.id} active={isGenerating} />
      <div className="grid gap-6">
        <PageBackButton fallbackHref="/adventure" title="同行故事" />

        <div className={hasBookSidebar ? "grid gap-6 lg:grid-cols-[0.72fr_1.28fr]" : "grid gap-6"}>
          {sourceBook ? <StoryDetailBookSidebar book={sourceBook} /> : null}

          <div className="grid gap-6 lg:min-w-0 xl:max-w-4xl">
            <section className="rounded-[30px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.84)] p-6 shadow-[var(--shadow-medium)]">
              <AdventureThreadBadges
                isOwner={thread.isOwner}
                isCompleted={thread.isCompleted}
                generationState={thread.generationState}
                participants={thread.participants}
                participantCount={thread.participantCount}
                participantLimit={thread.participantLimit}
                episodeCount={thread.episodeCount}
                episodeLimit={thread.episodeLimit}
              />

              <p className="mt-4 text-sm font-semibold tracking-[0.08em] text-[var(--text-muted)] sm:text-base">
                《{thread.sourceBookTitle}》里的同行故事
              </p>
              <h1 className="display-font mt-2 text-3xl leading-[1.16] text-[var(--text-primary)] sm:text-[2.75rem]">
                {thread.title}
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-8 text-[var(--text-secondary)]">
                {thread.lockedStyleName
                  ? `这段同行已经定下 ${thread.lockedStyleName} 的气质。后面的人会沿着同一种感觉继续走，直到故事自然走完。`
                  : "这段同行还在等第一篇替它慢慢定下整体气质。"}
              </p>

              <div
                className="mt-5 rounded-[24px] bg-[rgba(255,255,255,0.72)] px-4 py-4 shadow-[var(--shadow-small)] sm:px-5"
                data-testid="adventure-participant-rail"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">正在同行的分身</p>
                <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <ParticipantAvatarStack
                      participants={thread.participants}
                      maxVisible={5}
                      size="md"
                      testId="adventure-detail-avatar-stack"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)] sm:text-base">
                        {thread.participantCount}/{thread.participantLimit} 位同行者
                      </p>
                      <p className="text-sm leading-7 text-[var(--text-secondary)]">
                        {thread.episodes.length > 0
                          ? `${getThreadParticipantSummary(thread)} 最近一段由 ${latestEpisodeAuthor} 继续写下。`
                          : getThreadParticipantSummary(thread)}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[rgba(245,241,235,0.9)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                    {remainingParticipantSlots > 0 ? `还差 ${remainingParticipantSlots} 位同行者` : "同行席位已满"}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {currentContext ? (
                  thread.actionState === "continue" ? (
                    isGenerating ? (
                      <div className="inline-flex min-h-11 items-center rounded-full bg-[rgba(95,127,98,0.14)] px-5 py-3 text-sm font-semibold text-[var(--accent-moss)]">
                        {thread.generationState === "queued" ? "这一章已经进入队列" : "这一章正在写作中"}
                      </div>
                    ) : (
                      <form action={continueAdventureAction}>
                        <input type="hidden" name="threadId" value={thread.id} />
                        <SubmitButton
                          idleLabel={hasFailedGeneration ? "重新生成这一段" : "继续同行"}
                          pendingLabel={hasFailedGeneration ? "正在重新生成这一段..." : "正在继续这段同行..."}
                        />
                      </form>
                    )
                  ) : thread.actionState === "join" ? (
                    <form action={joinAdventureAction}>
                      <input type="hidden" name="threadId" value={thread.id} />
                      <SubmitButton idleLabel={thread.actionLabel} pendingLabel="正在进入这段同行..." />
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

            {thread.generationState === "queued" ? (
              <StateCard
                eyebrow="已进入队列"
                title={replaceEpisodeSequenceNumbersWithChinese(thread.latestEpisodeTitle ?? "新的篇章已经入队")}
                description={
                  thread.latestEpisodeExcerpt ??
                  "这一段冒险已经进入队列，页面会自动刷新。你可以先留在这里等它写完，也可以稍后回来。"
                }
              />
            ) : null}

            {thread.generationState === "running" ? (
              <StateCard
                eyebrow="正在写这一章"
                title={replaceEpisodeSequenceNumbersWithChinese(thread.latestEpisodeTitle ?? "新的篇章正在生成")}
                description={
                  thread.latestEpisodeExcerpt ??
                  "这一段冒险已经开始落笔了。页面会自动刷新，你可以先留在这里等它写完，也可以稍后回来。"
                }
              />
            ) : null}

            {hasFailedGeneration ? (
              <StateCard
                eyebrow="生成失败"
                title={replaceEpisodeSequenceNumbersWithChinese(thread.latestEpisodeTitle ?? "这一段冒险暂时卡住了")}
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
                        {formatEpisodeOrdinal(episode.episodeNo)}
                      </span>
                      <div
                        className="flex items-center gap-2 rounded-full bg-[rgba(255,255,255,0.75)] px-2.5 py-1.5 text-xs font-semibold text-[var(--text-secondary)]"
                        data-testid={`adventure-episode-author-${episode.id}`}
                      >
                        <ParticipantAvatar
                          displayName={episode.authorDisplayName}
                          avatar={episode.authorAvatar}
                          size="sm"
                          testId={`adventure-episode-author-avatar-${episode.id}`}
                        />
                        <span>由 {episode.authorDisplayName} 继续写下去</span>
                      </div>
                      {episode.styleName ? (
                        <span
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getStyleBadgeClass(
                            episode.styleName
                          )}`}
                        >
                          {episode.styleName}
                        </span>
                      ) : null}
                    </div>
                    <h2 className="display-font mt-4 text-3xl text-[var(--text-primary)]">
                      {replaceEpisodeSequenceNumbersWithChinese(episode.title)}
                    </h2>
                    <p className="mt-3 text-base leading-8 text-[var(--text-secondary)]">{episode.excerpt}</p>
                    <div className="mt-4 rounded-[22px] bg-[rgba(255,255,255,0.68)] p-4">
                      <p className="text-sm leading-7 whitespace-pre-line text-[var(--text-secondary)]">{episode.content}</p>
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
        </div>
      </div>
    </AppShell>
  );
}
