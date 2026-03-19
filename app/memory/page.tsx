import React from "react";
import type { Route } from "next";
import Link from "next/link";
import { startOrOpenPersonalLineAction } from "@/app/actions";
import { MemoryLineCard } from "@/components/memory-line-card";
import { StateCard } from "@/components/state-card";
import { SubmitButton } from "@/components/submit-button";
import { getPersonalLineListPrimaryAction } from "@/lib/personal-line-presentation";
import { getBooksBySlugs } from "@/lib/story-data";
import { formatAppTime } from "@/lib/story-experience-helpers";
import {
  getAuthenticatedAppContext,
  getPersonalLineBooks,
  getStoryExperienceSchemaStatus
} from "@/lib/story-experience";

export const dynamic = "force-dynamic";

const MEMORY_COPY = {
  eyebrow: "冒险",
  title: "我的分身在童话里的冒险",
  description: "每本童话都有一条只属于你的冒险主线。分身会在你重新打开它时，按这本书自己的节奏继续往前走。",
  schemaTitle: "冒险线的数据表还没准备好",
  authTitle: "登录 SecondMe 后，分身才会开始替你在童话里冒险",
  authDescription: "连接后，这里会出现你冒险过的童话，以及每本书自己的最新章节。",
  emptyExcerpt: "这本童话还在等你的分身真正走进去，留下第一段只属于你的冒险线。",
  emptyEyebrow: "冒险空态",
  emptyTitle: "第一条冒险线还没有被点亮",
  emptyDescription: "先从首页挑一本到想回到故事里继续冒险的童话。等你真正走进去以后，这里就会按书保留你的冒险主线。"
} as const;

export default async function MemoryPage() {
  const [currentContext, personalLines, schemaStatus] = await Promise.all([
    getAuthenticatedAppContext(),
    getPersonalLineBooks(),
    getStoryExperienceSchemaStatus()
  ]);
  const activeLines = personalLines.filter((line) => !line.isCompleted);
  const completedLines = personalLines.filter((line) => line.isCompleted);
  const booksBySlug = await getBooksBySlugs(personalLines.map((line) => line.sourceBookSlug));

  function renderLineCard(line: (typeof personalLines)[number]) {
    const primaryAction = getPersonalLineListPrimaryAction({
      sourceBookSlug: line.sourceBookSlug,
      latestEpisodeId: line.latestEpisodeId,
      todayGenerated: line.todayGenerated,
      generationState: line.generationState,
      isCompleted: line.isCompleted
    });
    const generatedTimeLabel = line.todayGenerated ? formatAppTime(line.latestEpisodeGeneratedAt) : null;
    const book = booksBySlug.get(line.sourceBookSlug) ?? null;

    return (
      <MemoryLineCard
        key={line.threadId}
        line={line}
        book={book}
        generatedTimeLabel={generatedTimeLabel}
        emptyExcerpt={MEMORY_COPY.emptyExcerpt}
        primaryAction={
          primaryAction.kind === "form" ? (
            <form action={startOrOpenPersonalLineAction}>
              <input type="hidden" name="slug" value={line.sourceBookSlug} />
              <SubmitButton idleLabel={primaryAction.label} pendingLabel={primaryAction.pendingLabel} />
            </form>
          ) : primaryAction.kind === "link" ? (
            <a
              href={primaryAction.href}
              className="inline-flex min-h-11 items-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-[var(--shadow-small)]"
            >
              {primaryAction.label}
            </a>
          ) : (
            <div className="inline-flex min-h-11 items-center rounded-full bg-[rgba(95,127,98,0.14)] px-5 py-3 text-sm font-semibold text-[var(--accent-moss)]">
              {primaryAction.label}
            </div>
          )
        }
        secondaryAction={
          <Link
            href={`/books/${line.sourceBookSlug}/read` as Route}
            className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-default)] px-5 py-3 text-sm font-semibold text-[var(--text-secondary)]"
          >
            阅读原故事
          </Link>
        }
      />
    );
  }

  return (
    <>
      <div className="grid gap-6">
        <section className="rounded-[30px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.82)] p-5 shadow-[var(--shadow-medium)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">{MEMORY_COPY.eyebrow}</p>
          <h1 className="display-font mt-2 text-2xl text-[var(--text-primary)]">{MEMORY_COPY.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--text-secondary)]">
            {MEMORY_COPY.description}
          </p>
        </section>

        {!schemaStatus.ready ? (
          <StateCard
            eyebrow="数据库待迁移"
            title={MEMORY_COPY.schemaTitle}
            description="请先执行 db/008_adventure_memory_refactor.sql 和 db/009_personal_companion_split.sql。迁移完成后，这里会开始展示你的 personal 主线。"
          />
        ) : null}

        {!currentContext ? (
          <StateCard
            eyebrow="连接后可进入"
            title={MEMORY_COPY.authTitle}
            description={MEMORY_COPY.authDescription}
            href="/me?auth=required"
            actionLabel="去连接 SecondMe"
          />
        ) : personalLines.length > 0 ? (
          <div className="grid gap-8">
            {activeLines.length > 0 ? (
              <section className="grid gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">冒险状态</p>
                  <h2 className="display-font mt-2 text-2xl text-[var(--text-primary)]">进行中</h2>
                </div>
                <div className="grid gap-5">{activeLines.map(renderLineCard)}</div>
              </section>
            ) : null}

            {completedLines.length > 0 ? (
              <section className="grid gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">冒险状态</p>
                  <h2 className="display-font mt-2 text-2xl text-[var(--text-primary)]">已结束</h2>
                </div>
                <div className="grid gap-5">{completedLines.map(renderLineCard)}</div>
              </section>
            ) : null}
          </div>
        ) : (
          <StateCard
            eyebrow={MEMORY_COPY.emptyEyebrow}
            title={MEMORY_COPY.emptyTitle}
            description={MEMORY_COPY.emptyDescription}
            href="/"
            actionLabel="回到童话书架"
          />
        )}
      </div>
    </>
  );
}
