import React from "react";
import type { Route } from "next";
import Link from "next/link";
import { CoverArtImage } from "@/components/cover-art-image";
import { resolveCoverAsset } from "@/lib/cover-assets";
import type { StoryBook } from "@/lib/story-data";

type AdventureThreadBookThumbProps = {
  book: StoryBook;
  href: string;
};

export function AdventureThreadBookThumb({ book, href }: AdventureThreadBookThumbProps) {
  const coverAsset = resolveCoverAsset(book);

  return (
    <Link
      href={href as Route}
      aria-label={`阅读《${book.title}》原故事`}
      className="group block w-[72px] shrink-0 sm:w-[82px]"
      data-testid="adventure-thread-book-thumb"
    >
      <div
        className="paper-grain relative aspect-[4/5] overflow-hidden rounded-[18px] border border-[rgba(255,245,236,0.76)] bg-[linear-gradient(180deg,rgba(246,233,216,0.92),rgba(136,70,56,0.38))] shadow-[0_12px_24px_rgba(76,37,30,0.14)] transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_16px_30px_rgba(76,37,30,0.18)]"
        data-cover-variant="adventureThreadBookThumb"
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
    </Link>
  );
}
