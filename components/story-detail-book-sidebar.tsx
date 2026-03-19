import React from "react";
import { CoverArtImage } from "@/components/cover-art-image";
import { resolveCoverAsset } from "@/lib/cover-assets";
import type { StoryBook } from "@/lib/story-data";

const categoryAccent: Record<StoryBook["categoryKey"], string> = {
  fairy_tale: "bg-[rgba(184,92,92,0.12)] text-[var(--berry)]",
  fable: "bg-[var(--accent-moss-light)] text-[var(--accent-moss)]",
  mythology: "bg-[var(--sky-light)] text-[var(--sky)]"
};

type StoryDetailBookSidebarProps = {
  book: StoryBook;
};

export function StoryDetailBookSidebar({ book }: StoryDetailBookSidebarProps) {
  const coverAsset = resolveCoverAsset(book);
  const summary = book.summary.trim() || book.originalSynopsis?.trim() || "这本书的故事会从这里重新被翻开。";

  return (
    <aside className="hidden lg:block lg:sticky lg:top-6 lg:self-start" data-testid="story-detail-book-sidebar">
      <section className="rounded-[32px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.9)] p-4 shadow-[var(--shadow-medium)] sm:p-5">
        <div
          className="paper-grain relative aspect-[4/5] overflow-hidden rounded-[24px] border border-[rgba(255,245,236,0.75)] bg-[linear-gradient(180deg,rgba(246,233,216,0.92),rgba(136,70,56,0.42))] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
          data-cover-source={coverAsset.isExternal ? "external" : "local"}
          data-cover-variant="storyDetailSidebar"
        >
          <CoverArtImage
            src={coverAsset.src}
            fallbackSrc={coverAsset.fallbackSrc}
            alt={`${book.title} 封面`}
            className="absolute inset-0 h-full w-full object-cover"
            objectPosition={coverAsset.objectPosition}
            isExternal={coverAsset.isExternal}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,248,236,0.24),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(67,47,34,0.18))]" />
        </div>

        <div className="mt-5">
          <span className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${categoryAccent[book.categoryKey]}`}>
            {book.categoryName}
          </span>
          <h2 className="display-font mt-4 text-3xl leading-tight text-[var(--text-primary)]">{book.title}</h2>
          <p className="mt-4 text-base leading-8 text-[var(--text-secondary)]">{summary}</p>
        </div>
      </section>
    </aside>
  );
}
