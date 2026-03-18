import type { Route } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { publishCompanionFromPersonalAction, startOrOpenPersonalLineAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { MemoryDetailHero } from "@/components/memory-detail-hero";
import { StateCard } from "@/components/state-card";
import { SubmitButton } from "@/components/submit-button";
import { getAuthenticatedAppContext, getPersonalLineDetail } from "@/lib/story-experience";

export const dynamic = "force-dynamic";

export default async function MemoryDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [line, currentContext] = await Promise.all([getPersonalLineDetail(slug, { ensureToday: true }), getAuthenticatedAppContext()]);

  if (!line) {
    if (currentContext) {
      redirect(`/books/${slug}/enter` as Route);
    }

    notFound();
  }

  const latestEpisode = line.episodes.at(-1) ?? null;
  const canPublishCompanion = Boolean(latestEpisode?.id) && !line.activeCompanionThreadId;

  return (
    <AppShell activeTab="memory">
      <div className="grid gap-6">
        <MemoryDetailHero
          line={line}
          actions={
            <>
              {currentContext ? (
                <form action={startOrOpenPersonalLineAction}>
                  <input type="hidden" name="slug" value={slug} />
                  <SubmitButton idleLabel="继续冒险" pendingLabel="正在回到故事里冒险..." />
                </form>
              ) : null}

              {canPublishCompanion ? (
                <form action={publishCompanionFromPersonalAction}>
                  <input type="hidden" name="originEpisodeId" value={latestEpisode?.id ?? ""} />
                  <SubmitButton idleLabel="公开成同行故事" pendingLabel="正在公开同行入口..." />
                </form>
              ) : line.activeCompanionThreadId ? (
                <Link
                  href={`/adventure/${line.activeCompanionThreadId}` as Route}
                  className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-default)] px-5 py-3 text-sm font-semibold text-[var(--text-secondary)]"
                >
                  去看同行故事
                </Link>
              ) : null}

              <Link
                href={`/books/${slug}` as Route}
                className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-default)] px-5 py-3 text-sm font-semibold text-[var(--text-secondary)]"
              >
                返回这本童话
              </Link>
            </>
          }
        />

        {line.episodes.length > 0 ? (
          <div className="grid gap-4">
            {line.episodes
              .slice()
              .reverse()
              .map((episode) => (
                <article
                  key={episode.id}
                  className="rounded-[28px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.86)] p-6 shadow-[var(--shadow-medium)]"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[var(--accent-moss-light)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-moss)]">
                      第 {episode.episodeNo} 段
                    </span>
                    <span className="rounded-full bg-[rgba(255,255,255,0.75)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                      由 {episode.authorDisplayName} 写下
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
                    <p className="whitespace-pre-line text-sm leading-7 text-[var(--text-secondary)]">{episode.content}</p>
                  </div>
                </article>
              ))}
          </div>
        ) : (
          <StateCard
            eyebrow="等待第一段"
            title="这条冒险线还没有真正落下第一篇"
            description="分身已经替你进去了，等第一段内容写完后，这里就会开始按顺序保留整条 personal 主线。"
          />
        )}
      </div>
    </AppShell>
  );
}
