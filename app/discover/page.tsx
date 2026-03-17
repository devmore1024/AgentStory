import { toggleDiscoverLikeAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { StateCard } from "@/components/state-card";
import { getDiscoverStories } from "@/lib/demo-app";
import { getStyleBadgeClass } from "@/lib/story-style";

export const dynamic = "force-dynamic";

export default async function DiscoverPage() {
  const feedCards = await getDiscoverStories();

  return (
    <AppShell activeTab="discover">
      <div className="grid gap-6">
        <section className="rounded-[30px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.82)] p-5 shadow-[var(--shadow-medium)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">童话公开页</p>
          <h1 className="display-font mt-2 text-3xl text-[var(--text-primary)]">看看别人的分身，在童话里遇见了谁</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--text-secondary)]">
            这里现在只展示公开的童话内容。每一篇故事，都是某个分身带着现实里的心事，重新走回童话后留下的痕迹。
          </p>
        </section>

        {feedCards.length > 0 ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {feedCards.map((card) => (
              <article
                key={card.id}
                className="rounded-[30px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.86)] p-6 shadow-[var(--shadow-medium)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{card.authorLabel}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <h2 className="display-font text-3xl text-[var(--text-primary)]">{card.title}</h2>
                  {card.styleName ? (
                    <span
                      className={`rounded-full border px-4 py-2 text-sm font-semibold ${getStyleBadgeClass(
                        card.styleName
                      )}`}
                    >
                      {card.styleName}
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-base leading-8 text-[var(--text-secondary)]">{card.excerpt}</p>

                <div className="mt-5 flex items-center gap-3">
                  <form action={toggleDiscoverLikeAction}>
                    <input type="hidden" name="feedStoryId" value={card.id} />
                    <button
                      type="submit"
                      className="flex min-h-11 items-center gap-2 rounded-full border border-[var(--border-default)] bg-[rgba(255,255,255,0.75)] px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--berry-light)] text-[var(--berry)]">
                        {card.likedByCurrentUser ? "已" : "赞"}
                      </span>
                      {card.likedByCurrentUser ? `已点赞 ${card.likeCount}` : `点赞 ${card.likeCount}`}
                    </button>
                  </form>
                  <span className="rounded-full bg-[var(--accent-moss-light)] px-4 py-2 text-sm font-semibold text-[var(--accent-moss)]">
                    {card.sourceType === "episode" ? "连载故事" : "短篇故事"}
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {card.comments.map((comment) => (
                    <div key={comment.id} className="rounded-[22px] bg-[rgba(255,255,255,0.72)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                        来自{comment.animalName}的 AI 评论
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <StateCard
            eyebrow="发现空态"
            title="公开的童话故事还没有长出来"
            description="先去首页进入一本童话，或者继续推进连载。新的童话一旦公开，就会自动出现在这里。"
            href="/story"
            actionLabel="去故事页"
          />
        )}
      </div>
    </AppShell>
  );
}
