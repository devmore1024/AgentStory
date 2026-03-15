import Link from "next/link";
import { createSerialEpisodeAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { StateCard } from "@/components/state-card";
import { SubmitButton } from "@/components/submit-button";
import { getAuthenticatedAppContext, getSerialEpisodes, getSerialMeta, getShortStories } from "@/lib/demo-app";
import { getStyleBadgeClass } from "@/lib/story-style";

export const dynamic = "force-dynamic";

function formatDateTime(value: string | null) {
  if (!value) {
    return "稍后";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export default async function StoryPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const currentTab = tab === "short" ? "short" : "serial";
  const [serialEpisodes, shortStories, serialMeta, currentContext] = await Promise.all([
    getSerialEpisodes(),
    getShortStories(),
    getSerialMeta(),
    getAuthenticatedAppContext()
  ]);

  return (
    <AppShell activeTab="story">
      {!currentContext ? (
        <div className="grid gap-6">
          <StateCard
            eyebrow="连接后解锁"
            title="故事页是你的分身故事中心"
            description="未登录时不会展示默认连载或默认短篇。连接 SecondMe 后，这里才会开始长出属于你的连载和短篇。"
            href="/me"
            actionLabel="去连接 SecondMe"
          />
        </div>
      ) : (
      <div className="grid gap-6">
        <section className="rounded-[30px] border border-[var(--border-light)] bg-[rgba(255,250,243,0.82)] p-4 shadow-[var(--shadow-medium)] sm:p-5">
          <div className="inline-flex rounded-full border border-[var(--border-light)] bg-[rgba(255,255,255,0.62)] p-1">
            <Link
              href="/story"
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                currentTab === "serial"
                  ? "bg-[var(--accent-moss)] text-[var(--text-on-accent)]"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              连载
            </Link>
            <Link
              href="/story?tab=short"
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                currentTab === "short"
                  ? "bg-[var(--accent-moss)] text-[var(--text-on-accent)]"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              短篇
            </Link>
          </div>
        </section>

        {currentTab === "serial" ? (
          <div className="grid gap-6">
            <StateCard
              eyebrow="自动主线"
              title="连载会沿着你的分身视角继续长下去"
              description="现在这页已经接上当前用户的真实连载数据。首轮会自动种下两章跨书主线，后续接入调度任务后会继续自然往下长。"
            />

            <section className="rounded-[28px] border border-[var(--border-light)] bg-[rgba(255,250,243,0.84)] p-5 shadow-[var(--shadow-medium)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">连载状态</p>
                  <h2 className="display-font mt-2 text-2xl text-[var(--text-primary)]">
                    已生成 {serialMeta.episodeCount} 章
                    {serialMeta.currentBookTitle ? `，当前停在《${serialMeta.currentBookTitle}》` : ""}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                    {serialMeta.canGenerateNow
                      ? "今天已经可以继续生成下一章了。"
                      : `下一次自动生成时间：${formatDateTime(serialMeta.nextGenerateAt)}`}
                  </p>
                </div>

                <form action={createSerialEpisodeAction}>
                  <SubmitButton idleLabel="继续生成下一章" pendingLabel="正在续写连载..." />
                </form>
              </div>
            </section>

            {serialEpisodes.length > 0 ? (
              <div className="grid gap-4">
                {serialEpisodes.map((episode) => (
                  <section
                    key={episode.id}
                    className="rounded-[28px] border border-[var(--border-light)] bg-[rgba(255,250,243,0.84)] p-6 shadow-[var(--shadow-medium)]"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[var(--sky-light)] px-3 py-1.5 text-xs font-semibold text-[var(--sky)]">
                        {episode.statusLabel}
                      </span>
                      <span className="rounded-full bg-[var(--apricot-light)] px-3 py-1.5 text-xs font-semibold text-[var(--apricot)]">
                        {episode.bookTitle}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <h2 className="display-font text-3xl text-[var(--text-primary)]">{episode.title}</h2>
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
                    <p className="mt-3 max-w-3xl text-base leading-8 text-[var(--text-secondary)]">{episode.excerpt}</p>
                    <div className="mt-4 rounded-[22px] bg-[rgba(255,255,255,0.68)] p-4">
                      <p className="text-sm leading-7 text-[var(--text-secondary)]">{episode.content}</p>
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <StateCard
                eyebrow="连载空态"
                title="第一章还没有落下来"
                description="后续接入真实调度后，这里会显示自动生成的章节。"
              />
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            <StateCard
              eyebrow="手动体验"
              title="短篇来自你主动挑中的那本书"
              description="现在你已经可以从书架真实触发短篇生成。每次进入一本书，都会在这里出现一篇新内容，并同步进入我的时间线和发现页。"
              href="/"
              actionLabel="回到首页书架"
            />

            {shortStories.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {shortStories.map((story) => (
                  <section
                    key={story.id}
                    className="rounded-[28px] border border-[var(--border-light)] bg-[rgba(255,250,243,0.84)] p-6 shadow-[var(--shadow-medium)]"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                      {story.categoryName} · {story.bookTitle}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <h2 className="display-font text-3xl text-[var(--text-primary)]">{story.title}</h2>
                      {story.styleName ? (
                        <span
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getStyleBadgeClass(
                            story.styleName
                          )}`}
                        >
                          {story.styleName}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 text-base leading-8 text-[var(--text-secondary)]">{story.excerpt}</p>
                    <div className="mt-4 rounded-[22px] bg-[rgba(255,255,255,0.68)] p-4">
                      <p className="text-sm leading-7 text-[var(--text-secondary)]">{story.content}</p>
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <StateCard
                eyebrow="短篇空态"
                title="你还没有手动进入过任何一本书"
                description="从首页书架挑一本你想走进去的故事，系统会立刻生成一篇属于你的短篇，并同步收进这里。"
                href="/"
                actionLabel="去首页挑书"
              />
            )}
          </div>
        )}
      </div>
      )}
    </AppShell>
  );
}
