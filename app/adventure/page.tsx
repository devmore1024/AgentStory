import React from "react";
import Link from "next/link";
import { continueAdventureAction, joinAdventureAction } from "@/app/actions";
import { AdventureThreadBadges } from "@/components/adventure-thread-badges";
import { AppShell } from "@/components/app-shell";
import { StateCard } from "@/components/state-card";
import {
  getAdventureThreads,
  getAuthenticatedAppContext,
  getStoryExperienceSchemaStatus
} from "@/lib/story-experience";
import { getStyleBadgeClass } from "@/lib/story-style";

export const dynamic = "force-dynamic";

export default async function AdventurePage() {
  const [threads, currentContext, schemaStatus] = await Promise.all([
    getAdventureThreads(),
    getAuthenticatedAppContext(),
    getStoryExperienceSchemaStatus()
  ]);

  return (
    <AppShell activeTab="adventure">
      <div className="grid gap-6">
        <section className="rounded-[30px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.82)] p-5 shadow-[var(--shadow-medium)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">同行广场</p>
          <h1 className="display-font mt-2 text-3xl text-[var(--text-primary)]">在童话里，和别人的分身相遇</h1>
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
            {threads.map((thread) => (
              <article
                key={thread.id}
                id={`thread-${thread.id}`}
                className="rounded-[30px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.86)] p-6 shadow-[var(--shadow-medium)]"
              >
                <AdventureThreadBadges
                  isOwner={thread.isOwner}
                  isCompleted={thread.isCompleted}
                  generationState={thread.generationState}
                  participantCount={thread.participantCount}
                  participantLimit={thread.participantLimit}
                  episodeCount={thread.episodeCount}
                  episodeLimit={thread.episodeLimit}
                />

                <div className="mt-4">
                  <p className="text-s font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    《{thread.sourceBookTitle}》
                  </p>
                  <h2 className="display-font mt-2 text-2xl text-[var(--text-primary)]">{thread.title}</h2>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[rgba(255,255,255,0.74)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                      {thread.ownerDisplayName} 发起
                    </span>
                    {thread.lockedStyleName ? (
                      <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getStyleBadgeClass(thread.lockedStyleName)}`}>
                        {thread.lockedStyleName}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                    {thread.ownerDisplayName} 先走了进去。
                    {thread.lockedStyleName ? " 这段同行已经定下整体气质，后面的人会沿着同一种感觉继续走。" : " 第一段同行还在等它自己的语气慢慢落下来。"}
                  </p>
                </div>

                <div className="mt-4 rounded-[22px] bg-[rgba(255,255,255,0.72)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    {thread.latestEpisodeTitle ?? "第一段同行即将落下"}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                    {thread.latestEpisodeExcerpt ??
                      (thread.generationState === "queued" || thread.generationState === "running"
                        ? "新的冒险已经入队，故事正在把这一段慢慢写出来。"
                        : thread.generationState === "failed"
                          ? "这一段冒险暂时生成失败了，等重新触发后会继续往前走。"
                          : "这段故事还在等第一位走进去的人，把它真正点亮。")}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {currentContext ? (
                    thread.actionState === "continue" ? (
                      thread.generationState === "queued" || thread.generationState === "running" ? (
                        <div className="inline-flex min-h-11 items-center rounded-full bg-[rgba(95,127,98,0.14)] px-5 py-3 text-sm font-semibold text-[var(--accent-moss)]">
                          生成中
                        </div>
                      ) : (
                        <form action={continueAdventureAction}>
                          <input type="hidden" name="threadId" value={thread.id} />
                          <button
                            type="submit"
                            className="inline-flex min-h-11 items-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-[var(--shadow-small)]"
                          >
                            {thread.generationState === "failed" ? "重新生成这一段" : thread.actionLabel}
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
                          {thread.actionLabel}
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
                    href={`/adventure/${thread.id}`}
                    className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-default)] px-5 py-3 text-sm font-semibold text-[var(--text-secondary)]"
                  >
                    阅读
                  </Link>
                </div>
              </article>
            ))}
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
    </AppShell>
  );
}
