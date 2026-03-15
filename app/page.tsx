import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { BookCover } from "@/components/book-cover";
import { PersonaCard } from "@/components/persona-card";
import { SerialPreview } from "@/components/serial-preview";
import { getAuthenticatedAppContext, getLatestSerialPreview } from "@/lib/demo-app";
import { getCategoriesWithBooks, getCategoryTotals, getRecommendedBooksForPersona } from "@/lib/story-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, totals, latestEpisode, currentContext] = await Promise.all([
    getCategoriesWithBooks(),
    getCategoryTotals(),
    getLatestSerialPreview(),
    getAuthenticatedAppContext()
  ]);
  const recommendedBooks = currentContext ? await getRecommendedBooksForPersona(currentContext.persona, 6) : [];

  return (
    <AppShell activeTab="home">
      <div className="grid gap-6">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-[var(--border-light)] bg-[rgba(255,250,243,0.8)] p-6 shadow-[var(--shadow-medium)] sm:p-7">
            <p className="accent-font text-2xl text-[var(--text-secondary)]">让你的 AI 分身走进故事里</p>
            <h1 className="display-font mt-2 max-w-3xl text-4xl leading-tight text-[var(--text-primary)] sm:text-5xl">
              首页像儿童书架，故事会自己长出来。
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--text-secondary)]">
              这里不是资讯流，也不是故事生成器。你的分身会带着自己的动物人格进入书里，而你可以从书架上抽出任何一本，决定今天想先读哪一个世界。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {totals.map((item) => (
                <span
                  key={item.key}
                  className="rounded-full border border-[var(--border-default)] bg-[rgba(255,255,255,0.65)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] shadow-[var(--shadow-small)]"
                >
                  {item.name} {item.count} 本
                </span>
              ))}
            </div>
          </div>

          {currentContext ? (
            <PersonaCard persona={currentContext.persona} compact />
          ) : (
            <section className="paper-grain relative overflow-hidden rounded-[32px] border border-[var(--border-light)] bg-[linear-gradient(180deg,#fff8ef_0%,#f5eadb_48%,#e7efe6_100%)] p-6 shadow-[var(--shadow-large)]">
              <p className="accent-font text-2xl text-[var(--text-secondary)]">先连接 SecondMe</p>
              <h2 className="display-font mt-2 text-3xl text-[var(--text-primary)]">登录后才会生成你的动物人格</h2>
              <p className="mt-4 text-base leading-8 text-[var(--text-secondary)]">
                首页不会在未登录时直接展示默认人格。连接 SecondMe 后，我们会根据你的资料、兴趣标签和软记忆生成真正属于你的动物人格。
              </p>
              <div className="mt-6">
                <Link
                  href="/api/auth/login"
                  className="inline-flex min-h-11 items-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-[var(--shadow-small)]"
                >
                  连接 SecondMe
                </Link>
              </div>
            </section>
          )}
        </section>

        <SerialPreview
          episode={
            latestEpisode
              ? {
                  title: latestEpisode.title,
                  bookTitle: latestEpisode.bookTitle,
                  excerpt: latestEpisode.excerpt,
                  statusLabel: "Agent 已经在行动"
                }
              : {
                  title: "你的分身正在穿过森林，准备把一条旧故事改写成新的开头",
                  bookTitle: "小红帽",
                  excerpt:
                    "它先看见的是路边那只被风吹倒的篮子，而不是狼。故事还没有正式开始，但你的分身已经停在命运的岔路前，准备问出今天的第一个问题。",
                  statusLabel: "Agent 已经在行动"
                }
          }
        />

        {currentContext ? (
          <section className="rounded-[32px] border border-[var(--border-light)] bg-[rgba(255,250,243,0.82)] p-5 shadow-[var(--shadow-medium)]">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">为你推荐</p>
                <h2 className="display-font mt-1 text-3xl text-[var(--text-primary)]">
                  更适合 {currentContext.persona.animalName} 动物人格进入的故事
                </h2>
              </div>
              <Link href="/me/share" className="text-sm font-semibold text-[var(--accent-moss)]">
                打开分享卡
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
              {recommendedBooks.map((book) => (
                <BookCover key={book.id} book={book} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="grid gap-6">
          {categories.map((category) => (
            <section
              key={category.id}
              className="rounded-[32px] border border-[var(--border-light)] bg-[rgba(236,215,189,0.62)] p-4 shadow-[var(--shadow-medium)] sm:p-5"
            >
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">儿童书架</p>
                  <h2 className="display-font mt-1 text-3xl text-[var(--text-primary)]">{category.name}</h2>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <span>{category.books.length} 本已上架</span>
                  <Link href="/story" className="font-semibold text-[var(--accent-moss)]">
                    去看故事页
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {category.books.slice(0, 12).map((book) => (
                  <BookCover key={book.id} book={book} />
                ))}
              </div>
            </section>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
