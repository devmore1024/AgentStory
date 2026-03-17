import { AppShell } from "@/components/app-shell";
import { StateCard } from "@/components/state-card";
import { getAuthenticatedAppContext, getDailyMemories, getStoryExperienceSchemaStatus } from "@/lib/story-experience";

export const dynamic = "force-dynamic";

export default async function MemoryPage() {
  const [currentContext, memories, schemaStatus] = await Promise.all([
    getAuthenticatedAppContext(),
    getDailyMemories({ ensureToday: true }),
    getStoryExperienceSchemaStatus()
  ]);

  return (
    <AppShell activeTab="memory">
      {!currentContext ? (
        <StateCard
          eyebrow="连接后解锁"
          title="回忆只会在登录后的夜里替你写下"
          description="登录 SecondMe 后，系统会先读取你的缓存画像，再在每天第一次进入时，为你生成一篇只属于自己的睡前回忆。"
          href="/me?auth=required"
          actionLabel="去连接 SecondMe"
        />
      ) : (
        <div className="grid gap-6">
          <section className="rounded-[30px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.82)] p-5 shadow-[var(--shadow-medium)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">睡前故事</p>
            <h1 className="display-font mt-2 text-3xl text-[var(--text-primary)]">回忆会在夜里替今天慢慢收拢</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--text-secondary)]">
              每天第一次来到这里时，Agent 会用 24 小时内缓存的 SecondMe 资料，替你写下一篇只属于今晚的睡前回忆。它不进入公共流，也不需要别人参与。
            </p>
          </section>

          {!schemaStatus.ready ? (
            <StateCard
              eyebrow="数据库待迁移"
              title="回忆功能的数据表还没准备好"
              description="请先执行 db/008_adventure_memory_refactor.sql。迁移完成后，回忆页会在每天第一次进入时生成新的睡前故事。"
            />
          ) : null}

          {memories.length > 0 ? (
            <div className="grid gap-4">
              {memories.map((memory, index) => (
                <article
                  key={memory.id}
                  className="rounded-[28px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.86)] p-6 shadow-[var(--shadow-medium)]"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[var(--apricot-light)] px-3 py-1.5 text-xs font-semibold text-[var(--apricot)]">
                      {index === 0 ? "今晚新回忆" : "旧回忆"}
                    </span>
                    <span className="rounded-full bg-[rgba(255,255,255,0.72)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                      {memory.memoryDate}
                    </span>
                    <span className="rounded-full bg-[rgba(255,255,255,0.72)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                      {memory.generationLabel}
                    </span>
                  </div>
                  <h2 className="display-font mt-4 text-3xl text-[var(--text-primary)]">{memory.title}</h2>
                  <p className="mt-3 text-base leading-8 text-[var(--text-secondary)]">{memory.excerpt}</p>
                  <div className="mt-4 rounded-[22px] bg-[rgba(255,255,255,0.68)] p-4">
                    <p className="text-sm leading-7 text-[var(--text-secondary)] whitespace-pre-line">{memory.content}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <StateCard
              eyebrow="回忆空态"
              title="今晚的睡前故事还没有落下"
              description="等第一次进入回忆页时，系统会先从缓存画像里取材，再替你把今天写成一篇安静的睡前回忆。"
            />
          )}
        </div>
      )}
    </AppShell>
  );
}
