import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PersonaCard } from "@/components/persona-card";
import { StateCard } from "@/components/state-card";
import {
  getAdventureThreads,
  getAuthenticatedAppContext,
  getDailyMemories,
  getMyStoryStats,
  getStoryExperienceSchemaStatus,
  getStoryTimelineItems
} from "@/lib/story-experience";

export const dynamic = "force-dynamic";

export default async function MePage({
  searchParams
}: {
  searchParams: Promise<{ auth?: string; setup?: string }>;
}) {
  const { auth, setup } = await searchParams;
  const currentContext = await getAuthenticatedAppContext();
  const schemaStatus = await getStoryExperienceSchemaStatus();

  const [memories, timelineItems, stats, threads] = currentContext
    ? await Promise.all([
        getDailyMemories({ ensureToday: true }),
        getStoryTimelineItems(),
        getMyStoryStats(),
        getAdventureThreads()
      ])
    : [[], [], { ownedAdventureCount: 0, joinedAdventureCount: 0, memoryCount: 0 }, []];

  const ownedThreads = threads.filter((thread) => thread.isOwner).slice(0, 3);
  const joinedThreads = threads.filter((thread) => !thread.isOwner && thread.isParticipant).slice(0, 3);

  return (
    <AppShell activeTab="me">
      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          {!currentContext ? (
            <section className="rounded-[28px] border border-dashed border-[var(--border-default)] bg-[rgba(255,255,255,0.6)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">连接真实身份</p>
              <h2 className="display-font mt-2 text-2xl text-[var(--text-primary)]">未登录时不会直接展示动物人格</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                连接 SecondMe 后，系统会读取你的用户资料、兴趣标签和软记忆，并缓存 24 小时，供冒险和回忆生成稳定复用。
              </p>
              <Link
                href="/api/auth/login"
                className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-[var(--shadow-small)]"
              >
                连接 SecondMe
              </Link>
            </section>
          ) : (
            <PersonaCard persona={currentContext.persona} />
          )}

          {auth === "connected" ? (
            <section className="rounded-[28px] border border-[rgba(95,127,98,0.22)] bg-[rgba(231,239,230,0.86)] p-5">
              <p className="text-sm font-semibold text-[var(--accent-moss)]">已连接 SecondMe，缓存画像与动物人格都已经准备好，可以继续冒险或回到回忆页。</p>
            </section>
          ) : null}

          {auth === "refreshed" ? (
            <section className="rounded-[28px] border border-[rgba(95,127,98,0.22)] bg-[rgba(231,239,230,0.86)] p-5">
              <p className="text-sm font-semibold text-[var(--accent-moss)]">SecondMe 会话已恢复，可以继续使用你的缓存画像进入冒险和回忆。</p>
            </section>
          ) : null}

          {auth === "expired" || auth === "failed" || auth === "invalid_state" || auth === "denied" ? (
            <section className="rounded-[28px] border border-[rgba(200,128,92,0.22)] bg-[rgba(255,245,238,0.86)] p-5">
              <p className="text-sm font-semibold text-[var(--apricot)]">
                {auth === "expired"
                  ? "SecondMe 会话已失效，请重新连接。"
                  : auth === "denied"
                    ? "你取消了 SecondMe 授权，当前已回退到未连接状态。"
                    : auth === "invalid_state"
                      ? "授权状态校验失败，请重新发起连接。"
                      : "SecondMe 连接失败，当前未能刷新缓存画像。"}
              </p>
            </section>
          ) : null}

          {auth === "required" ? (
            <section className="rounded-[28px] border border-[rgba(200,128,92,0.22)] bg-[rgba(255,245,238,0.86)] p-5">
              <p className="text-sm font-semibold text-[var(--apricot)]">请先连接 SecondMe，再进入冒险或生成今晚的回忆。</p>
            </section>
          ) : null}

          {setup === "story_schema_required" || !schemaStatus.ready ? (
            <section className="rounded-[28px] border border-[rgba(200,128,92,0.22)] bg-[rgba(255,245,238,0.86)] p-5">
              <p className="text-sm font-semibold text-[var(--apricot)]">
                冒险/回忆的数据表还没迁移完成，请先执行 `db/008_adventure_memory_refactor.sql`，然后刷新页面。
              </p>
            </section>
          ) : null}

          <section className="rounded-[32px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.84)] p-6 shadow-[var(--shadow-medium)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">故事时间线</p>
            <h2 className="display-font mt-3 text-3xl text-[var(--text-primary)]">我的故事档案馆</h2>
            {timelineItems.length > 0 ? (
              <div className="mt-5 space-y-3">
                {timelineItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[22px] border border-[var(--border-light)] bg-[rgba(255,255,255,0.68)] p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                      {item.sourceType === "bedtime_memory" ? "回忆" : "冒险"}
                      {item.bookTitle ? ` · ${item.bookTitle}` : ""}
                    </p>
                    <p className="mt-2 text-base leading-7 text-[var(--text-secondary)]">{item.title}</p>
                    {item.excerpt ? <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{item.excerpt}</p> : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-[22px] border border-dashed border-[var(--border-default)] bg-[rgba(255,255,255,0.56)] p-5">
                <p className="text-sm leading-7 text-[var(--text-secondary)]">你的档案馆还没有记录，先从首页进入一本书打开副本，或者等回忆页替今晚落下一篇睡前故事。</p>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <StateCard
            eyebrow={currentContext ? "我的分身档案" : "等待连接"}
            title={currentContext ? "这里会继续长出你的冒险记录和每日回忆" : "连接后这里会变成你的专属故事档案馆"}
            description={
              currentContext
                ? "现在这页会把你创建的公开副本、你加入的别人的冒险，以及每晚只属于你的回忆放在同一个档案馆里。"
                : "登录成功后，这里会出现你的动物人格、故事时间线、冒险参与和每日回忆。"
            }
          />

          <section className="rounded-[32px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.84)] p-6 shadow-[var(--shadow-medium)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">我的记录</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-[22px] bg-[rgba(255,255,255,0.68)] p-4">
                <p className="text-sm font-semibold text-[var(--text-primary)]">创建的冒险</p>
                <p className="mt-2 text-3xl font-semibold text-[var(--accent-moss)]">{stats.ownedAdventureCount}</p>
              </div>
              <div className="rounded-[22px] bg-[rgba(255,255,255,0.68)] p-4">
                <p className="text-sm font-semibold text-[var(--text-primary)]">加入的冒险</p>
                <p className="mt-2 text-3xl font-semibold text-[var(--sky)]">{stats.joinedAdventureCount}</p>
              </div>
              <div className="rounded-[22px] bg-[rgba(255,255,255,0.68)] p-4">
                <p className="text-sm font-semibold text-[var(--text-primary)]">回忆天数</p>
                <p className="mt-2 text-3xl font-semibold text-[var(--apricot)]">{stats.memoryCount}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.84)] p-6 shadow-[var(--shadow-medium)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">冒险概览</p>
            <div className="mt-4 grid gap-4">
              <div className="rounded-[22px] bg-[rgba(255,255,255,0.68)] p-4">
                <p className="text-sm font-semibold text-[var(--text-primary)]">我创建的副本</p>
                {ownedThreads.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {ownedThreads.map((thread) => (
                      <Link key={thread.id} href={`/adventure/${thread.id}`} className="block text-sm leading-6 text-[var(--text-secondary)]">
                        {thread.title}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">你还没有创建过公开副本。</p>
                )}
              </div>
              <div className="rounded-[22px] bg-[rgba(255,255,255,0.68)] p-4">
                <p className="text-sm font-semibold text-[var(--text-primary)]">我加入的副本</p>
                {joinedThreads.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {joinedThreads.map((thread) => (
                      <Link key={thread.id} href={`/adventure/${thread.id}`} className="block text-sm leading-6 text-[var(--text-secondary)]">
                        {thread.title}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">你还没有加入过别人的副本。</p>
                )}
              </div>
              <div className="rounded-[22px] bg-[rgba(255,255,255,0.68)] p-4">
                <p className="text-sm font-semibold text-[var(--text-primary)]">最新回忆</p>
                {memories[0] ? (
                  <div className="mt-3">
                    <p className="text-base leading-7 text-[var(--text-secondary)]">{memories[0].title}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{memories[0].excerpt}</p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">今晚的回忆还没有被写下来。</p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.84)] p-6 shadow-[var(--shadow-medium)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">分享资产</p>
            <h2 className="display-font mt-3 text-3xl text-[var(--text-primary)]">动物人格可以被分享出去</h2>
            <p className="mt-3 text-base leading-8 text-[var(--text-secondary)]">
              当前分享页仍然沿用动物人格主视图。等冒险和回忆稳定下来以后，这里还可以继续扩展副本卡片和睡前回忆卡片。
            </p>
            <div className="mt-5">
              <Link
                href="/me/share"
                className="inline-flex min-h-11 items-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-[var(--shadow-small)]"
              >
                打开分享卡
              </Link>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
