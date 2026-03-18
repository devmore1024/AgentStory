import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { BookCover } from "@/components/book-cover";
import { HomePersonaDock } from "@/components/home-persona-dock";
import { getAuthenticatedAppContext, getLatestPersonalLinePreview } from "@/lib/story-experience";
import { getHomepageFairyShelf } from "@/lib/story-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [fairyShelf, latestEpisode, currentContext] = await Promise.all([
    getHomepageFairyShelf(),
    getLatestPersonalLinePreview(),
    getAuthenticatedAppContext()
  ]);
  const previewEpisode = latestEpisode
    ? {
        title: latestEpisode.title,
        bookTitle: latestEpisode.bookTitle,
        bookSlug: latestEpisode.bookSlug,
        excerpt: latestEpisode.excerpt,
        statusLabel: latestEpisode.statusLabel
      }
    : {
        title: "第一段回去还没被点亮，今晚可以从你选中的童话开始。",
        bookTitle: "小红帽",
        bookSlug: "fairy-little-red-riding-hood",
        excerpt: "点开一本书，让分身先替你走回森林和月光里。故事会从你重新进入的那一刻，慢慢长出新的去向。",
        statusLabel: "准备回去"
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
              <h1 className="display-font mt-4 text-3xl leading-tight text-[var(--text-primary)] sm:text-5xl">
                你愿变成，童话里的那个天使吗？
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
                AgentTale 想做的，不是把童话重新讲一遍，而是让你的分身带着此刻的经历、遗憾和温柔，
                回到那些熟悉的森林、小镇和城堡里。你会重新遇见旧故事里的人，也会在新的路上遇见别人的分身，一起创造新的结局。
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
                  去同行广场
                </Link>
              </div>
            </div>

            <div className="rounded-[30px] border border-[rgba(255,247,240,0.72)] bg-[rgba(255,251,247,0.72)] p-5 shadow-[var(--shadow-medium)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                你的分身正在回去的童话
              </p>
              <h2 className="display-font mt-3 text-2xl leading-tight text-[var(--text-primary)]">
                《{previewEpisode.bookTitle}》
              </h2>
              <p className="mt-3 text-sm font-semibold text-[var(--accent-moss)]">{previewEpisode.statusLabel}</p>
              <div className="mt-5 grid gap-3 text-sm leading-6 text-[var(--text-secondary)] sm:grid-cols-2">
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">与熟悉的人重逢</p>
                  <p>你回去以后，童话里那些曾经只存在于书页上的人，会第一次认真看向现在的你。</p>
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">和别人的分身同行</p>
                  <p>当这段回去走到值得邀请别人的地方，你可以把当前节点公开成一条新的同行故事。</p>
                </div>
              </div>
              <div className="mt-5">
                <Link
                  href={previewEpisode.bookSlug ? `/memory/${previewEpisode.bookSlug}` : "/memory"}
                  className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-default)] px-5 py-3 text-sm font-semibold text-[var(--text-secondary)] transition hover:border-[var(--accent-moss)] hover:text-[var(--accent-moss)]"
                >
                  去看这条回去线
                </Link>
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
              <p className="mt-2 max-w-4xl text-sm leading-7 text-[var(--text-secondary)]">
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
