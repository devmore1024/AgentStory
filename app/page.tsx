import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { BookCover } from "@/components/book-cover";
import { HomePersonaDock } from "@/components/home-persona-dock";
import { getAuthenticatedAppContext, getLatestAdventurePreview } from "@/lib/story-experience";
import { getHomepageFairyShelf } from "@/lib/story-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [fairyShelf, latestEpisode, currentContext] = await Promise.all([
    getHomepageFairyShelf(),
    getLatestAdventurePreview(),
    getAuthenticatedAppContext()
  ]);
  const previewEpisode = latestEpisode
    ? {
        title: latestEpisode.title,
        bookTitle: latestEpisode.bookTitle,
        excerpt: latestEpisode.excerpt,
        statusLabel: latestEpisode.statusLabel
      }
    : {
        title: "第一条副本还没被点亮，今晚可以从你选中的书开始。",
        bookTitle: "小红帽",
        excerpt: "点开一本书，先替自己开出一条新的冒险线，让故事从你进入的那一刻开始偏航。",
        statusLabel: "准备开团"
      };
  const homepageFairyBooks = fairyShelf?.books.slice(0, 100) ?? [];

  return (
    <AppShell activeTab="home">
      <div className="grid gap-6">
        <section className="relative overflow-hidden rounded-[36px] border border-[rgba(255,244,234,0.74)] bg-[linear-gradient(135deg,rgba(255,250,245,0.96),rgba(245,232,220,0.88))] p-5 shadow-[var(--shadow-large)] sm:p-7">
          <div className="pointer-events-none absolute left-[-4rem] top-[-3rem] h-44 w-44 rounded-full bg-[rgba(255,236,201,0.3)] blur-3xl" />
          <div className="pointer-events-none absolute right-[-2rem] top-12 h-48 w-48 rounded-full bg-[rgba(159,69,88,0.12)] blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-[10%] h-40 w-40 rounded-full bg-[rgba(199,138,47,0.14)] blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:items-end">
            <div className="max-w-3xl">
              <h1 className="display-font mt-4 text-4xl leading-tight text-[var(--text-primary)] sm:text-5xl">
                你愿变成，童话里的那个天使吗？
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
                AgentTale 想做的，不是把童话重新讲一遍，而是让你的 AI 分身带着长大后的经历、错过和温柔，
                先替你走回森林、小镇和城堡里。它会在那里重新遇见熟悉的人物，也会在新的旅程里，遇见别人的分身与新的缘分。
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="#fairy-shelf"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-[var(--shadow-small)] transition hover:bg-[var(--accent-moss-hover)]"
                >
                  去挑一本今晚的童话
                </Link>
                <Link
                  href="/adventure"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-default)] bg-[rgba(255,255,255,0.52)] px-5 py-3 text-sm font-semibold text-[var(--text-secondary)] transition hover:border-[var(--accent-moss)] hover:text-[var(--accent-moss)]"
                >
                  去看今晚的冒险
                </Link>
              </div>
            </div>

            <div className="rounded-[30px] border border-[rgba(255,247,240,0.72)] bg-[rgba(255,251,247,0.72)] p-5 shadow-[var(--shadow-medium)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                {previewEpisode.statusLabel}
              </p>
              <h2 className="display-font mt-3 text-2xl leading-tight text-[var(--text-primary)]">
                《{previewEpisode.bookTitle}》
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{previewEpisode.excerpt}</p>
              <div className="mt-5 grid gap-3 text-sm leading-6 text-[var(--text-secondary)] sm:grid-cols-2">
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">带着现实回去</p>
                  <p>不是变回小孩，而是带着现在的自己，开出一条新的冒险副本。</p>
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">多人一起偏航</p>
                  <p>首篇定下来的风格会被整条副本继承，后来加入的人也会沿着同一种气质继续往前写。</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="fairy-shelf"
          className="rounded-[32px] border border-[var(--border-light)] bg-[rgba(255,250,246,0.78)] p-4 shadow-[var(--shadow-medium)] sm:p-5"
        >
          <div className="mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">今晚可以走进去的童话</p>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
                这些故事先替你保留在月光和书页之间。挑一本，让分身带着长大后的你回去看看，童话会不会因此变得更真一点。
              </p>
            </div>
          </div>

          {homepageFairyBooks.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {homepageFairyBooks.map((book) => (
                <BookCover key={book.id} book={book} variant="homeFairy" />
              ))}
            </div>
          ) : (
            <div className="rounded-[26px] border border-[rgba(255,245,236,0.78)] bg-[rgba(255,255,255,0.56)] p-6 text-sm leading-7 text-[var(--text-secondary)]">
              今晚的童话书架还没有亮起来。等第一批童话整理好以后，这里会重新长出可以直接走进去的封面和入口。
            </div>
          )}
        </section>
      </div>

      {currentContext ? (
        <HomePersonaDock
          persona={currentContext.persona}
          currentBookTitle={previewEpisode.bookTitle}
          currentEpisodeExcerpt={previewEpisode.excerpt}
          statusLabel={previewEpisode.statusLabel}
        />
      ) : null}
    </AppShell>
  );
}
