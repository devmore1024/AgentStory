import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getAuthenticatedAppContext } from "@/lib/demo-app";
import { getBookBySlug, getResolvedStoryParagraphs } from "@/lib/story-data";

export const dynamic = "force-dynamic";

export default async function BookReadPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [book, currentContext] = await Promise.all([getBookBySlug(slug), getAuthenticatedAppContext()]);

  if (!book) {
    notFound();
  }

  const storyParagraphs = getResolvedStoryParagraphs(book);

  return (
    <AppShell activeTab="home">
      <div className="mx-auto grid max-w-4xl gap-6">
        <section className="rounded-[32px] border border-[var(--border-light)] bg-[rgba(255,250,243,0.82)] p-6 shadow-[var(--shadow-medium)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{book.categoryName}</p>
          <h1 className="display-font mt-3 text-4xl leading-tight text-[var(--text-primary)] sm:text-5xl">{book.title}</h1>
          <p className="mt-4 text-base leading-8 text-[var(--text-secondary)]">{book.summary}</p>
          {book.sourceSite ? (
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)]">
              <span className="rounded-full bg-[rgba(255,255,255,0.68)] px-3 py-1.5 font-semibold">{book.sourceSite}</span>
              {book.sourceTitle ? (
                <span className="rounded-full bg-[rgba(255,255,255,0.68)] px-3 py-1.5 font-semibold">
                  {book.sourceTitle}
                </span>
              ) : null}
              {book.sourceUrl ? (
                <a href={book.sourceUrl} target="_blank" rel="noreferrer" className="font-semibold text-[var(--accent-moss)]">
                  查看英文原文
                </a>
              ) : null}
            </div>
          ) : null}

          <div className="mt-8 grid gap-5">
            {storyParagraphs.map((paragraph) => (
              <p key={paragraph} className="text-lg leading-9 text-[var(--text-secondary)]">
                {paragraph}
              </p>
            ))}
          </div>

          {currentContext ? (
            <div className="mt-8 rounded-[24px] border border-[var(--border-light)] bg-[rgba(255,255,255,0.62)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">你的进入方式</p>
              <h2 className="display-font mt-2 text-2xl text-[var(--text-primary)]">动物人格：{currentContext.persona.animalName}</h2>
              <p className="mt-3 text-base leading-8 text-[var(--text-secondary)]">{currentContext.persona.mappingReason}</p>
            </div>
          ) : (
            <div className="mt-8 rounded-[24px] border border-dashed border-[var(--border-default)] bg-[rgba(255,255,255,0.62)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">进入前提示</p>
              <p className="mt-3 text-base leading-8 text-[var(--text-secondary)]">
                登录 SecondMe 后，系统才会生成你的动物人格，并按你的分身视角进入这个故事。
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/books/${book.slug}`}
              className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-default)] px-5 py-3 text-sm font-semibold text-[var(--text-secondary)]"
            >
              返回故事详情
            </Link>
            <Link
              href={`/books/${book.slug}/enter`}
              className="inline-flex min-h-11 items-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)]"
            >
              现在进入故事
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
