import type { Route } from "next";
import Link from "next/link";
import { startOrOpenPersonalLineAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { MemoryLineCard } from "@/components/memory-line-card";
import { StateCard } from "@/components/state-card";
import { SubmitButton } from "@/components/submit-button";
import { getPersonalLineListPrimaryAction } from "@/lib/personal-line-presentation";
import { formatAppTime } from "@/lib/story-experience-helpers";
import {
  getAuthenticatedAppContext,
  getPersonalLineBooks,
  getStoryExperienceSchemaStatus
} from "@/lib/story-experience";

export const dynamic = "force-dynamic";

const MEMORY_COPY = {
  eyebrow: "冒险",
  title: "我在童话里的冒险",
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

  return (
    <AppShell activeTab="memory">
      <div className="grid gap-6">
        <section className="rounded-[30px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.82)] p-5 shadow-[var(--shadow-medium)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">{MEMORY_COPY.eyebrow}</p>
          <h1 className="display-font mt-2 text-3xl text-[var(--text-primary)]">{MEMORY_COPY.title}</h1>
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
          <div className="grid gap-5 xl:grid-cols-2">
            {personalLines.map((line) => {
              const primaryAction = getPersonalLineListPrimaryAction({
                sourceBookSlug: line.sourceBookSlug,
                latestEpisodeId: line.latestEpisodeId,
                todayGenerated: line.todayGenerated,
                generationState: line.generationState
              });
              const generatedTimeLabel = line.todayGenerated ? formatAppTime(line.latestEpisodeGeneratedAt) : null;

              return (
                <MemoryLineCard
                  key={line.threadId}
                  line={line}
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
                      href={`/books/${line.sourceBookSlug}` as Route}
                      className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-default)] px-5 py-3 text-sm font-semibold text-[var(--text-secondary)]"
                    >
                      阅读原故事
                    </Link>
                  }
                />
              );
            })}
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
    </AppShell>
  );
}
