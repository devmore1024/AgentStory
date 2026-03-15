import Link from "next/link";
import { notFound } from "next/navigation";
import { createShortStoryAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { BookCover } from "@/components/book-cover";
import { SubmitButton } from "@/components/submit-button";
import { getAuthenticatedAppContext } from "@/lib/demo-app";
import { getBookBySlug, getResolvedKeyScenes } from "@/lib/story-data";

export const dynamic = "force-dynamic";

export default async function BookDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [book, currentContext] = await Promise.all([getBookBySlug(slug), getAuthenticatedAppContext()]);

  if (!book) {
    notFound();
  }

  const keyScenes = getResolvedKeyScenes(book);

  return (
    <AppShell activeTab="home">
      <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <BookCover book={book} />
        </div>

        <section className="space-y-6">
          <div className="rounded-[32px] border border-[var(--border-light)] bg-[rgba(255,250,243,0.82)] p-6 shadow-[var(--shadow-medium)] sm:p-7">
            <span className="inline-flex rounded-full bg-[var(--apricot-light)] px-4 py-2 text-sm font-semibold text-[var(--apricot)]">
              {book.categoryName}
            </span>
            <h1 className="display-font mt-4 text-4xl leading-tight text-[var(--text-primary)] sm:text-5xl">{book.title}</h1>
            <p className="mt-4 text-base leading-8 text-[var(--text-secondary)]">{book.summary}</p>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <Link
                href={`/books/${book.slug}/read`}
                className="flex min-h-11 items-center justify-center rounded-full border border-[var(--border-default)] bg-[rgba(255,255,255,0.8)] px-5 py-3 text-sm font-semibold text-[var(--text-primary)] shadow-[var(--shadow-small)] transition hover:border-[var(--accent-moss)] hover:text-[var(--accent-moss)]"
              >
                阅读
              </Link>
              {currentContext ? (
                <form action={createShortStoryAction}>
                  <input type="hidden" name="slug" value={book.slug} />
                  <SubmitButton idleLabel="进入故事" pendingLabel="正在生成短篇..." />
                </form>
              ) : (
                <Link
                  href="/me?auth=required"
                  className="flex min-h-11 items-center justify-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-[var(--shadow-small)]"
                >
                  登录后进入故事
                </Link>
              )}
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
            <section className="rounded-[32px] border border-[var(--border-light)] bg-[rgba(255,250,243,0.82)] p-6 shadow-[var(--shadow-medium)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">关键情节</p>
              <div className="mt-4 grid gap-3">
                {keyScenes.map((item) => (
                  <div key={item} className="rounded-[22px] border border-[var(--border-light)] bg-[rgba(255,255,255,0.58)] p-4">
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[32px] border border-[var(--border-light)] bg-[rgba(255,250,243,0.82)] p-6 shadow-[var(--shadow-medium)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">原故事背景</p>
              <p className="mt-4 text-base leading-8 text-[var(--text-secondary)]">
                {book.originalSynopsis ?? book.summary}
              </p>
            </section>
          </div>

          {currentContext ? (
            <section className="rounded-[32px] border border-[var(--border-light)] bg-[linear-gradient(135deg,rgba(255,248,239,0.96),rgba(231,239,230,0.92))] p-6 shadow-[var(--shadow-medium)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">当前分身状态提示</p>
              <h2 className="display-font mt-3 text-3xl text-[var(--text-primary)]">
                你的动物人格：{currentContext.persona.animalName}
              </h2>
              <p className="mt-3 text-base leading-8 text-[var(--text-secondary)]">{currentContext.persona.mappingReason}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {currentContext.persona.recommendedStyles.map((item) => (
                  <span key={item} className="rounded-full bg-[rgba(255,255,255,0.7)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)]">
                    {item}
                  </span>
                ))}
              </div>
            </section>
          ) : (
            <section className="rounded-[32px] border border-dashed border-[var(--border-default)] bg-[rgba(255,255,255,0.62)] p-6 shadow-[var(--shadow-medium)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">进入前提示</p>
              <h2 className="display-font mt-3 text-3xl text-[var(--text-primary)]">登录后才会生成你的动物人格</h2>
              <p className="mt-3 text-base leading-8 text-[var(--text-secondary)]">
                未登录时不再展示默认人格。连接 SecondMe 后，系统会根据你的真实资料推荐适合进入这本书的风格和路径。
              </p>
              <Link
                href="/me?auth=required"
                className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)]"
              >
                去连接 SecondMe
              </Link>
            </section>
          )}
        </section>
      </div>
    </AppShell>
  );
}
