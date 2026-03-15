import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { BookCover } from "@/components/book-cover";
import { HomePersonaDock } from "@/components/home-persona-dock";
import { getAuthenticatedAppContext, getLatestSerialPreview } from "@/lib/demo-app";
import { getCategoriesWithBooks } from "@/lib/story-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, latestEpisode, currentContext] = await Promise.all([
    getCategoriesWithBooks(),
    getLatestSerialPreview(),
    getAuthenticatedAppContext()
  ]);
  const previewEpisode = latestEpisode
    ? {
        title: latestEpisode.title,
        bookTitle: latestEpisode.bookTitle,
        excerpt: latestEpisode.excerpt,
        statusLabel: "Agent 正在进入"
      }
    : {
        title: "故事已经开始改写，新的入口正在慢慢打开。",
        bookTitle: "小红帽",
        excerpt: "Agent 先停在命运分岔前，准备从这本书开始，把今天的故事往另一边轻轻推开一点。",
        statusLabel: "正在进入"
      };

  return (
    <AppShell activeTab="home">
      <div className="grid gap-6">
        {categories.map((category, index) => (
          <div key={category.id} className="grid gap-6">
            <section className="rounded-[32px] border border-[var(--border-light)] bg-[rgba(236,215,189,0.62)] p-4 shadow-[var(--shadow-medium)] sm:p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="display-font text-3xl text-[var(--text-primary)]">{category.name}</h2>
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
          </div>
        ))}
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
