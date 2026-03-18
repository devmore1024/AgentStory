import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { PageBackButton } from "@/components/page-back-button";
import { getAuthenticatedAppContext } from "@/lib/story-experience";
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
        <PageBackButton fallbackHref={`/books/${book.slug}`} title="原故事" />

        <section className="rounded-[32px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.82)] p-6 shadow-[var(--shadow-medium)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{book.categoryName}</p>
          <h1 className="display-font mt-3 text-4xl leading-tight text-[var(--text-primary)] sm:text-5xl">{book.title}</h1>
          <p className="mt-4 text-base leading-8 text-[var(--text-secondary)]">{book.summary}</p>

          <div className="mt-8 grid gap-5">
            {storyParagraphs.map((paragraph) => (
              <p key={paragraph} className="text-lg leading-9 text-[var(--text-secondary)]">
                {paragraph}
              </p>
            ))}
          </div>

          {currentContext ? (
            <div className="mt-8 rounded-[24px] border border-[var(--border-light)] bg-[rgba(255,255,255,0.62)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">你的分身会这样出现</p>
              <h2 className="display-font mt-2 text-2xl text-[var(--text-primary)]">{currentContext.persona.animalName}</h2>
              <p className="mt-3 text-base leading-8 text-[var(--text-secondary)]">{currentContext.persona.mappingReason}</p>
            </div>
          ) : (
            <div className="mt-8 rounded-[24px] border border-dashed border-[var(--border-default)] bg-[rgba(255,255,255,0.62)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">进入前提示</p>
              <p className="mt-3 text-base leading-8 text-[var(--text-secondary)]">
                登录 SecondMe 后，系统才会生成你的分身，并按你的视角把你带回这本童话里。
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/books/${book.slug}`}
              className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-default)] px-5 py-3 text-sm font-semibold text-[var(--text-secondary)]"
            >
              回到这本童话
            </Link>
            <Link
              href={`/books/${book.slug}/enter`}
              className="inline-flex min-h-11 items-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)]"
            >
              带着分身去冒险
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
