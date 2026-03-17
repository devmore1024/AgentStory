import Link from "next/link";
import { notFound } from "next/navigation";
import { continueAdventureAction, joinAdventureAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { StateCard } from "@/components/state-card";
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

  return (
    <AppShell activeTab="adventure">
      <div className="grid gap-6">
        <section className="rounded-[30px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.84)] p-6 shadow-[var(--shadow-medium)]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[var(--accent-moss-light)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-moss)]">
              {thread.isCompleted ? "已完结" : "进行中"}
            </span>
            <span className="rounded-full bg-[var(--sky-light)] px-3 py-1.5 text-xs font-semibold text-[var(--sky)]">
              {thread.participantCount}/{thread.participantLimit} 人
            </span>
            <span className="rounded-full bg-[var(--apricot-light)] px-3 py-1.5 text-xs font-semibold text-[var(--apricot)]">
              {thread.episodeCount}/{thread.episodeLimit} 篇
            </span>
          </div>

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            {thread.ownerDisplayName} 发起 · 《{thread.sourceBookTitle}》
          </p>
          <h1 className="display-font mt-2 text-4xl text-[var(--text-primary)]">{thread.title}</h1>
          <p className="mt-3 max-w-3xl text-base leading-8 text-[var(--text-secondary)]">
            {thread.lockedStyleName
              ? `这条副本已经锁定为 ${thread.lockedStyleName}。后续每一篇都会沿着同一种气质继续长，直到第 10 篇自动完结。`
              : "这条副本还在等待首篇定下它的整体气质。"}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {currentContext ? (
              thread.actionState === "continue" ? (
                <form action={continueAdventureAction}>
                  <input type="hidden" name="threadId" value={thread.id} />
                  <button
                    type="submit"
                    className="inline-flex min-h-11 items-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-[var(--shadow-small)]"
                  >
                    继续冒险
                  </button>
                </form>
              ) : thread.actionState === "join" ? (
                <form action={joinAdventureAction}>
                  <input type="hidden" name="threadId" value={thread.id} />
                  <button
                    type="submit"
                    className="inline-flex min-h-11 items-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-[var(--shadow-small)]"
                  >
                    加入冒险
                  </button>
                </form>
              ) : null
            ) : (
              <Link
                href="/me?auth=required"
                className="inline-flex min-h-11 items-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-[var(--shadow-small)]"
              >
                登录后进入冒险
              </Link>
            )}

            <Link
              href="/adventure"
              className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-default)] px-5 py-3 text-sm font-semibold text-[var(--text-secondary)]"
            >
              返回冒险列表
            </Link>
          </div>
        </section>

        {thread.episodes.length > 0 ? (
          <div className="grid gap-4">
            {thread.episodes.map((episode) => (
              <article
                key={episode.id}
                className="rounded-[28px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.86)] p-6 shadow-[var(--shadow-medium)]"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[var(--accent-moss-light)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-moss)]">
                    第 {episode.episodeNo} 篇
                  </span>
                  <span className="rounded-full bg-[rgba(255,255,255,0.75)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                    由 {episode.authorDisplayName} 推进
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
        ) : (
          <StateCard
            eyebrow="等待第一篇"
            title="这条冒险线还没有真正落下第一篇"
            description="副本已经开好，接下来只差第一位进入者把它推进到能被别人围观的那一步。"
          />
        )}
      </div>
    </AppShell>
  );
}
