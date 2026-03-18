import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { StateCard } from "@/components/state-card";
import {
  getAuthenticatedAppContext,
  getPersonalLineBooks,
  getStoryExperienceSchemaStatus
} from "@/lib/story-experience";

export const dynamic = "force-dynamic";

const MEMORY_COPY = {
  eyebrow: "冒险",
  title: "我在童话里的冒险",
  description: "每本童话都有一条只属于你的 personal 冒险主线。分身会在你重新打开它时，按这本书自己的节奏继续往前走。",
  schemaTitle: "冒险线的数据表还没准备好",
  authTitle: "登录 SecondMe 后，分身才会开始替你在童话里冒险",
  authDescription: "连接后，这里会出现你冒险过的童话，以及每本书自己的最新章节。",
  emptyExcerpt: "这本童话还在等你的分身真正走进去，留下第一段只属于你的冒险线。",
  actionLabel: "继续冒险",
  emptyEyebrow: "冒险空态",
  emptyTitle: "第一条冒险线还没有被点亮",
  emptyDescription: "先从首页挑一本到想回到故事里继续冒险的童话。等你真正走进去以后，这里就会按书保留你的 personal 主线。"
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
            {personalLines.map((line) => (
              <article
                key={line.threadId}
                className="rounded-[30px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.86)] p-6 shadow-[var(--shadow-medium)]"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[var(--accent-moss-light)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-moss)]">
                    {line.todayGenerated ? "今日已更新" : "等待今天续写"}
                  </span>
                  <span className="rounded-full bg-[rgba(255,255,255,0.74)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                    共 {line.episodeCount} 段
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">《{line.sourceBookTitle}》</p>
                  <h2 className="display-font mt-2 text-3xl text-[var(--text-primary)]">
                    {line.latestEpisodeTitle ?? line.title}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                    {line.latestEpisodeExcerpt ?? MEMORY_COPY.emptyExcerpt}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/memory/${line.sourceBookSlug}`}
                    className="inline-flex min-h-11 items-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-[var(--shadow-small)]"
                  >
                    {MEMORY_COPY.actionLabel}
                  </Link>
                  <Link
                    href={`/books/${line.sourceBookSlug}`}
                    className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-default)] px-5 py-3 text-sm font-semibold text-[var(--text-secondary)]"
                  >
                    阅读原故事
                  </Link>
                </div>
              </article>
            ))}
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
