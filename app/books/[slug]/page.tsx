import Link from "next/link";
import { notFound } from "next/navigation";
import { startOrOpenPersonalLineAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { BookCover } from "@/components/book-cover";
import { SubmitButton } from "@/components/submit-button";
import { getAuthenticatedAppContext, getPersonalLineForBookSlug } from "@/lib/story-experience";
import { getBookBySlug, getResolvedKeyScenes, getResolvedStoryParagraphs } from "@/lib/story-data";

export const dynamic = "force-dynamic";

export default async function BookDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [book, currentContext, personalLine] = await Promise.all([
    getBookBySlug(slug),
    getAuthenticatedAppContext(),
    getPersonalLineForBookSlug(slug)
  ]);

  if (!book) {
    notFound();
  }

  const keyScenes = getResolvedKeyScenes(book);
  const storyParagraphs = getResolvedStoryParagraphs(book);
  const overviewParagraphs = [
    book.originalSynopsis,
    ...storyParagraphs.filter((paragraph) => paragraph !== book.originalSynopsis)
  ]
    .filter((paragraph): paragraph is string => typeof paragraph === "string" && paragraph.trim().length > 0)
    .slice(0, 2);

  return (
    <AppShell activeTab="home">
      <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <BookCover book={book} />
        </div>

        <section className="space-y-6">
          <div className="rounded-[32px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.82)] p-6 shadow-[var(--shadow-medium)] sm:p-7">
            <span className="inline-flex rounded-full bg-[var(--apricot-light)] px-4 py-2 text-sm font-semibold text-[var(--apricot)]">
              {book.categoryName}
            </span>
            <h1 className="display-font mt-4 text-4xl leading-tight text-[var(--text-primary)] sm:text-5xl">{book.title}</h1>
            <p className="mt-4 text-base leading-8 text-[var(--text-secondary)]">{book.summary}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/books/${book.slug}/read`}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-default)] px-5 py-3 text-sm font-semibold text-[var(--text-secondary)]"
              >
                阅读原故事
              </Link>
              {currentContext ? (
                <form action={startOrOpenPersonalLineAction}>
                  <input type="hidden" name="slug" value={book.slug} />
                  <SubmitButton idleLabel={personalLine ? "继续回去" : "走进童话"} pendingLabel="正在回到童话里..." />
                </form>
              ) : (
                <Link
                  href="/me?auth=required"
                  className="flex min-h-11 items-center justify-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-[var(--shadow-small)]"
                >
                  登录后走进童话
                </Link>
              )}
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
            <section className="rounded-[32px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.82)] p-6 shadow-[var(--shadow-medium)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">关键情节</p>
              <div className="mt-4 grid gap-3">
                {keyScenes.map((item) => (
                  <div key={item} className="rounded-[22px] border border-[var(--border-light)] bg-[rgba(255,255,255,0.58)] p-4">
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[32px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.82)] p-6 shadow-[var(--shadow-medium)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">原故事概览</p>
              <div className="mt-4 grid gap-4">
                {overviewParagraphs.map((paragraph) => (
                  <p key={paragraph} className="text-base leading-8 text-[var(--text-secondary)]">
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {book.sourceSite ? (
                  <span className="rounded-full bg-[rgba(255,255,255,0.68)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                    来源：{book.sourceSite}
                  </span>
                ) : null}
                {book.sourceLicense ? (
                  <span className="rounded-full bg-[rgba(255,255,255,0.68)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                    {book.sourceLicense}
                  </span>
                ) : null}
                {book.sourceUrl ? (
                  <a
                    href={book.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-[var(--accent-moss)]"
                  >
                    查看原文来源
                  </a>
                ) : null}
              </div>
            </section>
          </div>

          {currentContext ? (
            <section className="rounded-[32px] border border-[var(--border-light)] bg-[linear-gradient(135deg,rgba(255,248,239,0.96),rgba(231,239,230,0.92))] p-6 shadow-[var(--shadow-medium)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">走进前的分身提示</p>
              <h2 className="display-font mt-3 text-3xl text-[var(--text-primary)]">
                你的分身会以{currentContext.persona.animalName}出现
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
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">走进前提示</p>
              <h2 className="display-font mt-3 text-3xl text-[var(--text-primary)]">登录后才会生成你的分身</h2>
              <p className="mt-3 text-base leading-8 text-[var(--text-secondary)]">
                未登录时不再展示默认人格。连接 SecondMe 后，系统会根据你的真实资料生成分身，并推荐更适合你走进这本童话的语气与风格。
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
