import React from "react";
import type { Route } from "next";
import Link from "next/link";
import { joinAdventureAction } from "@/app/actions";
import { AdventureThreadBookThumb } from "@/components/adventure-thread-book-thumb";
import { AdventureThreadBadges } from "@/components/adventure-thread-badges";
import { StateCard } from "@/components/state-card";
import { SubmitButton } from "@/components/submit-button";
import { getBooksBySlugs } from "@/lib/story-data";
import {
  getAdventureThreads,
  getAuthenticatedAppContext,
  getStoryExperienceSchemaStatus,
  type AdventureThreadView
} from "@/lib/story-experience";

export const dynamic = "force-dynamic";

function isCurrentSerialThread(thread: AdventureThreadView) {
  return thread.isOwner;
}

function getParticipantDisplayNames(thread: AdventureThreadView) {
  const names = thread.participants.map((participant) => participant.displayName).filter(Boolean);

  if (names.length > 0) {
    return names;
  }

  return [thread.ownerDisplayName];
}

function getParticipantPresenceLead(thread: AdventureThreadView) {
  const [firstName, secondName] = getParticipantDisplayNames(thread);

  if (thread.participantCount <= 1) {
    return `${firstName ?? thread.ownerDisplayName} 正在等下一位同行者加入。`;
  }

  if (thread.participantCount === 2) {
    return `${firstName ?? thread.ownerDisplayName} 和 ${secondName ?? "另一位同行者"}已经在里面一起推进。`;
  }

  return `${firstName ?? thread.ownerDisplayName}、${secondName ?? "另一位同行者"}和另外 ${
    thread.participantCount - 2
  } 位同行者已经在里面一起推进。`;
}

function getAdventureListHeadline(thread: AdventureThreadView) {
  return `${thread.ownerDisplayName}的分身正在`;
}

function getThreadDescription(thread: AdventureThreadView) {
  if (thread.generationState === "queued") {
    return "新的章节已经进入队列，等一下就会轮到它落下来。";
  }

  if (thread.generationState === "running") {
    return "新的章节已经开始写了，等一下就会落下来。";
  }

  if (thread.generationState === "failed") {
    return "这一段冒险暂时卡住了，进详情后可以继续把它接上。";
  }

  if (thread.participantCount <= 1) {
    return `${thread.ownerDisplayName} 正在等下一位同行者加入。`;
  }

  if (thread.participantCount === 2) {
    const [firstName, secondName] = getParticipantDisplayNames(thread);

    return `${firstName ?? thread.ownerDisplayName}和${secondName ?? "另一位同行者"}正在一起推进这段故事。`;
  }

  return `已经有 ${thread.participantCount} 位同行者在里面一起推进。`;
}

function getThreadExcerpt(thread: AdventureThreadView) {
  if (thread.latestEpisodeExcerpt) {
    return thread.latestEpisodeExcerpt;
  }

  if (thread.generationState === "queued") {
    return "新的冒险已经入队，正在等待轮到它开始写。";
  }

  if (thread.generationState === "running") {
    return "故事已经开始写这一段了，新的内容很快会落下来。";
  }

  if (thread.generationState === "failed") {
    return isCurrentSerialThread(thread)
      ? "这一段冒险暂时生成失败了，等重新进入详情后会继续往前走。"
      : "这一段冒险暂时生成失败了，等重新触发后会继续往前走。";
  }

  return "这段故事还在等第一位走进去的人，把它真正点亮。";
}

export default async function AdventurePage() {
  const [threads, currentContext, schemaStatus] = await Promise.all([
    getAdventureThreads(),
    getAuthenticatedAppContext(),
    getStoryExperienceSchemaStatus()
  ]);
  const booksBySlug = await getBooksBySlugs(threads.map((thread) => thread.sourceBookSlug ?? ""));

  return (
    <>
      <div className="grid gap-6">
        <section className="rounded-[30px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.82)] p-5 shadow-[var(--shadow-medium)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">同行广场</p>
          <h1 className="display-font mt-2 text-2xl text-[var(--text-primary)]">在童话里，和别人的分身相遇</h1>
          <p className="mt-2 max-w-5xl text-sm leading-7 text-[var(--text-secondary)]">
            这里收着所有已经被点亮的同行故事。有人刚走进森林，有人已经来到城堡门口；如果这段故事还留着位置，你也可以带着自己的分身进去继续走。
          </p>
        </section>

        {!schemaStatus.ready ? (
          <StateCard
            eyebrow="数据库待迁移"
            title="同行广场的数据表还没准备好"
            description="请先执行 db/008_adventure_memory_refactor.sql。迁移完成后，这里会开始展示已经点亮的同行故事。"
          />
        ) : null}

        {!currentContext ? (
          <StateCard
            eyebrow="连接后可参与"
            title="登录 SecondMe 后，才能加入或继续同行"
            description="未登录时你依然可以阅读别人已经点亮的童话，但不能真正带着分身走进去。"
            href="/me?auth=required"
            actionLabel="去连接 SecondMe"
          />
        ) : null}

        {threads.length > 0 ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {threads.map((thread) => {
              const isCurrentSerial = isCurrentSerialThread(thread);
              const detailHref = `/adventure/${thread.id}` as Route;
              const originalStoryHref = thread.sourceBookSlug ? (`/books/${thread.sourceBookSlug}/read` as Route) : null;
              const sourceBook = thread.sourceBookSlug ? (booksBySlug.get(thread.sourceBookSlug) ?? null) : null;

              return (
                <article
                  key={thread.id}
                  id={`thread-${thread.id}`}
                  className="rounded-[30px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.86)] p-6 shadow-[var(--shadow-medium)]"
                >
                  <AdventureThreadBadges
                    isOwner={thread.isOwner}
                    isCompleted={thread.isCompleted}
                    generationState={thread.generationState}
                    participants={thread.participants}
                    participantCount={thread.participantCount}
                    participantLimit={thread.participantLimit}
                    episodeCount={thread.episodeCount}
                    episodeLimit={thread.episodeLimit}
                    lockedStyleName={thread.lockedStyleName}
                    variant="listCompact"
                  />

                  <div className="mt-4 flex items-start gap-4">
                    {sourceBook && originalStoryHref ? (
                      <AdventureThreadBookThumb book={sourceBook} href={originalStoryHref} />
                    ) : null}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <h2
                          className="display-font text-[1.4rem] leading-[1.16] text-[var(--text-primary)] sm:text-[1.5rem]"
                          data-testid={`adventure-thread-headline-${thread.id}`}
                        >
                          {getAdventureListHeadline(thread)}
                            《{thread.sourceBookTitle}》
                          中冒险
                        </h2>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{getThreadDescription(thread)}</p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-[24px] bg-[rgba(255,255,255,0.76)] p-5 shadow-[var(--shadow-small)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                      {thread.latestEpisodeTitle ?? "第一段同行即将落下"}
                    </p>
                    <p className="mt-2 text-[15px] leading-8 text-[var(--text-secondary)]">{getThreadExcerpt(thread)}</p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {currentContext ? (
                      isCurrentSerial ? (
                        <Link
                          href={detailHref}
                          className="inline-flex min-h-11 items-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-[var(--shadow-small)]"
                        >
                          当前连载
                        </Link>
                      ) : thread.actionState === "join" ? (
                        <form action={joinAdventureAction}>
                          <input type="hidden" name="threadId" value={thread.id} />
                          <SubmitButton idleLabel={thread.actionLabel} pendingLabel="正在进入这段同行..." />
                        </form>
                      ) : <Link
                          href={detailHref}
                          className="inline-flex min-h-11 items-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-[var(--shadow-small)]"
                        >
                          当前连载
                        </Link>
                    ) : (
                      <Link
                        href="/me?auth=required"
                        className="inline-flex min-h-11 items-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-[var(--shadow-small)]"
                      >
                        登录后加入同行
                      </Link>
                    )}

                    {isCurrentSerial ? (
                      originalStoryHref ? (
                        <Link
                          href={originalStoryHref}
                          className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-default)] px-5 py-3 text-sm font-semibold text-[var(--text-secondary)]"
                        >
                          阅读原故事
                        </Link>
                      ) : null
                    ) : originalStoryHref ? (
                      <Link
                        href={originalStoryHref}
                        className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-default)] px-5 py-3 text-sm font-semibold text-[var(--text-secondary)]"
                      >
                        阅读原故事
                      </Link>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <StateCard
            eyebrow="同行状态"
            title="第一段同行还没有被点亮"
            description="先从首页挑一本到想回到故事里继续冒险的童话，点下“走进童话”，这里就会开始出现能被别人阅读或加入的故事。"
            href="/"
            actionLabel="回到童话书架"
          />
        )}
      </div>
    </>
  );
}
